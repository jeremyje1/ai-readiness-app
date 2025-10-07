-- STEP 2: Create premium feature tables
-- Run this AFTER step1-add-columns.sql

-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Ensure required columns exist on team_members
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'team_members'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.team_members ADD COLUMN organization VARCHAR(255);
    END IF;
END $$;

-- Implementation Phases Table
CREATE TABLE IF NOT EXISTS public.implementation_phases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phase_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    budget DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'implementation_phases'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.implementation_phases ADD COLUMN organization VARCHAR(255);
    END IF;
END $$;

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phase_id UUID REFERENCES public.implementation_phases(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tasks'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN organization VARCHAR(255);
    END IF;
END $$;

-- ROI Metrics Table
CREATE TABLE IF NOT EXISTS public.roi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(255) NOT NULL,
    baseline_value DECIMAL(12, 2),
    target_value DECIMAL(12, 2),
    current_value DECIMAL(12, 2),
    unit VARCHAR(50),
    category VARCHAR(100),
    measurement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'roi_metrics'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.roi_metrics ADD COLUMN organization VARCHAR(255);
    END IF;
END $$;

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) DEFAULT 'meeting',
    location VARCHAR(255),
    attendees JSONB DEFAULT '[]'::jsonb,
    phase_id UUID REFERENCES public.implementation_phases(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'calendar_events'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN organization VARCHAR(255);
    END IF;
END $$;


-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_members_org ON public.team_members(organization);
CREATE INDEX IF NOT EXISTS idx_implementation_phases_org ON public.implementation_phases(organization);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization);
CREATE INDEX IF NOT EXISTS idx_roi_metrics_org ON public.roi_metrics(organization);
CREATE INDEX IF NOT EXISTS idx_calendar_events_org ON public.calendar_events(organization);

-- Verify tables were created
SELECT 
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_name IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events')
ORDER BY t.table_name;