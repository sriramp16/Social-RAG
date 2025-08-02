export interface SocialMediaPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  author: string;
  authorId: string;
  timestamp: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  metadata: {
    hashtags: string[];
    mentions: string[];
    urls: string[];
    mediaUrls?: string[];
    location?: string;
    language: string;
  };
  sentiment: SentimentAnalysis;
  viralityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trend {
  id: string;
  topic: string;
  hashtag?: string;
  platform: SocialPlatform;
  category: TrendCategory;
  metrics: {
    mentions: number;
    engagement: number;
    reach: number;
    growthRate: number;
    velocity: number;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    overall: SentimentScore;
  };
  relatedTopics: string[];
  influencers: Influencer[];
  timeline: TrendTimelinePoint[];
  viralityFactors: ViralityFactor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  magnitude: number;
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  confidence: number;
}

export interface ViralityFactor {
  type: 'emotional' | 'controversial' | 'timely' | 'influencer' | 'algorithmic' | 'cultural';
  description: string;
  impact: number; // 0-1
  evidence: string[];
}

export interface Influencer {
  id: string;
  username: string;
  platform: SocialPlatform;
  followers: number;
  engagementRate: number;
  influence: number;
  topics: string[];
  recentPosts: SocialMediaPost[];
}

export interface TrendTimelinePoint {
  timestamp: Date;
  mentions: number;
  engagement: number;
  sentiment: SentimentScore;
  keyEvents?: string[];
}

export interface CulturalContext {
  id: string;
  topic: string;
  description: string;
  relevance: number;
  relatedEvents: string[];
  historicalContext: string;
  demographicFactors: DemographicFactors;
  geographicFactors: GeographicFactors;
}

export interface DemographicFactors {
  ageGroups: { [key: string]: number };
  genders: { [key: string]: number };
  interests: string[];
  socioeconomicFactors: string[];
}

export interface GeographicFactors {
  countries: { [key: string]: number };
  regions: { [key: string]: number };
  cities: { [key: string]: number };
  languages: { [key: string]: number };
}

export interface RAGQuery {
  id: string;
  query: string;
  results: RAGResult[];
  metadata: {
    searchTime: number;
    totalResults: number;
    filters: QueryFilters;
  };
  createdAt: Date;
}

export interface RAGResult {
  id: string;
  content: string;
  source: SocialMediaPost | Trend | CulturalContext;
  relevance: number;
  confidence: number;
  summary: string;
  keyInsights: string[];
  relatedContent: string[];
}

export interface QueryFilters {
  platforms?: SocialPlatform[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sentiment?: SentimentScore[];
  categories?: TrendCategory[];
  minEngagement?: number;
  languages?: string[];
}

export type SocialPlatform = 
  | 'twitter' 
  | 'reddit' 
  | 'instagram' 
  | 'tiktok' 
  | 'youtube' 
  | 'linkedin' 
  | 'facebook' 
  | 'discord' 
  | 'telegram';

export type TrendCategory = 
  | 'technology' 
  | 'politics' 
  | 'entertainment' 
  | 'sports' 
  | 'business' 
  | 'health' 
  | 'education' 
  | 'environment' 
  | 'social_justice' 
  | 'memes' 
  | 'viral_challenges' 
  | 'breaking_news';

export type SentimentScore = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface AnalyticsData {
  totalPosts: number;
  totalTrends: number;
  averageEngagement: number;
  topPlatforms: { platform: SocialPlatform; posts: number }[];
  sentimentDistribution: { sentiment: SentimentScore; count: number }[];
  trendingCategories: { category: TrendCategory; count: number }[];
  viralContent: SocialMediaPost[];
  recentTrends: Trend[];
}

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

export interface TrendPrediction {
  topic: string;
  confidence: number;
  predictedGrowth: number;
  timeframe: string;
  factors: string[];
  riskFactors: string[];
} 