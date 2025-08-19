# Email Service Setup Guide - Postmark Integration

## 🚀 Quick Setup Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard and add these environment variables:

```bash
POSTMARK_API_TOKEN=your-postmark-server-token-here
POSTMARK_FROM_EMAIL=noreply@northpathstrategies.org
POSTMARK_REPLY_TO=info@northpathstrategies.org
ADMIN_EMAIL=info@northpathstrategies.org
```

### 2. Get Your Postmark Server Token

1. Log into your Postmark account
2. Go to your server settings
3. Copy the "Server API Token"
4. Use this token for `POSTMARK_API_TOKEN`

### 3. Verify Domain/Email Setup

Make sure your sending domain is verified in Postmark:
- Verify `northpathstrategies.org` in Postmark
- Or update `POSTMARK_FROM_EMAIL` to match your verified domain

### 4. Test the Email System

After setting the environment variables in Vercel:

1. **User Registration Email**: Sign up at `/start` - you should receive a welcome email
2. **Assessment Completion Email**: Complete an assessment - both client and admin should receive notifications

## 📧 Email Flow Summary

### When Users Register (`/start`):
- ✅ Welcome email sent to user
- ✅ Contains dashboard access link and next steps

### When Assessment is Completed:
- ✅ Results email sent to user with score and recommendations  
- ✅ Admin notification sent to `ADMIN_EMAIL` with assessment details

## 🛠️ Current Implementation

- **Email Service**: `/lib/email-service.ts` - Postmark integration
- **Registration Emails**: `/app/api/user/register/route.ts` 
- **Assessment Emails**: `/app/api/ai-readiness/submit/route.ts`
- **Email Templates**: Professional HTML templates with branding

## ⚠️ Important Notes

1. **Environment Variables**: Must be set in Vercel for production
2. **Domain Verification**: Ensure your sending domain is verified in Postmark
3. **Fallback Behavior**: If Postmark isn't configured, emails are logged to console
4. **Error Handling**: Email failures won't break the core functionality

## 🧪 Testing

Without Postmark configured, you'll see these console logs:
```
⚠️  Postmark API token not found. Email functionality will be disabled.
📧 Email service not initialized. Logging email instead:
```

Once properly configured, you'll see:
```
✅ Email service initialized with Postmark
✅ Email sent successfully to user@example.com, MessageID: 12345
```

## Current Status

✅ Email service infrastructure is deployed  
✅ Registration welcome emails implemented  
✅ Assessment notification emails implemented  
⚠️  Needs Postmark environment variables to send actual emails
