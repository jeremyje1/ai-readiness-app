# AI Blueprint Platform - Deployment Guide

## 🚨 CRITICAL PRODUCTION FIXES APPLIED (January 2025)

### Issues Resolved:
1. ✅ **Missing Supabase environment variables** - Now validated at build time
2. ✅ **Assessment routes hanging** - Added proper error states and loading feedback
3. ✅ **Debug route exposed in production** - Locked down via middleware
4. ✅ **No health monitoring** - Added comprehensive health check endpoint
5. ✅ **Missing error boundaries** - Added application-wide error handling

## Overview
This guide covers the deployment process for the AI Blueprint platform, which serves both K-12 and Higher Education institutions at `https://aiblueprint.k12aiblueprint.com`.

## Prerequisites

### Required Services
- **Supabase**: Database and authentication
- **Stripe**: Payment processing
- **Postmark**: Email delivery
- **OpenAI**: AI features
- **Vercel** (recommended) or any Node.js hosting platform

### Environment Variables
All required environment variables must be configured before deployment. See `.env.local.example` for the complete list.

#### 🔴 CRITICAL Variables (App won't work without these):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
NEXT_PUBLIC_SITE_URL=https://aiblueprint.k12aiblueprint.com
```

## Pre-Deployment Checklist

### 1. Validate Environment
```bash
node scripts/validate-env.js
```
This script checks all required environment variables and their formats.

**NEW:** The application now includes runtime validation via `lib/env.ts` that will fail fast if critical variables are missing.

### 2. Run Tests
```bash
npm run typecheck
npm run lint
npm run test:run
```

### 3. Build Locally
```bash
npm run build
```
Ensure the build completes without errors.

## Deployment Steps

### Option 1: Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all variables from `.env.local` (production values)
   - Ensure `NODE_ENV=production`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Manual Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Configure Reverse Proxy** (nginx example)
   ```nginx
   server {
       listen 443 ssl http2;
       server_name aiblueprint.k12aiblueprint.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-Deployment Configuration

### 1. Configure Stripe Webhooks
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://aiblueprint.k12aiblueprint.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 2. Configure Supabase
1. **Database Tables**: Run migrations in `supabase/migrations/`
2. **Row Level Security**: Enable RLS on all tables
3. **Edge Functions**: Deploy if using Supabase Edge Functions

### 3. Configure Postmark
1. Verify sender domain
2. Add SPF/DKIM records to DNS
3. Set up email templates if needed

### 4. Set Up Monitoring

#### Health Check Endpoint
Monitor: `https://aiblueprint.k12aiblueprint.com/api/health`

Expected healthy response:
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok" },
    "stripe": { "status": "ok", "mode": "live" },
    "email": { "status": "ok" },
    "openai": { "status": "ok" }
  }
}
```

#### Recommended Monitoring Services
- **Uptime**: Pingdom, UptimeRobot
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Mixpanel
- **Performance**: Vercel Analytics, Lighthouse CI

## Domain Configuration

### Primary Domain
The application is configured to run at `https://aiblueprint.k12aiblueprint.com`

### Institution-Specific Routing
The platform automatically detects and adapts based on:
1. User's saved institution type (localStorage)
2. Onboarding selection
3. Domain context (fallback)

## Security Considerations

### Required Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
];
```

### Environment Security
- Never commit `.env.local` files
- Use different API keys for development/staging/production
- Rotate keys regularly
- Use Stripe restricted keys when possible

## Troubleshooting

### Common Issues

1. **Assessment Loading Error**
   - Check `/api/ai-readiness/questions` endpoint
   - Verify question data is properly loaded
   - Check browser console for specific errors

2. **Payment Processing Issues**
   - Verify Stripe webhook is configured
   - Check webhook secret matches environment variable
   - Ensure Stripe keys are for correct mode (test/live)

3. **Authentication Problems**
   - Verify Supabase URL and keys
   - Check JWT expiration settings
   - Ensure cookies are enabled

4. **Email Delivery Failures**
   - Verify Postmark API token
   - Check sender domain verification
   - Review email bounce logs

### Debug Mode
Add `?debug=1` to URLs for additional diagnostic information:
- `/api/payments/status?debug=1`
- `/ai-readiness/dashboard?debug=1`

## Rollback Procedure

1. **Vercel**: Use dashboard to instantly rollback to previous deployment
2. **Manual**: Keep previous build artifacts and switch symlinks
3. **Database**: Always backup before migrations

## Performance Optimization

### Recommended Optimizations
1. Enable Next.js Image Optimization
2. Use CDN for static assets
3. Enable gzip/brotli compression
4. Implement caching strategies:
   - Static pages: 1 hour
   - API responses: 5-15 minutes
   - Assets: 1 year with cache busting

### Bundle Size Monitoring
```bash
npm run analyze
```
Target metrics:
- First Load JS: < 200kB
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

## Maintenance Mode

To enable maintenance mode:
1. Create `public/maintenance.html`
2. Configure server to serve this file for all routes
3. Return 503 status code

## Support and Monitoring Contacts

- **Technical Issues**: tech@aiblueprint.com
- **Payment Issues**: billing@aiblueprint.com
- **On-call Engineer**: [Rotation Schedule]
- **Escalation**: [Management Contact]

## Backup and Disaster Recovery

### Daily Backups
- Database: Automated via Supabase
- User uploads: Stored in Supabase Storage with versioning
- Configuration: Version controlled in Git

### Recovery Time Objectives
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours

## Compliance

### Data Protection
- FERPA compliant for educational records
- COPPA compliant for K-12 students
- GDPR ready for international users

### Security Audits
- Quarterly security reviews
- Annual penetration testing
- Continuous dependency scanning

---

Last Updated: December 2024
Version: 1.0.0