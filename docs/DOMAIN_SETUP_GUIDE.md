# Canonical Domain Setup Guide (Post-Consolidation)

The application has consolidated onto a single canonical operational domain:

`aiblueprint.k12aiblueprint.com`

Legacy domains (marketing or app subdomains under `northpathstrategies.org` and `aireadiness.northpathstrategies.org`) remain only as 301 redirect sources. Do not introduce them into environment variables or new documentation.

## Domain Configuration Overview

Current production footprint:
- **Primary Application & Landing:** `aiblueprint.k12aiblueprint.com`
- **Redirect Sources (Deprecated):** `aireadiness.northpathstrategies.org`, `higheredaiblueprint.com`, `aiblueprint.higheredaiblueprint.com`

## Step 1: Register the Domain (if not already owned)

1. Use a domain registrar like Namecheap, GoDaddy, or Google Domains to register `northpathstrategies.org` if not already owned.
2. Ensure you have administrative access to manage DNS settings.

## Step 2: Connect (or Verify) Canonical Domain in Vercel

### A) Through Vercel Dashboard:

1. Login to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the organizational realignment app project
3. Go to **Settings** > **Domains**
4. Click **Add Domain**
5. Enter the canonical domain: `aiblueprint.k12aiblueprint.com`
6. (Optional) Add legacy domains only if needed for managed redirects; otherwise manage via DNS + vercel.json

### B) Using DNS Configuration:

Add the following DNS records at your domain registrar:

For the canonical subdomain under its parent domain (if using external DNS):
- **Type:** CNAME
- **Name:** aiblueprint.k12aiblueprint.com (or host label depending on provider)
- **Value:** cname.vercel-dns.com.
- **TTL:** Auto or 3600

## Step 3: SSL Certificate Setup

Vercel automatically provisions and renews SSL certificates for your domains. Ensure that:

1. The DNS configuration is correct and has propagated
2. The domains show as "Valid Configuration" in the Vercel dashboard

## Step 4: Environment Variable Configuration

Set (or sanitize) environment variables so only the canonical is present:

```
NEXT_PUBLIC_DOMAIN=aiblueprint.k12aiblueprint.com
NEXT_PUBLIC_APP_URL=https://aiblueprint.k12aiblueprint.com
NEXT_PUBLIC_BASE_URL=https://aiblueprint.k12aiblueprint.com
NEXTAUTH_URL=https://aiblueprint.k12aiblueprint.com
```

Remove any legacy host variables before redeploying.

## Step 5: Update Redirect URIs in Auth0

1. Login to your Auth0 Dashboard
2. Go to **Applications** > Your Application
3. Update allowed callback URLs:
   - Add `https://aiblueprint.k12aiblueprint.com/api/auth/callback`
4. Update allowed logout URLs:
   - Add `https://aiblueprint.k12aiblueprint.com`
5. Update allowed web origins:
   - Add `https://aiblueprint.k12aiblueprint.com`

## Step 6: Test the Domain Configuration

1. Visit `https://aiblueprint.k12aiblueprint.com` and verify 200 + expected content
2. Hit a legacy domain (e.g. `https://aireadiness.northpathstrategies.org`) and confirm 301 -> canonical
3. Test authentication callback at canonical domain
4. Validate Stripe checkout success & cancel URLs remain canonical

## Step 7: Monitoring and Maintenance

1. Set up uptime monitoring for both domains using Vercel Analytics or a third-party service
2. Ensure SSL certificates auto-renewal is working properly
3. Monitor for any DNS issues

## Troubleshooting Common Issues

- **Unexpected host in success URLs:** Remove stale NEXT_PUBLIC_* host vars and redeploy
- **Domain not connecting:** Verify DNS CNAME to Vercel, allow propagation
- **SSL certificate issues:** Ensure Vercel shows "Valid Configuration" for canonical
- **Auth redirects failing:** Confirm callback URL only references canonical domain
- **Mixed content warnings:** Ensure all assets are HTTPS & no legacy absolute links

## Support Resources

- [Vercel Domains Documentation](https://vercel.com/docs/custom-domains)
- [Auth0 Application Settings](https://auth0.com/docs/get-started/applications)
- DNS provider support
