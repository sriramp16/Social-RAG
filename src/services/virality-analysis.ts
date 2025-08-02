import { SentimentAnalysis } from '@/types/social-media';

interface Engagement {
  likes: number;
  shares: number;
  comments: number;
  views?: number;
}

interface Metadata {
  hashtags: string[];
  mentions: string[];
  urls: string[];
  language: string;
}

export function calculateViralityScore(
  engagement: Engagement,
  sentiment: SentimentAnalysis,
  metadata: Metadata
): number {
  let score = 0;
  
  // Engagement factors (40% weight)
  const totalEngagement = engagement.likes + engagement.shares + engagement.comments;
  const engagementScore = Math.min(1, totalEngagement / 10000); // Normalize to 0-1
  score += engagementScore * 0.4;
  
  // Share velocity (25% weight)
  const shareVelocity = engagement.shares / Math.max(1, engagement.likes);
  const velocityScore = Math.min(1, shareVelocity / 0.5); // High share ratio indicates virality
  score += velocityScore * 0.25;
  
  // Sentiment factors (20% weight)
  const sentimentScore = sentiment.label === 'positive' ? 0.8 : 
                        sentiment.label === 'negative' ? 0.6 : 0.4;
  score += sentimentScore * 0.2;
  
  // Content factors (15% weight)
  const contentScore = calculateContentScore(metadata);
  score += contentScore * 0.15;
  
  return Math.min(1, Math.max(0, score));
}

function calculateContentScore(metadata: Metadata): number {
  let score = 0;
  
  // Hashtag presence (positive for discoverability)
  if (metadata.hashtags.length > 0) {
    score += Math.min(0.3, metadata.hashtags.length * 0.1);
  }
  
  // Mention presence (indicates social interaction)
  if (metadata.mentions.length > 0) {
    score += Math.min(0.2, metadata.mentions.length * 0.05);
  }
  
  // URL presence (can indicate external linking)
  if (metadata.urls.length > 0) {
    score += 0.1;
  }
  
  // Language factor (English content tends to have broader reach)
  if (metadata.language === 'en') {
    score += 0.1;
  }
  
  return Math.min(1, score);
}

export function identifyViralityFactors(
  engagement: Engagement,
  sentiment: SentimentAnalysis,
  metadata: Metadata,
  content: string
): Array<{ type: string; description: string; impact: number; evidence: string[] }> {
  const factors = [];
  
  // High engagement factor
  const totalEngagement = engagement.likes + engagement.shares + engagement.comments;
  if (totalEngagement > 1000) {
    factors.push({
      type: 'high_engagement',
      description: 'High overall engagement indicates strong audience interest',
      impact: Math.min(1, totalEngagement / 10000),
      evidence: [`${totalEngagement} total engagements`]
    });
  }
  
  // Viral share ratio
  const shareRatio = engagement.shares / Math.max(1, engagement.likes);
  if (shareRatio > 0.3) {
    factors.push({
      type: 'viral_sharing',
      description: 'High share-to-like ratio suggests content is being widely shared',
      impact: Math.min(1, shareRatio),
      evidence: [`${shareRatio.toFixed(2)} share ratio`]
    });
  }
  
  // Emotional content
  if (sentiment.label === 'positive' && sentiment.score > 0.5) {
    factors.push({
      type: 'positive_emotion',
      description: 'Strong positive sentiment drives engagement',
      impact: sentiment.score,
      evidence: [`Sentiment score: ${sentiment.score.toFixed(2)}`]
    });
  }
  
  // Controversial content
  if (sentiment.label === 'negative' && sentiment.score < -0.3) {
    factors.push({
      type: 'controversial',
      description: 'Controversial content often goes viral due to strong reactions',
      impact: Math.abs(sentiment.score),
      evidence: [`Sentiment score: ${sentiment.score.toFixed(2)}`]
    });
  }
  
  // Trending hashtags
  const trendingHashtags = metadata.hashtags.filter(tag => 
    ['#viral', '#trending', '#fyp', '#foryou', '#trend'].includes(tag.toLowerCase())
  );
  if (trendingHashtags.length > 0) {
    factors.push({
      type: 'trending_hashtags',
      description: 'Use of trending hashtags increases discoverability',
      impact: Math.min(1, trendingHashtags.length * 0.3),
      evidence: trendingHashtags
    });
  }
  
  // Influencer mentions
  if (metadata.mentions.length > 0) {
    factors.push({
      type: 'influencer_mentions',
      description: 'Mentions of influencers can amplify reach',
      impact: Math.min(1, metadata.mentions.length * 0.2),
      evidence: metadata.mentions
    });
  }
  
  // Time-sensitive content
  const timeKeywords = ['breaking', 'just', 'now', 'live', 'urgent', 'alert'];
  const hasTimeSensitivity = timeKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
  if (hasTimeSensitivity) {
    factors.push({
      type: 'time_sensitive',
      description: 'Time-sensitive content creates urgency and sharing',
      impact: 0.7,
      evidence: ['Contains time-sensitive keywords']
    });
  }
  
  return factors;
}

export function predictViralityTrend(
  currentScore: number,
  historicalData: Array<{ timestamp: Date; score: number }>
): { trend: 'increasing' | 'decreasing' | 'stable'; confidence: number } {
  if (historicalData.length < 2) {
    return { trend: 'stable', confidence: 0.5 };
  }
  
  // Calculate trend based on recent data points
  const recentData = historicalData
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
  
  let increasingCount = 0;
  let totalComparisons = 0;
  
  for (let i = 0; i < recentData.length - 1; i++) {
    if (recentData[i].score > recentData[i + 1].score) {
      increasingCount++;
    }
    totalComparisons++;
  }
  
  const trendRatio = increasingCount / totalComparisons;
  
  if (trendRatio > 0.6) {
    return { trend: 'increasing', confidence: trendRatio };
  } else if (trendRatio < 0.4) {
    return { trend: 'decreasing', confidence: 1 - trendRatio };
  } else {
    return { trend: 'stable', confidence: 0.5 };
  }
} 