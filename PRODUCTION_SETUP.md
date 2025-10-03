# AI Blueprint Platform - Production Setup Guide

## 🎯 Overview

Professional SaaS platform for AI readiness assessment in education.

**New Production Domain:** https://aiblueprint.educationaiblueprint.com

## 🚀 Quick Start

### 1. Deploy to Production

```bash
./deploy-new-domain.sh
```

This script will:
- Build the application
- Deploy to Vercel
- Provide configuration checklist

### 2. Configure Services

#### Vercel Domain Setup
1. Go to [Vercel Domains](https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/settings/domains)
2. Add domain: `aiblueprint.educationaiblueprint.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: platform
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

#### Supabase Configuration
1. Run SQL configuration:
   ```bash
   # Copy contents of supabase-config.sql
   # Paste in Supabase SQL Editor
   # Execute
   ```

2. Update Auth Settings:
   - Navigate to: Project Settings → Authentication → URL Configuration
   - **Site URL:** `https://aiblueprint.educationaiblueprint.com`
   - **Redirect URLs:** Add:
     - `https://aiblueprint.educationaiblueprint.com/auth/callback`
     - `https://aiblueprint.educationaiblueprint.com/welcome`
     - `https://aiblueprint.educationaiblueprint.com/dashboard/personalized`
     - `http://localhost:3000/**` (dev only)

3. Disable Email Confirmation:
   - Go to: Authentication → Providers → Email
   - **Confirm email:** OFF (users get immediate access)
   - **Secure email change:** ON

#### Stripe Configuration
1. Update Success URL:
   ```
   https://aiblueprint.educationaiblueprint.com/auth/success?session_id={CHECKOUT_SESSION_ID}
   ```

2. Update Cancel URL:
   ```
   https://aiblueprint.educationaiblueprint.com/pricing?status=cancelled
   ```

## 🔧 Environment Variables

Update these in Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://aiblueprint.educationaiblueprint.com
NEXT_PUBLIC_APP_URL=https://aiblueprint.educationaiblueprint.com
NEXT_PUBLIC_BASE_URL=https://aiblueprint.educationaiblueprint.com
NEXTAUTH_URL=https://aiblueprint.educationaiblueprint.com
```

## 📝 Customer Flow

### Optimized Onboarding Journey

```
1. Landing Page (marketing-page.html)
   ↓ Click "Get Started"
   
2. Unified Entry (/get-started)
   - Single page for signup/login
   - Institution type selection
   - Form with all required fields
   ↓ Submit
   
3. Instant Access (No Email Verification)
   - Account created
   - Auto-login
   - Session established
   ↓
   
4. Welcome Page (/welcome)
   - Personalized onboarding
   - Quick tour
   - Action items
   ↓ Skip or Complete
   
5. Dashboard (/dashboard/personalized)
   - Full platform access
   - 7-day trial active
   - All features unlocked
```

### Key Improvements

✅ **Immediate Access** - No email verification wait
✅ **Single Entry Point** - No confusion
✅ **Session Handling** - Proper Chrome compatibility
✅ **Loading States** - Clear feedback
✅ **Error Handling** - Informative messages
✅ **Auto-confirm** - Trials start immediately

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ User-specific data access
- ✅ Secure password requirements (8+ chars)
- ✅ Session-based authentication
- ✅ HTTPS enforced
- ✅ Environment variable protection

## 🐛 Troubleshooting

### Authentication Hanging in Chrome

**Fixed!** The new implementation:
1. Uses single signup call (no double auth)
2. Waits for session to fully establish
3. Uses `window.location.href` for reliable navigation
4. Includes proper loading states

### Session Not Persisting

Ensure Supabase redirect URLs are configured correctly.

### Trial Not Activating

Check user_profiles table for:
- `subscription_status = 'trial'`
- `trial_ends_at` is 7 days from signup

## 📊 Monitoring

### Key Metrics to Track
- Signup conversion rate
- Time to first dashboard view
- Trial-to-paid conversion
- Session drop-off points

### Analytics Setup
Add to your analytics tool:
- Event: `signup_started`
- Event: `signup_completed`
- Event: `welcome_page_viewed`
- Event: `dashboard_first_visit`

## 🧪 Testing Checklist

- [ ] Domain resolves to Vercel
- [ ] SSL certificate active
- [ ] Signup creates account
- [ ] No email verification required
- [ ] Auto-login works
- [ ] Session persists
- [ ] Welcome page loads
- [ ] Dashboard accessible
- [ ] Trial status shows correctly
- [ ] Logout/login works
- [ ] Password reset works
- [ ] Marketing page links work
- [ ] Mobile responsive

## 📚 File Structure

```
app/
├── get-started/          # Unified signup/login
├── welcome/              # Post-signup onboarding
├── dashboard/            # Main app
└── api/
    └── auth/
        └── hooks/        # Supabase webhooks

marketing-page.html       # Landing page (external)
deploy-new-domain.sh      # Deployment script
supabase-config.sql       # Database setup
```

## 🆘 Support

For issues:
1. Check browser console for errors
2. Verify Supabase configuration
3. Check Vercel deployment logs
4. Review this guide

## 📄 License

Proprietary - AI Blueprint Platform

---

**Last Updated:** October 3, 2025
**Domain:** aiblueprint.educationaiblueprint.com
**Status:** Production Ready