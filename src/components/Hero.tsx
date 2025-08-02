import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Search, Brain, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-social animate-gradient">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Hero Content */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Social Media
            <span className="block bg-gradient-trend bg-clip-text text-transparent">
              RAG Analytics
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced retrieval-augmented generation system for real-time social media trend analysis, 
            viral content detection, and cultural context understanding.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-social">
              <Search className="mr-2 h-5 w-5" />
              Start Analyzing
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
              <TrendingUp className="mr-2 h-5 w-5" />
              View Trends
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="p-6 bg-card-elevated/50 backdrop-blur-sm border-white/10 shadow-elevated">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-trend rounded-lg mb-4 mx-auto">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Real-time Trends</h3>
            <p className="text-muted-foreground">
              Track viral content and emerging trends across multiple social platforms with advanced pattern recognition.
            </p>
          </Card>

          <Card className="p-6 bg-card-elevated/50 backdrop-blur-sm border-white/10 shadow-elevated">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-viral rounded-lg mb-4 mx-auto">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">AI-Powered RAG</h3>
            <p className="text-muted-foreground">
              Contextual information retrieval using vector embeddings and advanced language models for deep insights.
            </p>
          </Card>

          <Card className="p-6 bg-card-elevated/50 backdrop-blur-sm border-white/10 shadow-elevated">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-analytics rounded-lg mb-4 mx-auto">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Cultural Context</h3>
            <p className="text-muted-foreground">
              Understand social movements, memes, and cultural phenomena with sentiment analysis and context mapping.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};