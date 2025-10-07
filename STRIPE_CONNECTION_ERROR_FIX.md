# Stripe Connection Error Fix - Oct 7, 2025

## Issue
- **Error**: "An error occurred with our connection to Stripe. Request was retried 2 times."
- **Type**: StripeConnectionError
- **Location**: `/api/stripe/edu-checkout` endpoint

## Root Causes Possibilities

1. **Invalid API Key**: The Stripe secret key might be invalid, revoked, or from wrong account
2. **API Version Mismatch**: The API version `2025-06-30.basil` might be causing issues
3. **Price ID Mismatch**: The price IDs might not exist in the Stripe account
4. **Network Issues**: Vercel functions might have trouble reaching Stripe servers

## Debugging Endpoints Created

### 1. Test Connection: `/api/stripe/test-connection`
- Tests basic Stripe connectivity
- Attempts to list prices to verify API access
- Shows if API key is valid
- URL: https://aiblueprint.educationaiblueprint.com/api/stripe/test-connection

### 2. List Prices: `/api/stripe/list-prices`  
- Lists all available prices in your Stripe account
- Shows if configured price IDs exist
- Helps identify correct price IDs
- URL: https://aiblueprint.educationaiblueprint.com/api/stripe/list-prices

### 3. Auth Debug: `/api/auth/debug`
- Shows authentication status
- Lists available cookies
- URL: https://aiblueprint.educationaiblueprint.com/api/auth/debug

## Testing Steps

1. **Check Stripe Connection**:
   ```bash
   curl https://aiblueprint.educationaiblueprint.com/api/stripe/test-connection
   ```
   - If this fails with authentication error, the API key is invalid
   - If it works, it will show if prices are found

2. **Verify Price IDs**:
   ```bash
   curl https://aiblueprint.educationaiblueprint.com/api/stripe/list-prices
   ```
   - Check if your configured price IDs exist
   - Note the correct price IDs from your Stripe account

3. **Check Authentication**:
   - Visit the site and log in
   - Then visit: https://aiblueprint.educationaiblueprint.com/api/auth/debug
   - Should show authenticated: true

## Common Fixes

### 1. Wrong API Key
- Verify the Stripe secret key is from the correct account
- Make sure it's a live key (starts with `sk_live_`) not test key
- Regenerate the key in Stripe dashboard if needed

### 2. Wrong Price IDs
- The price IDs might be from a different Stripe account
- Use `/api/stripe/list-prices` to find correct IDs
- Update environment variables:
  - STRIPE_PRICE_EDU_MONTHLY_199
  - STRIPE_PRICE_EDU_YEARLY_1990

### 3. API Version Issue
- The code now has fallback handling for API version issues
- It will try without version if the specified version fails

## Environment Variables to Check

In Vercel dashboard:
- `STRIPE_SECRET_KEY` - Must be valid live key
- `STRIPE_PRICE_EDU_MONTHLY_199` - Must match a real price ID
- `STRIPE_PRICE_EDU_YEARLY_1990` - Must match a real price ID
- `SITE_URL` - Should be https://aiblueprint.educationaiblueprint.com

## Next Steps

1. Wait for deployment to complete (2-3 minutes)
2. Test the connection endpoint first
3. If connection works, check price IDs
4. Update environment variables if needed
5. Test the payment flow again