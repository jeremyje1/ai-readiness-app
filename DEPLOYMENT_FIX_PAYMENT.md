# Payment System Fix - Oct 6, 2025

## Issues Fixed

1. **Stripe Checkout 500 Error**
   - Problem: The `process.env.NEXT_PUBLIC_SITE_URL` was undefined on server-side
   - Solution: Updated both `/api/stripe/edu-checkout` and `/api/stripe/unified-checkout` to use fallback URL logic:
     ```typescript
     const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://aiblueprint.educationaiblueprint.com';
     ```

2. **Payment Status 401 Error**  
   - The `/api/payments/status` endpoint returns 401 due to authentication issues
   - This might be related to cookie/CORS configuration but the code looks correct

## Changes Made

1. **app/api/stripe/edu-checkout/route.ts**
   - Added baseUrl calculation with fallbacks for success/cancel URLs
   - Fixed both POST and GET methods

2. **app/api/stripe/unified-checkout/route.ts**
   - Updated buildCheckoutUrls to use correct domain with fallbacks
   - Changed hardcoded 'https://aiblueprint.k12aiblueprint.com' to dynamic URL

3. **app/api/stripe/debug/route.ts** (new)
   - Created debug endpoint to check environment variables
   - Access at `/api/stripe/debug` to verify configuration

## Environment Variables Needed

Make sure these are set in Vercel:
```bash
SITE_URL=https://aiblueprint.educationaiblueprint.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_EDU_MONTHLY_199=price_...
STRIPE_PRICE_EDU_YEARLY_1990=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing

1. Visit https://aiblueprint.educationaiblueprint.com/api/stripe/debug to verify environment
2. Test the payment flow on /pricing page
3. Check if 401 errors persist on payment status checks

## Next Steps

If 401 errors continue:
1. Check Supabase auth configuration in production
2. Verify cookie domain settings
3. Consider adding CORS headers if needed