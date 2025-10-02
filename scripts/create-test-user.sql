-- Create a test user for testing the platform
-- Run this in Supabase SQL Editor

-- Step 1: Create the user with Supabase Auth Admin API
-- This needs to be done via the Supabase Dashboard or using the service role key

-- For now, here's the SQL to create related records after you create the user:

-- First, create a user through Supabase Dashboard:
-- Go to Authentication > Users > Invite User
-- Email: test@aiblueprint.com
-- Password: TestUser123!

-- After creating the user, get their ID and run this SQL:

-- Replace 'USER_ID_HERE' with the actual user ID from the auth.users table
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the test user ID (adjust email if you used a different one)
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE email = 'test@aiblueprint.com'
    LIMIT 1;

    IF test_user_id IS NULL THEN
        RAISE NOTICE 'Test user not found. Please create user first via Supabase Dashboard.';
        RETURN;
    END IF;

    -- Create user profile
    INSERT INTO user_profiles (
        id,
        user_id,
        email,
        full_name,
        organization,
        role,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_user_id,
        'test@aiblueprint.com',
        'Test User',
        'Test Organization',
        'Administrator',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        organization = EXCLUDED.organization,
        updated_at = NOW();

    -- Create user payment record (simulate paid user)
    INSERT INTO user_payments (
        id,
        user_id,
        email,
        name,
        organization,
        tier,
        stripe_customer_id,
        stripe_session_id,
        payment_amount,
        payment_status,
        access_granted,
        created_at
    ) VALUES (
        gen_random_uuid(),
        test_user_id,
        'test@aiblueprint.com',
        'Test User',
        'Test Organization',
        'platform-monthly',
        'cus_test_' || substr(md5(random()::text), 1, 14),
        'cs_test_' || substr(md5(random()::text), 1, 24),
        199,
        'completed',
        true,
        NOW()
    ) ON CONFLICT DO NOTHING;

    -- Create a sample streamlined assessment response
    INSERT INTO streamlined_assessment_responses (
        user_id,
        institution_type,
        institution_size,
        institution_state,
        ai_journey_stage,
        biggest_challenge,
        top_priorities,
        implementation_timeline,
        contact_name,
        contact_email,
        contact_role,
        completed_at
    ) VALUES (
        test_user_id,
        'university',
        'large',
        'California',
        'piloting',
        'Faculty adoption and training',
        ARRAY['faculty_development', 'student_safety', 'academic_integrity'],
        'immediate',
        'Test User',
        'test@aiblueprint.com',
        'CIO',
        NOW()
    ) ON CONFLICT DO NOTHING;

    -- Create sample gap analysis
    INSERT INTO gap_analysis_results (
        user_id,
        overall_score,
        maturity_level,
        govern_score,
        govern_gaps,
        govern_strengths,
        govern_recommendations,
        map_score,
        map_gaps,
        map_strengths,
        map_recommendations,
        measure_score,
        measure_gaps,
        measure_strengths,
        measure_recommendations,
        manage_score,
        manage_gaps,
        manage_strengths,
        manage_recommendations,
        priority_actions,
        quick_wins
    ) VALUES (
        test_user_id,
        65.5,
        'Developing',
        60.0,
        ARRAY['Lack of formal AI governance structure', 'No clear AI ethics guidelines'],
        ARRAY['Executive support for AI initiatives', 'Budget allocated for AI projects'],
        ARRAY['Establish AI governance committee', 'Develop AI ethics framework'],
        70.0,
        ARRAY['Incomplete AI risk assessment', 'Limited stakeholder mapping'],
        ARRAY['Strong IT infrastructure', 'Existing data governance'],
        ARRAY['Complete comprehensive AI risk assessment', 'Map all AI stakeholders'],
        65.0,
        ARRAY['No AI performance metrics', 'Limited monitoring capabilities'],
        ARRAY['Regular security assessments', 'Established reporting procedures'],
        ARRAY['Define AI KPIs', 'Implement AI monitoring tools'],
        67.0,
        ARRAY['Reactive incident response', 'Limited AI training programs'],
        ARRAY['Strong project management', 'Good vendor relationships'],
        ARRAY['Develop proactive AI management plan', 'Create AI training curriculum'],
        ARRAY['Establish AI governance committee', 'Complete AI risk assessment', 'Define AI KPIs'],
        ARRAY['Document current AI tools in use', 'Survey faculty on AI needs', 'Create AI working group']
    ) ON CONFLICT DO NOTHING;

    -- Create sample roadmaps
    INSERT INTO implementation_roadmaps (
        user_id,
        roadmap_type,
        goals,
        action_items,
        milestones,
        success_metrics,
        start_date,
        end_date,
        status
    ) VALUES
    (
        test_user_id,
        '30_day',
        ARRAY['Establish AI governance', 'Complete initial assessment', 'Form AI committee'],
        ARRAY['Schedule stakeholder meetings', 'Draft governance charter', 'Identify committee members'],
        ARRAY['Week 1: Stakeholder alignment', 'Week 2: Charter draft', 'Week 3: Committee formation', 'Week 4: First meeting'],
        ARRAY['Committee formed', 'Charter approved', '100% stakeholder participation'],
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        'in_progress'
    ),
    (
        test_user_id,
        '60_day',
        ARRAY['Develop AI policies', 'Launch pilot program', 'Train key staff'],
        ARRAY['Write AI usage policy', 'Select pilot departments', 'Develop training materials'],
        ARRAY['Month 1: Policy development', 'Month 2: Pilot launch and training'],
        ARRAY['Policy approved', '3+ departments in pilot', '50+ staff trained'],
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '60 days',
        'not_started'
    ),
    (
        test_user_id,
        '90_day',
        ARRAY['Full AI framework implementation', 'Measure pilot outcomes', 'Plan expansion'],
        ARRAY['Deploy AI tools', 'Collect metrics', 'Develop expansion plan'],
        ARRAY['Month 1: Deployment', 'Month 2: Measurement', 'Month 3: Planning'],
        ARRAY['Framework operational', 'ROI measured', 'Expansion plan approved'],
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '90 days',
        'not_started'
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Test user data created successfully for user ID: %', test_user_id;
END $$;

-- Verify the test user setup
SELECT
    u.email,
    u.created_at,
    up.full_name,
    up.organization,
    pay.tier,
    pay.payment_status,
    sa.institution_type,
    sa.ai_journey_stage,
    ga.maturity_level,
    ga.overall_score
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_payments pay ON u.id = pay.user_id
LEFT JOIN streamlined_assessment_responses sa ON u.id = sa.user_id
LEFT JOIN gap_analysis_results ga ON u.id = ga.user_id
WHERE u.email = 'test@aiblueprint.com';