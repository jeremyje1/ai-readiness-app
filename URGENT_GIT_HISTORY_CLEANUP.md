# 🚨 URGENT ACTION REQUIRED - Git History Contamination

## CRITICAL ALERT
Your git history contains the exposed Stripe secret key `sk_live_...kUxs`. This means the key is permanently visible to anyone with access to your repository, even though it's been removed from current files.

## IMMEDIATE ACTIONS (Do These NOW)

### 1. ⚠️ DO NOT PUSH until git history is cleaned
```bash
# DO NOT RUN: git push
# The exposed key is still in git history and would be exposed publicly
```

### 2. 🔑 Create New Stripe API Keys IMMEDIATELY
1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. **Create a new restricted secret key** with minimal permissions:
   - `write:checkout_sessions`
   - `write:payment_intents` 
   - `read:payment_intents`
   - `write:subscriptions`
   - `read:subscriptions`
3. **Immediately revoke** the compromised key `sk_live_...kUxs`

### 3. 🧹 Clean Git History (REQUIRED)

Option A: **BFG Repo-Cleaner (Recommended)**
```bash
# Install BFG
brew install bfg

# Create a backup
cp -r ai-readiness-app-main ai-readiness-app-backup

# Clean the repository
cd ai-readiness-app-main
bfg --replace-text ../passwords.txt .git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

Create `passwords.txt` with:
```
***REMOVED***
```

Option B: **git-filter-branch (Alternative)**
```bash
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local .env.local.*' \
  --prune-empty --tag-name-filter cat -- --all
```

### 4. 🔄 Force Push Clean History
```bash
# After cleaning with BFG or filter-branch
git push --force --all
git push --force --tags
```

### 5. 📱 Update All Environment Variables

**Local Development:**
```bash
# Update .env.local
STRIPE_SECRET_KEY="sk_live_YOUR_NEW_SECRET_KEY_HERE"
```

**Vercel Production:**
```bash
# Update in Vercel dashboard
vercel env rm STRIPE_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY production
# Enter your new secret key when prompted
```

## Security Verification Checklist

After completing the above:

- [ ] ✅ New Stripe API key created with restricted permissions
- [ ] ✅ Old compromised key revoked in Stripe Dashboard
- [ ] ✅ Git history cleaned (no more sk_live_ keys in `git log --all --patch`)
- [ ] ✅ Local .env.local updated with new key
- [ ] ✅ Vercel production environment updated
- [ ] ✅ Run `./scripts/stripe-security-check.sh` - should show all green
- [ ] ✅ Test a payment to ensure new key works
- [ ] ✅ Monitor Stripe logs for any suspicious activity

## WHY THIS IS CRITICAL

1. **Git History is Public**: Once pushed, anyone can see your entire git history
2. **Keys Don't Expire**: The compromised key remains valid until manually revoked
3. **Financial Risk**: Attackers can create unauthorized charges
4. **Data Access**: Keys can access customer payment information

## Test After Fixing

Run this to verify security:
```bash
./scripts/stripe-security-check.sh
```

Should show:
- ✅ No hardcoded secrets in code
- ✅ Environment files properly gitignored  
- ✅ No Stripe keys in git history
- ✅ Webhook signature verification implemented

## Prevention for Future

1. **Never commit .env files**: Already configured in .gitignore ✅
2. **Use restricted API keys**: Only give minimum required permissions
3. **Regular key rotation**: Every 90 days
4. **Monitor usage**: Set up alerts for unusual API activity
5. **Pre-commit hooks**: Scan for secrets before commits

---

## ⏰ TIMELINE FOR ACTION

- **Next 15 minutes**: Create new Stripe keys, revoke old ones
- **Next 30 minutes**: Clean git history with BFG
- **Next 45 minutes**: Update all environment variables
- **Next 60 minutes**: Test and verify everything works

**This is a time-sensitive security incident. Act immediately.**
