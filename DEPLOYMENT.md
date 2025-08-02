# Deployment Guide

This guide covers deploying the Social Media Trend Analysis System to various platforms and environments.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed
- Access to deployment platform (Vercel, Netlify, etc.)
- Supabase project set up
- OpenAI API key
- Social media API keys

### 1. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Social Media API Keys (at least one required)
VITE_TWITTER_BEARER_TOKEN=your_twitter_bearer_token
VITE_REDDIT_CLIENT_ID=your_reddit_client_id
VITE_YOUTUBE_API_KEY=your_youtube_api_key

# Application Configuration
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_REAL_TIME_COLLECTION=true
VITE_ENABLE_AI_INSIGHTS=true
```

### 2. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create social media posts table
CREATE TABLE social_media_posts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  engagement JSONB NOT NULL,
  metadata JSONB NOT NULL,
  sentiment JSONB NOT NULL,
  virality_score DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trends table
CREATE TABLE trends (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  hashtag TEXT,
  platform TEXT NOT NULL,
  category TEXT NOT NULL,
  metrics JSONB NOT NULL,
  sentiment JSONB NOT NULL,
  related_topics TEXT[] NOT NULL,
  influencers JSONB NOT NULL,
  timeline JSONB NOT NULL,
  virality_factors JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RAG queries table
CREATE TABLE rag_queries (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  results JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_posts_platform ON social_media_posts(platform);
CREATE INDEX idx_posts_timestamp ON social_media_posts(timestamp);
CREATE INDEX idx_posts_virality ON social_media_posts(virality_score);
CREATE INDEX idx_trends_category ON trends(category);
CREATE INDEX idx_trends_platform ON trends(platform);
```

## 🌐 Platform-Specific Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from your `.env` file

4. **Custom Domain (Optional)**
   - In Vercel dashboard, go to Domains
   - Add your custom domain
   - Configure DNS settings as instructed

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables**
   - Go to Netlify dashboard
   - Navigate to Site settings > Environment variables
   - Add all required environment variables

### Railway Deployment

1. **Connect your repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure environment variables**
   - Add all environment variables in Railway dashboard
   - Set build command: `npm run build`
   - Set start command: `npm run preview`

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   events {
     worker_connections 1024;
   }

   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;

     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
         try_files $uri $uri/ /index.html;
       }

       location /api {
         proxy_pass http://backend:3000;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
       }
     }
   }
   ```

3. **Build and run**
   ```bash
   docker build -t social-media-analyzer .
   docker run -p 80:80 social-media-analyzer
   ```

## 🔧 Production Configuration

### Performance Optimization

1. **Enable compression**
   ```bash
   npm install compression
   ```

2. **Configure caching headers**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@radix-ui/react-*'],
           },
         },
       },
     },
   });
   ```

3. **Enable service worker for caching**
   ```bash
   npm install workbox-webpack-plugin
   ```

### Security Configuration

1. **Content Security Policy**
   ```html
   <!-- index.html -->
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
   ```

2. **HTTPS enforcement**
   ```typescript
   // Force HTTPS in production
   if (import.meta.env.PROD && location.protocol !== 'https:') {
     location.replace(`https:${location.href.substring(location.protocol.length)}`);
   }
   ```

3. **API rate limiting**
   ```typescript
   // Implement rate limiting for API calls
   const rateLimiter = {
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   };
   ```

### Monitoring and Analytics

1. **Error tracking with Sentry**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **Performance monitoring**
   ```typescript
   // Add performance monitoring
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### Environment Variables in CI/CD

Set up secrets in your GitHub repository:

1. Go to Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
   - `VITE_TWITTER_BEARER_TOKEN`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## 📊 Database Migration

### Supabase Migrations

1. **Create migration files**
   ```sql
   -- migrations/001_initial_schema.sql
   CREATE TABLE IF NOT EXISTS social_media_posts (
     -- table definition
   );
   ```

2. **Run migrations**
   ```bash
   # Using Supabase CLI
   supabase db push
   ```

3. **Seed data (optional)**
   ```sql
   -- seed.sql
   INSERT INTO social_media_posts (id, platform, content, author, author_id, timestamp, engagement, metadata, sentiment, virality_score)
   VALUES (
     'sample_1',
     'twitter',
     'Sample tweet content',
     'sample_user',
     'user_123',
     NOW(),
     '{"likes": 100, "shares": 50, "comments": 25}',
     '{"hashtags": ["#sample"], "mentions": [], "urls": [], "language": "en"}',
     '{"score": 0.5, "magnitude": 0.8, "label": "positive", "emotions": {"joy": 0.6, "sadness": 0, "anger": 0, "fear": 0, "surprise": 0.2, "disgust": 0}, "confidence": 0.8}',
     0.75
   );
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Build failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment variables not loading**
   - Ensure all variables are prefixed with `VITE_`
   - Check deployment platform environment variable settings
   - Verify variable names match exactly

3. **Database connection issues**
   - Verify Supabase URL and API key
   - Check database permissions
   - Ensure tables are created correctly

4. **API rate limiting**
   - Implement exponential backoff
   - Add request queuing
   - Monitor API usage

### Performance Issues

1. **Slow loading times**
   - Enable code splitting
   - Optimize bundle size
   - Implement lazy loading

2. **Memory leaks**
   - Clean up event listeners
   - Dispose of subscriptions
   - Monitor memory usage

3. **Database performance**
   - Add proper indexes
   - Optimize queries
   - Implement caching

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load balancing**
   - Use CDN for static assets
   - Implement load balancer for API
   - Distribute database load

2. **Caching strategy**
   - Redis for session storage
   - CDN for static content
   - Database query caching

3. **Database scaling**
   - Read replicas for analytics
   - Connection pooling
   - Query optimization

### Monitoring and Alerting

1. **Set up monitoring**
   ```typescript
   // Add health checks
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });
   ```

2. **Configure alerts**
   - Error rate thresholds
   - Response time monitoring
   - Database connection alerts

3. **Logging**
   ```typescript
   // Structured logging
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API keys rotated regularly
- [ ] Content Security Policy configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CORS properly configured
- [ ] Error messages sanitized

## 📞 Support

For deployment issues:

1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check GitHub issues for known problems
4. Contact support with detailed error logs

---

This deployment guide covers the essential steps to get your Social Media Trend Analysis System running in production. Follow the platform-specific instructions and ensure all security measures are in place before going live. 