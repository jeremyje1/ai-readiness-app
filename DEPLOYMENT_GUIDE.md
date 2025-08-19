# Deployment Guide - NorthPath Analytics Platform

## Prerequisites Checklist

### 1. Environment Variables Update ✅

Update the following environment variables in Vercel Dashboard:

#### Domain & URL Variables

```
NEXT_PUBLIC_DOMAIN=app.northpathstrategies.org
NEXT_PUBLIC_APP_URL=https://app.northpathstrategies.org
NEXT_PUBLIC_BASE_URL=https://app.northpathstrategies.org
NEXTAUTH_URL=https://app.northpathstrategies.org
```

#### Database Variables

```
DATABASE_URL=<production_database_url>
SUPABASE_URL=<production_supabase_url>
NEXT_PUBLIC_SUPABASE_URL=<production_supabase_url>
SUPABASE_ANON_KEY=<production_anon_key>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<production_service_role_key>
```

#### Auth Variables

```
NEXTAUTH_SECRET=<secure_random_string>
GOOGLE_CLIENT_ID=<production_google_client_id>
GOOGLE_CLIENT_SECRET=<production_google_client_secret>
GITHUB_ID=<production_github_id>
GITHUB_SECRET=<production_github_secret>
AUTH0_CLIENT_ID=<production_auth0_client_id>
AUTH0_CLIENT_SECRET=<production_auth0_client_secret>
AUTH0_ISSUER=<production_auth0_issuer>
```

#### Payment Variables

```
STRIPE_SECRET_KEY=<production_stripe_secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<production_stripe_publishable>
STRIPE_WEBHOOK_SECRET=<production_webhook_secret>
STRIPE_BASIC_PRICE_ID=<basic_price_id>
STRIPE_COMPREHENSIVE_PRICE_ID=<comprehensive_price_id>
STRIPE_AI_ENHANCED_PRICE_ID=<ai_enhanced_price_id>
STRIPE_ENTERPRISE_PRICE_ID=<enterprise_price_id>
STRIPE_TEAM_PRICE_ID=<team_price_id>
```

#### AI & External Services

```
OPENAI_API_KEY=<production_openai_key>
```

### 2. Database Migration 🔄

Run Prisma migration deployment (after fixing database connection):

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="<production_database_url>"

# Deploy migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. Vercel Configuration ✅

Updated `vercel.json` with:

- Correct domain: `app.northpathstrategies.org`
- Extended function timeouts for AI/PDF generation (30s)
- CORS headers for API routes
- Regional deployment (IAD1)

### 4. Power BI Configuration 🔄

#### Required Actions:

1. **Power BI Admin Portal**
   - Add `app.northpathstrategies.org` to embed allowlist
   - Configure tenant settings for embedding
   - Enable service principal access

2. **Azure AD App Registration**
   - Update redirect URIs to include `https://app.northpathstrategies.org`
   - Configure API permissions for Power BI Service
   - Add application secrets for production

3. **Power BI Workspace**
   - Configure workspace for app-only authentication
   - Assign service principal permissions
   - Validate report and dataset access

## Deployment Steps

### Step 1: Update Environment Variables

```bash
# Using Vercel CLI (if available)
vercel env add NEXT_PUBLIC_DOMAIN production
# Enter: app.northpathstrategies.org

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://app.northpathstrategies.org

# Or update via Vercel Dashboard:
# https://vercel.com/dashboard/settings/environment-variables
```

### Step 2: Database Setup

```bash
# Ensure production database is accessible
# Update DATABASE_URL in Vercel environment
# Run migration deployment
pnpm run prisma migrate deploy
```

### Step 3: Deploy Application

```bash
# Deploy to Vercel
vercel --prod

# Or trigger deployment via Git push to main branch
git push origin main
```

### Step 4: Post-Deployment Verification

#### Health Checks

- [ ] Application loads at `https://app.northpathstrategies.org`
- [ ] API endpoints respond correctly
- [ ] Authentication flow works
- [ ] Database connections established
- [ ] Power BI reports load
- [ ] File upload functionality works
- [ ] AI PDF generation functions

#### API Endpoint Tests

```bash
# Test health endpoint
curl https://app.northpathstrategies.org/api/health

# Test upload endpoint
curl -X POST https://app.northpathstrategies.org/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-data.csv"

# Test AI report generation
curl -X POST https://app.northpathstrategies.org/api/report/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'
```

### Step 5: External Service Configuration

#### Power BI Embed Setup

1. Login to Power BI Admin Portal
2. Navigate to Tenant Settings > Developer Settings
3. Add `app.northpathstrategies.org` to "Embed content in apps"
4. Configure service principal authentication
5. Test embed functionality

#### Stripe Webhook Configuration

```bash
# Update webhook endpoint in Stripe Dashboard
# Endpoint: https://app.northpathstrategies.org/api/webhooks/stripe
# Events: subscription.created, subscription.updated, subscription.deleted
```

#### Auth Provider Updates

- **Google OAuth**: Add `https://app.northpathstrategies.org` to authorized origins
- **GitHub OAuth**: Update callback URL to `https://app.northpathstrategies.org/api/auth/callback/github`
- **Auth0**: Update allowed callback URLs and origins

## Monitoring & Maintenance

### Performance Monitoring

- Vercel Analytics enabled
- Error tracking via Vercel monitoring
- Database performance via Supabase metrics

### Backup Strategy

- Database: Automated daily backups via Supabase
- File uploads: S3 backup strategy (if implemented)
- Configuration: Environment variables documented

### SSL/Security

- SSL certificate automatically managed by Vercel
- Security headers configured in `next.config.js`
- API rate limiting implemented

## Rollback Plan

### If Deployment Fails

1. Revert environment variables to previous values
2. Rollback database migrations if necessary:
   ```bash
   npx prisma migrate reset --force
   npx prisma migrate deploy
   ```
3. Deploy previous working version via Vercel dashboard

### Emergency Contacts

- Vercel Support: Dashboard help
- Supabase Support: Database issues
- Stripe Support: Payment processing
- Power BI Support: Embedding issues

## Security Checklist

- [ ] All production secrets are encrypted
- [ ] No development keys in production
- [ ] CORS properly configured
- [ ] API rate limiting enabled
- [ ] Database access restricted to application
- [ ] File upload validation implemented
- [ ] User input sanitization active

## Post-Deployment TODO

1. Monitor error rates for 24 hours
2. Validate all user workflows
3. Test payment processing end-to-end
4. Verify Power BI embed functionality
5. Check email notifications
6. Validate backup systems
7. Update documentation with any issues found
