-- ============================================
-- QUICK FIX: Run this for jeremy.estrella@gmail.com
-- Pre-filled and ready to run!
-- ============================================

DO $$
DECLARE
    v_auth_user_id UUID;
    v_user_email TEXT := 'jeremy.estrella@gmail.com';
    v_org_name TEXT;
    v_institution_id UUID;
BEGIN
    RAISE NOTICE '🚀 Fixing setup for: %', v_user_email;
    
    -- Get auth user
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = v_user_email;
    
    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', v_user_email;
    END IF;
    
    RAISE NOTICE '✅ Found user: %', v_auth_user_id;
    
    -- Create profile if missing
    IF NOT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = v_auth_user_id) THEN
        RAISE NOTICE '📝 Creating profile...';
        INSERT INTO user_profiles (user_id, email, full_name, subscription_tier, subscription_status, trial_ends_at, created_at)
        VALUES (v_auth_user_id, v_user_email, 'Jeremy Estrella', 'trial', 'trialing', NOW() + INTERVAL '7 days', NOW());
        RAISE NOTICE '✅ Profile created';
    END IF;
    
    -- Create institution if missing
    SELECT institution_id INTO v_institution_id FROM user_profiles WHERE user_id = v_auth_user_id;
    
    IF v_institution_id IS NULL THEN
        RAISE NOTICE '🏢 Creating institution...';
        v_org_name := 'gmail.com';
        
        INSERT INTO institutions (name, slug, headcount, budget, org_type, created_at)
        VALUES (v_org_name, 'gmail-com-' || FLOOR(EXTRACT(EPOCH FROM NOW()))::TEXT, 500, 1000000, 'K12', NOW())
        RETURNING id INTO v_institution_id;
        
        UPDATE user_profiles SET institution_id = v_institution_id, institution_name = v_org_name WHERE user_id = v_auth_user_id;
        RAISE NOTICE '✅ Institution created: %', v_institution_id;
    END IF;
    
    -- Create membership if missing
    IF NOT EXISTS(SELECT 1 FROM institution_memberships WHERE user_id = v_auth_user_id) THEN
        RAISE NOTICE '🔗 Creating membership...';
        INSERT INTO institution_memberships (user_id, institution_id, role, active, created_at)
        VALUES (v_auth_user_id, v_institution_id, 'admin', true, NOW());
        RAISE NOTICE '✅ Membership created';
    END IF;
    
    RAISE NOTICE '🎉 Setup complete for %', v_user_email;
END $$;

-- Show results
SELECT 
    'Verification for jeremy.estrella@gmail.com' as status,
    au.email,
    up.full_name,
    i.name as institution,
    im.role,
    im.active
FROM auth.users au
JOIN user_profiles up ON au.id = up.user_id
JOIN institutions i ON up.institution_id = i.id
JOIN institution_memberships im ON au.id = im.user_id
WHERE au.email = 'jeremy.estrella@gmail.com';
