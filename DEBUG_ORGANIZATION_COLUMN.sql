-- DEBUG: Check for organization column in user_payments table
-- Run this in your Supabase SQL editor to diagnose the issue
-- Run each section separately to see the results

-- 1. Check if user_payments table exists
SELECT 
    table_schema,
    table_name
FROM information_schema.tables 
WHERE table_name = 'user_payments'
ORDER BY table_schema;

-- 2. Check columns in user_payments table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_payments'
ORDER BY ordinal_position;

-- 3. Check if organization column exists specifically
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND column_name = 'organization';

-- 4. Check existing RLS policies on premium tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('team_members', 'implementation_phases', 'implementation_tasks', 'roi_metrics', 'calendar_events');

-- 5. Test query to see what the actual error is
-- First, let's get a sample user ID from the user_payments table
SELECT user_id, organization, access_granted 
FROM public.user_payments 
LIMIT 5;

-- 6. If you have auth.uid() available (when running as authenticated user):
-- This will test the actual query used in RLS policies
SELECT organization 
FROM public.user_payments 
WHERE user_id = auth.uid() 
AND access_granted = true;

-- 7. Alternative: Get your current user ID from auth.users
SELECT id, email 
FROM auth.users 
WHERE email = 'your-email@example.com'  -- Replace with your actual email
LIMIT 1;

-- 8. Test the exact query pattern used in RLS policies
-- This simulates what happens when RLS policies are evaluated
DO $$
DECLARE
    test_org TEXT;
BEGIN
    -- Try to select organization from user_payments
    -- This is what the RLS policies are trying to do
    SELECT organization INTO test_org
    FROM public.user_payments 
    WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
    LIMIT 1;
    
    RAISE NOTICE 'Organization found: %', test_org;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: % - %', SQLSTATE, SQLERRM;
END $$;

-- 9. Check if the error is happening at table level or policy level
-- Try a direct query on one of the premium tables
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'team_members' 
AND table_schema = 'public';

-- 10. Try to see the actual RLS policy definitions
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE cls.relname IN ('team_members', 'implementation_phases', 'implementation_tasks', 'roi_metrics', 'calendar_events')
AND nsp.nspname = 'public';