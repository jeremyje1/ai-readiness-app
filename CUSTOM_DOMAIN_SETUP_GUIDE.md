# Custom Domain Setup Guide
## Setting up aireadiness.northpathstrategies.org

### 🚨 Current Issue
The domain `aireadiness.northpathstrategies.org` appears to be assigned to another Vercel project or account. 

### 🔧 Resolution Steps

#### Option 1: Transfer Domain (Recommended)
1. **Check Domain Ownership**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to the project that currently owns `aireadiness.northpathstrategies.org`
   - Remove the domain from that project

2. **Add Domain to Current Project**:
   ```bash
   vercel domains add aireadiness.northpathstrategies.org
   vercel alias set ai-readiness-ftyjotqi8-jeremys-projects-73929cad.vercel.app aireadiness.northpathstrategies.org
   ```

#### Option 2: Manual Setup via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `ai-readiness-app` project
3. Go to **Settings** > **Domains**
4. Click **Add Domain**
5. Enter: `aireadiness.northpathstrategies.org`
6. Follow Vercel's DNS configuration instructions

### 📋 DNS Configuration Required
Once the domain is available, you'll need to set these DNS records:

#### For Root Domain (aireadiness.northpathstrategies.org):
```
Type: CNAME
Name: aireadiness
Value: cname.vercel-dns.com
```

#### Alternative (A Record):
```
Type: A
Name: aireadiness
Value: 76.76.19.61
```

### 🔄 After Domain Setup
Once the domain is configured, update environment variables:

```bash
# Update NEXTAUTH_URL to use custom domain
vercel env add NEXTAUTH_URL production
# When prompted, enter: https://aireadiness.northpathstrategies.org

# Update app URLs
vercel env add NEXT_PUBLIC_APP_URL production
# When prompted, enter: https://aireadiness.northpathstrategies.org

vercel env add NEXT_PUBLIC_BASE_URL production
# When prompted, enter: https://aireadiness.northpathstrategies.org

# Redeploy with new URLs
vercel --prod
```

### 🎯 Current Status
- ✅ Application is fully functional on: https://ai-readiness-ftyjotqi8-jeremys-projects-73929cad.vercel.app
- ⏳ Custom domain setup pending domain transfer/availability
- ✅ All environment variables ready for custom domain

### 📞 Next Steps
1. **Immediate**: Contact domain administrator to transfer `aireadiness.northpathstrategies.org`
2. **Alternative**: Use a different subdomain (e.g., `ai-blueprint.northpathstrategies.org`)
3. **Once resolved**: Follow the DNS configuration steps above

### 🔍 Troubleshooting
If you continue to have issues:
- Check if you have the correct permissions for the `northpathstrategies.org` domain
- Verify you're logged into the correct Vercel account
- Consider using a different subdomain temporarily
