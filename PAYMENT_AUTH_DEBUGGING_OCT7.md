# Payment & Authentication Debugging - Oct 7, 2025

## Current Issues

### 1. Authentication (401 Error) on `/api/payments/status`
- The API is not receiving valid authentication cookies
- This suggests a cookie/session issue between client and server

### 2. Stripe Checkout (500 Error) on `/api/stripe/edu-checkout`
- Stripe configuration appears correct (API keys, price IDs)
- The error might be related to Stripe API version mismatch or invalid price IDs

## Debugging Endpoints Created

### 1. `/api/stripe/debug`
- Shows Stripe configuration status
- Confirms all environment variables are set
- Access: https://aiblueprint.educationaiblueprint.com/api/stripe/debug

### 2. `/api/auth/debug`
- Shows authentication status and cookies
- Helps diagnose auth issues
- Access: https://aiblueprint.educationaiblueprint.com/api/auth/debug

## Changes Made

### 1. Enhanced Error Handling
- Added detailed error responses in Stripe checkout endpoint
- Added error logging in payment status endpoint
- Added user-friendly error alerts on frontend

### 2. Improved Fetch Configuration
- Added `credentials: 'include'` to all API calls
- Ensures cookies are sent with requests

### 3. URL Handling
- Added `.trim()` to remove whitespace from environment URLs
- Proper fallback chain: SITE_URL → NEXT_PUBLIC_SITE_URL → hardcoded

## Next Debugging Steps

1. **Check Auth Debug Endpoint**: Visit `/api/auth/debug` when logged in to see if cookies are present
2. **Verify Stripe Price IDs**: The price IDs might be incorrect or from a different Stripe account
3. **Check Stripe API Version**: The API version `2025-06-30.basil` might be invalid
4. **Test with Stripe CLI**: Use Stripe CLI to verify the price IDs exist

## Potential Fixes

### For Auth Issue:
```typescript
// Might need to add sameSite and secure flags
cookieStore.set({
  name,
  value,
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  ...options
})
```

### For Stripe Issue:
```typescript
// Try with a valid API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' // Use a known valid version
})
```

## Environment Variables Required
- STRIPE_SECRET_KEY
- STRIPE_PRICE_EDU_MONTHLY_199
- STRIPE_PRICE_EDU_YEARLY_1990
- SITE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY