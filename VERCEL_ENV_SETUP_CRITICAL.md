# ⚠️ CRITICAL: Vercel Environment Variables Setup

**Build failed due to missing environment variables!**

## Immediate Action Required

Go to your Vercel project dashboard and add these environment variables:

### 1. Access Vercel Settings
```
https://vercel.com/jeremyje1/ai-readiness-app/settings/environment-variables
```

### 2. Required Environment Variables (Build will fail without these)

#### **SUPABASE (CRITICAL - Build blocker)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these:**
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

#### **SITE URL (CRITICAL)**
```bash
NEXT_PUBLIC_SITE_URL=https://aiblueprint.educationaiblueprint.com
```

### 3. Important Environment Variables (Features won't work without these)

#### **SENDGRID (Email delivery)**
```bash
SENDGRID_API_KEY=SG_your-actual-api-key-here
SENDGRID_FROM_EMAIL=noreply@educationaiblueprint.com
SENDGRID_FROM_NAME=AI Readiness Assessment
```

**⚠️ SECURITY NOTE:** 
- The exposed API key `SG_pffbbgUxR...` from git history should be DELETED and replaced
- Create a NEW SendGrid API key at: https://app.sendgrid.com/settings/api_keys
- Delete the old exposed key immediately

#### **OPENAI (AI analysis)**
```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ORG_ID=org-your-organization-id
```

#### **STRIPE (Payments)**
```bash
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_EDU_MONTHLY_199=price_your-monthly-price-id
STRIPE_PRICE_JEREMY_CONSULTATION=price_your-consultation-price-id
```

### 4. Optional Environment Variables

```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV=false

# AI Configuration
AI_ANALYSIS_MODEL=gpt-4
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt

# Founder Image
NEXT_PUBLIC_JEREMY_HEADSHOT_URL=https://northpathstrategies.org/your-path.jpg
```

## How to Add in Vercel

### Option 1: Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/jeremyje1/ai-readiness-app/settings/environment-variables
2. Click "Add New" for each variable
3. Enter Name and Value
4. Select environments: Production, Preview, Development (check all 3)
5. Click "Save"

### Option 2: Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add SENDGRID_API_KEY
# ... etc
```

### Option 3: Import from .env.local
```bash
# Copy your local .env.local values to Vercel
vercel env pull .env.vercel.local
```

## After Adding Variables

### Redeploy
Once all environment variables are added:

1. **Automatic redeploy:**
   - Vercel will auto-redeploy the `demo-final-clean` branch
   - Check deployment status at: https://vercel.com/jeremyje1/ai-readiness-app

2. **Manual redeploy (if needed):**
   ```bash
   # Trigger redeploy without code changes
   vercel --prod
   ```

3. **Or redeploy from dashboard:**
   - Go to: https://vercel.com/jeremyje1/ai-readiness-app/deployments
   - Find the failed deployment
   - Click "..." → "Redeploy"

## Verification Checklist

After deployment succeeds:

- [ ] Visit: https://aiblueprint.educationaiblueprint.com
- [ ] Check homepage loads
- [ ] Visit: https://aiblueprint.educationaiblueprint.com/demo
- [ ] Verify auto-login works
- [ ] Check dashboard displays mock data
- [ ] Test demo banner countdown
- [ ] Start guided tour
- [ ] Submit assessment (test email delivery)

## Security Best Practices

### ✅ DO:
- Use environment variables for ALL secrets
- Rotate the exposed SendGrid API key immediately
- Use different keys for development vs production
- Enable Vercel's secret scanning
- Review access logs periodically

### ❌ DON'T:
- Commit API keys to git (we already fixed this)
- Share service role keys publicly
- Use the same keys across environments
- Bypass GitHub's push protection

## Current Build Error

```
Error: Missing environment variable: NEXT_PUBLIC_SUPABASE_URL
```

**This means:** Vercel doesn't have the Supabase configuration yet.

**Fix:** Add the 3 CRITICAL Supabase variables listed above.

## Need Help?

### Supabase Setup
- Dashboard: https://supabase.com/dashboard
- Documentation: https://supabase.com/docs/guides/getting-started

### SendGrid Setup
- Dashboard: https://app.sendgrid.com
- API Keys: https://app.sendgrid.com/settings/api_keys
- **Action Required:** Delete exposed key, create new one

### Vercel Support
- Documentation: https://vercel.com/docs/concepts/projects/environment-variables
- Support: https://vercel.com/support

## Quick Start (Copy-Paste Ready)

Once you have your actual values, you can add them all at once:

```bash
# Add these in Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://aiblueprint.educationaiblueprint.com
SENDGRID_API_KEY=SG_NEW_KEY_HERE  # ⚠️ Create NEW key, delete old one
SENDGRID_FROM_EMAIL=noreply@educationaiblueprint.com
SENDGRID_FROM_NAME=AI Readiness Assessment
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Summary

**Problem:** Build failed - missing Supabase environment variables
**Solution:** Add environment variables in Vercel dashboard
**Priority:** CRITICAL - deployment blocked until fixed
**Time:** 5-10 minutes to add variables
**Next Step:** Vercel will auto-redeploy once variables are added
