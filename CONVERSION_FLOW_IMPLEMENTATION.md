# Blueprint Generation to Paying Customer Conversion Flow

## Overview

This document outlines the implementation of a conversion flow that guides users from blueprint generation to becoming paying customers. The system uses Stripe for payment processing and includes trial management, subscription tracking, and strategic upgrade prompts.

## Key Components

### 1. Stripe Configuration

- **Price ID**: `price_1SDnhlRMpSG47vNmDQr1WeJ3` ($199/month platform access)
- **Publishable Key**: `pk_live_51Rxag5RMpSG47vNmE0GkLZ6xVBlXC2D8TS5FUSDI4VoKc5mJOzZu8JOKzmMMYMLtAONF7wJUfz6Wi4jKpbS2rBEi00tkzmeJgx`
- **Webhook Endpoint**: `https://aiblueprint.k12aiblueprint.com/api/stripe/webhook`
- **Secret Key**: Set in Vercel environment as `STRIPE_SECRET_KEY`

### 2. Subscription Status Tracking

#### API Endpoint Updates

**`/api/blueprint/generate/route.ts`**
- Enhanced access control to check trial expiration
- Returns specific error codes (`TRIAL_EXPIRED`, `SUBSCRIPTION_REQUIRED`) with upgrade URLs
- Provides user-friendly error messages based on subscription status

#### User Profile Updates

**`/api/stripe/webhook/route.ts`**
- Updates `user_profiles` table with `subscription_status: 'active'` upon successful payment
- Stores Stripe customer ID for future reference
- Maintains subscription tier information

### 3. Conversion UI Components

#### ConversionModal Component
**Location**: `/components/ConversionModal.tsx`

Features:
- Dynamic content based on conversion reason (trial expired, subscription required, feature upgrade)
- Animated modal with compelling value propositions
- Direct integration with Stripe checkout
- Trust badges (SOC 2, FERPA, AIRIX certified)

#### BlueprintUpgradeCTA Component
**Location**: `/components/blueprint/BlueprintUpgradeCTA.tsx`

Features:
- Trial expiration warning banner (shows when ≤3 days left)
- Floating upgrade prompt (appears after 30 seconds on page)
- Locked feature inline CTAs
- Dismissible with memory

### 4. Subscription Hook
**Location**: `/hooks/useSubscription.ts`

Provides real-time subscription status:
- `hasActiveSubscription`: Boolean for paid status
- `isTrialUser`: Boolean for trial status
- `daysLeftInTrial`: Number of days remaining
- `canAccessPremiumFeatures`: Combined check for access

### 5. Success Page
**Location**: `/app/ai-readiness/success/page.tsx`

Post-payment experience:
- Subscription verification
- Onboarding guidance
- Feature highlights
- Quick actions (dashboard, create blueprint)

## User Flow

### 1. Trial User Journey
```
Assessment Complete → Generate Blueprint → Trial Access (7 days) → 
Upgrade Prompts (3 days left) → Conversion Modal → Stripe Checkout → 
Payment Success → Full Access
```

### 2. Expired Trial Journey
```
Attempt Blueprint Generation → Trial Expired Error → 
Conversion Modal → Stripe Checkout → Payment Success → 
Resume Blueprint Generation
```

### 3. New User Journey (No Trial)
```
Complete Assessment → Attempt Blueprint → Subscription Required → 
Conversion Modal → Stripe Checkout → Payment Success → 
Generate Blueprint
```

## Integration Points

### 1. Blueprint Generation Page
```typescript
// In /app/blueprint/new/page.tsx
if (response.status === 403) {
    if (errorData.code === 'TRIAL_EXPIRED') {
        setConversionReason('trial_expired');
    } else if (errorData.code === 'SUBSCRIPTION_REQUIRED') {
        setConversionReason('subscription_required');
    }
    setShowConversionModal(true);
}
```

### 2. Blueprint Viewer Integration
```typescript
// Add to BlueprintViewer component
import BlueprintUpgradeCTA from './BlueprintUpgradeCTA';
import { useSubscription } from '@/hooks/useSubscription';

// In component
const subscription = useSubscription();

// In render
{subscription.isTrialUser && (
    <BlueprintUpgradeCTA 
        isTrialUser={true}
        daysLeftInTrial={subscription.daysLeftInTrial}
    />
)}
```

### 3. Feature Gating
```typescript
// Example of gating premium features
import { LockedFeatureCTA } from '@/components/blueprint/BlueprintUpgradeCTA';

{subscription.canAccessPremiumFeatures ? (
    <ExportToPDFButton />
) : (
    <LockedFeatureCTA feature="PDF Export" />
)}
```

## Deployment Steps

1. **Environment Variables**
   - Ensure `STRIPE_SECRET_KEY` is set in Vercel
   - Verify `STRIPE_WEBHOOK_SECRET` matches webhook configuration

2. **Database Changes**
   - No schema changes required (uses existing fields)
   - `subscription_status` field utilized for tracking

3. **Testing Checklist**
   - [ ] Trial expiration flow
   - [ ] Direct purchase flow
   - [ ] Webhook processing
   - [ ] Email notifications
   - [ ] Success page redirect

## Monitoring & Analytics

### Key Metrics to Track
1. **Conversion Rate**: Trial → Paid
2. **Time to Conversion**: Average days from trial start
3. **Drop-off Points**: Where users abandon
4. **Feature Usage**: Which locked features drive upgrades

### Webhook Events to Monitor
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Future Enhancements

1. **A/B Testing**
   - Different CTA copy
   - Modal timing variations
   - Pricing display formats

2. **Advanced Features**
   - Annual billing discount
   - Team/enterprise tiers
   - Usage-based pricing for API access

3. **Retention Features**
   - Win-back campaigns
   - Pause subscription option
   - Loyalty rewards

## Support & Troubleshooting

### Common Issues

1. **User Can't Access After Payment**
   - Check webhook logs in Stripe dashboard
   - Verify `user_profiles` subscription_status
   - Check for email case sensitivity issues

2. **Conversion Modal Not Showing**
   - Verify error codes from API
   - Check browser console for errors
   - Ensure modal component imported correctly

3. **Stripe Checkout Errors**
   - Verify price ID matches live environment
   - Check API keys (live vs test)
   - Review Stripe dashboard for declined payments