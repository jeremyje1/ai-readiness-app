# Custom Domain Setup Guide for northpathstrategies.org

This guide outlines the steps to configure the custom domain for North Path Strategies' organizational realignment application.

## Domain Configuration Overview

The application will use the following domain structure:
- **Marketing Site & Landing Page:** `northpathstrategies.org`
- **Application Portal:** `app.northpathstrategies.org`

## Step 1: Register the Domain (if not already owned)

1. Use a domain registrar like Namecheap, GoDaddy, or Google Domains to register `northpathstrategies.org` if not already owned.
2. Ensure you have administrative access to manage DNS settings.

## Step 2: Connect Domain to Vercel

### A) Through Vercel Dashboard:

1. Login to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the organizational realignment app project
3. Go to **Settings** > **Domains**
4. Click **Add Domain**
5. Enter the domains:
   - `northpathstrategies.org` (for marketing site)
   - `app.northpathstrategies.org` (for application portal)
6. Follow the Vercel instructions to verify domain ownership

### B) Using DNS Configuration:

Add the following DNS records at your domain registrar:

#### For apex domain (northpathstrategies.org):
- **Type:** A
- **Name:** @ (or leave blank)
- **Value:** 76.76.21.21
- **TTL:** Auto or 3600

#### For www subdomain:
- **Type:** CNAME
- **Name:** www
- **Value:** cname.vercel-dns.com.
- **TTL:** Auto or 3600

#### For app subdomain:
- **Type:** CNAME
- **Name:** app
- **Value:** cname.vercel-dns.com.
- **TTL:** Auto or 3600

## Step 3: SSL Certificate Setup

Vercel automatically provisions and renews SSL certificates for your domains. Ensure that:

1. The DNS configuration is correct and has propagated
2. The domains show as "Valid Configuration" in the Vercel dashboard

## Step 4: Environment Variable Configuration

Update environment variables in your Vercel project:

1. Go to **Settings** > **Environment Variables**
2. Add/update the following:
   - `NEXT_PUBLIC_DOMAIN=northpathstrategies.org`
   - `NEXT_PUBLIC_APP_URL=https://app.northpathstrategies.org`
   - `NEXTAUTH_URL=https://app.northpathstrategies.org`
   - `AUTH0_ISSUER_BASE_URL=https://{your-auth0-tenant}.us.auth0.com`
   - `AUTH0_BASE_URL=https://app.northpathstrategies.org`

## Step 5: Update Redirect URIs in Auth0

1. Login to your Auth0 Dashboard
2. Go to **Applications** > Your Application
3. Update allowed callback URLs:
   - Add `https://app.northpathstrategies.org/api/auth/callback`
   - Add `https://northpathstrategies.org/api/auth/callback` (if needed)
4. Update allowed logout URLs:
   - Add `https://app.northpathstrategies.org`
   - Add `https://northpathstrategies.org` (if needed)
5. Update allowed web origins:
   - Add `https://app.northpathstrategies.org`
   - Add `https://northpathstrategies.org`

## Step 6: Test the Domain Configuration

1. Visit `https://northpathstrategies.org` to ensure the marketing site loads correctly
2. Visit `https://app.northpathstrategies.org` to ensure the application portal loads correctly
3. Test the authentication flow to confirm proper redirection
4. Test any cross-domain functionalities

## Step 7: Monitoring and Maintenance

1. Set up uptime monitoring for both domains using Vercel Analytics or a third-party service
2. Ensure SSL certificates auto-renewal is working properly
3. Monitor for any DNS issues

## Troubleshooting Common Issues

- **Domain not connecting:** Verify DNS records are correct and allow 24-48 hours for propagation
- **SSL certificate issues:** Ensure DNS is correctly configured for domain verification
- **Auth redirects failing:** Confirm all redirect URIs are properly updated in Auth0
- **Mixed content warnings:** Ensure all assets are loaded over HTTPS

## Support Resources

- [Vercel Domains Documentation](https://vercel.com/docs/custom-domains)
- [Auth0 Application Settings](https://auth0.com/docs/get-started/applications)
- DNS provider support
