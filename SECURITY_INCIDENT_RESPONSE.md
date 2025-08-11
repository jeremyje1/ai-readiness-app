# SECURITY INCIDENT RESPONSE

## Issue: Webhook Secret Exposed
- **Date**: August 11, 2025
- **Type**: Stripe webhook secret exposed in git commit
- **Severity**: HIGH - Webhook endpoint could be compromised

## Immediate Actions Required:

### 1. Regenerate Stripe Webhook Secret
1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint
3. Click "Reveal" next to "Signing secret"
4. Click "Roll signing secret" to generate a new one
5. Copy the new secret (starts with `whsec_`)

### 2. Update Environment Variable
```bash
vercel env rm STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the new secret when prompted
```

### 3. Redeploy Application
```bash
vercel --prod
```

## Actions Taken:
- ✅ Removed exposed secret from test file
- ✅ Committed security fix
- ⏳ Awaiting new webhook secret from user

## Next Steps:
1. User generates new webhook secret in Stripe
2. User updates environment variable 
3. User redeploys application
4. Test webhook functionality with new secret

## Prevention:
- Never include real secrets in test files
- Use environment variables or placeholder values
- Set up .gitignore for sensitive files
- Regular security audits of codebase
