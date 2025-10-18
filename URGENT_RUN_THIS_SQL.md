# 🚨 IMMEDIATE ACTION REQUIRED 🚨

## Critical Issue: Demo Form Breaking in Production

**Time:** October 18, 2025 @ 11:20 AM  
**Status:** 🔴 BLOCKING ALL DEMO REGISTRATIONS

---

## The Problem

Your demo registration form is **failing with 500 errors** because the database is missing the `phone` column that the API expects.

**Error Message:**
```
Failed to update existing demo lead
"Could not find the 'phone' column of 'demo_leads' in the schema cache"
```

---

## ⚡ IMMEDIATE FIX (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: `jocigzsthcpspxfdfxae`

### Step 2: Run This SQL
1. Click **SQL Editor** in left sidebar
2. Click **New Query**
3. **Copy and paste this EXACTLY:**

```sql
ALTER TABLE demo_leads ADD COLUMN IF NOT EXISTS phone TEXT;
```

4. Click **Run** (or press Cmd+Enter / Ctrl+Enter)

### Step 3: Verify Success
You should see: `Success. No rows returned`

That's it! The demo form will work immediately.

---

## Verify It's Fixed

1. Visit: https://aiblueprint.educationaiblueprint.com/demo
2. Fill out the form completely
3. Click "Start the interactive demo"
4. Should redirect to dashboard (not error anymore)

---

## What I've Already Done

✅ Created migration files for future deployments  
✅ Updated base migration to include phone column  
✅ Pushed code fixes to GitHub  
✅ Documented the issue  

**What's LEFT:** You need to run that one SQL command in Supabase (above).

---

## Why This Happened

The `phone` field was added to the intake form and API, but the database migration was never run in production. The code expected the column to exist, but it didn't.

---

## Questions?

- Migration file: `supabase/migrations/20251018_add_phone_to_demo_leads.sql`
- Full docs: `CRITICAL_FIX_PHONE_COLUMN.md`
- Quick SQL: `QUICK_FIX_ADD_PHONE_COLUMN.sql`

---

**Action:** Run the SQL command above in Supabase Dashboard NOW to fix the demo form. ⚡
