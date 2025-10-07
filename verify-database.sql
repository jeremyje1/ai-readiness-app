-- Verification script - run this after applying direct-fix.sql

-- 1. Check user_payments structure
SELECT 
    'USER_PAYMENTS COLUMNS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if premium feature tables exist
SELECT 
    'PREMIUM FEATURE TABLES' as section,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events');

-- 3. Check RLS policies  
SELECT 
    'RLS POLICIES' as section,
    tablename as table_name,
    policyname as policy_name,
    permissive,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events')
ORDER BY tablename, policyname;

-- 4. Check if there's any test data
SELECT 
    'TEST DATA - user_payments' as section,
    COUNT(*) as total_records,
    COUNT(CASE WHEN payment_status = 'premium' THEN 1 END) as premium_users,
    COUNT(CASE WHEN organization IS NOT NULL THEN 1 END) as users_with_org
FROM public.user_payments;

-- 5. Check constraints
SELECT 
    'CONSTRAINTS' as section,
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND conrelid::regclass::text LIKE '%user_payments%';