export interface EnvironmentConfig {
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // OpenAI Configuration
  openai: {
    apiKey: string;
    model: string;
  };
  
  // Social Media API Keys
  socialMedia: {
    twitter: {
      bearerToken: string;
      apiKey: string;
      apiSecret: string;
      accessToken: string;
      accessTokenSecret: string;
      rateLimit: number;
    };
    reddit: {
      clientId: string;
      clientSecret: string;
      userAgent: string;
      rateLimit: number;
    };
    youtube: {
      apiKey: string;
      rateLimit: number;
    };
    instagram: {
      accessToken: string;
      appId: string;
      appSecret: string;
    };
    tiktok: {
      clientKey: string;
      clientSecret: string;
    };
    linkedin: {
      clientId: string;
      clientSecret: string;
    };
    facebook: {
      appId: string;
      appSecret: string;
    };
  };
  
  // Data Processing Configuration
  dataProcessing: {
    collectionFrequency: 'realtime' | 'hourly' | 'daily';
    minEngagementThreshold: number;
    maxPostsPerCollection: number;
  };
  
  // AI/ML Configuration
  ai: {
    sentimentConfidenceThreshold: number;
    viralityScoreThreshold: number;
  };
  
  // Database Configuration
  database: {
    url: string;
    poolSize: number;
  };
  
  // Redis Configuration
  redis: {
    url: string;
    password: string;
  };
  
  // Vector Database Configuration
  vectorDb: {
    chromaUrl: string;
    dimension: number;
  };
  
  // Application Configuration
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
  };
  
  // Feature Flags
  features: {
    realTimeCollection: boolean;
    aiInsights: boolean;
    viralityPrediction: boolean;
    culturalContext: boolean;
  };
  
  // Monitoring and Analytics
  monitoring: {
    analytics: boolean;
    analyticsId: string;
    errorTracking: boolean;
    errorTrackingDsn: string;
  };
  
  // Security
  security: {
    jwtSecret: string;
    encryptionKey: string;
    corsOrigin: string;
  };
  
  // Development Configuration
  development: {
    devMode: boolean;
    mockData: boolean;
    debugMode: boolean;
  };
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
    },
    
    socialMedia: {
      twitter: {
        bearerToken: import.meta.env.VITE_TWITTER_BEARER_TOKEN || '',
        apiKey: import.meta.env.VITE_TWITTER_API_KEY || '',
        apiSecret: import.meta.env.VITE_TWITTER_API_SECRET || '',
        accessToken: import.meta.env.VITE_TWITTER_ACCESS_TOKEN || '',
        accessTokenSecret: import.meta.env.VITE_TWITTER_ACCESS_TOKEN_SECRET || '',
        rateLimit: parseInt(import.meta.env.VITE_TWITTER_RATE_LIMIT || '300'),
      },
      reddit: {
        clientId: import.meta.env.VITE_REDDIT_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_REDDIT_CLIENT_SECRET || '',
        userAgent: import.meta.env.VITE_REDDIT_USER_AGENT || 'SocialMediaTrendAnalyzer/1.0',
        rateLimit: parseInt(import.meta.env.VITE_REDDIT_RATE_LIMIT || '60'),
      },
      youtube: {
        apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
        rateLimit: parseInt(import.meta.env.VITE_YOUTUBE_RATE_LIMIT || '10000'),
      },
      instagram: {
        accessToken: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN || '',
        appId: import.meta.env.VITE_INSTAGRAM_APP_ID || '',
        appSecret: import.meta.env.VITE_INSTAGRAM_APP_SECRET || '',
      },
      tiktok: {
        clientKey: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
        clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || '',
      },
      linkedin: {
        clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || '',
      },
      facebook: {
        appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
        appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
      },
    },
    
    dataProcessing: {
      collectionFrequency: (import.meta.env.VITE_DATA_COLLECTION_FREQUENCY as any) || 'hourly',
      minEngagementThreshold: parseInt(import.meta.env.VITE_MIN_ENGAGEMENT_THRESHOLD || '100'),
      maxPostsPerCollection: parseInt(import.meta.env.VITE_MAX_POSTS_PER_COLLECTION || '1000'),
    },
    
    ai: {
      sentimentConfidenceThreshold: parseFloat(import.meta.env.VITE_SENTIMENT_ANALYSIS_CONFIDENCE_THRESHOLD || '0.7'),
      viralityScoreThreshold: parseFloat(import.meta.env.VITE_VIRALITY_SCORE_THRESHOLD || '0.6'),
    },
    
    database: {
      url: import.meta.env.VITE_DATABASE_URL || '',
      poolSize: parseInt(import.meta.env.VITE_DATABASE_POOL_SIZE || '10'),
    },
    
    redis: {
      url: import.meta.env.VITE_REDIS_URL || '',
      password: import.meta.env.VITE_REDIS_PASSWORD || '',
    },
    
    vectorDb: {
      chromaUrl: import.meta.env.VITE_CHROMA_DB_URL || '',
      dimension: parseInt(import.meta.env.VITE_VECTOR_DIMENSION || '1536'),
    },
    
    app: {
      name: import.meta.env.VITE_APP_NAME || 'Social Media Trend Analyzer',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: (import.meta.env.VITE_APP_ENVIRONMENT as any) || 'development',
    },
    
    features: {
      realTimeCollection: import.meta.env.VITE_ENABLE_REAL_TIME_COLLECTION === 'true',
      aiInsights: import.meta.env.VITE_ENABLE_AI_INSIGHTS === 'true',
      viralityPrediction: import.meta.env.VITE_ENABLE_VIRALITY_PREDICTION === 'true',
      culturalContext: import.meta.env.VITE_ENABLE_CULTURAL_CONTEXT === 'true',
    },
    
    monitoring: {
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
      errorTracking: import.meta.env.VITE_ERROR_TRACKING_ENABLED === 'true',
      errorTrackingDsn: import.meta.env.VITE_ERROR_TRACKING_DSN || '',
    },
    
    security: {
      jwtSecret: import.meta.env.VITE_JWT_SECRET || '',
      encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || '',
      corsOrigin: import.meta.env.VITE_CORS_ORIGIN || 'http://localhost:3000',
    },
    
    development: {
      devMode: import.meta.env.VITE_DEV_MODE === 'true',
      mockData: import.meta.env.VITE_MOCK_DATA_ENABLED === 'true',
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    },
  };
};

export const config = getEnvironmentConfig();

// Validation function to check if required environment variables are set
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.supabase.url) errors.push('VITE_SUPABASE_URL is required');
  if (!config.supabase.anonKey) errors.push('VITE_SUPABASE_ANON_KEY is required');
  if (!config.openai.apiKey) errors.push('VITE_OPENAI_API_KEY is required');
  
  // Check if at least one social media API is configured
  const hasSocialMediaConfig = 
    config.socialMedia.twitter.bearerToken ||
    config.socialMedia.reddit.clientId ||
    config.socialMedia.youtube.apiKey;
    
  if (!hasSocialMediaConfig) {
    errors.push('At least one social media API configuration is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to get platform-specific configuration
export const getPlatformConfig = (platform: string) => {
  switch (platform) {
    case 'twitter':
      return config.socialMedia.twitter;
    case 'reddit':
      return config.socialMedia.reddit;
    case 'youtube':
      return config.socialMedia.youtube;
    case 'instagram':
      return config.socialMedia.instagram;
    case 'tiktok':
      return config.socialMedia.tiktok;
    case 'linkedin':
      return config.socialMedia.linkedin;
    case 'facebook':
      return config.socialMedia.facebook;
    default:
      return null;
  }
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['features']): boolean => {
  return config.features[feature];
};

// Helper function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return config.app.environment === 'development' || config.development.devMode;
};

// Helper function to check if mock data should be used
export const shouldUseMockData = (): boolean => {
  return config.development.mockData || isDevelopment();
}; 