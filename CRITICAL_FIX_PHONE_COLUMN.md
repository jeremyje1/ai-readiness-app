# CRITICAL FIX: Demo Leads Phone Column Missing

**Issue Identified:** October 18, 2025 @ 11:20 AM  
**Status:** 🔴 BLOCKING - Demo registration failing in production  
**Severity:** P0 - Critical

## Problem

The `/api/demo/register` endpoint is failing with 500 errors:

```
Failed to update existing demo lead
{
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'phone' column of 'demo_leads' in the schema cache"
}
```

**Root Cause:** The `phone` column was included in the API payload but missing from the Supabase `demo_leads` table schema.

## Immediate Fix Required

### Option 1: Supabase SQL Editor (FASTEST - 2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae
2. Navigate to: **SQL Editor** → **New Query**
3. Copy and paste from `QUICK_FIX_ADD_PHONE_COLUMN.sql`:

```sql
ALTER TABLE demo_leads
ADD COLUMN IF NOT EXISTS phone TEXT;
```

4. Click **Run** (or press Ctrl/Cmd + Enter)
5. Verify success - you should see "Success. No rows returned"

### Option 2: Run Migration Script (5 minutes)

```bash
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main
node apply-phone-migration.js
```

### Option 3: Supabase CLI (if installed)

```bash
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main
supabase db push
```

## Verification Steps

After applying the fix, verify with this query in SQL Editor:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'demo_leads'
  AND column_name = 'phone';
```

Expected result:
```
column_name | data_type | is_nullable
------------|-----------|-------------
phone       | text      | YES
```

## Test the Fix

1. Visit: https://aiblueprint.educationaiblueprint.com/demo
2. Fill out the intake form
3. Submit the form
4. Should redirect successfully to demo dashboard
5. Check Supabase `demo_leads` table for new entry with phone field

## Files Updated

### New Migration
- ✅ `supabase/migrations/20251018_add_phone_to_demo_leads.sql`
- ✅ `apply-phone-migration.js` (helper script)
- ✅ `QUICK_FIX_ADD_PHONE_COLUMN.sql` (manual SQL)

### Updated Files
- ✅ `supabase/migrations/20251017_create_demo_leads_table.sql` (added phone column)

## Post-Fix Deployment

After applying the database fix, commit and deploy the updated migration:

```bash
git add supabase/migrations/20251017_create_demo_leads_table.sql
git add supabase/migrations/20251018_add_phone_to_demo_leads.sql
git add apply-phone-migration.js
git add QUICK_FIX_ADD_PHONE_COLUMN.sql
git add CRITICAL_FIX_PHONE_COLUMN.md

git commit -m "fix: Add phone column to demo_leads table schema"
git push origin main
```

No code deployment needed - this is a database-only fix. The API code already expects the phone column.

## Impact

**Before Fix:**
- ❌ Demo form submissions failing with 500 errors
- ❌ No leads being captured
- ❌ Poor user experience

**After Fix:**
- ✅ Demo form submissions working
- ✅ Leads captured with optional phone numbers
- ✅ Sales team can follow up via phone

## Related Issues

This also explains the SendGrid webhook errors:
```
📨 Received form submission: { 
  name: 'undefined undefined', 
  email: undefined, 
  institution: undefined, 
  interest: undefined 
}
```

These were likely from automated bots, not the demo form. The actual demo form issue is the missing phone column.

## Prevention

- ✅ Added phone column to base migration
- ✅ Created additive migration for existing databases
- 📋 TODO: Add database schema validation tests
- 📋 TODO: Add pre-deployment migration check

## Timeline

- **11:20 AM** - First 500 error detected in production
- **11:21 AM** - Issue diagnosed (missing phone column)
- **11:25 AM** - Migrations created
- **11:30 AM** - Fix documented
- **⏰ PENDING** - Database migration applied
- **⏰ PENDING** - Production verification

---

**Next Action:** Apply the SQL fix immediately via Supabase Dashboard SQL Editor (Option 1 above).
