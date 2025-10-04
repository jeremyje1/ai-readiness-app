# Domain Migration & Authentication Fix Implementation Guide

## New Domain Setup: aiblueprint.educationaiblueprint.com

### 1. Domain Configuration in Vercel

Run these commands to configure the new domain:

```bash
# In your terminal
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main
vercel domains add aiblueprint.educationaiblueprint.com
```

Then configure DNS:
- Add CNAME record: `aiblueprint.educationaiblueprint.com` → `cname.vercel-dns.com`

### 2. Environment Variables Update

Update your `.env.local` and Vercel environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://aiblueprint.educationaiblueprint.com
NEXT_PUBLIC_APP_URL=https://aiblueprint.educationaiblueprint.com
```

### 3. Supabase Configuration Update

In your Supabase project settings (https://supabase.com/dashboard/project/YOUR_PROJECT/auth/url-configuration):

Add to **Redirect URLs**:
- https://aiblueprint.educationaiblueprint.com/auth/callback
- https://aiblueprint.educationaiblueprint.com/welcome
- https://aiblueprint.educationaiblueprint.com/dashboard/personalized
- http://localhost:3000/auth/callback (for development)

Add to **Site URL**:
- https://aiblueprint.educationaiblueprint.com

### 4. Update Marketing Page

Update all URLs in marketing-page.html from:
- `https://aiblueprint.k12aiblueprint.com` 
To:
- `https://aiblueprint.educationaiblueprint.com`

### 5. Stripe Configuration

Update your Stripe success/cancel URLs:
- Success URL: `https://aiblueprint.educationaiblueprint.com/auth/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `https://aiblueprint.educationaiblueprint.com/pricing?status=cancelled`

## Authentication Fix Implementation

The hanging issue is caused by:
1. Double authentication (signup then immediate signin)
2. Browser session storage conflicts in Chrome
3. No proper loading states

### Solution Implemented:
1. **Simplified signup flow** - no double authentication
2. **Session-based redirect** - wait for Supabase to fully set the session
3. **Loading states** - clear feedback during auth operations
4. **Error handling** - better Chrome compatibility
5. **Auto-confirm emails** - no email verification required for trial

## Deployment Steps

1. Update environment variables in Vercel
2. Deploy with new domain configuration
3. Test the complete flow
4. Update DNS records
5. Verify SSL certificate

## Testing Checklist

- [ ] New domain resolves correctly
- [ ] Signup works without hanging
- [ ] Login works smoothly
- [ ] Session persists across pages
- [ ] Trial is properly activated
- [ ] Dashboard loads correctly
- [ ] Marketing page links work