import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { RAGInterface } from "@/components/RAGInterface";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Brain, Zap, ArrowRight } from "lucide-react";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [currentView, setCurrentView] = useState<'hero' | 'dashboard' | 'rag'>('hero');
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session && (currentView === 'dashboard' || currentView === 'rag')) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [currentView, navigate]);

  if (currentView === 'dashboard') {
    return (
      <div>
        <Navigation />
        <div className="pt-16">
          <Dashboard />
        </div>
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setCurrentView('hero')}
            variant="outline"
            className="shadow-social bg-background/80 backdrop-blur-sm"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'rag') {
    return (
      <div>
        <Navigation />
        <div className="pt-16">
          <RAGInterface />
        </div>
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setCurrentView('hero')}
            variant="outline"
            className="shadow-social bg-background/80 backdrop-blur-sm"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <Hero />
      
      {/* Quick Access Section */}
      <div className="bg-background py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore the Platform</h2>
            <p className="text-muted-foreground text-lg">
              Experience the power of AI-driven social media analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card 
              className="p-8 bg-card-elevated shadow-elevated hover:shadow-social transition-all duration-300 cursor-pointer group"
              onClick={() => setCurrentView('dashboard')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-analytics rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                Real-time monitoring of social media trends, viral content tracking, and engagement analytics across platforms.
              </p>
              <Button variant="outline" className="w-full group-hover:bg-primary/10 group-hover:border-primary/20">
                Launch Dashboard
              </Button>
            </Card>

            <Card 
              className="p-8 bg-card-elevated shadow-elevated hover:shadow-social transition-all duration-300 cursor-pointer group"
              onClick={() => setCurrentView('rag')}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-trend rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-3">RAG Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Ask natural language questions and get contextual insights powered by vector search and AI generation.
              </p>
              <Button variant="outline" className="w-full group-hover:bg-accent/10 group-hover:border-accent/20">
                Try RAG Search
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-card py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powered by Advanced Technology</h2>
            <p className="text-muted-foreground text-lg">
              Built with cutting-edge AI and vector database technologies
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Vector Embeddings", icon: "🔗" },
              { name: "Real-time Processing", icon: "⚡" },
              { name: "Multi-platform APIs", icon: "🌐" },
              { name: "Sentiment Analysis", icon: "🎯" }
            ].map((tech, index) => (
              <Card key={index} className="p-6 text-center bg-card-elevated shadow-social">
                <div className="text-3xl mb-3">{tech.icon}</div>
                <h3 className="font-semibold text-card-foreground">{tech.name}</h3>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
