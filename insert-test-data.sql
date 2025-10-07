-- Insert comprehensive test data for premium features
-- Run this after direct-fix.sql

-- 1. Add or update a test premium user tied to an existing user record
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- Reuse the most recent user from auth.users (Supabase)
    SELECT id, email
    INTO v_user_id, v_email
    FROM auth.users
    WHERE email IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users. Please create a user first, then rerun this script.';
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

    RAISE NOTICE 'Premium access granted to user % for organization %', v_user_id, 'Test Organization Inc';
END $$;

-- 2. Add team members for the test organization
INSERT INTO public.team_members (id, organization, name, email, role, department, avatar_url)
VALUES 
    ('22222222-2222-2222-2222-222222222221'::uuid, 'Test Organization Inc', 'John Doe', 'john.doe@testorg.com', 'admin', 'Technology', 'https://ui-avatars.com/api/?name=John+Doe'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Test Organization Inc', 'Jane Smith', 'jane.smith@testorg.com', 'editor', 'Product', 'https://ui-avatars.com/api/?name=Jane+Smith'),
    ('22222222-2222-2222-2222-222222222223'::uuid, 'Test Organization Inc', 'Bob Johnson', 'bob.johnson@testorg.com', 'viewer', 'Operations', 'https://ui-avatars.com/api/?name=Bob+Johnson'),
    ('22222222-2222-2222-2222-222222222224'::uuid, 'Test Organization Inc', 'Alice Williams', 'alice.williams@testorg.com', 'editor', 'AI Strategy', 'https://ui-avatars.com/api/?name=Alice+Williams')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- 3. Add implementation phases
INSERT INTO public.implementation_phases (id, organization, phase_name, description, start_date, end_date, status, budget)
VALUES 
    ('33333333-3333-3333-3333-333333333331'::uuid, 'Test Organization Inc', 'Phase 1: AI Readiness Assessment', 'Comprehensive assessment of current AI capabilities and readiness', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'in_progress', 25000),
    ('33333333-3333-3333-3333-333333333332'::uuid, 'Test Organization Inc', 'Phase 2: Infrastructure Setup', 'Setting up necessary infrastructure and tools for AI implementation', CURRENT_DATE + INTERVAL '31 days', CURRENT_DATE + INTERVAL '60 days', 'planning', 50000),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Test Organization Inc', 'Phase 3: Pilot Implementation', 'Implementing pilot AI projects in selected departments', CURRENT_DATE + INTERVAL '61 days', CURRENT_DATE + INTERVAL '120 days', 'planning', 75000)
ON CONFLICT (id) DO UPDATE SET
    phase_name = EXCLUDED.phase_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 4. Add tasks
INSERT INTO public.tasks (organization, phase_id, assigned_to, title, description, status, priority, due_date)
VALUES 
    ('Test Organization Inc', '33333333-3333-3333-3333-333333333331'::uuid, '22222222-2222-2222-2222-222222222221'::uuid, 'Complete NIST AI Framework Assessment', 'Fill out the comprehensive NIST assessment questionnaire', 'in_progress', 'high', CURRENT_DATE + INTERVAL '7 days'),
    ('Test Organization Inc', '33333333-3333-3333-3333-333333333331'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Document Current AI Use Cases', 'Create inventory of all current AI/ML initiatives', 'todo', 'high', CURRENT_DATE + INTERVAL '10 days'),
    ('Test Organization Inc', '33333333-3333-3333-3333-333333333331'::uuid, '22222222-2222-2222-2222-222222222224'::uuid, 'Stakeholder Interviews', 'Conduct interviews with key stakeholders', 'todo', 'medium', CURRENT_DATE + INTERVAL '14 days'),
    ('Test Organization Inc', '33333333-3333-3333-3333-333333333332'::uuid, '22222222-2222-2222-2222-222222222221'::uuid, 'Select Cloud Provider', 'Evaluate and select appropriate cloud infrastructure', 'todo', 'high', CURRENT_DATE + INTERVAL '35 days'),
    ('Test Organization Inc', '33333333-3333-3333-3333-333333333332'::uuid, '22222222-2222-2222-2222-222222222223'::uuid, 'Data Governance Framework', 'Establish data governance policies and procedures', 'todo', 'high', CURRENT_DATE + INTERVAL '40 days');

-- 5. Add ROI metrics
INSERT INTO public.roi_metrics (organization, metric_name, baseline_value, target_value, current_value, unit, category)
VALUES 
    ('Test Organization Inc', 'Process Automation Rate', 15, 60, 22, 'percentage', 'Efficiency'),
    ('Test Organization Inc', 'Customer Response Time', 48, 12, 36, 'hours', 'Customer Service'),
    ('Test Organization Inc', 'Data Processing Speed', 100, 500, 150, 'records/minute', 'Performance'),
    ('Test Organization Inc', 'Error Reduction Rate', 5, 1, 3.5, 'percentage', 'Quality'),
    ('Test Organization Inc', 'Cost Savings', 0, 500000, 125000, 'dollars', 'Financial'),
    ('Test Organization Inc', 'Employee Productivity', 100, 150, 115, 'index', 'Productivity');

-- 6. Add calendar events
INSERT INTO public.calendar_events (organization, title, description, start_time, end_time, event_type, location, phase_id, created_by)
VALUES 
    ('Test Organization Inc', 'AI Strategy Kickoff Meeting', 'Initial meeting to discuss AI implementation strategy', NOW() + INTERVAL '2 days 10 hours', NOW() + INTERVAL '2 days 11 hours', 'meeting', 'Conference Room A', '33333333-3333-3333-3333-333333333331'::uuid, '22222222-2222-2222-2222-222222222221'::uuid),
    ('Test Organization Inc', 'NIST Assessment Review', 'Review and discuss NIST assessment results', NOW() + INTERVAL '7 days 14 hours', NOW() + INTERVAL '7 days 16 hours', 'review', 'Virtual - Teams', '33333333-3333-3333-3333-333333333331'::uuid, '22222222-2222-2222-2222-222222222224'::uuid),
    ('Test Organization Inc', 'Stakeholder Workshop', 'Workshop with department heads on AI opportunities', NOW() + INTERVAL '10 days 9 hours', NOW() + INTERVAL '10 days 13 hours', 'workshop', 'Training Room 1', '33333333-3333-3333-3333-333333333331'::uuid, '22222222-2222-2222-2222-222222222222'::uuid),
    ('Test Organization Inc', 'Infrastructure Planning Session', 'Technical planning for AI infrastructure', NOW() + INTERVAL '30 days 10 hours', NOW() + INTERVAL '30 days 12 hours', 'planning', 'IT Conference Room', '33333333-3333-3333-3333-333333333332'::uuid, '22222222-2222-2222-2222-222222222221'::uuid);

-- 7. Summary of inserted data
SELECT 'Data insertion completed. Summary:' as status;

SELECT 'User Payments' as table_name, COUNT(*) as count FROM public.user_payments WHERE organization = 'Test Organization Inc'
UNION ALL
SELECT 'Team Members', COUNT(*) FROM public.team_members WHERE organization = 'Test Organization Inc'
UNION ALL
SELECT 'Implementation Phases', COUNT(*) FROM public.implementation_phases WHERE organization = 'Test Organization Inc'
UNION ALL
SELECT 'Tasks', COUNT(*) FROM public.tasks WHERE organization = 'Test Organization Inc'
UNION ALL
SELECT 'ROI Metrics', COUNT(*) FROM public.roi_metrics WHERE organization = 'Test Organization Inc'
UNION ALL
SELECT 'Calendar Events', COUNT(*) FROM public.calendar_events WHERE organization = 'Test Organization Inc';