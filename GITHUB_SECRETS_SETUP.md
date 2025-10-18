# GitHub Secrets Configuration Guide

## Overview
This guide will help you configure the required GitHub secrets to enable automated workflows for the best customer experience.

## Required Secrets

### 1. SUPABASE_DB_URL
**Purpose:** Direct PostgreSQL connection for seeding policy templates  
**Format:** `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

**How to get it:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Copy the **URI** (not the pooler connection)
5. Replace `[YOUR-PASSWORD]` with your actual database password

**Example:**
```
postgresql://postgres.xxxxxxxxxxxx:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. CRON_SECRET
**Purpose:** Secure authentication for cron job endpoints  
**Format:** Random secure string (at least 32 characters)

**Generate a secure secret:**
```bash
# Run this command to generate a random 64-character secret:
openssl rand -base64 48
```

**Example output:**
```
7k9mP2xQ8nR5sT1vW4yA6bC3dE7fG0hJ2kL5mN8pQ1rS4tU7vW0xY3zA6bC9dE2f
```

### 3. APP_BASE_URL
**Purpose:** Your production application URL for API callbacks  
**Format:** `https://your-domain.com` (no trailing slash)

**Your production URL:**
```
https://aiblueprint.educationaiblueprint.com
```

**Alternative if using Vercel:**
- You can also use your Vercel production URL
- Find it in Vercel Dashboard → Project → Settings → Domains

## Step-by-Step Setup Instructions

### Step 1: Generate CRON_SECRET (if you don't have one)

Run this command in your terminal:
```bash
openssl rand -base64 48
```

Copy the output - you'll need it for the next step.

### Step 2: Add Secrets to GitHub

1. **Go to your GitHub repository:**
   - Navigate to: https://github.com/jeremyje1/ai-readiness-app

2. **Open Repository Settings:**
   - Click **Settings** tab (top navigation)

3. **Navigate to Secrets:**
   - In left sidebar, click **Secrets and variables** → **Actions**

4. **Add Each Secret:**
   - Click **New repository secret** button
   - Add the following secrets one by one:

#### Secret 1: SUPABASE_DB_URL
- **Name:** `SUPABASE_DB_URL`
- **Value:** Your Supabase PostgreSQL connection string
- Click **Add secret**

#### Secret 2: CRON_SECRET
- **Name:** `CRON_SECRET`
- **Value:** The random string you generated above
- Click **Add secret**

#### Secret 3: APP_BASE_URL
- **Name:** `APP_BASE_URL`
- **Value:** `https://aiblueprint.educationaiblueprint.com`
- Click **Add secret**

### Step 3: Add CRON_SECRET to Environment Variables

The CRON_SECRET needs to be available in your production environment (Vercel/deployment platform).

**For Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new environment variable:
   - **Name:** `CRON_SECRET`
   - **Value:** Same value you used for GitHub secret
   - **Environment:** Production (and optionally Preview/Development)
4. Click **Save**
5. **Redeploy your application** for the change to take effect

**For other platforms:**
Add `CRON_SECRET` as an environment variable in your deployment platform's settings.

### Step 4: Verify Secrets are Added

In GitHub:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see three repository secrets:
   - ✅ `APP_BASE_URL`
   - ✅ `CRON_SECRET`
   - ✅ `SUPABASE_DB_URL`

## What Each Workflow Does

### 🌱 Seed Production Policy Templates
**When:** Runs on every push to main  
**Purpose:** Automatically seeds NIST AI RMF policy templates into production database  
**Customer Benefit:** Ensures latest policy templates are always available for generation

### 🧹 Password Token Cleanup
**When:** Runs every hour (at :05)  
**Purpose:** Automatically deletes expired password reset tokens from database  
**Customer Benefit:** Maintains database hygiene and security

### 🔄 Policy Updates Refresh
**When:** Runs every 6 hours  
**Purpose:** Checks for NIST framework updates and generates policy redlines  
**Customer Benefit:** Customers always have access to latest compliance guidance

## Testing the Setup

After adding secrets, you can manually trigger each workflow to test:

1. Go to **Actions** tab in GitHub
2. Select a workflow from the left sidebar:
   - "Seed Production Policy Templates"
   - "Password Token Cleanup"
   - "Policy Updates Refresh"
3. Click **Run workflow** button
4. Select branch: `main`
5. Click green **Run workflow** button
6. Wait 1-2 minutes and verify it completes successfully (green checkmark)

## Security Best Practices

✅ **DO:**
- Use different CRON_SECRET for production vs. staging
- Rotate CRON_SECRET every 90 days
- Keep SUPABASE_DB_URL confidential (never commit to code)
- Use read-only database credentials if possible for non-seeding workflows

❌ **DON'T:**
- Share secrets in Slack, email, or other communication tools
- Commit secrets to version control
- Use simple/guessable CRON_SECRET values
- Reuse secrets across different services

## Troubleshooting

### "Unauthorized" errors in workflow runs
- ✅ Verify CRON_SECRET is identical in GitHub secrets AND Vercel environment variables
- ✅ Redeploy your application after adding CRON_SECRET to Vercel

### "Connection failed" errors for SUPABASE_DB_URL
- ✅ Verify the connection string format is correct
- ✅ Check that the password doesn't contain special characters that need URL encoding
- ✅ Ensure your Supabase project is active (not paused)

### Workflow doesn't trigger on schedule
- ✅ Check that the workflow file has been updated (secrets alone won't trigger re-enable)
- ✅ GitHub Actions may have up to 15-minute delay for scheduled workflows

## Support

If you encounter issues:
1. Check workflow run logs in GitHub Actions tab
2. Review Vercel deployment logs
3. Verify all secrets are correctly added in both GitHub and Vercel

---

**Last Updated:** October 18, 2025  
**Maintained By:** Jeremy Estrella - NorthPath Strategies
