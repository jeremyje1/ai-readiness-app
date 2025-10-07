-- Create premium feature tables with RLS policies

-- 1. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Implementation Phases Table
CREATE TABLE IF NOT EXISTS public.implementation_phases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization VARCHAR(255) NOT NULL,
    phase_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    budget DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization VARCHAR(255) NOT NULL,
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

-- 4. ROI Metrics Table
CREATE TABLE IF NOT EXISTS public.roi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization VARCHAR(255) NOT NULL,
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

-- 5. Calendar Events Table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization VARCHAR(255) NOT NULL,
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

-- Ensure organization columns exist on legacy tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'team_members'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.team_members ADD COLUMN organization VARCHAR(255) NOT NULL DEFAULT 'Unknown Organization';
        ALTER TABLE public.team_members ALTER COLUMN organization DROP DEFAULT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'implementation_phases'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.implementation_phases ADD COLUMN organization VARCHAR(255) NOT NULL DEFAULT 'Unknown Organization';
        ALTER TABLE public.implementation_phases ALTER COLUMN organization DROP DEFAULT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tasks'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN organization VARCHAR(255) NOT NULL DEFAULT 'Unknown Organization';
        ALTER TABLE public.tasks ALTER COLUMN organization DROP DEFAULT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'roi_metrics'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.roi_metrics ADD COLUMN organization VARCHAR(255) NOT NULL DEFAULT 'Unknown Organization';
        ALTER TABLE public.roi_metrics ALTER COLUMN organization DROP DEFAULT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'calendar_events'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN organization VARCHAR(255) NOT NULL DEFAULT 'Unknown Organization';
        ALTER TABLE public.calendar_events ALTER COLUMN organization DROP DEFAULT;
    END IF;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_org ON public.team_members(organization);
CREATE INDEX IF NOT EXISTS idx_implementation_phases_org ON public.implementation_phases(organization);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization);
CREATE INDEX IF NOT EXISTS idx_roi_metrics_org ON public.roi_metrics(organization);
CREATE INDEX IF NOT EXISTS idx_calendar_events_org ON public.calendar_events(organization);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with EXISTS for clarity
-- Team Members policies
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'team_members'
            AND policyname = 'Users can view team members in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can view team members in their organization"
ON public.team_members FOR SELECT
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = team_members.organization
                AND user_payments.payment_status = 'premium'
        )
);$$;
    END IF;
END
$policy$;

DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'team_members'
            AND policyname = 'Users can manage team members in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can manage team members in their organization"
ON public.team_members FOR ALL
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = team_members.organization
                AND user_payments.payment_status = 'premium'
                AND user_payments.role IN ('admin', 'owner')
        )
);$$;
    END IF;
END
$policy$;

-- Implementation Phases policies
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'implementation_phases'
            AND policyname = 'Users can view phases in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can view phases in their organization"
ON public.implementation_phases FOR SELECT
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = implementation_phases.organization
                AND user_payments.payment_status = 'premium'
        )
);$$;
    END IF;
END
$policy$;

DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'implementation_phases'
            AND policyname = 'Users can manage phases in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can manage phases in their organization"
ON public.implementation_phases FOR ALL
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = implementation_phases.organization
                AND user_payments.payment_status = 'premium'
                AND user_payments.role IN ('admin', 'owner', 'editor')
        )
);$$;
    END IF;
END
$policy$;

-- Tasks policies
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'tasks'
            AND policyname = 'Users can view tasks in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can view tasks in their organization"
ON public.tasks FOR SELECT
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = tasks.organization
                AND user_payments.payment_status = 'premium'
        )
);$$;
    END IF;
END
$policy$;

DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'tasks'
            AND policyname = 'Users can manage tasks in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can manage tasks in their organization"
ON public.tasks FOR ALL
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = tasks.organization
                AND user_payments.payment_status = 'premium'
                AND user_payments.role IN ('admin', 'owner', 'editor')
        )
);$$;
    END IF;
END
$policy$;

-- ROI Metrics policies
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'roi_metrics'
            AND policyname = 'Users can view ROI metrics in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can view ROI metrics in their organization"
ON public.roi_metrics FOR SELECT
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = roi_metrics.organization
                AND user_payments.payment_status = 'premium'
        )
);$$;
    END IF;
END
$policy$;

DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'roi_metrics'
            AND policyname = 'Users can manage ROI metrics in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can manage ROI metrics in their organization"
ON public.roi_metrics FOR ALL
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = roi_metrics.organization
                AND user_payments.payment_status = 'premium'
                AND user_payments.role IN ('admin', 'owner', 'editor')
        )
);$$;
    END IF;
END
$policy$;

-- Calendar Events policies
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'calendar_events'
            AND policyname = 'Users can view calendar events in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can view calendar events in their organization"
ON public.calendar_events FOR SELECT
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = calendar_events.organization
                AND user_payments.payment_status = 'premium'
        )
);$$;
    END IF;
END
$policy$;

DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'calendar_events'
            AND policyname = 'Users can manage calendar events in their organization'
    ) THEN
        EXECUTE $$CREATE POLICY "Users can manage calendar events in their organization"
ON public.calendar_events FOR ALL
USING (
        EXISTS (
                SELECT 1 FROM public.user_payments
                WHERE user_payments.user_id = auth.uid()
                AND user_payments.organization = calendar_events.organization
                AND user_payments.payment_status = 'premium'
                AND user_payments.role IN ('admin', 'owner', 'editor')
        )
);$$;
    END IF;
END
$policy$;