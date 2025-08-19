# 🚀 AI Readiness App - Deployment Guide

## Quick Deploy Commands

### Option 1: AI-Optimized Script (Recommended)
```bash
./deploy-ai-readiness.sh
```

### Option 2: Manual Vercel Deploy
```bash
# Pre-checks
./check-openai-models.sh
./test-enhanced-ai-pdf.sh

# Build and deploy
npm run build
vercel --prod
```

### Option 3: Git-based Deployment
```bash
git add .
git commit -m "AI features deployment"
git push origin main
# Auto-deploys via Vercel Git integration
```

## Environment Variables (Production)

Copy `.env.production.example` and configure:

```bash
# Critical for AI functionality
OPENAI_API_KEY=***REMOVED***
ENABLE_ADVANCED_AI=true

# Domain configuration
NEXT_PUBLIC_APP_URL=https://ai-readiness.northpathstrategies.org
NEXTAUTH_URL=https://ai-readiness.northpathstrategies.org

# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
```

## Pre-Deployment Checklist

- [ ] OpenAI API key configured and tested
- [ ] Database schema up to date
- [ ] All AI algorithms functional
- [ ] PDF generation working (15-30 second timeout)
- [ ] Environment variables set in Vercel dashboard
- [ ] Domain/subdomain configured

## AI-Specific Features

### Extended Timeouts
- API routes: 30 seconds (for GPT-4o processing)
- PDF generation: 30 seconds
- Assessment calculation: 25 seconds

### Monitoring
- AI reliability dashboard: `./ai-reliability-dashboard.sh`
- OpenAI model status: `./check-openai-models.sh`
- PDF generation test: `./test-enhanced-ai-pdf.sh`

## Troubleshooting

### Common Issues

1. **OpenAI API Timeout**
   - Check model availability: `./check-openai-models.sh`
   - Verify API key: `OPENAI_API_KEY` in environment

2. **PDF Generation Fails**
   - Run: `./test-enhanced-ai-pdf.sh`
   - Check timeout settings in `vercel.json`

3. **Assessment Calculation Errors**
   - Verify algorithm files in `/lib/algorithms/`
   - Check tier configuration in `/lib/tierConfiguration.ts`

## Post-Deployment Verification

```bash
# Test endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/ai-readiness/calculate

# Monitor logs
vercel logs your-project-name --follow
```

## Production URLs

- **Main App**: https://ai-readiness.northpathstrategies.org
- **Admin Dashboard**: https://ai-readiness.northpathstrategies.org/admin
- **API Health**: https://ai-readiness.northpathstrategies.org/api/health

---

**Status**: Production Ready ✅  
**AI Features**: 6 Patent-Pending Algorithms, GPT-4o Integration, Advanced PDF Generation
