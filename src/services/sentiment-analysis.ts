import Sentiment from 'sentiment';
import { SentimentAnalysis } from '@/types/social-media';

const sentiment = new Sentiment();

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    // Use the sentiment library for basic analysis
    const result = sentiment.analyze(text);
    
    // Calculate sentiment score (-1 to 1)
    const score = Math.max(-1, Math.min(1, result.score / 10));
    
    // Determine sentiment label
    let label: 'positive' | 'negative' | 'neutral' | 'mixed';
    if (score > 0.1) {
      label = 'positive';
    } else if (score < -0.1) {
      label = 'negative';
    } else {
      label = 'neutral';
    }
    
    // Analyze emotions (simplified version)
    const emotions = analyzeEmotions(text);
    
    // Calculate confidence based on text length and sentiment strength
    const confidence = Math.min(0.95, Math.max(0.5, Math.abs(score) * 0.8 + 0.2));
    
    return {
      score,
      magnitude: Math.abs(result.score),
      label,
      emotions,
      confidence,
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      score: 0,
      magnitude: 0,
      label: 'neutral',
      emotions: {
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        disgust: 0,
      },
      confidence: 0.5,
    };
  }
}

function analyzeEmotions(text: string) {
  const lowerText = text.toLowerCase();
  
  // Simple emotion keyword matching
  const joyWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'love', 'lol', 'haha'];
  const sadnessWords = ['sad', 'depressed', 'crying', 'miss', 'lost', 'alone', 'hurt'];
  const angerWords = ['angry', 'mad', 'hate', 'furious', 'rage', 'annoyed', 'fuck'];
  const fearWords = ['scared', 'afraid', 'terrified', 'worried', 'anxious', 'panic'];
  const surpriseWords = ['wow', 'omg', 'unexpected', 'shocked', 'surprised', 'amazing'];
  const disgustWords = ['disgusting', 'gross', 'nasty', 'awful', 'terrible'];
  
  const joy = calculateEmotionScore(lowerText, joyWords);
  const sadness = calculateEmotionScore(lowerText, sadnessWords);
  const anger = calculateEmotionScore(lowerText, angerWords);
  const fear = calculateEmotionScore(lowerText, fearWords);
  const surprise = calculateEmotionScore(lowerText, surpriseWords);
  const disgust = calculateEmotionScore(lowerText, disgustWords);
  
  return { joy, sadness, anger, fear, surprise, disgust };
}

function calculateEmotionScore(text: string, emotionWords: string[]): number {
  let score = 0;
  for (const word of emotionWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  return Math.min(1, score / 5); // Normalize to 0-1
} 