import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Brain, 
  Zap, 
  ArrowRight, 
  Database, 
  Filter,
  TrendingUp,
  MessageSquare,
  Globe,
  Clock,
  Target,
  Sparkles,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { RAGQuery, RAGResult, QueryFilters, SocialPlatform, TrendCategory } from "@/types/social-media";
import { RAGService } from "@/services/rag-service";
import React from "react";

const ragService = new RAGService();

const exampleQueries = [
  "What are the trending topics about climate change?",
  "Analyze sentiment around recent tech announcements",
  "Find viral memes from the past week",
  "Show me emerging social movements on platforms",
  "What's driving the AI conversation on social media?",
  "Identify patterns in viral content across platforms"
];

const mockResults: RAGResult[] = [
  {
    id: "1",
    content: "Climate activism has surged 340% in the past week, with #ClimateAction trending across platforms. Key influencers are driving engagement through educational content and calls to action.",
    source: {
      id: "trend_1",
      topic: "Climate Action",
      platform: "twitter",
      category: "environment",
      metrics: { mentions: 15420, engagement: 234000, reach: 500000, growthRate: 340, velocity: 1200 },
      sentiment: { positive: 0.7, negative: 0.1, neutral: 0.2, overall: "positive" },
      relatedTopics: ["#ClimateAction", "#Sustainability", "#GreenTech"],
      influencers: [],
      timeline: [],
      viralityFactors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    relevance: 0.95,
    confidence: 0.92,
    summary: "Climate activism trending with 340% growth, driven by educational content and influencer engagement.",
    keyInsights: ["High engagement on educational content", "Strong influencer participation", "Cross-platform virality"],
    relatedContent: ["#ClimateAction", "#Sustainability", "#GreenTech"]
  },
  {
    id: "2",
    content: "Young activists are organizing digital campaigns using AI-generated content to raise awareness about environmental issues. The movement shows strong engagement among Gen Z audiences.",
    source: {
      id: "post_1",
      platform: "tiktok",
      content: "AI-generated content for climate awareness",
      author: "eco_activist",
      authorId: "activist_123",
      timestamp: new Date(),
      engagement: { likes: 8900, shares: 3400, comments: 1200 },
      metadata: { hashtags: ["#ClimateAction", "#AI"], mentions: [], urls: [], language: "en" },
      sentiment: { score: 0.8, magnitude: 0.9, label: "positive", emotions: { joy: 0.6, sadness: 0, anger: 0, fear: 0, surprise: 0.4, disgust: 0 }, confidence: 0.9 },
      viralityScore: 0.87,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    relevance: 0.87,
    confidence: 0.88,
    summary: "AI-generated climate content gaining traction among Gen Z audiences.",
    keyInsights: ["Gen Z audience engagement", "AI content innovation", "Digital activism"],
    relatedContent: ["#ClimateAction", "#AI", "#GenZ"]
  }
];

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-6 text-red-600">Something went wrong. Please try again or reload the page.</div>;
    }
    return this.props.children;
  }
}

export const RAGInterface = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RAGResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState<RAGQuery | null>(null);
  const [filters, setFilters] = useState<QueryFilters>({});
  const [currentView, setCurrentView] = useState<'search' | 'insights' | 'trends'>('search');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory | 'all'>('all');
  const [dateRange, setDateRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Apply filters
      const searchFilters: QueryFilters = {
        platforms: selectedPlatform !== 'all' ? [selectedPlatform] : undefined,
        categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
        minEngagement: 100,
      };

      // Add date range
      const now = new Date();
      let startDate = new Date();
      switch (dateRange) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      searchFilters.dateRange = { start: startDate, end: now };

      const ragQuery = await ragService.query(query, searchFilters);
      setCurrentQuery(ragQuery);
      setResults(ragQuery.results);
      
      // Save query for history
      await ragService.saveQuery(ragQuery);
    } catch (error) {
      console.error('Error performing RAG search:', error);
      // Fallback to mock results
      setResults(mockResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const getSourceType = (result: RAGResult) => {
    if ('platform' in result.source && 'content' in result.source) {
      return 'post';
    } else if ('topic' in result.source && 'metrics' in result.source) {
      return 'trend';
    } else {
      return 'context';
    }
  };

  const getSourceIcon = (result: RAGResult) => {
    const sourceType = getSourceType(result);
    switch (sourceType) {
      case 'post':
        const post = result.source as any;
        switch (post.platform) {
          case 'twitter': return '🐦';
          case 'tiktok': return '🎵';
          case 'instagram': return '📷';
          case 'reddit': return '🤖';
          case 'youtube': return '📺';
          default: return '🌐';
        }
      case 'trend': return '📈';
      case 'context': return '📚';
      default: return '📄';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'bg-green-100 text-green-800';
    if (relevance >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-analytics bg-clip-text text-transparent">
              AI-Powered Social Media Analysis
            </h1>
            <p className="text-muted-foreground text-lg">
              Ask questions about social media trends and get contextual insights powered by vector search and AI
            </p>
          </div>

          {/* Search Interface */}
          <Card className="p-6 mb-8 bg-card-elevated shadow-elevated">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Natural Language Query</span>
              </div>
              
              <Textarea
                placeholder="Ask me anything about social media trends, viral content, cultural movements, or platform-specific insights..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[120px] bg-background border-border resize-none"
              />
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedPlatform} onValueChange={(value: SocialPlatform | 'all') => setSelectedPlatform(value)}>
                  <SelectTrigger>
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

                <Select value={selectedCategory} onValueChange={(value: TrendCategory | 'all') => setSelectedCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={(value: 'hour' | 'day' | 'week' | 'month') => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="day">Last Day</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleSearch}
                  disabled={isLoading || !query.trim()}
                  className="bg-gradient-analytics text-white border-0 shadow-social"
                >
                  {isLoading ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Example Queries */}
              <div className="flex flex-wrap gap-2">
                {exampleQueries.slice(0, 3).map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-xs border-border hover:bg-primary/10"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-secondary" />
                  <span className="text-lg font-semibold">Analysis Results</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {results.length} matches found
                  </Badge>
                  {currentQuery && (
                    <Badge variant="outline" className="text-xs">
                      {currentQuery.metadata.searchTime}ms
                    </Badge>
                  )}
                </div>
                
                <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
                  <TabsList>
                    <TabsTrigger value="search" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search Results
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      AI Insights
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Trend Analysis
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="search" className="space-y-4">
                    {results.length > 0 ? (
                      results.map((result, index) => (
                        <Card key={index} className="p-6 bg-card-elevated shadow-social border-l-4 border-l-primary">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getSourceIcon(result)}</span>
                              <Badge className={getRelevanceColor(result.relevance)}>
                                {(result.relevance * 100).toFixed(0)}% relevant
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getSourceType(result)}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                                {(result.confidence * 100).toFixed(0)}% confidence
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-card-foreground mb-4 leading-relaxed">
                            {result.content}
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                              <p className="text-sm text-card-foreground">{result.summary}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Key Insights</h4>
                              <div className="flex flex-wrap gap-1">
                                {result.keyInsights.map((insight, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {insight}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Related Content</h4>
                              <div className="flex flex-wrap gap-1">
                                {result.relatedContent.map((content, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {content}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-glow">
                              View Details
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="p-6 text-muted-foreground">No results found. Try a different query.</div>
                    )}
                  </TabsContent>
                  <TabsContent value="insights" className="space-y-4">
                    <Card className="p-6 bg-gradient-trend/10 border-accent/20">
                      <div className="flex items-start gap-3">
                        <Brain className="h-6 w-6 text-accent mt-1" />
                        <div>
                          <h3 className="font-semibold text-card-foreground mb-2">AI-Generated Insights</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Based on the analysis of {results.length} relevant sources, here are the key insights:
                          </p>
                          
                          <div className="space-y-3">
                            <div className="p-3 bg-background/50 rounded-lg">
                              <h4 className="font-medium text-card-foreground mb-1">Trend Analysis</h4>
                              <p className="text-sm text-muted-foreground">
                                The query shows strong engagement patterns with {results.filter(r => r.relevance > 0.8).length} highly relevant sources.
                              </p>
                            </div>
                            
                            <div className="p-3 bg-background/50 rounded-lg">
                              <h4 className="font-medium text-card-foreground mb-1">Sentiment Patterns</h4>
                              <p className="text-sm text-muted-foreground">
                                Overall sentiment analysis indicates positive engagement with the topic.
                              </p>
                            </div>
                            
                            <div className="p-3 bg-background/50 rounded-lg">
                              <h4 className="font-medium text-card-foreground mb-1">Recommendations</h4>
                              <p className="text-sm text-muted-foreground">
                                Consider monitoring related hashtags and engaging with key influencers in this space.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  <TabsContent value="trends" className="space-y-4">
                    <Card className="p-6 bg-card-elevated shadow-elevated">
                      <h3 className="font-semibold text-card-foreground mb-4">Trend Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-background/50 rounded-lg text-center">
                          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-card-foreground">340%</div>
                          <div className="text-sm text-muted-foreground">Growth Rate</div>
                        </div>
                        
                        <div className="p-4 bg-background/50 rounded-lg text-center">
                          <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-card-foreground">15.4K</div>
                          <div className="text-sm text-muted-foreground">Total Mentions</div>
                        </div>
                        
                        <div className="p-4 bg-background/50 rounded-lg text-center">
                          <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-card-foreground">5</div>
                          <div className="text-sm text-muted-foreground">Platforms</div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* RAG Explanation */}
          <Card className="p-6 bg-gradient-trend/10 border-accent/20 mt-8">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold text-card-foreground mb-2">How RAG Analysis Works</h3>
                <p className="text-sm text-muted-foreground">
                  Your query is converted to vector embeddings and matched against our social media knowledge base. 
                  The most relevant content is retrieved and analyzed to provide contextual insights about trends, 
                  sentiment, and cultural movements. AI then generates comprehensive analysis and recommendations.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};