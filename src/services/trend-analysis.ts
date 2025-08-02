import { Trend, SocialMediaPost, TrendCategory, SocialPlatform, ViralityFactor } from '@/types/social-media';
import { identifyViralityFactors } from './virality-analysis';
import { supabase } from '@/integrations/supabase/client';

export class TrendAnalysisService {
  
  async identifyTrends(timeWindow: 'hour' | 'day' | 'week' = 'day'): Promise<Trend[]> {
    try {
      // Get posts from the specified time window
      const posts = await this.getRecentPosts(timeWindow);
      
      // Group posts by topics/hashtags
      const topicGroups = this.groupPostsByTopic(posts);
      
      // Analyze each group for trend potential
      const trends: Trend[] = [];
      
      for (const [topic, groupPosts] of Object.entries(topicGroups)) {
        if (groupPosts.length >= 5) { // Minimum posts to consider a trend
          const trend = await this.analyzeTrend(topic, groupPosts);
          if (trend && this.isSignificantTrend(trend)) {
            trends.push(trend);
          }
        }
      }
      
      // Sort by significance
      return trends.sort((a, b) => b.metrics.velocity - a.metrics.velocity);
    } catch (error) {
      console.error('Error identifying trends:', error);
      return [];
    }
  }
  
  private async getRecentPosts(timeWindow: string): Promise<SocialMediaPost[]> {
    const now = new Date();
    let startTime: Date;
    
    switch (timeWindow) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  private groupPostsByTopic(posts: SocialMediaPost[]): Record<string, SocialMediaPost[]> {
    const groups: Record<string, SocialMediaPost[]> = {};
    
    for (const post of posts) {
      // Extract topics from hashtags and content
      const topics = this.extractTopics(post);
      
      for (const topic of topics) {
        if (!groups[topic]) {
          groups[topic] = [];
        }
        groups[topic].push(post);
      }
    }
    
    return groups;
  }
  
  private extractTopics(post: SocialMediaPost): string[] {
    const topics = new Set<string>();
    
    // Add hashtags as topics
    for (const hashtag of post.metadata.hashtags) {
      topics.add(hashtag.toLowerCase());
    }
    
    // Extract key phrases from content
    const keyPhrases = this.extractKeyPhrases(post.content);
    for (const phrase of keyPhrases) {
      topics.add(phrase.toLowerCase());
    }
    
    return Array.from(topics);
  }
  
  private extractKeyPhrases(content: string): string[] {
    // Simple key phrase extraction
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const phrases: string[] = [];
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    
    return phrases.slice(0, 10); // Limit to top 10 phrases
  }
  
  private async analyzeTrend(topic: string, posts: SocialMediaPost[]): Promise<Trend | null> {
    try {
      // Calculate metrics
      const metrics = this.calculateTrendMetrics(posts);
      
      // Analyze sentiment distribution
      const sentiment = this.analyzeSentimentDistribution(posts);
      
      // Identify related topics
      const relatedTopics = this.findRelatedTopics(topic, posts);
      
      // Find influencers
      const influencers = this.identifyInfluencers(posts);
      
      // Create timeline
      const timeline = this.createTrendTimeline(posts);
      
      // Identify virality factors
      const viralityFactors = this.identifyTrendViralityFactors(posts);
      
      // Determine category
      const category = this.categorizeTrend(topic, posts);
      
      const trend: Trend = {
        id: `trend_${topic}_${Date.now()}`,
        topic,
        hashtag: topic.startsWith('#') ? topic : undefined,
        platform: this.determinePrimaryPlatform(posts),
        category,
        metrics,
        sentiment,
        relatedTopics,
        influencers,
        timeline,
        viralityFactors,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return trend;
    } catch (error) {
      console.error('Error analyzing trend:', error);
      return null;
    }
  }
  
  private calculateTrendMetrics(posts: SocialMediaPost[]) {
    const totalMentions = posts.length;
    const totalEngagement = posts.reduce((sum, post) => 
      sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
    );
    
    const totalReach = posts.reduce((sum, post) => 
      sum + (post.engagement.views || 0), 0
    );
    
    // Calculate growth rate (posts per hour)
    const timeSpan = posts[0].timestamp.getTime() - posts[posts.length - 1].timestamp.getTime();
    const hoursSpan = timeSpan / (1000 * 60 * 60);
    const growthRate = totalMentions / Math.max(1, hoursSpan);
    
    // Calculate velocity (engagement per hour)
    const velocity = totalEngagement / Math.max(1, hoursSpan);
    
    return {
      mentions: totalMentions,
      engagement: totalEngagement,
      reach: totalReach,
      growthRate,
      velocity,
    };
  }
  
  private analyzeSentimentDistribution(posts: SocialMediaPost[]) {
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    for (const post of posts) {
      switch (post.sentiment.label) {
        case 'positive':
          positive++;
          break;
        case 'negative':
          negative++;
          break;
        default:
          neutral++;
      }
    }
    
    const total = posts.length;
    const overall = positive > negative ? 'positive' : 
                   negative > positive ? 'negative' : 'neutral';
    
    return {
      positive: positive / total,
      negative: negative / total,
      neutral: neutral / total,
      overall,
    };
  }
  
  private findRelatedTopics(topic: string, posts: SocialMediaPost[]): string[] {
    const relatedTopics = new Set<string>();
    
    for (const post of posts) {
      for (const hashtag of post.metadata.hashtags) {
        if (hashtag.toLowerCase() !== topic.toLowerCase()) {
          relatedTopics.add(hashtag.toLowerCase());
        }
      }
    }
    
    return Array.from(relatedTopics).slice(0, 10);
  }
  
  private identifyInfluencers(posts: SocialMediaPost[]) {
    const authorStats = new Map<string, { posts: number; totalEngagement: number }>();
    
    for (const post of posts) {
      const current = authorStats.get(post.author) || { posts: 0, totalEngagement: 0 };
      current.posts++;
      current.totalEngagement += post.engagement.likes + post.engagement.shares + post.engagement.comments;
      authorStats.set(post.author, current);
    }
    
    // Sort by engagement and return top influencers
    return Array.from(authorStats.entries())
      .sort(([, a], [, b]) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5)
      .map(([author, stats]) => ({
        id: author,
        username: author,
        platform: this.determinePrimaryPlatform(posts),
        followers: 0, // Would need to fetch from platform API
        engagementRate: stats.totalEngagement / stats.posts,
        influence: stats.totalEngagement / posts.length,
        topics: [posts.find(p => p.author === author)?.metadata.hashtags[0] || ''],
        recentPosts: posts.filter(p => p.author === author).slice(0, 3),
      }));
  }
  
  private createTrendTimeline(posts: SocialMediaPost[]) {
    const timeline: Array<{
      timestamp: Date;
      mentions: number;
      engagement: number;
      sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
      keyEvents?: string[];
    }> = [];
    
    // Group posts by hour
    const hourlyGroups = new Map<string, SocialMediaPost[]>();
    
    for (const post of posts) {
      const hour = new Date(post.timestamp.getTime() - (post.timestamp.getTime() % (60 * 60 * 1000)));
      const hourKey = hour.toISOString();
      
      if (!hourlyGroups.has(hourKey)) {
        hourlyGroups.set(hourKey, []);
      }
      hourlyGroups.get(hourKey)!.push(post);
    }
    
    // Create timeline points
    for (const [hourKey, hourPosts] of hourlyGroups) {
      const mentions = hourPosts.length;
      const engagement = hourPosts.reduce((sum, post) => 
        sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
      );
      
      const sentiment = this.getDominantSentiment(hourPosts);
      
      timeline.push({
        timestamp: new Date(hourKey),
        mentions,
        engagement,
        sentiment,
      });
    }
    
    return timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  private getDominantSentiment(posts: SocialMediaPost[]): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    
    for (const post of posts) {
      sentimentCounts[post.sentiment.label]++;
    }
    
    const total = posts.length;
    const maxCount = Math.max(sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral);
    
    if (maxCount / total > 0.6) {
      if (sentimentCounts.positive === maxCount) return 'positive';
      if (sentimentCounts.negative === maxCount) return 'negative';
      return 'neutral';
    }
    
    return 'mixed';
  }
  
  private identifyTrendViralityFactors(posts: SocialMediaPost[]): ViralityFactor[] {
    const factors: ViralityFactor[] = [];
    
    // Analyze high-engagement posts for virality factors
    const highEngagementPosts = posts
      .sort((a, b) => (b.engagement.likes + b.engagement.shares + b.engagement.comments) - 
                      (a.engagement.likes + a.engagement.shares + a.engagement.comments))
      .slice(0, 10);
    
    for (const post of highEngagementPosts) {
      const postFactors = identifyViralityFactors(
        post.engagement,
        post.sentiment,
        post.metadata,
        post.content
      );
      
      for (const factor of postFactors) {
        const existingFactor = factors.find(f => f.type === factor.type);
        if (existingFactor) {
          existingFactor.impact = Math.max(existingFactor.impact, factor.impact);
          existingFactor.evidence.push(...factor.evidence);
        } else {
          factors.push({
            type: factor.type as any,
            description: factor.description,
            impact: factor.impact,
            evidence: factor.evidence,
          });
        }
      }
    }
    
    return factors.slice(0, 5); // Return top 5 factors
  }
  
  private categorizeTrend(topic: string, posts: SocialMediaPost[]): TrendCategory {
    const content = posts.map(p => p.content).join(' ').toLowerCase();
    
    // Simple keyword-based categorization
    if (content.includes('ai') || content.includes('tech') || content.includes('software')) {
      return 'technology';
    }
    if (content.includes('politics') || content.includes('election') || content.includes('government')) {
      return 'politics';
    }
    if (content.includes('movie') || content.includes('music') || content.includes('celebrity')) {
      return 'entertainment';
    }
    if (content.includes('sport') || content.includes('game') || content.includes('team')) {
      return 'sports';
    }
    if (content.includes('business') || content.includes('company') || content.includes('market')) {
      return 'business';
    }
    if (content.includes('health') || content.includes('medical') || content.includes('covid')) {
      return 'health';
    }
    if (content.includes('climate') || content.includes('environment') || content.includes('green')) {
      return 'environment';
    }
    if (content.includes('justice') || content.includes('protest') || content.includes('rights')) {
      return 'social_justice';
    }
    
    return 'memes'; // Default category
  }
  
  private determinePrimaryPlatform(posts: SocialMediaPost[]): SocialPlatform {
    const platformCounts = new Map<SocialPlatform, number>();
    
    for (const post of posts) {
      platformCounts.set(post.platform, (platformCounts.get(post.platform) || 0) + 1);
    }
    
    let maxCount = 0;
    let primaryPlatform: SocialPlatform = 'twitter';
    
    for (const [platform, count] of platformCounts) {
      if (count > maxCount) {
        maxCount = count;
        primaryPlatform = platform;
      }
    }
    
    return primaryPlatform;
  }
  
  private isSignificantTrend(trend: Trend): boolean {
    // Define criteria for significant trends
    return trend.metrics.mentions >= 10 && 
           trend.metrics.velocity >= 100 &&
           trend.metrics.growthRate >= 2;
  }
} 