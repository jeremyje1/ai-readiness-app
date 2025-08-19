# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in your Vercel project dashboard:

### 1. Go to Vercel Dashboard
- Navigate to your project
- Go to Settings > Environment Variables

### 2. Add the following variables:

#### Core Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### Team Plan Pricing (Test Mode)
```
STRIPE_PRICE_TEAM_MONTHLY=price_1Rxb2wRMpSG47vNmCzxZGv5I
STRIPE_PRICE_TEAM_YEARLY=price_1Rxb32RMpSG47vNmlMtDijH7
```

#### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

#### Database & AI (if already configured)
```
NEXT_PUBLIC_AI_READINESS_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_AI_READINESS_SUPABASE_ANON_KEY=your_anon_key
AI_READINESS_SUPABASE_URL=https://your-project.supabase.co
AI_READINESS_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
```

### 3. Environment Settings
- Set environment to: **Production** and **Preview**
- Click "Add" for each variable

### 4. Redeploy
After adding all variables, trigger a new deployment:
- Go to Deployments tab
- Click "Redeploy" on the latest deployment

## Verification Commands

After deployment, verify the setup:

### Check Config Status
```bash
curl https://your-domain.vercel.app/api/stripe/config-status
```
Expected: `"allPresent": true`

### Test Unified Checkout
```bash
open "https://your-domain.vercel.app/api/stripe/unified-checkout?product=team&billing=monthly&trial_days=7&return_to=k12&contact_email=test@example.com"
```

### Local Verification (optional)
```bash
npm run verify:stripe:prices
```

## Production Setup

When ready for live mode:
1. Create live mode products/prices in Stripe Dashboard
2. Update environment variables with `sk_live_` and `price_` IDs
3. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - Events: checkout.session.completed, customer.subscription.*
4. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

## Team Plan Pricing
- **Monthly**: $995.00/month
- **Yearly**: $10,000.00/year
- **Trial**: 7 days supported via unified checkout
