# GitHub Secrets - Quick Setup Checklist

## Your Generated CRON_SECRET (Already copied to clipboard!)
```
S2O/NYFnliDztJowcfGeEvV9U52W0mv7gitt9BmjQPGgtPUCYIj9w+Gt6klEIXs+
```

## Step 1: Add GitHub Secrets (5 minutes)

🔗 **Go to:** https://github.com/jeremyje1/ai-readiness-app/settings/secrets/actions

Click **"New repository secret"** for each:

### Secret #1: CRON_SECRET
- **Name:** `CRON_SECRET`
- **Value:** `S2O/NYFnliDztJowcfGeEvV9U52W0mv7gitt9BmjQPGgtPUCYIj9w+Gt6klEIXs+`

### Secret #2: APP_BASE_URL
- **Name:** `APP_BASE_URL`
- **Value:** `https://aiblueprint.educationaiblueprint.com`

### Secret #3: SUPABASE_DB_URL
- **Name:** `SUPABASE_DB_URL`
- **Value:** Get from Supabase Dashboard
  1. Go to: https://app.supabase.com/project/_/settings/database
  2. Find "Connection string" → "URI" tab
  3. Copy the connection string
  4. Replace `[YOUR-PASSWORD]` with your actual password

---

## Step 2: Add to Vercel (3 minutes)

🔗 **Go to:** Your Vercel project → Settings → Environment Variables

### Add Environment Variable:
- **Name:** `CRON_SECRET`
- **Value:** `S2O/NYFnliDztJowcfGeEvV9U52W0mv7gitt9BmjQPGgtPUCYIj9w+Gt6klEIXs+`
- **Environment:** ✅ Production ✅ Preview (optional)

**⚠️ CRITICAL:** Click "Redeploy" after adding the variable!

---

## Step 3: Test Workflows (2 minutes)

🔗 **Go to:** https://github.com/jeremyje1/ai-readiness-app/actions

Test each workflow manually:

1. Click **"Seed Production Policy Templates"** → **"Run workflow"** → **"Run workflow"**
2. Click **"Password Token Cleanup"** → **"Run workflow"** → **"Run workflow"**
3. Click **"Policy Updates Refresh"** → **"Run workflow"** → **"Run workflow"**

✅ All should show green checkmarks!

---

## Verification Checklist

- [ ] CRON_SECRET added to GitHub Secrets
- [ ] APP_BASE_URL added to GitHub Secrets
- [ ] SUPABASE_DB_URL added to GitHub Secrets
- [ ] CRON_SECRET added to Vercel Environment Variables
- [ ] Vercel app redeployed
- [ ] All three workflows tested and passing

---

## What Happens After Setup?

### 🌱 Seed Production Policy Templates
- **Trigger:** Every push to main
- **Benefit:** Latest NIST AI RMF policy templates always available

### 🧹 Password Token Cleanup
- **Trigger:** Every hour (at :05)
- **Benefit:** Automatic security maintenance

### 🔄 Policy Updates Refresh
- **Trigger:** Every 6 hours
- **Benefit:** Customers get latest compliance guidance

---

## Need Help?

See full documentation: `GITHUB_SECRETS_SETUP.md`

**Support:** info@northpathstrategies.org
