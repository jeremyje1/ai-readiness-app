# Production Environment Variables Setup

## 🚨 CRITICAL - Missing Supabase Environment Variables

The production deployment is failing because Supabase environment variables are not configured in Vercel.

### Required Environment Variables for Vercel Production:

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app
   - Go to Settings → Environment Variables

2. **Add these Supabase variables:**

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://jocigzsthcpspxfdfxae.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIzMTE3NiwiZXhwIjoyMDY4ODA3MTc2fQ.-o5WI0bTZ7fExVlaP38Rf4FetsIP7XtBsmSMJGbt2N0

# Email Configuration (REQUIRED)
POSTMARK_SERVER_TOKEN=your-new-postmark-token-here
FROM_EMAIL=info@northpathstrategies.org
REPLY_TO_EMAIL=info@northpathstrategies.org
ADMIN_NOTIFICATION_EMAIL=info@northpathstrategies.org

# Authentication (REQUIRED)
NEXTAUTH_URL=https://aiblueprint.k12aiblueprint.com

# Stripe Configuration (REQUIRED)
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. **Important Notes:**

- **POSTMARK_SERVER_TOKEN**: Use your NEW token after rotating the exposed one
- **STRIPE_WEBHOOK_SECRET**: The webhook secret from your Stripe dashboard
- **Environment**: Set all variables for "Production" environment

### 4. **Deploy After Adding Variables:**

After adding all environment variables, redeploy:
```bash
vercel --prod
```

## Error Details:

**Current Error**: `supabaseKey is required`
**Cause**: Missing `NEXT_PUBLIC_SUPABASE_ANON_KEY` in production environment
**Impact**: Payment verification system cannot access database

## Priority:

🔴 **HIGH PRIORITY** - This prevents paying customers from accessing their purchased services!
