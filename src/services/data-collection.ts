import axios from 'axios';
import * as cheerio from 'cheerio';
import { SocialMediaPost, SocialPlatform, SentimentAnalysis } from '@/types/social-media';
import { analyzeSentiment } from './sentiment-analysis';
import { calculateViralityScore } from './virality-analysis';

export interface DataCollectionConfig {
  platforms: SocialPlatform[];
  keywords: string[];
  hashtags: string[];
  accounts: string[];
  frequency: 'realtime' | 'hourly' | 'daily';
  filters: {
    minEngagement: number;
    languages: string[];
    excludeKeywords: string[];
  };
}

export class DataCollectionService {
  private config: DataCollectionConfig;
  private isRunning: boolean = false;

  constructor(config: DataCollectionConfig) {
    this.config = config;
  }

  async startCollection(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Data collection is already running');
    }

    this.isRunning = true;
    console.log('Starting data collection...');

    // Start collection for each platform
    for (const platform of this.config.platforms) {
      this.collectFromPlatform(platform);
    }
  }

  async stopCollection(): Promise<void> {
    this.isRunning = false;
    console.log('Stopping data collection...');
  }

  private async collectFromPlatform(platform: SocialPlatform): Promise<void> {
    while (this.isRunning) {
      try {
        const posts = await this.fetchPostsFromPlatform(platform);
        const processedPosts = await this.processPosts(posts, platform);
        
        // Store in database
        await this.storePosts(processedPosts);
        
        // Wait for next collection cycle
        await this.delay(this.getCollectionInterval());
      } catch (error) {
        console.error(`Error collecting from ${platform}:`, error);
        await this.delay(60000); // Wait 1 minute before retrying
      }
    }
  }

  private async fetchPostsFromPlatform(platform: SocialPlatform): Promise<any[]> {
    switch (platform) {
      case 'twitter':
        return await this.fetchTwitterPosts();
      case 'reddit':
        return await this.fetchRedditPosts();
      case 'instagram':
        return await this.fetchInstagramPosts();
      case 'tiktok':
        return await this.fetchTikTokPosts();
      case 'youtube':
        return await this.fetchYouTubePosts();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async fetchTwitterPosts(): Promise<any[]> {
    // Twitter API v2 implementation
    const posts = [];
    
    for (const keyword of this.config.keywords) {
      try {
        // Using Twitter API v2 search endpoint
        const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_TWITTER_BEARER_TOKEN || ''}`,
          },
          params: {
            query: keyword,
            max_results: 100,
            'tweet.fields': 'created_at,public_metrics,entities,author_id',
            'user.fields': 'username,name',
            'expansions': 'author_id',
          },
        });

        if (response.data.data) {
          posts.push(...response.data.data);
        }
      } catch (error) {
        console.error(`Error fetching Twitter posts for keyword ${keyword}:`, error);
      }
    }

    return posts;
  }

  private async fetchRedditPosts(): Promise<any[]> {
    const posts = [];
    
    for (const keyword of this.config.keywords) {
      try {
        // Reddit API implementation
        const response = await axios.get(`https://www.reddit.com/search.json`, {
          params: {
            q: keyword,
            sort: 'hot',
            t: 'day',
            limit: 100,
          },
          headers: {
            'User-Agent': 'SocialMediaTrendAnalyzer/1.0',
          },
        });

        if (response.data.data?.children) {
          posts.push(...response.data.data.children.map((child: any) => child.data));
        }
      } catch (error) {
        console.error(`Error fetching Reddit posts for keyword ${keyword}:`, error);
      }
    }

    return posts;
  }

  private async fetchInstagramPosts(): Promise<any[]> {
    // Instagram Basic Display API or scraping implementation
    const posts = [];
    
    // Note: Instagram has strict API limitations
    // This would require proper authentication and API access
    try {
      // Implementation would depend on Instagram API access
      console.log('Instagram collection requires API access');
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
    }

    return posts;
  }

  private async fetchTikTokPosts(): Promise<any[]> {
    // TikTok API or scraping implementation
    const posts = [];
    
    try {
      // Implementation would depend on TikTok API access
      console.log('TikTok collection requires API access');
    } catch (error) {
      console.error('Error fetching TikTok posts:', error);
    }

    return posts;
  }

  private async fetchYouTubePosts(): Promise<any[]> {
    const posts = [];
    
    for (const keyword of this.config.keywords) {
      try {
        // YouTube Data API v3
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: keyword,
            type: 'video',
            order: 'relevance',
            maxResults: 50,
            key: import.meta.env.VITE_YOUTUBE_API_KEY || '',
          },
        });

        if (response.data.items) {
          posts.push(...response.data.items);
        }
      } catch (error) {
        console.error(`Error fetching YouTube posts for keyword ${keyword}:`, error);
      }
    }

    return posts;
  }

  private async processPosts(rawPosts: any[], platform: SocialPlatform): Promise<SocialMediaPost[]> {
    const processedPosts: SocialMediaPost[] = [];

    for (const rawPost of rawPosts) {
      try {
        const processedPost = await this.processPost(rawPost, platform);
        if (processedPost && this.passesFilters(processedPost)) {
          processedPosts.push(processedPost);
        }
      } catch (error) {
        console.error('Error processing post:', error);
      }
    }

    return processedPosts;
  }

  private async processPost(rawPost: any, platform: SocialPlatform): Promise<SocialMediaPost | null> {
    try {
      const content = this.extractContent(rawPost, platform);
      const engagement = this.extractEngagement(rawPost, platform);
      const metadata = this.extractMetadata(rawPost, platform);
      
      // Analyze sentiment
      const sentiment = await analyzeSentiment(content);
      
      // Calculate virality score
      const viralityScore = calculateViralityScore(engagement, sentiment, metadata);

      const post: SocialMediaPost = {
        id: this.generatePostId(rawPost, platform),
        platform,
        content,
        author: this.extractAuthor(rawPost, platform),
        authorId: this.extractAuthorId(rawPost, platform),
        timestamp: this.extractTimestamp(rawPost, platform),
        engagement,
        metadata,
        sentiment,
        viralityScore,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return post;
    } catch (error) {
      console.error('Error processing post:', error);
      return null;
    }
  }

  private extractContent(rawPost: any, platform: SocialPlatform): string {
    switch (platform) {
      case 'twitter':
        return rawPost.text || '';
      case 'reddit':
        return rawPost.selftext || rawPost.title || '';
      case 'youtube':
        return rawPost.snippet?.description || rawPost.snippet?.title || '';
      default:
        return rawPost.text || rawPost.content || '';
    }
  }

  private extractEngagement(rawPost: any, platform: SocialPlatform) {
    switch (platform) {
      case 'twitter':
        return {
          likes: rawPost.public_metrics?.like_count || 0,
          shares: rawPost.public_metrics?.retweet_count || 0,
          comments: rawPost.public_metrics?.reply_count || 0,
        };
      case 'reddit':
        return {
          likes: rawPost.score || 0,
          shares: 0, // Reddit doesn't have shares
          comments: rawPost.num_comments || 0,
        };
      case 'youtube':
        return {
          likes: rawPost.statistics?.likeCount || 0,
          shares: 0,
          comments: rawPost.statistics?.commentCount || 0,
          views: rawPost.statistics?.viewCount || 0,
        };
      default:
        return {
          likes: rawPost.likes || 0,
          shares: rawPost.shares || 0,
          comments: rawPost.comments || 0,
        };
    }
  }

  private extractMetadata(rawPost: any, platform: SocialPlatform) {
    const hashtags = this.extractHashtags(rawPost, platform);
    const mentions = this.extractMentions(rawPost, platform);
    const urls = this.extractUrls(rawPost, platform);

    return {
      hashtags,
      mentions,
      urls,
      language: this.detectLanguage(rawPost, platform),
    };
  }

  private extractHashtags(rawPost: any, platform: SocialPlatform): string[] {
    const content = this.extractContent(rawPost, platform);
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return content.match(hashtagRegex) || [];
  }

  private extractMentions(rawPost: any, platform: SocialPlatform): string[] {
    const content = this.extractContent(rawPost, platform);
    const mentionRegex = /@[\w]+/g;
    return content.match(mentionRegex) || [];
  }

  private extractUrls(rawPost: any, platform: SocialPlatform): string[] {
    const content = this.extractContent(rawPost, platform);
    const urlRegex = /https?:\/\/[^\s]+/g;
    return content.match(urlRegex) || [];
  }

  private detectLanguage(rawPost: any, platform: SocialPlatform): string {
    // Simple language detection - in production, use a proper library
    const content = this.extractContent(rawPost, platform);
    // This is a simplified version - you'd want to use a proper language detection library
    return 'en'; // Default to English
  }

  private extractAuthor(rawPost: any, platform: SocialPlatform): string {
    switch (platform) {
      case 'twitter':
        return rawPost.author_id || 'unknown';
      case 'reddit':
        return rawPost.author || 'unknown';
      case 'youtube':
        return rawPost.snippet?.channelTitle || 'unknown';
      default:
        return rawPost.author || rawPost.username || 'unknown';
    }
  }

  private extractAuthorId(rawPost: any, platform: SocialPlatform): string {
    switch (platform) {
      case 'twitter':
        return rawPost.author_id || 'unknown';
      case 'reddit':
        return rawPost.author || 'unknown';
      case 'youtube':
        return rawPost.snippet?.channelId || 'unknown';
      default:
        return rawPost.author_id || rawPost.author || 'unknown';
    }
  }

  private extractTimestamp(rawPost: any, platform: SocialPlatform): Date {
    switch (platform) {
      case 'twitter':
        return new Date(rawPost.created_at);
      case 'reddit':
        return new Date(rawPost.created_utc * 1000);
      case 'youtube':
        return new Date(rawPost.snippet?.publishedAt);
      default:
        return new Date(rawPost.created_at || rawPost.timestamp || Date.now());
    }
  }

  private generatePostId(rawPost: any, platform: SocialPlatform): string {
    switch (platform) {
      case 'twitter':
        return `twitter_${rawPost.id}`;
      case 'reddit':
        return `reddit_${rawPost.id}`;
      case 'youtube':
        return `youtube_${rawPost.id?.videoId || rawPost.id}`;
      default:
        return `${platform}_${rawPost.id || Date.now()}`;
    }
  }

  private passesFilters(post: SocialMediaPost): boolean {
    const { filters } = this.config;
    
    // Check minimum engagement
    const totalEngagement = post.engagement.likes + post.engagement.shares + post.engagement.comments;
    if (totalEngagement < filters.minEngagement) {
      return false;
    }

    // Check language
    if (filters.languages.length > 0 && !filters.languages.includes(post.metadata.language)) {
      return false;
    }

    // Check excluded keywords
    const content = post.content.toLowerCase();
    for (const keyword of filters.excludeKeywords) {
      if (content.includes(keyword.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  private async storePosts(posts: SocialMediaPost[]): Promise<void> {
    // Store posts in Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    
    for (const post of posts) {
      try {
        const { error } = await supabase
          .from('social_media_posts')
          .insert({
            id: post.id,
            platform: post.platform,
            content: post.content,
            author: post.author,
            author_id: post.authorId,
            timestamp: post.timestamp.toISOString(),
            engagement: post.engagement,
            metadata: post.metadata,
            sentiment: post.sentiment,
            virality_score: post.viralityScore,
            created_at: post.createdAt.toISOString(),
            updated_at: post.updatedAt.toISOString(),
          });

        if (error) {
          console.error('Error storing post:', error);
        }
      } catch (error) {
        console.error('Error storing post:', error);
      }
    }
  }

  private getCollectionInterval(): number {
    switch (this.config.frequency) {
      case 'realtime':
        return 30000; // 30 seconds
      case 'hourly':
        return 3600000; // 1 hour
      case 'daily':
        return 86400000; // 24 hours
      default:
        return 300000; // 5 minutes
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 