-- Seed data for premium features (for testing)

-- Helper function to get the first premium institution
DO $$
DECLARE
    v_organization TEXT;
    v_user_id UUID;
    v_team_member_id UUID;
    v_phase1_id UUID;
    v_phase2_id UUID;
    v_phase3_id UUID;
BEGIN
    -- Get first premium user's organization
    SELECT up.organization, up.user_id INTO v_organization, v_user_id
    FROM user_payments up
    WHERE up.access_granted = true
    AND up.organization IS NOT NULL
    LIMIT 1;

    IF v_organization IS NULL THEN
        RAISE NOTICE 'No premium organizations found. Please ensure a user has upgraded to premium first.';
        RETURN;
    END IF;

    -- Create team members if they don't exist
    INSERT INTO team_members (user_id, organization, role, full_name, email, department, avatar_url, permissions, joined_at)
    VALUES 
        (v_user_id, v_organization, 'owner', 'Admin User', 
         (SELECT email FROM auth.users WHERE id = v_user_id), 
         'Leadership', NULL, 
         '{"manage_team": true, "manage_billing": true, "manage_projects": true}'::jsonb, 
         NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET organization = v_organization
    RETURNING id INTO v_team_member_id;

    -- Add sample team members
    INSERT INTO team_members (organization, role, full_name, email, department, permissions, joined_at)
    VALUES 
        (v_organization, 'admin', 'Sarah Johnson', 'sarah.johnson@example.com', 'IT', 
         '{"manage_team": true, "manage_projects": true}'::jsonb, NOW() - INTERVAL '30 days'),
        (v_organization, 'member', 'Michael Chen', 'michael.chen@example.com', 'Operations', 
         '{"manage_projects": false}'::jsonb, NOW() - INTERVAL '45 days'),
        (v_organization, 'member', 'Emily Rodriguez', 'emily.rodriguez@example.com', 'HR', 
         '{"manage_projects": false}'::jsonb, NOW() - INTERVAL '20 days'),
        (v_organization, 'member', 'David Kim', 'david.kim@example.com', 'Finance', 
         '{"manage_projects": false}'::jsonb, NOW() - INTERVAL '60 days')
    ON CONFLICT DO NOTHING;

    -- Create implementation phases
    INSERT INTO implementation_phases (organization, phase_name, phase_order, status, start_date, target_end_date, description)
    VALUES 
        (v_organization, 'Discovery & Assessment', 1, 'completed', 
         NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days',
         'Initial AI readiness assessment and opportunity identification')
    RETURNING id INTO v_phase1_id;

    INSERT INTO implementation_phases (organization, phase_name, phase_order, status, start_date, target_end_date, actual_end_date, description)
    VALUES 
        (v_organization, 'Pilot Projects', 2, 'in_progress', 
         NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days', NULL,
         'Execute pilot AI projects in key departments')
    RETURNING id INTO v_phase2_id;

    INSERT INTO implementation_phases (organization, phase_name, phase_order, status, start_date, target_end_date, description)
    VALUES 
        (v_organization, 'Scaling & Integration', 3, 'planned', 
         NOW() + INTERVAL '30 days', NOW() + INTERVAL '120 days',
         'Scale successful pilots across the organization')
    RETURNING id INTO v_phase3_id;

    -- Create tasks for Phase 1 (Completed)
    INSERT INTO implementation_tasks (phase_id, organization, task_title, description, status, priority, estimated_hours, actual_hours, due_date, completed_date)
    VALUES 
        (v_phase1_id, v_organization, 'Conduct initial AI readiness assessment', 
         'Complete comprehensive assessment across all departments', 
         'completed', 'high', 40, 45, NOW() - INTERVAL '85 days', NOW() - INTERVAL '80 days'),
        (v_phase1_id, v_organization, 'Identify key stakeholders', 
         'Map out decision makers and champions in each department', 
         'completed', 'high', 20, 18, NOW() - INTERVAL '83 days', NOW() - INTERVAL '82 days'),
        (v_phase1_id, v_organization, 'Document current processes', 
         'Create process maps for high-impact workflows', 
         'completed', 'medium', 60, 65, NOW() - INTERVAL '75 days', NOW() - INTERVAL '70 days'),
        (v_phase1_id, v_organization, 'Prioritize AI opportunities', 
         'Rank opportunities by impact and feasibility', 
         'completed', 'high', 30, 28, NOW() - INTERVAL '65 days', NOW() - INTERVAL '62 days');

    -- Create tasks for Phase 2 (In Progress)
    INSERT INTO implementation_tasks (phase_id, organization, task_title, description, status, priority, estimated_hours, actual_hours, due_date)
    VALUES 
        (v_phase2_id, v_organization, 'Setup AI infrastructure', 
         'Configure cloud resources and data pipelines', 
         'completed', 'critical', 80, 75, NOW() - INTERVAL '50 days'),
        (v_phase2_id, v_organization, 'Implement customer service chatbot', 
         'Deploy AI chatbot for customer support', 
         'in_progress', 'high', 120, 60, NOW() + INTERVAL '10 days'),
        (v_phase2_id, v_organization, 'Develop predictive analytics dashboard', 
         'Create dashboard for sales forecasting', 
         'in_progress', 'high', 100, 40, NOW() + INTERVAL '20 days'),
        (v_phase2_id, v_organization, 'Train pilot teams', 
         'Conduct training sessions for pilot departments', 
         'todo', 'medium', 40, 0, NOW() + INTERVAL '15 days'),
        (v_phase2_id, v_organization, 'Measure pilot results', 
         'Track KPIs and ROI for pilot projects', 
         'todo', 'high', 30, 0, NOW() + INTERVAL '25 days');

    -- Create tasks for Phase 3 (Planned)
    INSERT INTO implementation_tasks (phase_id, organization, task_title, description, status, priority, estimated_hours, due_date)
    VALUES 
        (v_phase3_id, v_organization, 'Develop scaling strategy', 
         'Create roadmap for organization-wide deployment', 
         'todo', 'high', 40, NOW() + INTERVAL '35 days'),
        (v_phase3_id, v_organization, 'Establish AI governance', 
         'Define policies and ethical guidelines', 
         'todo', 'critical', 60, NOW() + INTERVAL '40 days'),
        (v_phase3_id, v_organization, 'Expand training programs', 
         'Roll out AI training to all departments', 
         'todo', 'high', 80, NOW() + INTERVAL '60 days'),
        (v_phase3_id, v_organization, 'Integrate AI systems', 
         'Connect AI tools with existing enterprise systems', 
         'todo', 'high', 120, NOW() + INTERVAL '90 days');

    -- Create ROI metrics
    INSERT INTO roi_metrics (organization, metric_type, metric_value, metric_date, category, description)
    VALUES 
        -- Cost savings
        (v_organization, 'cost_savings', 15000, NOW() - INTERVAL '60 days', 'efficiency', 
         'Reduced manual data entry costs through automation'),
        (v_organization, 'cost_savings', 22000, NOW() - INTERVAL '30 days', 'efficiency', 
         'Customer service efficiency improvements'),
        (v_organization, 'cost_savings', 28000, NOW(), 'efficiency', 
         'Process optimization savings'),
        
        -- Revenue increase
        (v_organization, 'revenue_increase', 35000, NOW() - INTERVAL '45 days', 'sales', 
         'Improved lead conversion through AI insights'),
        (v_organization, 'revenue_increase', 42000, NOW() - INTERVAL '15 days', 'sales', 
         'Upsell opportunities identified by AI'),
        (v_organization, 'revenue_increase', 51000, NOW(), 'sales', 
         'New customer acquisition through predictive analytics'),
        
        -- Productivity gains
        (v_organization, 'productivity_hours', 120, NOW() - INTERVAL '50 days', 'productivity', 
         'Hours saved through automated reporting'),
        (v_organization, 'productivity_hours', 180, NOW() - INTERVAL '25 days', 'productivity', 
         'Reduced meeting time with AI summaries'),
        (v_organization, 'productivity_hours', 240, NOW(), 'productivity', 
         'Faster decision making with AI insights');

    -- Create calendar events
    INSERT INTO calendar_events (organization, title, description, event_type, start_time, end_time, location, meeting_url, host_id)
    VALUES 
        (v_organization, 'AI Strategy Review', 
         'Monthly review of AI implementation progress and KPIs', 
         'meeting', 
         NOW() + INTERVAL '3 days' + TIME '14:00', 
         NOW() + INTERVAL '3 days' + TIME '15:30',
         'Conference Room A', 
         'https://zoom.us/j/123456789',
         v_team_member_id),
        
        (v_organization, 'AI Ethics Training', 
         'Mandatory training on responsible AI use and governance', 
         'training', 
         NOW() + INTERVAL '7 days' + TIME '10:00', 
         NOW() + INTERVAL '7 days' + TIME '12:00',
         'Training Center', 
         'https://teams.microsoft.com/l/meetup/123',
         (SELECT id FROM team_members WHERE organization = v_organization AND full_name = 'Sarah Johnson' LIMIT 1)),
        
        (v_organization, 'Pilot Project Demo', 
         'Demonstration of customer service chatbot pilot results', 
         'presentation', 
         NOW() + INTERVAL '10 days' + TIME '15:00', 
         NOW() + INTERVAL '10 days' + TIME '16:00',
         'Auditorium', 
         NULL,
         (SELECT id FROM team_members WHERE organization = v_organization AND full_name = 'Michael Chen' LIMIT 1)),
        
        (v_organization, 'AI Implementation Workshop', 
         'Hands-on workshop for department leads on AI tools', 
         'workshop', 
         NOW() + INTERVAL '14 days' + TIME '09:00', 
         NOW() + INTERVAL '14 days' + TIME '17:00',
         'Innovation Lab', 
         NULL,
         v_team_member_id);

    -- Create team activity
    INSERT INTO team_activity (team_member_id, action_type, action_details, entity_type, entity_id)
    VALUES 
        (v_team_member_id, 'project_update', 
         '{"message": "Completed infrastructure setup ahead of schedule"}'::jsonb, 
         'task', 
         (SELECT id FROM implementation_tasks WHERE task_title = 'Setup AI infrastructure' LIMIT 1)),
        
        ((SELECT id FROM team_members WHERE organization = v_organization AND full_name = 'Sarah Johnson' LIMIT 1), 
         'milestone_achieved', 
         '{"milestone": "50% completion of pilot projects"}'::jsonb, 
         'phase', 
         v_phase2_id),
        
        ((SELECT id FROM team_members WHERE organization = v_organization AND full_name = 'Michael Chen' LIMIT 1), 
         'document_shared', 
         '{"document": "AI ROI Analysis Q4.pdf", "url": "/documents/roi-q4.pdf"}'::jsonb, 
         'document', 
         gen_random_uuid());

    RAISE NOTICE 'Premium feature data seeded successfully for institution: %', v_organization;

END $$;