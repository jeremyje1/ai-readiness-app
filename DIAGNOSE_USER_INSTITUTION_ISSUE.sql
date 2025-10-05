-- ============================================
-- Diagnose User and Institution Issue
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Step 1: Check if user exists in auth.users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
WHERE id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';

-- Step 2: Check if user exists in user_profiles
SELECT 
    user_id,
    email,
    full_name,
    institution_id,
    institution_name,
    created_at
FROM user_profiles
WHERE user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';

-- Step 3: Check institution_memberships table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'institution_memberships'
ORDER BY ordinal_position;

-- Step 4: Check foreign key constraints on institution_memberships
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'institution_memberships'
    AND tc.constraint_type = 'FOREIGN KEY';

-- Step 5: Find all valid users who could have institution memberships
SELECT 
    au.id,
    au.email,
    up.full_name,
    up.institution_id,
    CASE 
        WHEN im.user_id IS NOT NULL THEN 'Has membership'
        ELSE 'No membership'
    END as membership_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
LEFT JOIN institution_memberships im ON au.id = im.user_id
WHERE au.email LIKE '%' || (
    SELECT email FROM user_profiles WHERE user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83'
) || '%'
OR au.id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';

-- Step 6: If user doesn't exist in auth.users, this is the problem
-- The fix is to either:
-- A) Find the correct auth.users ID for this email
-- B) Delete the orphaned user_profile record
-- C) Modify the foreign key constraint (not recommended)

-- ============================================
-- SOLUTION: Find the correct user ID
-- ============================================

-- Find the actual authenticated user by email
SELECT 
    au.id as auth_user_id,
    au.email,
    up.user_id as profile_user_id,
    up.full_name,
    CASE 
        WHEN au.id = up.user_id THEN 'MATCHED ✅'
        WHEN au.id != up.user_id THEN 'MISMATCH ❌'
        WHEN up.user_id IS NULL THEN 'NO PROFILE'
    END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.email = up.email
WHERE au.email = (
    SELECT email FROM user_profiles WHERE user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83'
)
ORDER BY au.created_at DESC
LIMIT 5;
