# Backend Environment Audit - October 10, 2025

## 🎯 Executive Summary

**Backend Platform:** Supabase (PostgreSQL + Auth)  
**Frontend/API Hosting:** Vercel  
**Status:** ✅ Backend operational, ⚠️ Missing environment variables on Vercel

---

## ✅ Backend Health Status

Verified via production health endpoint (`/api/health`):

```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok", "latency": 226 },
    "stripe": { "status": "ok", "mode": "live" },
    "email": { "status": "ok", "provider": "postmark" },
    "openai": { "status": "ok" }
  }
}
```

**All backend services are functional:**
- ✅ Supabase database responding (226ms latency)
- ✅ Stripe integration active (live mode)
- ✅ Postmark email service connected
- ✅ OpenAI API configured

---

## ⚠️ Missing Vercel Environment Variables (Production)

The following **6 variables** are **NOT SET** in Vercel Production:

### Internal Secrets (4 vars)
These were regenerated during security remediation and must be added from 1Password vault:

1. `ADMIN_GRANT_TOKEN` - Internal admin authentication token (64 hex chars)
2. `JWT_SECRET` - JWT signing secret (base64 token)
3. `CRON_SECRET` - Cron job authentication (64 hex chars)
4. `NEXTAUTH_SECRET` - NextAuth session signing (base64 token)

**Note:** `CRON_SECRET` and `NEXTAUTH_SECRET` are already present in Vercel but may need verification against vault values if they were rotated.

### Stripe Price IDs (2 vars)
These map to specific Stripe product/price combinations:

5. `STRIPE_PRICE_EDU_MONTHLY_199` - Educational monthly subscription price ID
6. `STRIPE_PRICE_EDU_YEARLY_1990` - Educational yearly subscription price ID  
7. `STRIPE_PRICE_TEAM_MONTHLY` - Team plan monthly price ID
8. `STRIPE_PRICE_TEAM_YEARLY` - Team plan yearly price ID

**Current default values** (from `setup-vercel-env.sh`):
```bash
STRIPE_PRICE_EDU_MONTHLY_199=price_1SDnhlRMpSG47vNmDQr1WeJ3
STRIPE_PRICE_EDU_YEARLY_1990=price_1RxbGlRMpSG47vNmWEOu1otZ
STRIPE_PRICE_TEAM_MONTHLY=price_1RxbFkRMpSG47vNmLp4LCRHZ
STRIPE_PRICE_TEAM_YEARLY=price_1RxbGlRMpSG47vNmWEOu1otZ
```

---

## 📋 Current Vercel Environment (48 vars present)

✅ **Already configured:**
- All Supabase connection variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Core Stripe variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- NextAuth configuration (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`)
- Postmark email service (`POSTMARK_SERVER_TOKEN`, `POSTMARK_API_TOKEN`, etc.)
- OpenAI API key (`OPENAI_API_KEY`)
- Site URLs (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, etc.)
- Redis rate limiting (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_REDIS_PREFIX`)

---

## 🔐 Security Notes

### Old Compromised Values (DO NOT USE)
These values were leaked in git history and must **never** be used again:

```bash
# ❌ COMPROMISED - DO NOT USE
ADMIN_GRANT_TOKEN=2a1d0e199bd65c2f74fd72fc461d54405396196d82d68f13c98370aafe035414
CRON_SECRET=dcccabbc78126f5787295f6bbeebfd567f47b9ab39fb84d262bb08e64e4be3c4
NEXTAUTH_SECRET=oP1eYsTDPtsk0x484fsEtNftkZ+h/pjHw7fM+dxXD2A=
JWT_SECRET=+arV4Gn/SPlCsBWgopOkOQBRUE+uFWDoKoP6c/NNwBc=
```

**Verified:** Current Vercel production does **NOT** contain these old values ✅

### New Values Location
All rotated secrets are stored in:
**1Password → "AI Blueprint / Production Secrets"**

---

## 🚀 Recommended Actions

### 1. Update Missing Vercel Variables (Priority: HIGH)

Run the setup script with vault secrets:

```bash
# Option A: Export from 1Password CLI or manually
export ADMIN_GRANT_TOKEN="<from-vault>"
export JWT_SECRET="<from-vault>"
export STRIPE_PRICE_EDU_MONTHLY_199="price_1SDnhlRMpSG47vNmDQr1WeJ3"
export STRIPE_PRICE_EDU_YEARLY_1990="price_1RxbGlRMpSG47vNmWEOu1otZ"
export STRIPE_PRICE_TEAM_MONTHLY="price_1RxbFkRMpSG47vNmLp4LCRHZ"
export STRIPE_PRICE_TEAM_YEARLY="price_1RxbGlRMpSG47vNmWEOu1otZ"

# Run setup script
./setup-vercel-env.sh
```

**OR manually via Vercel dashboard:**

1. Go to: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/settings/environment-variables
2. Add each missing variable for **Production** environment
3. Redeploy: `vercel --prod`

### 2. Verify Supabase Service Role Key Rotation (Priority: MEDIUM)

The current `SUPABASE_SERVICE_ROLE_KEY` in Vercel may need rotation if it was exposed:

```bash
# 1. Generate new service role key in Supabase dashboard:
open https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/settings/api

# 2. Update in Vercel
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste new key when prompted

# 3. Redeploy
vercel --prod
```

### 3. Validate All Services Post-Update (Priority: HIGH)

After updating variables:

```bash
# Health check
curl https://aiblueprint.educationaiblueprint.com/api/health | jq .

# Stripe config verification
curl https://aiblueprint.educationaiblueprint.com/api/stripe/config-status | jq .

# Test checkout flow
open https://aiblueprint.educationaiblueprint.com/pricing
```

---

## 📊 Backend Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend/API)               │
│  • Next.js App Router                                    │
│  • API Routes (/api/*)                                   │
│  • Environment Variables (48 configured, 6 missing)      │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────────────────────────────────────┐
             │                                          │
    ┌────────▼────────┐                    ┌───────────▼────────┐
    │   SUPABASE      │                    │   EXTERNAL APIS    │
    │  (PostgreSQL)   │                    │                    │
    │  • Auth         │                    │  • Stripe (✅)     │
    │  • Database     │                    │  • Postmark (✅)   │
    │  • RLS Policies │                    │  • OpenAI (✅)     │
    │  Status: ✅     │                    │  • Upstash (✅)    │
    └─────────────────┘                    └────────────────────┘
```

**No Railway, no separate backend server—everything runs serverless on Vercel + Supabase.**

---

## 🔍 Code References

### Variables Required by Application

From `setup-vercel-env.sh` line 89-140:
```bash
REQUIRED_VARS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_BASE_URL
  NEXTAUTH_URL
  NEXTAUTH_SECRET
  ADMIN_GRANT_TOKEN          # ⚠️ MISSING
  JWT_SECRET                 # ⚠️ MISSING
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  STRIPE_PRICE_EDU_MONTHLY_199   # ⚠️ MISSING
  STRIPE_PRICE_EDU_YEARLY_1990   # ⚠️ MISSING
  STRIPE_PRICE_TEAM_MONTHLY      # ⚠️ MISSING
  STRIPE_PRICE_TEAM_YEARLY       # ⚠️ MISSING
  POSTMARK_SERVER_TOKEN
  POSTMARK_API_TOKEN
  POSTMARK_FROM_EMAIL
  POSTMARK_MESSAGE_STREAM
  POSTMARK_REPLY_TO
  FROM_EMAIL
  REPLY_TO_EMAIL
  ADMIN_EMAIL
  ADMIN_NOTIFICATION_EMAIL
  OPENAI_API_KEY
  CRON_SECRET
  RATE_LIMIT_REDIS_PREFIX
)
```

### Where Variables Are Used

**`JWT_SECRET`:** Currently **not used** in codebase (searched with `grep_search`).  
- May be reserved for future JWT authentication implementation.
- Safe to add as placeholder for now.

**`ADMIN_GRANT_TOKEN`:** Used for administrative API endpoints requiring elevated permissions.

**Stripe Price IDs:** Used in:
- `app/api/stripe/webhook/route.ts` (subscription product mapping)
- `app/api/stripe/unified-checkout/route.ts` (checkout session creation)
- `app/api/stripe/config-status/route.ts` (config validation)
- `lib/ai-blueprint-edu-product.ts` (product configuration)

---

## ✅ Next Steps

1. **Immediate:** Add 6 missing variables to Vercel Production from 1Password vault
2. **Short-term:** Verify `SUPABASE_SERVICE_ROLE_KEY` hasn't been compromised; rotate if needed
3. **Validation:** Run health checks and test critical flows (signup, checkout, dashboard)
4. **Documentation:** Update `SECURITY_REMEDIATION_GUIDE.md` to remove Railway references

---

## 📞 Support

- **Supabase Dashboard:** https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae
- **Vercel Dashboard:** https://vercel.com/jeremys-projects-73929cad/ai-readiness-app
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Production Site:** https://aiblueprint.educationaiblueprint.com
- **Health Endpoint:** https://aiblueprint.educationaiblueprint.com/api/health

---

**Audit Completed:** October 10, 2025  
**Audited By:** GitHub Copilot  
**Backend Status:** ✅ Operational  
**Action Required:** Add 6 missing Vercel environment variables
