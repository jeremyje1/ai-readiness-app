-- DEBUG: Check for organization column in user_payments table
-- Run this in your Supabase SQL editor to diagnose the issue

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
-- Replace 'YOUR_USER_ID' with an actual user ID from your database
SELECT organization 
FROM public.user_payments 
WHERE user_id = 'YOUR_USER_ID' 
AND access_granted = true;