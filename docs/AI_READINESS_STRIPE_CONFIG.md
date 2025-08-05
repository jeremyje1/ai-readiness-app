# AI Readiness Assessment - Environment Variables Setup

## Stripe Price IDs for AI Readiness

Add these environment variables to your production environment (Vercel, etc.):

```bash
# AI Readiness Assessment - Self-Service Tier ($2,500)
STRIPE_AI_BASIC_PRICE_ID=price_1RniBIELd2WOuqIWlSDnbDNn

# AI Roadmap Intensive - Custom Analysis + Consulting ($12,000)
STRIPE_AI_CUSTOM_PRICE_ID=price_1RniD9ELd2WOuqIW2zJKkdEJ
```

## Verification

The Stripe integration will:
- Fall back to these hardcoded price IDs if environment variables are not set
- Use environment variables in production for flexibility
- Route users to appropriate success/cancel pages after payment

## Next Steps for Production

1. **Set Environment Variables**: Add the above variables to your production deployment
2. **Test Payment Flow**: Verify both tier checkout flows work correctly
3. **Verify Redirects**: Ensure success/cancel redirects work as expected
4. **Monitor Conversions**: Track conversion from Tier 1 ($2,500) to Tier 2 ($12,000)

## Stripe Dashboard Products

These price IDs correspond to:
- **Self-Service**: AI Readiness Assessment ($2,500 one-time)
- **Custom Analysis**: AI Roadmap Intensive ($12,000 one-time)

Both are configured for one-time payments with appropriate redirect flows to start the assessment process.
