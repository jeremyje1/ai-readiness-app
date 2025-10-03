# AI Blueprint EDU - Customer Flow Test Guide

## Overview
This guide will help you test the complete customer journey from signup through trial access.

## Production URLs
- **Main Platform**: https://aiblueprint.k12aiblueprint.com/
- **Marketing Site**: https://educationaiblueprint.com/ (use the HTML in marketing-page.html)

## Customer Flow Steps

### 1. Sign Up Flow (NEW!)

#### Option A: Direct Sign Up
1. Go to: https://aiblueprint.k12aiblueprint.com/auth/signup
2. Fill out the form:
   - Full Name
   - School/Institution
   - Email Address
   - Password (min 8 characters)
3. Click "Start Free Trial"
4. Check your email for confirmation link
5. Click the confirmation link in email
6. You'll be redirected to the dashboard with trial access

#### Option B: From Marketing Page
1. Click "Get Started" or "Start Free Trial" button
2. You'll be redirected to the signup page
3. Follow steps 2-6 from Option A

#### Option C: From Login Page
1. Go to: https://aiblueprint.k12aiblueprint.com/auth/login
2. Click "Start your free trial" link at the bottom
3. Follow steps 2-6 from Option A

### 2. Trial Access Features
Once signed up and confirmed, you'll have access to:
- ✅ Full AI readiness assessment
- ✅ Personalized implementation roadmap
- ✅ Faculty readiness evaluation tools
- ✅ 7-day trial period (no credit card required)

### 3. Login Flow
1. Go to: https://aiblueprint.k12aiblueprint.com/auth/login
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to your personalized dashboard

### 4. Upgrade to Paid Subscription
1. From dashboard, click on any upgrade prompt
2. Or go to: https://aiblueprint.k12aiblueprint.com/pricing
3. Choose monthly ($199/mo) or yearly ($1,990/yr)
4. Enter payment details in Stripe checkout
5. Complete purchase
6. Return to platform with full access

## What's Fixed

### ✅ Sign Up Flow
- Created dedicated signup page at `/auth/signup`
- Users can create accounts directly without going through Stripe
- 7-day trial automatically activated on signup
- Email confirmation required for account activation

### ✅ Authentication Flow
- Login page now properly redirects signup requests to signup page
- Added "Start your free trial" link on login page
- Created callback handler for email confirmation
- Trial status tracked in user profile

### ✅ User Journey
- Clear path from marketing → signup → trial → paid
- No credit card required for trial
- Seamless upgrade path after trial

## Testing Checklist

- [ ] Test signup with new email
- [ ] Verify confirmation email received
- [ ] Confirm email and access dashboard
- [ ] Check trial status shows in dashboard
- [ ] Test login/logout flow
- [ ] Test password reset flow
- [ ] Test upgrade to paid flow

## Known Limitations

1. **Email Delivery**: Confirmation emails depend on Supabase email service being properly configured
2. **Trial Expiration**: Trial expires after 7 days, no automatic email reminders yet
3. **Chrome Incognito**: Some auth issues in Chrome incognito mode (timeout workaround in place)

## Troubleshooting

### If signup doesn't work:
1. Check browser console for errors
2. Verify email isn't already registered
3. Try different browser or clear cookies
4. Check spam folder for confirmation email

### If login doesn't work:
1. Ensure you've confirmed your email
2. Try password reset if forgotten
3. Clear browser cache and cookies
4. Try different browser

### If trial access doesn't show:
1. Log out and log back in
2. Check user profile for trial_ends_at date
3. Contact support if issues persist

## Support
For any issues during testing, check the browser console for error messages and include them in your bug report.