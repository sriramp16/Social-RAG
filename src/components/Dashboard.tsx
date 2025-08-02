import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Users, 
  Search, 
  Filter,
  Zap,
  Brain,
  Target,
  BarChart3,
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Trend, SocialMediaPost, AnalyticsData, TrendPrediction } from "@/types/social-media";
import { TrendAnalysisService } from "@/services/trend-analysis";
import { DataCollectionService } from "@/services/data-collection";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const trendAnalysisService = new TrendAnalysisService();

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'trends' | 'viral' | 'predictions'>('overview');
  const [timeWindow, setTimeWindow] = useState<'hour' | 'day' | 'week'>('day');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [viralContent, setViralContent] = useState<SocialMediaPost[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [predictions, setPredictions] = useState<TrendPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [timeWindow]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load trends
      const currentTrends = await trendAnalysisService.identifyTrends(timeWindow);
      setTrends(currentTrends);

      // Load viral content
      const viralPosts = await loadViralContent();
      setViralContent(viralPosts);

      // Load analytics
      const analyticsData = await loadAnalytics();
      setAnalytics(analyticsData);

      // Load predictions
      const trendPredictions = await loadPredictions();
      setPredictions(trendPredictions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadViralContent = async (): Promise<SocialMediaPost[]> => {
    // Mock data for now - would be replaced with actual API call
    return [
      {
        id: '1',
        platform: 'twitter',
        content: 'Breaking: New AI breakthrough shows remarkable performance in natural language processing...',
        author: 'tech_news',
        authorId: 'tech_news_123',
        timestamp: new Date(),
        engagement: { likes: 2340, shares: 890, comments: 456 },
        metadata: { hashtags: ['#AI', '#TechNews'], mentions: [], urls: [], language: 'en' },
        sentiment: { score: 0.8, magnitude: 0.9, label: 'positive', emotions: { joy: 0.7, sadness: 0, anger: 0, fear: 0, surprise: 0.3, disgust: 0 }, confidence: 0.9 },
        viralityScore: 0.85,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        platform: 'tiktok',
        content: 'This dance challenge is taking over social media! 🕺💃 #DanceChallenge #Viral',
        author: 'dance_creator',
        authorId: 'dance_123',
        timestamp: new Date(),
        engagement: { likes: 5670, shares: 2340, comments: 890, views: 50000 },
        metadata: { hashtags: ['#DanceChallenge', '#Viral'], mentions: [], urls: [], language: 'en' },
        sentiment: { score: 0.9, magnitude: 0.8, label: 'positive', emotions: { joy: 0.9, sadness: 0, anger: 0, fear: 0, surprise: 0.1, disgust: 0 }, confidence: 0.95 },
        viralityScore: 0.92,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  };

  const loadAnalytics = async (): Promise<AnalyticsData> => {
    // Mock analytics data
    return {
      totalPosts: 15420,
      totalTrends: 23,
      averageEngagement: 87.3,
      topPlatforms: [
        { platform: 'twitter', posts: 6500 },
        { platform: 'tiktok', posts: 4200 },
        { platform: 'instagram', posts: 3200 },
        { platform: 'reddit', posts: 1520 }
      ],
      sentimentDistribution: [
        { sentiment: 'positive', count: 8500 },
        { sentiment: 'neutral', count: 5200 },
        { sentiment: 'negative', count: 1720 }
      ],
      trendingCategories: [
        { category: 'technology', count: 8 },
        { category: 'entertainment', count: 6 },
        { category: 'politics', count: 4 },
        { category: 'sports', count: 3 },
        { category: 'business', count: 2 }
      ],
      viralContent: [],
      recentTrends: []
    };
  };

  const loadPredictions = async (): Promise<TrendPrediction[]> => {
    return [
      {
        topic: 'AI Ethics Debate',
        confidence: 0.85,
        predictedGrowth: 45,
        timeframe: 'Next 48 hours',
        factors: ['High engagement on related posts', 'Influencer discussions', 'News coverage'],
        riskFactors: ['Controversial topic', 'Polarizing opinions']
      },
      {
        topic: 'Sustainable Fashion',
        confidence: 0.72,
        predictedGrowth: 28,
        timeframe: 'Next week',
        factors: ['Growing environmental awareness', 'Celebrity endorsements'],
        riskFactors: ['Seasonal factors']
      }
    ];
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return '🐦';
      case 'tiktok': return '🎵';
      case 'instagram': return '📷';
      case 'reddit': return '🤖';
      case 'youtube': return '📺';
      default: return '🌐';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      politics: 'bg-red-100 text-red-800',
      sports: 'bg-green-100 text-green-800',
      business: 'bg-yellow-100 text-yellow-800',
      health: 'bg-pink-100 text-pink-800',
      environment: 'bg-emerald-100 text-emerald-800',
      social_justice: 'bg-orange-100 text-orange-800',
      memes: 'bg-indigo-100 text-indigo-800',
      viral_challenges: 'bg-rose-100 text-rose-800',
      breaking_news: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Social Media Analytics Dashboard</h1>
              <p className="text-muted-foreground">Real-time trend analysis and content insights</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeWindow} onValueChange={(value: 'hour' | 'day' | 'week') => setTimeWindow(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Last Hour</SelectItem>
                  <SelectItem value="day">Last Day</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={loadDashboardData}
                disabled={isLoading}
                className="bg-gradient-analytics text-white border-0"
              >
                {isLoading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 mb-8 bg-card-elevated shadow-elevated">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search trends, keywords, or content..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button className="bg-gradient-analytics text-white border-0">
              <Search className="mr-2 h-4 w-4" />
              Analyze
            </Button>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card-elevated shadow-social">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Mentions</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {analytics?.totalPosts.toLocaleString() || '0'}
                </p>
                <p className="text-accent text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-card-elevated shadow-social">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Trends</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {analytics?.totalTrends || 0}
                </p>
                <p className="text-accent text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 new
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </Card>

          <Card className="p-6 bg-card-elevated shadow-social">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Engagement Rate</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {analytics?.averageEngagement || 0}%
                </p>
                <p className="text-accent text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2%
                </p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card-elevated shadow-social">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Viral Content</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {viralContent.length}
                </p>
                <p className="text-accent text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1%
                </p>
              </div>
              <Zap className="h-8 w-8 text-chart-4" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="viral" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Viral Content
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Platform Distribution */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Platform Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.topPlatforms.map(p => ({ name: p.platform, value: p.posts })) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics?.topPlatforms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Sentiment Distribution */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Sentiment Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.sentimentDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sentiment" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Trending Categories */}
            <Card className="p-6 bg-card-elevated shadow-elevated">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Trending Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {analytics?.trendingCategories.map((category, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-background/50">
                    <div className="text-2xl mb-2">{category.count}</div>
                    <Badge className={getCategoryColor(category.category)}>
                      {category.category.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trending Topics */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Trending Topics</h2>
                <div className="space-y-4">
                  {trends.slice(0, 5).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-card-foreground">{trend.topic}</span>
                          <Badge className={getCategoryColor(trend.category)}>
                            {trend.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {getPlatformIcon(trend.platform)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {trend.metrics.mentions.toLocaleString()} mentions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-accent font-medium">+{trend.metrics.growthRate.toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {trend.metrics.velocity.toFixed(0)}/hr
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Trend Timeline */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Trend Activity</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends[0]?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="mentions" stroke="#8884d8" />
                    <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="viral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Viral Content */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Viral Content</h2>
                <div className="space-y-4">
                  {viralContent.map((content, index) => (
                    <div key={index} className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPlatformIcon(content.platform)}</span>
                          <Badge variant="outline" className="text-xs">
                            {content.platform}
                          </Badge>
                          <Badge 
                            variant={content.sentiment.label === 'positive' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {content.sentiment.label}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-accent">
                            {(content.viralityScore * 100).toFixed(0)}% viral
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {content.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-card-foreground mb-2 line-clamp-2">{content.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>by @{content.author}</span>
                        <span>
                          {content.engagement.likes.toLocaleString()} likes • 
                          {content.engagement.shares.toLocaleString()} shares
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Virality Factors */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Virality Factors</h2>
                <div className="space-y-4">
                  {viralContent[0]?.viralityScore && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Engagement Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${viralContent[0].viralityScore * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {(viralContent[0].viralityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Share Velocity</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(viralContent[0].engagement.shares / viralContent[0].engagement.likes) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {((viralContent[0].engagement.shares / viralContent[0].engagement.likes) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trend Predictions */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Trend Predictions</h2>
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-card-foreground">{prediction.topic}</h3>
                        <Badge 
                          variant={prediction.confidence > 0.8 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {(prediction.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>+{prediction.predictedGrowth}% growth predicted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{prediction.timeframe}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">Key Factors:</div>
                        <div className="flex flex-wrap gap-1">
                          {prediction.factors.slice(0, 3).map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Prediction Accuracy */}
              <Card className="p-6 bg-card-elevated shadow-elevated">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Prediction Accuracy</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Accurate Predictions</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">87%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Partial Accuracy</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">11%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">Inaccurate</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">2%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};