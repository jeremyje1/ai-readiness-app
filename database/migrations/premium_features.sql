-- Premium Features Database Schema
-- Team Management, Task Tracking, ROI Metrics, and Calendar Integration

-- 1. Team Management System
-- ========================

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'owner', 'admin', 'member', 'viewer'
    department TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'pending'
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
    blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'Foundation', 'Pilot Programs', 'Scaling', 'Optimization'
    description TEXT,
    order_index INTEGER NOT NULL,
    target_completion_date DATE,
    status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Implementation tasks
CREATE TABLE IF NOT EXISTS implementation_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phase_id UUID REFERENCES implementation_phases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES team_members(id),
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'blocked'
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
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
    institution_id UUID,
    metric_date DATE NOT NULL,
    
    -- Time savings
    hours_saved_automation DECIMAL(10,2) DEFAULT 0,
    hours_saved_efficiency DECIMAL(10,2) DEFAULT 0,
    hours_saved_total DECIMAL(10,2) GENERATED ALWAYS AS (hours_saved_automation + hours_saved_efficiency) STORED,
    
    -- Cost reductions
    cost_reduction_staff DECIMAL(12,2) DEFAULT 0,
    cost_reduction_tools DECIMAL(12,2) DEFAULT 0,
    cost_reduction_errors DECIMAL(12,2) DEFAULT 0,
    cost_reduction_total DECIMAL(12,2) GENERATED ALWAYS AS (cost_reduction_staff + cost_reduction_tools + cost_reduction_errors) STORED,
    
    -- Efficiency metrics
    tasks_automated INTEGER DEFAULT 0,
    processes_optimized INTEGER DEFAULT 0,
    error_rate_reduction DECIMAL(5,2) DEFAULT 0, -- Percentage
    
    -- User satisfaction
    satisfaction_score DECIMAL(3,2) DEFAULT 0, -- 0-5 scale
    nps_score INTEGER DEFAULT 0, -- -100 to 100
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(institution_id, metric_date)
);

-- ROI calculation history
CREATE TABLE IF NOT EXISTS roi_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID,
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
    institution_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL, -- 'one_on_one', 'group', 'training', 'review', 'office_hours'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time)) / 60) STORED,
    location TEXT, -- 'zoom', 'teams', 'in_person', custom URL
    meeting_url TEXT,
    
    -- Participants
    host_id UUID REFERENCES team_members(id),
    attendee_ids UUID[],
    max_attendees INTEGER,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- RRULE format
    recurrence_end_date DATE,
    
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
CREATE INDEX idx_team_activity_member ON team_activity(team_member_id);
CREATE INDEX idx_team_activity_created ON team_activity(created_at DESC);
CREATE INDEX idx_tasks_phase ON implementation_tasks(phase_id);
CREATE INDEX idx_tasks_assigned ON implementation_tasks(assigned_to);
CREATE INDEX idx_tasks_status ON implementation_tasks(status);
CREATE INDEX idx_roi_metrics_date ON roi_metrics(institution_id, metric_date DESC);
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

-- RLS Policies (example for team_members)
CREATE POLICY "Users can view their team members" ON team_members
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM team_members WHERE institution_id = team_members.institution_id)
    );

CREATE POLICY "Admins can manage team members" ON team_members
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM team_members WHERE institution_id = team_members.institution_id AND role IN ('owner', 'admin'))
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

CREATE OR REPLACE FUNCTION calculate_monthly_roi(inst_id UUID, month_date DATE)
RETURNS TABLE(
    total_hours_saved DECIMAL,
    total_cost_reduction DECIMAL,
    roi_percentage DECIMAL
) AS $$
DECLARE
    avg_hourly_rate DECIMAL := 75; -- Average hourly rate for calculation
BEGIN
    RETURN QUERY
    SELECT 
        SUM(hours_saved_total) as total_hours_saved,
        SUM(cost_reduction_total) as total_cost_reduction,
        CASE 
            WHEN SUM(cost_reduction_total) > 0 THEN
                ((SUM(cost_reduction_total) - 199) / 199) * 100 -- ROI based on $199/month cost
            ELSE 0
        END as roi_percentage
    FROM roi_metrics
    WHERE institution_id = inst_id
    AND metric_date >= date_trunc('month', month_date)
    AND metric_date < date_trunc('month', month_date) + interval '1 month';
END;
$$ LANGUAGE plpgsql;