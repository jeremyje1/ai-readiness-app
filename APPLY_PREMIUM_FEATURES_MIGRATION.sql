-- IMPORTANT: Run this SQL in your Supabase Dashboard SQL Editor
-- This creates all tables needed for premium features

-- 1. Team Management System
-- ========================

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'owner', 'admin', 'member', 'viewer'
    department TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'pending'
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team activity log
CREATE TABLE IF NOT EXISTS team_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_details JSONB,
    entity_type TEXT,
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Task Tracking System
-- ======================

-- Implementation phases
CREATE TABLE IF NOT EXISTS implementation_phases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization TEXT NOT NULL,
    phase_name TEXT NOT NULL,
    phase_order INTEGER NOT NULL,
    description TEXT,
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Implementation tasks
CREATE TABLE IF NOT EXISTS implementation_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phase_id UUID REFERENCES implementation_phases(id) ON DELETE CASCADE,
    organization TEXT NOT NULL,
    task_title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES team_members(id),
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'completed', 'blocked'
    estimated_hours INTEGER DEFAULT 0,
    actual_hours INTEGER DEFAULT 0,
    due_date DATE,
    completed_date DATE,
    blockers TEXT[],
    dependencies UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES implementation_tasks(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROI Metrics System
-- ====================

-- ROI metrics tracking
CREATE TABLE IF NOT EXISTS roi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'cost_savings', 'revenue_increase', 'productivity_hours', etc.
    metric_value DECIMAL(12,2) NOT NULL,
    metric_date DATE NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROI calculations
CREATE TABLE IF NOT EXISTS roi_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization TEXT NOT NULL,
    calculation_date DATE NOT NULL,
    monthly_savings DECIMAL(12,2),
    annual_projection DECIMAL(12,2),
    payback_period_months INTEGER,
    roi_percentage DECIMAL(6,2),
    calculation_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Calendar System
-- =================

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL, -- 'meeting', 'training', 'workshop', 'presentation', 'office_hours'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    meeting_url TEXT,
    host_id UUID REFERENCES team_members(id),
    attendee_ids UUID[],
    max_attendees INTEGER,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    response TEXT DEFAULT 'pending', -- 'accepted', 'declined', 'maybe', 'pending'
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, team_member_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_org ON team_members(organization);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_activity_member ON team_activity(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_created ON team_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phases_org ON implementation_phases(organization);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON implementation_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON implementation_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON implementation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON implementation_tasks(organization);
CREATE INDEX IF NOT EXISTS idx_roi_metrics_org ON roi_metrics(organization, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_org ON calendar_events(organization);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time ON calendar_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
-- First, let's create policies that use user_payments table to check organization access
CREATE POLICY "Users can view their organization's team members" ON team_members
    FOR SELECT USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

CREATE POLICY "Users can view their organization's data" ON implementation_phases
    FOR SELECT USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

CREATE POLICY "Users can view their organization's tasks" ON implementation_tasks
    FOR SELECT USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

CREATE POLICY "Users can view their organization's ROI metrics" ON roi_metrics
    FOR SELECT USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

CREATE POLICY "Users can view their organization's events" ON calendar_events
    FOR SELECT USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- INSERT policies for team_members
CREATE POLICY "Users can insert team members for their organization" ON team_members
    FOR INSERT WITH CHECK (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- UPDATE policies for team_members
CREATE POLICY "Users can update their organization's team members" ON team_members
    FOR UPDATE USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- INSERT policies for implementation_phases
CREATE POLICY "Users can insert phases for their organization" ON implementation_phases
    FOR INSERT WITH CHECK (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- INSERT policies for implementation_tasks
CREATE POLICY "Users can insert tasks for their organization" ON implementation_tasks
    FOR INSERT WITH CHECK (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- UPDATE policies for implementation_tasks
CREATE POLICY "Users can update their organization's tasks" ON implementation_tasks
    FOR UPDATE USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- INSERT policies for roi_metrics
CREATE POLICY "Users can insert ROI metrics for their organization" ON roi_metrics
    FOR INSERT WITH CHECK (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- UPDATE policies for roi_metrics
CREATE POLICY "Users can update their organization's ROI metrics" ON roi_metrics
    FOR UPDATE USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- INSERT policies for calendar_events
CREATE POLICY "Users can insert events for their organization" ON calendar_events
    FOR INSERT WITH CHECK (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- UPDATE policies for calendar_events
CREATE POLICY "Users can update their organization's events" ON calendar_events
    FOR UPDATE USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- DELETE policies for calendar_events
CREATE POLICY "Users can delete their organization's events" ON calendar_events
    FOR DELETE USING (
        organization IN (
            SELECT organization FROM user_payments 
            WHERE user_id = auth.uid() 
            AND access_granted = true
        )
    );

-- Insert seed data for testing

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Premium features tables created successfully!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '1. Deploy the updated API endpoints';
    RAISE NOTICE '2. Update frontend components to use real data';
    RAISE NOTICE '3. Run seed data script if needed for testing';
END $$;