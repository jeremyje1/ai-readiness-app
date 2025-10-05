-- ============================================
-- Find All Users in the System
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Show all auth.users
SELECT 
    '🔐 AUTH USERS' as source,
    id,
    email,
    created_at,
    last_sign_in_at,
    confirmed_at IS NOT NULL as email_confirmed
FROM auth.users
ORDER BY created_at DESC;

-- 2. Show all user_profiles
SELECT 
    '👤 USER PROFILES' as source,
    user_id,
    email,
    full_name,
    institution_id,
    institution_name,
    created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 3. Show all institution_memberships
SELECT 
    '🏢 INSTITUTION MEMBERSHIPS' as source,
    user_id,
    institution_id,
    role,
    active,
    created_at
FROM institution_memberships
ORDER BY created_at DESC;

-- 4. Show users WITHOUT profiles
SELECT 
    '⚠️ AUTH USERS WITHOUT PROFILES' as status,
    au.id as auth_user_id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ORDER BY au.created_at DESC;

-- 5. Show profiles WITHOUT auth users
SELECT 
    '⚠️ PROFILES WITHOUT AUTH' as status,
    up.user_id as profile_user_id,
    up.email,
    up.full_name,
    up.created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.id IS NULL
ORDER BY up.created_at DESC;

-- 6. Show orphaned institution memberships
SELECT 
    '⚠️ ORPHANED MEMBERSHIPS' as status,
    im.user_id,
    im.institution_id,
    im.role,
    i.name as institution_name
FROM institution_memberships im
LEFT JOIN auth.users au ON im.user_id = au.id
LEFT JOIN institutions i ON im.institution_id = i.id
WHERE au.id IS NULL;

-- 7. Find the user by email if they exist anywhere
-- Replace 'user@example.com' with the actual email
/*
SELECT 
    '🔍 SEARCH BY EMAIL' as search_type,
    'auth.users' as found_in,
    id as user_id,
    email
FROM auth.users
WHERE email ILIKE '%jeremy%' OR email ILIKE '%example%'

UNION ALL

SELECT 
    '🔍 SEARCH BY EMAIL' as search_type,
    'user_profiles' as found_in,
    user_id,
    email
FROM user_profiles
WHERE email ILIKE '%jeremy%' OR email ILIKE '%example%';
*/
