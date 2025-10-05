-- ============================================
-- Fix Missing Institution Membership
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Check if user exists and has profile
SELECT 
    up.user_id,
    up.email,
    up.full_name,
    up.institution_id,
    up.institution_name
FROM user_profiles up
WHERE up.user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';

-- Check if institution membership exists
SELECT *
FROM institution_memberships
WHERE user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';

-- Check if institution exists
SELECT *
FROM institutions
WHERE id IN (
    SELECT institution_id 
    FROM user_profiles 
    WHERE user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83'
);

-- Option 1: Create institution membership if profile has institution_id
DO $$
DECLARE
    v_user_id UUID := 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';
    v_institution_id UUID;
    v_membership_exists BOOLEAN;
BEGIN
    -- Get institution_id from user_profile
    SELECT institution_id INTO v_institution_id
    FROM user_profiles
    WHERE user_id = v_user_id;

    -- Check if membership already exists
    SELECT EXISTS(
        SELECT 1 FROM institution_memberships 
        WHERE user_id = v_user_id
    ) INTO v_membership_exists;

    -- If institution_id exists and no membership, create it
    IF v_institution_id IS NOT NULL AND NOT v_membership_exists THEN
        INSERT INTO institution_memberships (
            user_id,
            institution_id,
            role,
            active,
            created_at
        ) VALUES (
            v_user_id,
            v_institution_id,
            'admin',
            true,
            NOW()
        );
        
        RAISE NOTICE 'Created institution membership for user %', v_user_id;
    ELSIF v_membership_exists THEN
        RAISE NOTICE 'Institution membership already exists for user %', v_user_id;
    ELSE
        RAISE NOTICE 'No institution_id found in user_profile for user %', v_user_id;
    END IF;
END $$;

-- Option 2: If no institution exists, create default one and membership
DO $$
DECLARE
    v_user_id UUID := 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';
    v_user_email TEXT;
    v_org_name TEXT;
    v_institution_id UUID;
    v_has_institution BOOLEAN;
BEGIN
    -- Get user email
    SELECT email INTO v_user_email
    FROM user_profiles
    WHERE user_id = v_user_id;

    -- Check if user already has institution
    SELECT EXISTS(
        SELECT 1 FROM user_profiles 
        WHERE user_id = v_user_id 
        AND institution_id IS NOT NULL
    ) INTO v_has_institution;

    -- If no institution, create one
    IF NOT v_has_institution THEN
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
            LOWER(REPLACE(v_org_name, '.', '-')) || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
            500,
            1000000,
            'K12',
            NOW()
        )
        RETURNING id INTO v_institution_id;
        
        -- Update user profile with institution_id
        UPDATE user_profiles
        SET 
            institution_id = v_institution_id,
            institution_name = v_org_name
        WHERE user_id = v_user_id;
        
        -- Create institution membership
        INSERT INTO institution_memberships (
            user_id,
            institution_id,
            role,
            active,
            created_at
        ) VALUES (
            v_user_id,
            v_institution_id,
            'admin',
            true,
            NOW()
        );
        
        RAISE NOTICE 'Created institution % and membership for user %', v_institution_id, v_user_id;
    ELSE
        RAISE NOTICE 'User % already has institution', v_user_id;
    END IF;
END $$;

-- Verify the fix
SELECT 
    up.user_id,
    up.email,
    up.full_name,
    up.institution_id,
    up.institution_name,
    i.name as institution_name_from_table,
    im.role as membership_role,
    im.active as membership_active
FROM user_profiles up
LEFT JOIN institutions i ON up.institution_id = i.id
LEFT JOIN institution_memberships im ON im.user_id = up.user_id AND im.institution_id = up.institution_id
WHERE up.user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';
