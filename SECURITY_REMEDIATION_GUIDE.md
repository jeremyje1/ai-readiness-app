# 🔒 SECURITY REMEDIATION GUIDE
**Date:** October 10, 2025  
**Status:** ✅ Git cleanup complete - Credential rotation needed

---

## ✅ COMPLETED ACTIONS

### 1. Git Repository Cleanup
- ✅ Removed `.env.temp.fetch` from git tracking
- ✅ Added to `.gitignore` to prevent future commits
- ✅ Deleted local exposed files (`.env.production`, `.env.temp.fetch`)
- ✅ Committed security fix to repository
- ✅ All tests passing (100 passed, 18 skipped)

---

## 🔐 NEW CRYPTOGRAPHIC SECRETS GENERATED

**IMPORTANT:** Use the freshly generated values stored in the secure vault (1Password → “AI Blueprint / Production Secrets”) to replace the compromised ones in Railway and Vercel. Do **not** commit secret values to git.

---

## 🚨 CREDENTIALS TO ROTATE IMMEDIATELY

### Priority 1: Stripe Keys (CRITICAL) 🔴

**Why:** Live payment credentials were exposed in git-tracked file

**Actions Required:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Click **"Roll"** next to your **Secret key**
3. Copy new secret key: `sk_live_...`
4. Go to: https://dashboard.stripe.com/webhooks
5. Select your webhook endpoint
6. Click **"Roll signing secret"**
7. Copy new webhook secret: `whsec_...`

**Update in:**
- Railway: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

---

### Priority 2: Supabase Service Role Key (CRITICAL) 🔴

**Why:** Service role key has full database access - equivalent to root access

**Actions Required:**
1. Go to: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/settings/api
2. Scroll to **"Service role"** section
3. Click **"Reset service_role key"**
4. Confirm the reset
5. Copy new key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Update in:**
- Railway: `SUPABASE_SERVICE_ROLE_KEY`
- Vercel: `SUPABASE_SERVICE_ROLE_KEY`

**Note:** The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public-safe and doesn't need rotation.

---

### Priority 3: Postmark API Token (HIGH) 🟠

**Why:** Email sending credentials exposed

**Actions Required:**
1. Go to: https://account.postmarkapp.com/servers
2. Select your server
3. Go to **"API Tokens"** tab
4. Click **"Create Token"** or regenerate existing
5. Delete old token
6. Copy new token

**Update in:**
- Railway: `POSTMARK_API_TOKEN`, `POSTMARK_SERVER_TOKEN`
- Vercel: `POSTMARK_API_TOKEN`, `POSTMARK_SERVER_TOKEN`

---

### Priority 4: Internal Application Secrets (MEDIUM) 🟡

**Why:** Application security tokens exposed

**Use the new values from the secure vault:**

- Railway: update `ADMIN_GRANT_TOKEN`, `CRON_SECRET`, `NEXTAUTH_SECRET`, and `JWT_SECRET` with the entries labeled **“Production – Internal Secrets (Rotated <DATE>)”**.
- Vercel: update the same four variables for all environments (Production, Preview, Development).

---

### Priority 5: Postgres Password (OPTIONAL) ⚪

**Why:** Database password exposed, but Supabase manages this

**Actions (Optional):**
1. Go to: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/settings/database
2. Click **"Reset database password"**
3. Update connection strings if you use direct database access

**Note:** If you only access database via Supabase SDK (which you do), this is less critical.

---

## 📋 STEP-BY-STEP CREDENTIAL UPDATE PROCESS

### For Railway:

```bash
# 1. Open Railway dashboard
open https://railway.app

# 2. Navigate to your project
# 3. Go to Variables tab
# 4. Update each variable one by one:
#    - Click on variable
#    - Replace with new value
#    - Click "Save"
# 5. Railway will auto-redeploy after changes
```

### For Vercel:

```bash
# 1. Open Vercel dashboard
open https://vercel.com

# 2. Navigate to your project settings
# 3. Go to Environment Variables
# 4. For each variable to update:
#    - Find the variable
#    - Click "Edit"
#    - Replace value
#    - Select all environments (Production, Preview, Development)
#    - Click "Save"
# 5. Redeploy from Vercel dashboard or:
vercel --prod
```

---

## 🧪 VERIFICATION CHECKLIST

After updating all credentials, verify everything works:

### 1. Test Deployments
```bash
# Check Railway
curl https://your-railway-app.up.railway.app/api/health

# Check Vercel
curl https://aiblueprint.educationaiblueprint.com/api/health
```

### 2. Test Stripe Integration
- [ ] Visit pricing page
- [ ] Click "Start 7-Day Trial"
- [ ] Verify Stripe checkout opens
- [ ] Complete test transaction (use Stripe test card: 4242 4242 4242 4242)
- [ ] Verify webhook receives payment confirmation

### 3. Test Supabase Integration
- [ ] Login to app
- [ ] Create/read data (assessment, profile, etc.)
- [ ] Verify RLS policies work correctly
- [ ] Check database queries execute successfully

### 4. Test Email Integration (Postmark)
- [ ] Signup new user
- [ ] Verify welcome email arrives
- [ ] Test password reset flow
- [ ] Confirm password setup email

### 5. Test Authentication
- [ ] Login with existing account
- [ ] Logout and login again
- [ ] Test session persistence
- [ ] Verify JWT tokens work

---

## 🔒 GIT HISTORY CLEANUP (OPTIONAL BUT RECOMMENDED)

The exposed secrets are still in git history. To completely remove them:

### Option A: BFG Repo-Cleaner (Easiest)

```bash
# Install BFG
brew install bfg

# Clone fresh mirror
cd ~/Desktop
git clone --mirror git@github.com:jeremyje1/ai-readiness-app.git

# Remove files from ALL history
cd ai-readiness-app.git
bfg --delete-files .env.temp.fetch

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: Rewrites history!)
git push --force

# Update your local repo
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main
git fetch origin
git reset --hard origin/chore/upgrade-vitest-vite
```

### Option B: Leave History (If Private Repo)

If your repository is private and you've rotated all credentials:
- The old secrets are useless now
- Git history exposure is minimal risk
- Focus on preventing future leaks

---

## 🛡️ PREVENTION: Git Pre-Commit Hook

Install a pre-commit hook to catch secrets before they're committed:

```bash
# Install gitleaks
brew install gitleaks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "❌ SECRETS DETECTED! Commit blocked."
    echo "Remove secrets from staged files before committing."
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

---

## 📊 SECURITY STATUS SUMMARY

| Area | Status | Action Required |
|------|--------|----------------|
| Git Repository | ✅ Clean | None - files removed |
| OpenAI API Key | ✅ Rotated | None - already done |
| Stripe Keys | 🔴 Exposed | **ROTATE NOW** |
| Supabase Keys | 🔴 Exposed | **ROTATE NOW** |
| Postmark Token | 🔴 Exposed | **ROTATE NOW** |
| Internal Secrets | 🟡 Exposed | **UPDATE NOW** |
| Code Security | ✅ Good | None |
| Build Security | ✅ Passing | None |

---

## ⏱️ ESTIMATED TIME TO COMPLETE

- **Stripe rotation:** 5 minutes
- **Supabase rotation:** 3 minutes
- **Postmark rotation:** 3 minutes
- **Update Railway variables:** 5 minutes
- **Update Vercel variables:** 5 minutes
- **Verification testing:** 10 minutes

**Total:** ~30 minutes

---

## 🆘 SUPPORT

If you encounter issues during rotation:

1. **Stripe Issues:**
   - Support: https://support.stripe.com
   - Docs: https://stripe.com/docs/keys

2. **Supabase Issues:**
   - Discord: https://discord.supabase.com
   - Docs: https://supabase.com/docs

3. **Postmark Issues:**
   - Support: https://postmarkapp.com/support
   - Docs: https://postmarkapp.com/developer

---

## ✅ COMPLETION CHECKLIST

- [ ] Git cleanup committed and pushed
- [ ] Stripe secret key rotated
- [ ] Stripe webhook secret rotated
- [ ] Supabase service role key rotated
- [ ] Postmark API token rotated
- [ ] ADMIN_GRANT_TOKEN updated in Railway & Vercel
- [ ] CRON_SECRET updated in Railway & Vercel
- [ ] NEXTAUTH_SECRET updated in Railway & Vercel
- [ ] JWT_SECRET updated in Railway & Vercel
- [ ] Railway redeployed successfully
- [ ] Vercel redeployed successfully
- [ ] All verification tests passed
- [ ] Git pre-commit hook installed (optional)
- [ ] Git history cleaned (optional)

---

## 📝 NOTES

- Keep this file secure - it contains your new secrets
- After updating all systems, you can delete this file
- Consider setting up a password manager for future secret storage
- Schedule quarterly security reviews and key rotations

---

**Last Updated:** October 10, 2025, 3:40 PM CST
**Next Review:** January 10, 2026
