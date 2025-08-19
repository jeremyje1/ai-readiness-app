# Vercel Deployment Guide with Security Considerations

This document outlines the deployment process for the NorthPath Strategies application on Vercel, with a focus on security best practices.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A Vercel account with appropriate permissions
2. Access to the GitHub repository
3. Access to required environment variables and API keys

## Deployment Steps

### 1. Connect Repository to Vercel

1. Log in to your Vercel account
2. Click "Import Project" and select "From Git Repository"
3. Select the GitHub repository: `jeremyje1/organizational_realign_app` (or the current repository)
4. Select the `clean-branch` branch as the production branch

### 2. Configure Environment Variables

All sensitive information must be stored as environment variables in Vercel, never in the codebase.

#### Required Environment Variables

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://{your-project-id}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={your-anon-key}
SUPABASE_SERVICE_ROLE_KEY={your-service-role-key}

# Database
DATABASE_URL=postgresql://postgres:{password}@db.{project-id}.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=https://northpathstrategies.org
NEXTAUTH_SECRET={generated-secret}

# OAuth Providers
GITHUB_ID={github-client-id}
GITHUB_SECRET={github-client-secret}
AUTH0_CLIENT_ID={auth0-client-id}
AUTH0_CLIENT_SECRET={auth0-client-secret}
AUTH0_ISSUER={auth0-issuer-url}
GOOGLE_CLIENT_ID={google-client-id}
GOOGLE_CLIENT_SECRET={google-client-secret}

# Stripe Integration
STRIPE_SECRET_KEY={stripe-secret-key}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY={stripe-publishable-key}
STRIPE_WEBHOOK_SECRET={stripe-webhook-secret}

# Stripe Price IDs
STRIPE_SINGLE_USE_PRICE_ID={price-id}
STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID={price-id}
STRIPE_COMPREHENSIVE_PRICE_ID={price-id}
STRIPE_ENTERPRISE_PRICE_ID={price-id}

# OpenAI (if used)
OPENAI_API_KEY={openai-api-key}
```

### 3. Setting Environment Variables in Vercel

1. Navigate to your project in the Vercel dashboard
2. Go to "Settings" > "Environment Variables"
3. Add each required variable with its corresponding value
4. Specify which environments (Production, Preview, Development) should have access to each variable
5. For sensitive values, use Preview/Production environments only (not Development)

### 4. Domain Configuration

1. Navigate to "Settings" > "Domains"
2. Add and verify the following domains:
   - northpathstrategies.org
   - www.northpathstrategies.org
   - app.northpathstrategies.org

### 5. Security Settings

1. Enable "Protected Deployments" under project settings
2. Configure GitHub integration with required status checks
3. Set up deployment notifications

## Security Best Practices

### API Key Rotation

Regularly rotate the following API keys:

- Stripe API keys: Every 90 days
- Supabase API keys: Every 90 days
- OAuth client secrets: Every 180 days

### Access Control

- Limit Vercel project access to essential team members only
- Use role-based access control where possible
- Regularly audit team member permissions

### Environment Separation

- Use different API keys for Development, Preview, and Production environments
- Never share Production API keys with Development environments

### Monitoring

- Set up monitoring and alerts for unusual deployment activity
- Configure notification channels for successful and failed deployments
- Implement error tracking (e.g., Sentry) to catch runtime issues

## Deployment Verification

After deployment, verify:

1. All pages load correctly
2. Authentication flows work as expected
3. Payment processes function properly
4. No sensitive information appears in client-side code

## Rollback Procedure

If issues are discovered after deployment:

1. Immediately check for security implications
2. Navigate to the Deployments tab in Vercel
3. Select the last stable deployment
4. Click "Promote to Production"
5. Investigate and fix issues before redeploying

## Contact Information

For deployment issues or security concerns, contact:

- Jeremy Estrella: jeremy@northpathstrategies.org

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Security Best Practices Documentation](./SECURITY_BEST_PRACTICES.md)
