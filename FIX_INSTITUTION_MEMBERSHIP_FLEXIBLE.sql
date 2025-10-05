-- ============================================
-- Fix Institution Membership - FLEXIBLE VERSION
-- Works with either auth.users ID or email
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- INSTRUCTIONS:
-- 1. First run FIND_USERS.sql to see all users
-- 2. Find the correct user (either by auth ID or email)
-- 3. Update the variables below
-- 4. Run this script

DO $$
DECLARE
    -- METHOD 1: If you have the auth.users ID, use this
    v_input_auth_id UUID := NULL; -- Replace with auth.users.id if known
    
    -- METHOD 2: If you only have the email, use this
    v_input_email TEXT := NULL; -- Replace with user email, e.g., 'user@example.com'
    
    -- Working variables (don't modify these)
    v_auth_user_id UUID;
    v_user_email TEXT;
    v_profile_user_id UUID;
    v_org_name TEXT;
    v_institution_id UUID;
    v_has_institution BOOLEAN;
    v_membership_exists BOOLEAN;
    v_profile_exists BOOLEAN;
BEGIN
    -- Validate input
    IF v_input_auth_id IS NULL AND v_input_email IS NULL THEN
        RAISE EXCEPTION 'Please provide either v_input_auth_id OR v_input_email at the top of this script';
    END IF;
    
    -- Find the user by auth ID or email
    IF v_input_auth_id IS NOT NULL THEN
        RAISE NOTICE '🔍 Looking up user by auth ID: %', v_input_auth_id;
        
        SELECT id, email INTO v_auth_user_id, v_user_email
        FROM auth.users
        WHERE id = v_input_auth_id;
        
        IF v_auth_user_id IS NULL THEN
            RAISE EXCEPTION 'No auth.users record found with ID %', v_input_auth_id;
        END IF;
    ELSE
        RAISE NOTICE '🔍 Looking up user by email: %', v_input_email;
        
        SELECT id, email INTO v_auth_user_id, v_user_email
        FROM auth.users
        WHERE email = v_input_email
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF v_auth_user_id IS NULL THEN
            RAISE EXCEPTION 'No auth.users record found with email %', v_input_email;
        END IF;
    END IF;
    
    RAISE NOTICE '✅ Found auth user: % (%)', v_auth_user_id, v_user_email;
    
    -- Check if profile exists
    SELECT EXISTS(
        SELECT 1 FROM user_profiles WHERE user_id = v_auth_user_id
    ) INTO v_profile_exists;
    
    IF NOT v_profile_exists THEN
        RAISE NOTICE '⚠️  No user_profile found for auth user %', v_auth_user_id;
        RAISE NOTICE 'Creating user_profile...';
        
        -- Create profile
        INSERT INTO user_profiles (
            user_id,
            email,
            full_name,
            created_at
        ) VALUES (
            v_auth_user_id,
            v_user_email,
            split_part(v_user_email, '@', 1), -- Use email prefix as name
            NOW()
        );
        
        RAISE NOTICE '✅ Created user_profile for user %', v_auth_user_id;
    ELSE
        RAISE NOTICE '✅ User profile exists';
    END IF;
    
    -- Check if user already has institution
    SELECT 
        institution_id IS NOT NULL,
        institution_id
    INTO v_has_institution, v_institution_id
    FROM user_profiles
    WHERE user_id = v_auth_user_id;
    
    -- Create institution if needed
    IF NOT v_has_institution OR v_institution_id IS NULL THEN
        RAISE NOTICE '🏢 No institution found, creating one...';
        
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
        
        RAISE NOTICE '✅ Created institution: % (ID: %)', v_org_name, v_institution_id;
        
        -- Update user profile with institution_id
        UPDATE user_profiles
        SET 
            institution_id = v_institution_id,
            institution_name = v_org_name
        WHERE user_id = v_auth_user_id;
        
        RAISE NOTICE '✅ Updated user profile with institution_id';
    ELSE
        RAISE NOTICE '✅ User already has institution: %', v_institution_id;
    END IF;
    
    -- Check if membership exists
    SELECT EXISTS(
        SELECT 1 FROM institution_memberships 
        WHERE user_id = v_auth_user_id
        AND institution_id = v_institution_id
    ) INTO v_membership_exists;
    
    -- Create membership if needed
    IF NOT v_membership_exists THEN
        RAISE NOTICE '🔗 Creating institution membership...';
        
        INSERT INTO institution_memberships (
            user_id,
            institution_id,
            role,
            active,
            created_at
        ) VALUES (
            v_auth_user_id,
            v_institution_id,
            'admin',
            true,
            NOW()
        );
        
        RAISE NOTICE '✅ Created institution membership for user %', v_auth_user_id;
    ELSE
        RAISE NOTICE '✅ Institution membership already exists';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Auth User ID: %', v_auth_user_id;
    RAISE NOTICE 'Email: %', v_user_email;
    RAISE NOTICE 'Institution ID: %', v_institution_id;
    RAISE NOTICE 'Institution Name: %', v_org_name;
    RAISE NOTICE '';
    
END $$;

-- Verify the results
SELECT 
    '✅ VERIFICATION' as status,
    au.id as auth_user_id,
    au.email,
    up.user_id as profile_user_id,
    up.full_name,
    up.institution_id,
    i.name as institution_name,
    im.role as membership_role,
    im.active as membership_active,
    CASE 
        WHEN au.id = up.user_id THEN '✅ IDs Match'
        ELSE '❌ ID Mismatch'
    END as id_status,
    CASE 
        WHEN im.user_id IS NOT NULL THEN '✅ Has Membership'
        ELSE '❌ No Membership'
    END as membership_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
LEFT JOIN institutions i ON up.institution_id = i.id
LEFT JOIN institution_memberships im ON im.user_id = au.id AND im.institution_id = up.institution_id
ORDER BY au.created_at DESC
LIMIT 10;
