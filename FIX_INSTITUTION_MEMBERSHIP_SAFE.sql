-- ============================================
-- Fix Institution Membership for User
-- SAFE VERSION - Works with auth.users constraint
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- This script will:
-- 1. Find the correct auth.users ID by email
-- 2. Update user_profiles if needed
-- 3. Create institution and membership correctly

DO $$
DECLARE
    v_profile_user_id UUID := 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';
    v_auth_user_id UUID;
    v_user_email TEXT;
    v_org_name TEXT;
    v_institution_id UUID;
    v_has_institution BOOLEAN;
    v_membership_exists BOOLEAN;
BEGIN
    -- Get the email from the profile
    SELECT email INTO v_user_email
    FROM user_profiles
    WHERE user_id = v_profile_user_id;
    
    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'No user profile found with ID %', v_profile_user_id;
    END IF;
    
    RAISE NOTICE 'Found profile email: %', v_user_email;
    
    -- Find the REAL auth.users ID by email
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = v_user_email
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'No auth.users record found for email %', v_user_email;
    END IF;
    
    RAISE NOTICE 'Found auth user ID: %', v_auth_user_id;
    
    -- Check if the IDs match
    IF v_auth_user_id != v_profile_user_id THEN
        RAISE NOTICE 'MISMATCH DETECTED: profile_user_id (%) != auth_user_id (%)', v_profile_user_id, v_auth_user_id;
        RAISE NOTICE 'This profile was created with incorrect user_id';
        RAISE NOTICE 'Recommendation: Update user_profiles.user_id to match auth.users.id';
        
        -- Option: Update the profile to use correct user_id (uncomment if needed)
        -- UPDATE user_profiles 
        -- SET user_id = v_auth_user_id 
        -- WHERE user_id = v_profile_user_id;
        -- RAISE NOTICE 'Updated user_profile to use correct user_id';
    ELSE
        RAISE NOTICE 'User IDs match correctly ✅';
    END IF;
    
    -- Check if user already has institution
    SELECT 
        EXISTS(SELECT 1 FROM user_profiles WHERE user_id = v_auth_user_id AND institution_id IS NOT NULL),
        institution_id
    INTO v_has_institution, v_institution_id
    FROM user_profiles
    WHERE user_id = v_auth_user_id;
    
    -- Create institution if needed
    IF NOT v_has_institution OR v_institution_id IS NULL THEN
        RAISE NOTICE 'No institution found, creating one...';
        
        -- Generate org name from email domain
        v_org_name := COALESCE(
            NULLIF(split_part(v_user_email, '@', 2), ''),
            'Default Institution'
        );
        
        -- Create institution
        INSERT INTO institutions (
            name,
            slug,
            headcount,
            budget,
            org_type,
            created_at
        ) VALUES (
            v_org_name,
            LOWER(REPLACE(REPLACE(v_org_name, '.', '-'), ' ', '-')) || '-' || FLOOR(EXTRACT(EPOCH FROM NOW()))::TEXT,
            500,
            1000000,
            'K12',
            NOW()
        )
        RETURNING id INTO v_institution_id;
        
        RAISE NOTICE 'Created institution: % (ID: %)', v_org_name, v_institution_id;
        
        -- Update user profile with institution_id
        UPDATE user_profiles
        SET 
            institution_id = v_institution_id,
            institution_name = v_org_name
        WHERE user_id = v_auth_user_id;
        
        RAISE NOTICE 'Updated user profile with institution_id';
    ELSE
        RAISE NOTICE 'User already has institution: %', v_institution_id;
    END IF;
    
    -- Check if membership exists
    SELECT EXISTS(
        SELECT 1 FROM institution_memberships 
        WHERE user_id = v_auth_user_id
        AND institution_id = v_institution_id
    ) INTO v_membership_exists;
    
    -- Create membership if needed
    IF NOT v_membership_exists THEN
        RAISE NOTICE 'Creating institution membership...';
        
        INSERT INTO institution_memberships (
            user_id,
            institution_id,
            role,
            active,
            created_at
        ) VALUES (
            v_auth_user_id,  -- Use the REAL auth.users ID
            v_institution_id,
            'admin',
            true,
            NOW()
        );
        
        RAISE NOTICE 'Created institution membership for user % ✅', v_auth_user_id;
    ELSE
        RAISE NOTICE 'Institution membership already exists ✅';
    END IF;
    
END $$;

-- Verify the results
SELECT 
    'VERIFICATION' as check_type,
    au.id as auth_user_id,
    au.email,
    up.user_id as profile_user_id,
    up.full_name,
    up.institution_id,
    up.institution_name,
    i.name as institution_name_from_table,
    im.role as membership_role,
    im.active as membership_active,
    CASE 
        WHEN au.id = up.user_id THEN '✅ IDs Match'
        ELSE '❌ ID Mismatch - PROBLEM!'
    END as id_status,
    CASE 
        WHEN im.user_id IS NOT NULL THEN '✅ Has Membership'
        ELSE '❌ No Membership'
    END as membership_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.email = up.email
LEFT JOIN institutions i ON up.institution_id = i.id
LEFT JOIN institution_memberships im ON im.user_id = au.id AND im.institution_id = up.institution_id
WHERE up.user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83'
   OR au.id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';
