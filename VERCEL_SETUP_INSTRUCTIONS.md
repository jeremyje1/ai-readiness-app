# Setup Vercel Environment Variables - Step-by-Step Guide

## Option A: Using the Export Script (Recommended)

### Step 1: Create a temporary secrets file (outside repo)

```bash
# Copy the template to a secure location
cp export-secrets-template.sh ~/Desktop/my-secrets.sh

# Edit it with your actual secrets from 1Password vault
nano ~/Desktop/my-secrets.sh  # or use your preferred editor
```

### Step 2: Source the secrets and run setup

```bash
# Load secrets into your shell
source ~/Desktop/my-secrets.sh

# Run the Vercel setup script (will use exported variables)
./setup-vercel-env.sh

# Clean up the secrets file
rm ~/Desktop/my-secrets.sh
```

---

## Option B: Manual Vercel Dashboard Update

If you prefer to update variables manually via the web interface:

### 1. Open Vercel Dashboard
```bash
open https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/settings/environment-variables
```

### 2. Add These 6 Missing Variables

Click "Add New" for each:

**Variable 1:**
- Key: `ADMIN_GRANT_TOKEN`
- Value: `<64-hex-char-from-1Password-vault>`
- Environment: Production ✓

**Variable 2:**
- Key: `JWT_SECRET`
- Value: `<base64-token-from-1Password-vault>`
- Environment: Production ✓

**Variable 3:**
- Key: `STRIPE_PRICE_EDU_MONTHLY_199`
- Value: `price_1SDnhlRMpSG47vNmDQr1WeJ3`
- Environment: Production ✓

**Variable 4:**
- Key: `STRIPE_PRICE_EDU_YEARLY_1990`
- Value: `price_1RxbGlRMpSG47vNmWEOu1otZ`
- Environment: Production ✓

**Variable 5:**
- Key: `STRIPE_PRICE_TEAM_MONTHLY`
- Value: `price_1RxbFkRMpSG47vNmLp4LCRHZ`
- Environment: Production ✓

**Variable 6:**
- Key: `STRIPE_PRICE_TEAM_YEARLY`
- Value: `price_1RxbGlRMpSG47vNmWEOu1otZ`
- Environment: Production ✓

### 3. Redeploy
```bash
vercel --prod
```

---

## Option C: One-liner Exports (Quick & Dirty)

If you trust your terminal history won't be saved:

```bash
export ADMIN_GRANT_TOKEN="<paste>" && \
export JWT_SECRET="<paste>" && \
export STRIPE_PRICE_EDU_MONTHLY_199="price_1SDnhlRMpSG47vNmDQr1WeJ3" && \
export STRIPE_PRICE_EDU_YEARLY_1990="price_1RxbGlRMpSG47vNmWEOu1otZ" && \
export STRIPE_PRICE_TEAM_MONTHLY="price_1RxbFkRMpSG47vNmLp4LCRHZ" && \
export STRIPE_PRICE_TEAM_YEARLY="price_1RxbGlRMpSG47vNmWEOu1otZ" && \
export SUPABASE_SERVICE_ROLE_KEY="<paste>" && \
export STRIPE_SECRET_KEY="<paste>" && \
export STRIPE_WEBHOOK_SECRET="<paste>" && \
export POSTMARK_SERVER_TOKEN="<paste>" && \
export POSTMARK_API_TOKEN="<paste>" && \
export OPENAI_API_KEY="<paste>" && \
export CRON_SECRET="<paste>" && \
export NEXTAUTH_SECRET="<paste>" && \
./setup-vercel-env.sh

# Clear history after (zsh)
history -d $(history 1)
```

---

## Verification After Setup

```bash
# Check variables were added
vercel env ls

# Test health endpoint
curl https://aiblueprint.educationaiblueprint.com/api/health | jq .

# Run verification script
./scripts/verify-security.sh
```

---

## Troubleshooting

**Script prompts for secrets even after export:**
- Make sure you're in the same terminal session where you ran `source`
- Check exports: `echo $ADMIN_GRANT_TOKEN` (should show value)
- Try re-sourcing: `source ~/Desktop/my-secrets.sh`

**"Vercel CLI not found":**
```bash
npm install -g vercel
vercel login
```

**Permission denied on script:**
```bash
chmod +x setup-vercel-env.sh
chmod +x scripts/verify-security.sh
```

---

## Security Notes

- ⚠️ Never commit filled secrets files to git
- ⚠️ Delete temporary secrets files after use
- ⚠️ Clear terminal history if using Option C
- ✅ All secrets files are already in `.gitignore`
- ✅ The template file is safe to commit (contains no real secrets)

---

**Quick Check - Are My Secrets Exported?**

```bash
# Run this to check (won't show actual values, just whether they're set)
for var in ADMIN_GRANT_TOKEN JWT_SECRET SUPABASE_SERVICE_ROLE_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET POSTMARK_SERVER_TOKEN POSTMARK_API_TOKEN OPENAI_API_KEY CRON_SECRET NEXTAUTH_SECRET; do
  if [ -z "${!var}" ]; then
    echo "❌ $var - NOT SET"
  else
    echo "✅ $var - SET (${#!var} chars)"
  fi
done
```

This will show which secrets are missing without revealing their values.
