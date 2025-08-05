# 🔗 Stripe Checkout Session Update Guide

## ✅ Automatic Updates (Already Done)

Your app has been automatically updated with the new payment-gated assessment URLs:

### Updated Redirect URLs:
- **Higher Ed Pulse Check**: `/assessment/higher-ed-pulse-check?session_id={CHECKOUT_SESSION_ID}`
- **AI Readiness Comprehensive**: `/assessment/ai-readiness-comprehensive?session_id={CHECKOUT_SESSION_ID}`  
- **AI Transformation Blueprint**: `/assessment/ai-transformation-blueprint?session_id={CHECKOUT_SESSION_ID}`
- **Enterprise Partnership**: `/assessment/enterprise-partnership?session_id={CHECKOUT_SESSION_ID}`

## 📋 Three Ways to Update Your Stripe Checkout Sessions

### Method 1: Using Your Existing API (Recommended)

Your current Stripe checkout creation API has been updated. No additional changes needed.

**Endpoint**: `POST /api/ai-blueprint/stripe/create-checkout`

**Example Usage**:
```javascript
// This will automatically use the new success URLs
const response = await fetch('/api/ai-blueprint/stripe/create-checkout?tier=ai-readiness-comprehensive&price_id=price_1Ro4tAELd2WOuqIWaDPEWxX3');
```

### Method 2: Direct Stripe Dashboard Configuration

If you create checkout sessions manually in the Stripe Dashboard:

1. **Log into your Stripe Dashboard**
2. **Go to Products → Your Product → Pricing**
3. **Update the Success URL for each price**:

```
Higher Ed Pulse Check (price_1RomXAELd2WOuqIWUJT4cY29):
https://aireadiness.northpathstrategies.org/assessment/higher-ed-pulse-check?session_id={CHECKOUT_SESSION_ID}

AI Readiness Comprehensive (price_1Ro4tAELd2WOuqIWaDPEWxX3):
https://aireadiness.northpathstrategies.org/assessment/ai-readiness-comprehensive?session_id={CHECKOUT_SESSION_ID}

AI Transformation Blueprint (price_1RomY5ELd2WOuqIWd3wUhiQm):
https://aireadiness.northpathstrategies.org/assessment/ai-transformation-blueprint?session_id={CHECKOUT_SESSION_ID}

Enterprise Partnership (price_1RomYtELd2WOuqIWKdsStKyQ):
https://aireadiness.northpathstrategies.org/assessment/enterprise-partnership?session_id={CHECKOUT_SESSION_ID}
```

### Method 3: Direct Stripe API Usage

If you're creating checkout sessions directly with the Stripe API:

```javascript
const stripe = require('stripe')('sk_test_...');

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_1Ro4tAELd2WOuqIWaDPEWxX3', // Your price ID
    quantity: 1,
  }],
  success_url: 'https://aireadiness.northpathstrategies.org/assessment/ai-readiness-comprehensive?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://aireadiness.northpathstrategies.org/pricing?cancelled=true',
  metadata: {
    tier: 'ai-readiness-comprehensive',
    service: 'ai-blueprint'
  }
});
```

## 🧪 Testing Your Updated Checkout

### Test the Complete Flow:

1. **Start a checkout session** (using any method above)
2. **Complete payment** with Stripe test card: `4242 4242 4242 4242`
3. **Verify redirect** to assessment page with `session_id` parameter
4. **Confirm PaymentGate** verifies the payment and grants access

### Test Cards for Different Scenarios:
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Authentication: 4000 0025 0000 3155
```

## 🔍 Verification Checklist

- [ ] Checkout sessions redirect to new assessment URLs
- [ ] Session ID is passed as `?session_id={CHECKOUT_SESSION_ID}`
- [ ] PaymentGate component verifies payment successfully
- [ ] Users can access assessment after payment
- [ ] Failed payments show appropriate error messages

## 🚀 Deploy the Changes

After testing, deploy your updates:

```bash
cd /path/to/your/app
vercel --prod
```

## 📞 Support

If you encounter any issues:

1. **Check the browser console** for JavaScript errors
2. **Verify environment variables** are set correctly
3. **Test with Stripe test mode** before going live
4. **Check Stripe webhook logs** for payment verification issues

## 🎯 Current Integration Status

✅ **Stripe Price IDs**: Configured  
✅ **Payment Verification API**: `/api/stripe/verify-payment`  
✅ **Assessment Pages**: Created with PaymentGate  
✅ **Success URLs**: Updated automatically  
✅ **Domain**: `aireadiness.northpathstrategies.org`  

Your Stripe integration is now fully configured for the new payment-gated assessment system! 🎉
