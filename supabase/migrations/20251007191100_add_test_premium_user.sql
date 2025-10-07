DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    SELECT id, email
    INTO v_user_id, v_email
    FROM auth.users
    WHERE email IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_user_id IS NULL THEN
    RAISE NOTICE 'No existing auth.users found. Skipping premium seed in migration 20251007191100.';
        RETURN;
    END IF;

    INSERT INTO public.user_payments (
        user_id,
        email,
        name,
        organization,
        tier,
        stripe_customer_id,
        stripe_session_id,
        payment_status,
        payment_amount,
        access_granted,
        is_test,
        role,
        department,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        COALESCE(v_email, 'premium@test.com'),
        'Premium Test User',
        'Test Organization Inc',
        'premium',
        'cus_test_' || gen_random_uuid()::text,
        'cs_test_' || gen_random_uuid()::text,
        'premium',
        9900,
        true,
        true,
        'admin',
        'Technology',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        organization = EXCLUDED.organization,
        tier = EXCLUDED.tier,
        payment_status = EXCLUDED.payment_status,
        payment_amount = EXCLUDED.payment_amount,
        access_granted = EXCLUDED.access_granted,
        is_test = EXCLUDED.is_test,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        updated_at = NOW();

    RAISE NOTICE 'Premium access ensured for user % in migration 20251007191100', v_user_id;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'team_members'
          AND column_name = 'name'
    ) THEN
        INSERT INTO public.team_members (id, organization, name, email, role, department, avatar_url)
        VALUES 
            ('22222222-2222-2222-2222-222222222221'::uuid, 'Test Organization Inc', 'John Doe', 'john.doe@testorg.com', 'admin', 'Technology', 'https://ui-avatars.com/api/?name=John+Doe'),
            ('22222222-2222-2222-2222-222222222222'::uuid, 'Test Organization Inc', 'Jane Smith', 'jane.smith@testorg.com', 'editor', 'Product', 'https://ui-avatars.com/api/?name=Jane+Smith')
        ON CONFLICT (id) DO UPDATE SET
            organization = EXCLUDED.organization,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            updated_at = NOW();
    ELSE
        RAISE NOTICE 'Skipping team_members seed: expected column "name" not found.';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'implementation_phases'
          AND column_name = 'phase_name'
    ) THEN
        INSERT INTO public.implementation_phases (id, organization, phase_name, description, start_date, end_date, status, budget)
        VALUES (
            '33333333-3333-3333-3333-333333333331'::uuid,
            'Test Organization Inc',
            'Phase 1: AI Assessment',
            'Initial assessment and planning phase',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            'in_progress',
            50000
        )
        ON CONFLICT (id) DO UPDATE SET
            organization = EXCLUDED.organization,
            phase_name = EXCLUDED.phase_name,
            status = EXCLUDED.status,
            budget = EXCLUDED.budget,
            updated_at = NOW();
    ELSE
        RAISE NOTICE 'Skipping implementation_phases seed: expected column "phase_name" not found.';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Test premium seed data refreshed (migration 20251007191100).';
END $$;