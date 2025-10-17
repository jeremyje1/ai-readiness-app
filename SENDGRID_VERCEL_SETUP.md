# SendGrid Environment Variables Setup for Vercel

## Manual Setup (Recommended)

Run these commands one at a time and follow the prompts:

### 1. Add SENDGRID_API_KEY
```bash
vercel env add SENDGRID_API_KEY
```
When prompted:
- **Value**: `SG_KEY_REDACTED`
- **Environments**: Select all (Production, Preview, Development)

### 2. Add SENDGRID_FROM_EMAIL
```bash
vercel env add SENDGRID_FROM_EMAIL
```
When prompted:
- **Value**: `info@northpathstrategies.org`
- **Environments**: Select all (Production, Preview, Development)

### 3. Add SENDGRID_TO_EMAIL
```bash
vercel env add SENDGRID_TO_EMAIL
```
When prompted:
- **Value**: `info@northpathstrategies.org`
- **Environments**: Select all (Production, Preview, Development)

---

## Verify Installation

After adding all variables, verify they were added:
```bash
vercel env ls
```

You should see:
- SENDGRID_API_KEY (Production, Preview, Development)
- SENDGRID_FROM_EMAIL (Production, Preview, Development)
- SENDGRID_TO_EMAIL (Production, Preview, Development)

---

## Pull to Local Environment

Sync the Vercel environment variables to your local `.env.local`:
```bash
vercel env pull .env.local
```

---

## Redeploy to Production

After adding the environment variables, redeploy your application:
```bash
vercel --prod
```

This will trigger a new production deployment with the SendGrid configuration.

---

## Alternative: Use Vercel Dashboard (Web UI)

If you prefer using the web interface:

1. Go to https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/settings/environment-variables
2. Click "Add New" for each variable:

   **SENDGRID_API_KEY**
   - Name: `SENDGRID_API_KEY`
   - Value: `SG_KEY_REDACTED`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **SENDGRID_FROM_EMAIL**
   - Name: `SENDGRID_FROM_EMAIL`
   - Value: `info@northpathstrategies.org`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **SENDGRID_TO_EMAIL**
   - Name: `SENDGRID_TO_EMAIL`
   - Value: `info@northpathstrategies.org`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. Click "Save" for each
4. Redeploy your application

---

## Testing

After deployment, test the contact form:
1. Visit your production site: https://aiblueprint.educationaiblueprint.com/lead-generation-page.html
2. Fill out and submit the form
3. Check info@northpathstrategies.org for the email
4. Check browser console for any errors

---

## Troubleshooting

### If emails still don't work:

1. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```

2. **Verify SendGrid API key is valid:**
   - Go to https://app.sendgrid.com/settings/api_keys
   - Check that your API key has "Mail Send" permissions
   - Verify the key hasn't expired

3. **Verify sender email is verified in SendGrid:**
   - Go to https://app.sendgrid.com/settings/sender_auth
   - Ensure `info@northpathstrategies.org` is verified
   - If not verified, you'll need to complete the verification process

4. **Check SendGrid activity:**
   - Go to https://app.sendgrid.com/email_activity
   - Look for recent send attempts
   - Check for any errors or bounces

---

## Security Note

⚠️ **Important**: Never commit API keys to git. The `.env.local` file is already in `.gitignore`.

If you accidentally expose the API key:
1. Go to SendGrid dashboard
2. Delete the exposed key
3. Generate a new key
4. Update Vercel environment variables with the new key
