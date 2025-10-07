-- Premium Features Database Schema
-- Team Management, Task Tracking, ROI Metrics, and Calendar Integration

-- 1. Team Management System
-- ========================

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization TEXT NOT NULL, -- Organization name from user_payments
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
    action_type TEXT NOT NULL, -- 'blueprint_updated', 'policy_downloaded', 'task_completed', etc.
    action_details JSONB,
    entity_type TEXT, -- 'blueprint', 'policy', 'task', 'document'
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
    dependencies UUID[], -- Array of task IDs this depends on
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

-- 3. ROI Calculation Engine
-- ========================

-- ROI metrics tracking
CREATE TABLE IF NOT EXISTS roi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'cost_savings', 'revenue_increase', 'productivity_hours', etc.
    metric_value DECIMAL(12,2) NOT NULL,
    metric_date DATE NOT NULL,
    category TEXT, -- 'automation', 'efficiency', 'sales', 'customer_service', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROI calculation history
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

-- 4. Calendar Integration
-- ======================

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL, -- 'meeting', 'training', 'workshop', 'presentation', 'office_hours'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT, -- 'Conference Room A', 'Zoom', 'Teams', etc.
    meeting_url TEXT,
    
    -- Participants
    host_id UUID REFERENCES team_members(id),
    attendee_ids UUID[],
    max_attendees INTEGER,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- RRULE format
    
    -- Status
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
CREATE INDEX idx_team_members_org ON team_members(organization);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_activity_member ON team_activity(team_member_id);
CREATE INDEX idx_team_activity_created ON team_activity(created_at DESC);
CREATE INDEX idx_phases_org ON implementation_phases(organization);
CREATE INDEX idx_tasks_phase ON implementation_tasks(phase_id);
CREATE INDEX idx_tasks_assigned ON implementation_tasks(assigned_to);
CREATE INDEX idx_tasks_status ON implementation_tasks(status);
CREATE INDEX idx_tasks_org ON implementation_tasks(organization);
CREATE INDEX idx_roi_metrics_org ON roi_metrics(organization, metric_date DESC);
CREATE INDEX idx_calendar_events_org ON calendar_events(organization);
CREATE INDEX idx_calendar_events_time ON calendar_events(start_time, end_time);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);

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

-- RLS Policies
-- Team members policies
CREATE POLICY "Users can view their team members" ON team_members
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM team_members WHERE organization = team_members.organization)
    );

CREATE POLICY "Admins can manage team members" ON team_members
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM team_members WHERE organization = team_members.organization AND role IN ('owner', 'admin'))
    );

-- Team activity policies
CREATE POLICY "Users can view team activity" ON team_activity
    FOR SELECT USING (
        team_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND organization IN (
            SELECT organization FROM team_members WHERE id = team_activity.team_member_id
        ))
    );

-- Implementation phases policies
CREATE POLICY "Users can view their phases" ON implementation_phases
    FOR SELECT USING (
        organization IN (SELECT organization FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage phases" ON implementation_phases
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM team_members WHERE organization = implementation_phases.organization AND role IN ('owner', 'admin'))
    );

-- Tasks policies
CREATE POLICY "Users can view their tasks" ON implementation_tasks
    FOR SELECT USING (
        organization IN (SELECT organization FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update assigned tasks" ON implementation_tasks
    FOR UPDATE USING (
        assigned_to IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        OR
        auth.uid() IN (SELECT user_id FROM team_members WHERE organization = implementation_tasks.organization AND role IN ('owner', 'admin'))
    );

-- ROI metrics policies
CREATE POLICY "Users can view their ROI metrics" ON roi_metrics
    FOR SELECT USING (
        organization IN (SELECT organization FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage ROI metrics" ON roi_metrics
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM team_members WHERE organization = roi_metrics.organization AND role IN ('owner', 'admin'))
    );

-- Calendar events policies
CREATE POLICY "Users can view their events" ON calendar_events
    FOR SELECT USING (
        organization IN (SELECT organization FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create events" ON calendar_events
    FOR INSERT WITH CHECK (
        host_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
    );

-- RSVP policies
CREATE POLICY "Users can view RSVPs" ON event_rsvps
    FOR SELECT USING (
        team_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        OR
        event_id IN (SELECT id FROM calendar_events WHERE organization IN (
            SELECT organization FROM team_members WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can manage their RSVPs" ON event_rsvps
    FOR ALL USING (
        team_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
    );

-- Functions for calculations
CREATE OR REPLACE FUNCTION calculate_phase_progress(phase_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_tasks, completed_tasks
    FROM implementation_tasks
    WHERE phase_id = phase_uuid;
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_monthly_roi(org_name TEXT, month_date DATE)
RETURNS TABLE(
    total_savings DECIMAL,
    roi_percentage DECIMAL,
    payback_period_months INTEGER
) AS $$
DECLARE
    monthly_cost DECIMAL := 199; -- $199/month subscription
    total_value DECIMAL;
BEGIN
    -- Calculate total savings for the month
    SELECT COALESCE(SUM(metric_value), 0) INTO total_value
    FROM roi_metrics
    WHERE organization = org_name
    AND metric_type IN ('cost_savings', 'revenue_increase')
    AND metric_date >= date_trunc('month', month_date)
    AND metric_date < date_trunc('month', month_date) + interval '1 month';
    
    RETURN QUERY
    SELECT 
        total_value as total_savings,
        CASE 
            WHEN total_value > 0 THEN
                ((total_value - monthly_cost) / monthly_cost) * 100
            ELSE 0
        END as roi_percentage,
        CASE
            WHEN total_value > monthly_cost THEN 1
            WHEN total_value > 0 THEN CEIL(monthly_cost / total_value)::INTEGER
            ELSE NULL
        END as payback_period_months;
END;
$$ LANGUAGE plpgsql;