# Email Fixes - October 1, 2025

## Issues Found

1. **Wrong Message Stream**: Code uses `"outbound"` but Postmark requires `"aiblueprint-transactional"`
2. **No Admin Notifications**: When customers sign up via Stripe, no email is sent to admin
3. **Environment Variables**: Need to ensure Vercel has correct Postmark configuration

## Postmark Configuration

```bash
Token: 455001d4-2657-4b12-bfc7-66c63734daf8
From: info@northpathstrategies.org
MessageStream: aiblueprint-transactional
```

## Fixes Applied

### 1. Fixed MessageStream in email-service.ts
- Changed default from `'outbound'` to `'aiblueprint-transactional'`
- This matches the Postmark configuration

### 2. Adding Admin Notification for New Customers
- Modified `sendAssessmentAccessEmail` in webhook to also send admin notification
- Admin receives email with customer details when payment completes

### 3. Environment Variables to Set in Vercel

```bash
POSTMARK_API_TOKEN=455001d4-2657-4b12-bfc7-66c63734daf8
POSTMARK_SERVER_TOKEN=455001d4-2657-4b12-bfc7-66c63734daf8
POSTMARK_FROM_EMAIL=info@northpathstrategies.org
POSTMARK_MESSAGE_STREAM=aiblueprint-transactional
ADMIN_EMAIL=info@northpathstrategies.org
ADMIN_NOTIFICATION_EMAIL=info@northpathstrategies.org
FROM_EMAIL=info@northpathstrategies.org
REPLY_TO_EMAIL=info@northpathstrategies.org
POSTMARK_REPLY_TO=info@northpathstrategies.org
```

## Code Changes Summary

### ✅ COMPLETED

1. **Fixed MessageStream** (`lib/email-service.ts` line 67)
   - Changed default from 'outbound' to 'aiblueprint-transactional'

2. **Added Admin Notification Method** (`lib/email-service.ts` after line 463)
   - New method: `sendNewCustomerNotification()`
   - Sends formatted HTML email with customer details, Stripe info, links

3. **Modified Webhook Handler** (`app/api/stripe/webhook/route.ts` after line 219)
   - Calls admin notification after customer email sent
   - Includes error handling to prevent breaking customer flow

## Testing

After deployment:
1. Complete a test purchase with test Stripe card (4242 4242 4242 4242)
2. Check if customer receives welcome email
3. Check if admin receives new customer notification
4. Verify emails appear in Postmark dashboard (Activity tab)
5. Test reply-to functionality

## Email Templates

### Customer Welcome Email
- Subject: Welcome to AI Blueprint – [tier]
- Contains: Dashboard link, password setup link, magic link
- Sent to: Customer email

### Admin Notification Email (NEW - IMPLEMENTED)
- Subject: 🎉 New Customer: [name] ([tier])
- Contains: Customer details, tier badge, Stripe session/customer IDs, links to Stripe dashboard and admin panel
- Sent to: ADMIN_EMAIL / ADMIN_NOTIFICATION_EMAIL
- Design: Professional HTML with green header, white content boxes, linked buttons
