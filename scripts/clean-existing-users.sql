-- Clean all test users and related data
-- Run this in Supabase SQL Editor

-- Step 1: Delete from existing related tables
DELETE FROM auth_password_setup_tokens WHERE id IS NOT NULL;
DELETE FROM user_payments WHERE id IS NOT NULL;
DELETE FROM user_profiles WHERE id IS NOT NULL;
DELETE FROM user_activity_log WHERE id IS NOT NULL;
DELETE FROM ai_readiness_assessments WHERE id IS NOT NULL;
DELETE FROM ai_readiness_payments WHERE id IS NOT NULL;

-- Step 2: Delete all users from auth.users
-- WARNING: This will delete ALL users!
DELETE FROM auth.users WHERE id IS NOT NULL;

-- Verify cleanup
SELECT 'auth.users' as table_name, COUNT(*) as row_count FROM auth.users
UNION ALL
SELECT 'auth_password_setup_tokens', COUNT(*) FROM auth_password_setup_tokens
UNION ALL
SELECT 'user_payments', COUNT(*) FROM user_payments
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;