# Fix Premium Features - Step by Step Guide

Based on your debug results, here's exactly what you need to do:

## Current Status
✅ `user_payments` table exists with `organization` column  
❌ No RLS policies exist on premium tables  
❌ No data in `user_payments` table  

## Step 1: Add Yourself to user_payments (if needed)

If you haven't purchased premium through Stripe yet:

1. Run the contents of `ADD_TEST_USER_PAYMENT.sql` in Supabase SQL editor
2. Replace 'your-email@example.com' with your actual email
3. This will add you as a premium user

## Step 2: Create the Premium Tables and RLS Policies

Run the ENTIRE contents of `APPLY_PREMIUM_FEATURES_MIGRATION.sql` in your Supabase SQL editor.

This will:
- Create all premium tables (team_members, implementation_phases, etc.)
- Create all RLS policies with proper references to `public.user_payments`
- Enable row level security on all tables

## Step 3: If You Still Get Errors

If you're still getting "column organization does not exist" errors:

1. Run `FIX_RLS_POLICIES_SIMPLE.sql` which will:
   - Drop all existing policies
   - Recreate them with explicit table references
   - Use EXISTS clauses for better clarity

## Step 4: Verify Everything Works

Run this verification query:

```sql
-- Check that policies were created
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename IN ('team_members', 'implementation_phases', 'implementation_tasks', 'roi_metrics', 'calendar_events');

-- Should return a count > 0

-- Test the APIs
SELECT * FROM public.team_members;
-- Should work without error (may return no rows if no data yet)
```

## Step 5: Test the Frontend

1. Go to your premium dashboard
2. Try using the Team, Tasks, ROI, or Calendar features
3. They should now work without 403 errors

## Common Issues

### "column organization does not exist"
- This means RLS policies weren't created. Run the migration again.

### 403 Forbidden errors
- This means you're not in the user_payments table. Run Step 1.

### Empty data
- This is normal. The APIs will create data as you use them.

## Need More Help?

Run sections 8 and 10 from `DEBUG_ORGANIZATION_COLUMN.sql` again after running the migration to see if policies were created correctly.