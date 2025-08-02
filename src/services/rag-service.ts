import { RAGQuery, RAGResult, SocialMediaPost, Trend, CulturalContext, QueryFilters } from '@/types/social-media';
import { supabase } from '@/integrations/supabase/client';
import { fetchHuggingFace } from '@/lib/huggingface-proxy';

export class RAGService {
  
  constructor() {}
  
  async query(query: string, filters?: QueryFilters): Promise<RAGQuery> {
    const startTime = Date.now();
    
    try {
      // 1. Retrieve relevant content
      const results = await this.retrieveContent(query, filters);
      
      // 2. Generate response using LLM
      const enhancedResults = await this.generateInsights(query, results);
      
      const searchTime = Date.now() - startTime;
      
      return {
        id: `query_${Date.now()}`,
        query,
        results: enhancedResults,
        metadata: {
          searchTime,
          totalResults: enhancedResults.length,
          filters: filters || {},
        },
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error in RAG query:', error);
      throw error;
    }
  }
  
  private async retrieveContent(query: string, filters?: QueryFilters): Promise<RAGResult[]> {
    const results: RAGResult[] = [];
    
    // Search in social media posts
    const posts = await this.searchPosts(query, filters);
    for (const post of posts) {
      results.push({
        id: `post_${post.id}`,
        content: post.content,
        source: post,
        relevance: this.calculateRelevance(query, post.content),
        confidence: 0.8,
        summary: this.generateSummary(post.content),
        keyInsights: this.extractKeyInsights(post),
        relatedContent: post.metadata.hashtags,
      });
    }
    
    // Search in trends
    const trends = await this.searchTrends(query, filters);
    for (const trend of trends) {
      results.push({
        id: `trend_${trend.id}`,
        content: `${trend.topic}: ${trend.metrics.mentions} mentions, ${trend.metrics.engagement} engagement`,
        source: trend,
        relevance: this.calculateRelevance(query, trend.topic),
        confidence: 0.9,
        summary: `Trending topic "${trend.topic}" with ${trend.metrics.mentions} mentions`,
        keyInsights: this.extractTrendInsights(trend),
        relatedContent: trend.relatedTopics,
      });
    }
    
    // Search in cultural context
    const contexts = await this.searchCulturalContext(query, filters);
    for (const context of contexts) {
      results.push({
        id: `context_${context.id}`,
        content: context.description,
        source: context,
        relevance: this.calculateRelevance(query, context.description),
        confidence: 0.85,
        summary: context.description,
        keyInsights: this.extractContextInsights(context),
        relatedContent: context.relatedEvents,
      });
    }
    
    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }
  
  private async searchPosts(query: string, filters?: QueryFilters): Promise<SocialMediaPost[]> {
    let supabaseQuery = supabase
      .from('social_media_posts')
      .select('*')
      .or(`content.ilike.%${query}%,metadata->hashtags.cs.{${query}}`);
    
    if (filters?.platforms && filters.platforms.length > 0) {
      supabaseQuery = supabaseQuery.in('platform', filters.platforms);
    }
    
    if (filters?.dateRange) {
      supabaseQuery = supabaseQuery
        .gte('timestamp', filters.dateRange.start.toISOString())
        .lte('timestamp', filters.dateRange.end.toISOString());
    }
    
    if (filters?.minEngagement) {
      // Note: This would need a more complex query in production
      supabaseQuery = supabaseQuery.gte('engagement->likes', filters.minEngagement);
    }
    
    const { data, error } = await supabaseQuery.limit(20);
    
    if (error) {
      console.error('Error searching posts:', error);
      return [];
    }
    
    return data || [];
  }
  
  private async searchTrends(query: string, filters?: QueryFilters): Promise<Trend[]> {
    let supabaseQuery = supabase
      .from('trends')
      .select('*')
      .or(`topic.ilike.%${query}%,related_topics.cs.{${query}}`);
    
    if (filters?.categories && filters.categories.length > 0) {
      supabaseQuery = supabaseQuery.in('category', filters.categories);
    }
    
    const { data, error } = await supabaseQuery.limit(10);
    
    if (error) {
      console.error('Error searching trends:', error);
      return [];
    }
    
    return data || [];
  }
  
  private async searchCulturalContext(query: string, filters?: QueryFilters): Promise<CulturalContext[]> {
    const { data, error } = await supabase
      .from('cultural_contexts')
      .select('*')
      .or(`topic.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);
    
    if (error) {
      console.error('Error searching cultural context:', error);
      return [];
    }
    
    return data || [];
  }
  
  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const queryWord of queryWords) {
      if (contentWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
        matches++;
      }
    }
    
    return matches / queryWords.length;
  }
  
  private generateSummary(content: string): string {
    // Simple summary generation - in production, use LLM
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + '.';
  }
  
  private extractKeyInsights(post: SocialMediaPost): string[] {
    const insights: string[] = [];
    
    if (post.viralityScore > 0.7) {
      insights.push('High virality potential');
    }
    
    if (post.sentiment.label === 'positive' && post.sentiment.score > 0.5) {
      insights.push('Strong positive sentiment');
    }
    
    if (post.metadata.hashtags.length > 3) {
      insights.push('Multiple trending hashtags');
    }
    
    const totalEngagement = post.engagement.likes + post.engagement.shares + post.engagement.comments;
    if (totalEngagement > 1000) {
      insights.push('High engagement rate');
    }
    
    return insights;
  }
  
  private extractTrendInsights(trend: Trend): string[] {
    const insights: string[] = [];
    
    if (trend.metrics.growthRate > 10) {
      insights.push('Rapid growth trend');
    }
    
    if (trend.metrics.velocity > 500) {
      insights.push('High engagement velocity');
    }
    
    if (trend.sentiment.overall === 'positive' && trend.sentiment.positive > 0.6) {
      insights.push('Predominantly positive sentiment');
    }
    
    if (trend.viralityFactors.length > 0) {
      insights.push(`${trend.viralityFactors.length} virality factors identified`);
    }
    
    return insights;
  }
  
  private extractContextInsights(context: CulturalContext): string[] {
    const insights: string[] = [];
    
    if (context.relevance > 0.8) {
      insights.push('Highly relevant cultural context');
    }
    
    if (context.relatedEvents.length > 0) {
      insights.push(`${context.relatedEvents.length} related events`);
    }
    
    return insights;
  }
  
  private async generateInsights(query: string, results: any[]): Promise<any[]> {
    // Call Hugging Face proxy instead of OpenAI
    const response = await fetchHuggingFace(query);
    // Process response as needed
    return response;
  }
  
  async saveQuery(query: RAGQuery): Promise<void> {
    try {
      const { error } = await supabase
        .from('rag_queries')
        .insert({
          id: query.id,
          query: query.query,
          results: query.results,
          metadata: query.metadata,
          created_at: query.createdAt.toISOString(),
        });
      
      if (error) {
        console.error('Error saving RAG query:', error);
      }
    } catch (error) {
      console.error('Error saving RAG query:', error);
    }
  }
}

// Example: Query all users
export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

// Example: Insert a new post
export async function addPost(user_id: number, content: string) {
  const { data, error } = await supabase.from('posts').insert({ user_id, content });
  if (error) throw error;
  return data;
}