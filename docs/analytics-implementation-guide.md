# Analytics Implementation Guide

This document outlines the analytics tracking system implemented for the NorthPath Strategies application, including Google Analytics 4 (GA4) integration, event tracking, and GDPR-compliant cookie consent management.

## Table of Contents

1. [Overview](#overview)
2. [Key Components](#key-components)
3. [Implementation Details](#implementation-details)
4. [Event Tracking Guide](#event-tracking-guide)
5. [Conversion Funnels](#conversion-funnels)
6. [Privacy Compliance](#privacy-compliance)
7. [Custom Tracking Implementation](#custom-tracking-implementation)
8. [Server-side Analytics](#server-side-analytics)

## Overview

The analytics implementation is designed to track user engagement, conversion funnels, and key performance metrics while maintaining privacy compliance. It uses Google Analytics 4 (GA4) as the primary analytics platform with custom event tracking for specific business needs.

## Key Components

- **Analytics Provider**: Centralized context provider for managing analytics state
- **Cookie Consent Banner**: GDPR-compliant consent mechanism
- **Tracking Hooks**: Custom hooks for easy implementation across components
- **Event Tracking**: Standardized event tracking functions
- **Funnel Tracking**: Predefined conversion funnels for key user journeys
- **Server-side Analytics**: API route for capturing sensitive events

## Implementation Details

### Configuration

Set your Google Analytics 4 Measurement ID in `.env.local`:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### Analytics Provider

The `AnalyticsProvider` component manages the analytics context, including:
- Initialization of Google Analytics
- Management of user consent state
- Page view tracking on route changes

```tsx
<AnalyticsProvider>
  {children}
</AnalyticsProvider>
```

### Cookie Consent Banner

The GDPR-compliant cookie banner allows users to:
- Accept all cookies
- Accept only necessary cookies
- Reject all cookies
- View the privacy policy

Analytics tracking only occurs after explicit user consent.

## Event Tracking Guide

### Standard Events

Use the `useTracking` hook to access tracking functions:

```tsx
import { useTracking } from '@/hooks/useTracking';

function MyComponent() {
  const { trackEvent, trackCTA, trackForm } = useTracking();

  // Track a custom event
  trackEvent('category', 'action', { custom_param: 'value' });

  // Track a button click
  trackCTA('signup_button', 'hero_section');

  // Track a form submission
  trackForm('contact_form', true, { form_version: '2.0' });

  return (
    // Your component JSX
  );
}
```

### Event Categories

Use these standardized event categories for consistency:

- `engagement`: User interactions and engagement metrics
- `conversion`: Conversion-related events and funnel progress
- `navigation`: Navigation and wayfinding events
- `form`: Form interactions and submissions
- `content`: Content consumption events
- `error`: Error events and failures
- `assessment`: Assessment-specific interactions
- `account`: User account activities

### Standard User Actions

- `click`: User clicked on an element
- `view`: User viewed content
- `submit`: User submitted a form
- `start`: User started a process
- `complete`: User completed a process
- `download`: User downloaded a file
- `share`: User shared content
- `signup`: User signed up
- `login`: User logged in
- `upgrade`: User upgraded their account
- `error`: User encountered an error

## Conversion Funnels

### Assessment Funnel

Track the assessment completion funnel:

```tsx
const { trackAssessmentFunnel } = useTracking();

// When user views the assessment page
trackAssessmentFunnel('view');

// When user starts the assessment
trackAssessmentFunnel('start');

// When user reaches halfway point
trackAssessmentFunnel('halfway', { question_id: 15 });

// When user completes the assessment
trackAssessmentFunnel('complete', { time_taken: 360, score: 85 });
```

### Signup Funnel

```tsx
const { trackSignupFunnel } = useTracking();

// Track progression through signup
trackSignupFunnel('view');
trackSignupFunnel('start');
trackSignupFunnel('email_entered');
trackSignupFunnel('complete');
```

### Checkout Funnel

```tsx
const { trackCheckoutFunnel } = useTracking();

// Track progression through checkout
trackCheckoutFunnel('view');
trackCheckoutFunnel('start');
trackCheckoutFunnel('add_payment', { plan: 'premium' });
trackCheckoutFunnel('complete', { value: 299, currency: 'USD' });
```

## Privacy Compliance

### GDPR Compliance

The analytics system is designed with privacy-by-default:

1. **Explicit Consent**: No tracking occurs without explicit consent
2. **Preference Storage**: User preferences are stored in localStorage
3. **Consent Banner**: Clear, informative consent UI with multiple options
4. **Data Minimization**: Only necessary data is collected
5. **IP Anonymization**: IP addresses are anonymized in GA4

### Cookie Consent Implementation

The cookie consent banner is implemented as a dynamically loaded component to avoid affecting initial load time:

```tsx
// In layout.tsx
const CookieConsentBanner = dynamic(
  () => import('@/components/cookie-consent/CookieConsentBanner'),
  { ssr: false }
);

// Then in the body:
<CookieConsentBanner />
```

## Custom Tracking Implementation

### Tracking Component Loads

The LoadingHandler component demonstrates custom event tracking:

```tsx
<LoadingHandler
  loading={isLoading}
  error={error}
  data={data}
  trackingId="dashboard-content"
>
  {content}
</LoadingHandler>
```

This will automatically track:
- Content loading state
- Successful load events
- Error events
- Empty state events

### Tracking User Engagement

The `useTracking` hook automatically tracks:
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page
- Reading engagement (started reading, engaged, deep engagement)
- Exit events

## Server-side Analytics

For sensitive operations or when client-side tracking isn't possible, use the server-side analytics API:

```tsx
// Example server action
'use server';

async function trackPurchaseEvent(userId: string, amount: number) {
  await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'conversion',
      eventAction: 'purchase',
      properties: {
        userId,
        amount,
        currency: 'USD',
      }
    })
  });
}
```

## Data Access and Analysis

Analytics data is stored in two locations:
1. **Google Analytics 4**: Primary interface for data analysis
2. **Supabase analytics_events table**: For custom event queries and backend analysis

Access to the analytics_events table is restricted to admin users through RLS policies.
