-- ============================================
-- BULK FIX FOR ALL EXISTING USERS
-- Automatically creates institutions and memberships for ALL users
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- ============================================

-- This will:
-- 1. Find all users with profiles but no institution
-- 2. Create institutions for them
-- 3. Create institution memberships

DO $$
DECLARE
    v_user RECORD;
    v_institution_id UUID;
    v_org_name TEXT;
    v_slug TEXT;
BEGIN
    RAISE NOTICE '🚀 Starting bulk user fix...';
    RAISE NOTICE '';

    -- Loop through all users who need fixing
    FOR v_user IN 
        SELECT 
            au.id as auth_user_id,
            au.email,
            up.user_id as profile_user_id,
            up.institution_id,
            up.institution_name,
            up.institution_type
        FROM auth.users au
        LEFT JOIN user_profiles up ON au.id = up.user_id
        WHERE au.id IS NOT NULL
    LOOP
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '👤 Processing: %', v_user.email;
        
        -- Check if user has profile
        IF v_user.profile_user_id IS NULL THEN
            RAISE NOTICE '⚠️  No profile found - creating...';
            
            -- Create profile
            INSERT INTO user_profiles (
                user_id,
                email,
                full_name,
                subscription_tier,
                subscription_status,
                trial_ends_at,
                created_at
            ) VALUES (
                v_user.auth_user_id,
                v_user.email,
                split_part(v_user.email, '@', 1),
                'trial',
                'trialing',
                NOW() + INTERVAL '7 days',
                NOW()
            );
            
            RAISE NOTICE '✅ Profile created';
            
            -- Set variables for institution creation
            v_user.institution_id := NULL;
            v_user.institution_name := NULL;
            v_user.institution_type := 'K12';
        ELSE
            RAISE NOTICE '✅ Profile exists';
        END IF;
        
        -- Check if user needs institution
        IF v_user.institution_id IS NULL THEN
            RAISE NOTICE '🏢 No institution - creating...';
            
            -- Generate org name from email domain
            v_org_name := COALESCE(
                NULLIF(v_user.institution_name, ''),
                REPLACE(SPLIT_PART(v_user.email, '@', 2), '.', ' '),
                'My Institution'
            );
            
            -- Check if institution already exists
            SELECT id INTO v_institution_id
            FROM institutions
            WHERE name = v_org_name
            LIMIT 1;
            
            IF v_institution_id IS NULL THEN
                -- Create new institution
                v_slug := LOWER(REPLACE(REPLACE(v_org_name, '.', '-'), ' ', '-')) 
                         || '-' || FLOOR(EXTRACT(EPOCH FROM NOW()))::TEXT;
                
                INSERT INTO institutions (
                    name,
                    slug,
                    headcount,
                    budget,
                    org_type,
                    created_at
                ) VALUES (
                    v_org_name,
                    v_slug,
                    500,
                    1000000,
                    COALESCE(v_user.institution_type, 'K12'),
                    NOW()
                )
                RETURNING id INTO v_institution_id;
                
                RAISE NOTICE '✅ Created institution: % (ID: %)', v_org_name, v_institution_id;
            ELSE
                RAISE NOTICE '✅ Using existing institution: %', v_institution_id;
            END IF;
            
            -- Update user profile with institution
            UPDATE user_profiles
            SET 
                institution_id = v_institution_id,
                institution_name = v_org_name
            WHERE user_id = v_user.auth_user_id;
            
            RAISE NOTICE '✅ Updated profile with institution';
        ELSE
            v_institution_id := v_user.institution_id;
            RAISE NOTICE '✅ Institution already set: %', v_institution_id;
        END IF;
        
        -- Check if membership exists
        IF NOT EXISTS(
            SELECT 1 FROM institution_memberships 
            WHERE user_id = v_user.auth_user_id
            AND institution_id = v_institution_id
        ) THEN
            RAISE NOTICE '🔗 Creating institution membership...';
            
            INSERT INTO institution_memberships (
                user_id,
                institution_id,
                role,
                active,
                created_at
            ) VALUES (
                v_user.auth_user_id,
                v_institution_id,
                'admin',
                true,
                NOW()
            )
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE '✅ Membership created';
        ELSE
            RAISE NOTICE '✅ Membership already exists';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 BULK FIX COMPLETE!';
    RAISE NOTICE '';
    
END $$;

-- Verification Report
SELECT 
    '📊 Summary' as report_type,
    COUNT(DISTINCT au.id) as total_auth_users,
    COUNT(DISTINCT up.user_id) as users_with_profiles,
    COUNT(DISTINCT CASE WHEN up.institution_id IS NOT NULL THEN up.user_id END) as users_with_institutions,
    COUNT(DISTINCT im.user_id) as users_with_memberships
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
LEFT JOIN institution_memberships im ON au.id = im.user_id;

-- Show any remaining issues
SELECT 
    '⚠️ Users Still Missing Setup' as status,
    au.id as auth_user_id,
    au.email,
    CASE WHEN up.user_id IS NULL THEN '❌' ELSE '✅' END as has_profile,
    CASE WHEN up.institution_id IS NULL THEN '❌' ELSE '✅' END as has_institution,
    CASE WHEN im.user_id IS NULL THEN '❌' ELSE '✅' END as has_membership
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
LEFT JOIN institution_memberships im ON au.id = im.user_id AND im.institution_id = up.institution_id
WHERE up.user_id IS NULL 
   OR up.institution_id IS NULL 
   OR im.user_id IS NULL
ORDER BY au.created_at DESC;

-- Show successful setups
SELECT 
    '✅ Complete User Setups' as status,
    au.email,
    up.full_name,
    i.name as institution,
    im.role,
    im.active as membership_active
FROM auth.users au
JOIN user_profiles up ON au.id = up.user_id
JOIN institutions i ON up.institution_id = i.id
JOIN institution_memberships im ON au.id = im.user_id AND im.institution_id = up.institution_id
ORDER BY au.created_at DESC;
