# AI Readiness App - Environment Setup Guide

## Required Environment Variables

The AI readiness app needs the following environment variables to function properly. Copy them from your main app's `.env.local` file.

### 1. Create the Environment File
```bash
cp .env.local.example .env.local
```

### 2. Required API Keys & Configurations

#### OpenAI (Required for AI analysis)
```bash
OPENAI_API_KEY="sk-your-openai-api-key-here"
OPENAI_ORG_ID="org-your-organization-id"
```

#### Stripe (Required for payments)
```bash
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key" 
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

#### Supabase (Required for database)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

#### SendGrid (Required for email notifications)
```bash
SENDGRID_API_KEY="SG_your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

### 3. Copy from Main App
If you have these variables in your main app, you can copy them:

```bash
# From the main app directory, copy the values to the AI app
cd ../organizational_realign_app
cat .env.local | grep -E "OPENAI|STRIPE|SUPABASE|SENDGRID" > ../ai-readiness-app/env_values.txt
```

### 4. Quick Setup Commands

Tell the other Copilot to run these commands to set up the environment:

```bash
# 1. Copy the example file
cp .env.local.example .env.local

# 2. Edit the file with your actual API keys
# Replace all placeholder values with your real API keys from the main app
```

### 5. Verification
After setting up, verify the environment works:

```bash
npm run build
npm run dev
```

## Security Notes
- Never commit `.env.local` to version control
- Use different Stripe keys for development/production  
- Rotate API keys regularly
- Use environment-specific Supabase projects

## For Copilot Instructions
When working in the AI readiness app workspace, remind the user to:
1. Copy their API keys from the main app's `.env.local`
2. Update the `.env.local` file in the AI app with actual values
3. Ensure all required services (OpenAI, Stripe, Supabase, SendGrid) are configured

## Optional Debug Flags

### ALGORITHM_DEBUG
Set `ALGORITHM_DEBUG=1` to enable verbose enterprise algorithm logging (factor JSON + persistence diagnostics). Omit or set to 0 in production.
