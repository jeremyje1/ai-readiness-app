-- Direct fix for database issues
-- Run this in Supabase SQL Editor

-- STEP 1: First ensure user_payments table exists and has all columns
-- Check if user_payments table exists, create if not
CREATE TABLE IF NOT EXISTS public.user_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'free',
    payment_amount DECIMAL(10, 2),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'organization' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN organization VARCHAR(255);
        RAISE NOTICE 'Added organization column to user_payments';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'is_test' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN is_test BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_test column to user_payments';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'role' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN role VARCHAR(50) DEFAULT 'viewer';
        RAISE NOTICE 'Added role column to user_payments';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'department' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN department VARCHAR(100);
        RAISE NOTICE 'Added department column to user_payments';
    END IF;
END $$;

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS user_payments_user_id_unique ON public.user_payments(user_id);

-- Verify columns were added
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'user_payments' 
    AND table_schema = 'public'
    AND column_name IN ('organization', 'is_test', 'role', 'department');
    
    IF col_count = 4 THEN
        RAISE NOTICE 'SUCCESS: All 4 columns exist in user_payments table';
    ELSE
        RAISE NOTICE 'WARNING: Only % of 4 expected columns exist', col_count;
    END IF;
END $$;

-- 2. Create premium feature tables (skip if they exist)
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

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_team_members_org ON public.team_members(organization);
CREATE INDEX IF NOT EXISTS idx_implementation_phases_org ON public.implementation_phases(organization);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization);
CREATE INDEX IF NOT EXISTS idx_roi_metrics_org ON public.roi_metrics(organization);
CREATE INDEX IF NOT EXISTS idx_calendar_events_org ON public.calendar_events(organization);

-- 4. Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist and recreate
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view team members in their organization" ON public.team_members;
    DROP POLICY IF EXISTS "Users can manage team members in their organization" ON public.team_members;
    DROP POLICY IF EXISTS "Users can view phases in their organization" ON public.implementation_phases;
    DROP POLICY IF EXISTS "Users can manage phases in their organization" ON public.implementation_phases;
    DROP POLICY IF EXISTS "Users can view tasks in their organization" ON public.tasks;
    DROP POLICY IF EXISTS "Users can manage tasks in their organization" ON public.tasks;
    DROP POLICY IF EXISTS "Users can view ROI metrics in their organization" ON public.roi_metrics;
    DROP POLICY IF EXISTS "Users can manage ROI metrics in their organization" ON public.roi_metrics;
    DROP POLICY IF EXISTS "Users can view calendar events in their organization" ON public.calendar_events;
    DROP POLICY IF EXISTS "Users can manage calendar events in their organization" ON public.calendar_events;
END $$;

-- 6. Create new RLS policies
-- Team Members
CREATE POLICY "Users can view team members in their organization"
ON public.team_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = team_members.organization
        AND user_payments.payment_status = 'premium'
    )
);

CREATE POLICY "Users can manage team members in their organization"
ON public.team_members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = team_members.organization
        AND user_payments.payment_status = 'premium'
        AND user_payments.role IN ('admin', 'owner')
    )
);

-- Implementation Phases
CREATE POLICY "Users can view phases in their organization"
ON public.implementation_phases FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = implementation_phases.organization
        AND user_payments.payment_status = 'premium'
    )
);

CREATE POLICY "Users can manage phases in their organization"
ON public.implementation_phases FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = implementation_phases.organization
        AND user_payments.payment_status = 'premium'
        AND user_payments.role IN ('admin', 'owner', 'editor')
    )
);

-- Tasks
CREATE POLICY "Users can view tasks in their organization"
ON public.tasks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = tasks.organization
        AND user_payments.payment_status = 'premium'
    )
);

CREATE POLICY "Users can manage tasks in their organization"
ON public.tasks FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = tasks.organization
        AND user_payments.payment_status = 'premium'
        AND user_payments.role IN ('admin', 'owner', 'editor')
    )
);

-- ROI Metrics
CREATE POLICY "Users can view ROI metrics in their organization"
ON public.roi_metrics FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = roi_metrics.organization
        AND user_payments.payment_status = 'premium'
    )
);

CREATE POLICY "Users can manage ROI metrics in their organization"
ON public.roi_metrics FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = roi_metrics.organization
        AND user_payments.payment_status = 'premium'
        AND user_payments.role IN ('admin', 'owner', 'editor')
    )
);

-- Calendar Events
CREATE POLICY "Users can view calendar events in their organization"
ON public.calendar_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = calendar_events.organization
        AND user_payments.payment_status = 'premium'
    )
);

CREATE POLICY "Users can manage calendar events in their organization"
ON public.calendar_events FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_payments
        WHERE user_payments.user_id = auth.uid()
        AND user_payments.organization = calendar_events.organization
        AND user_payments.payment_status = 'premium'
        AND user_payments.role IN ('admin', 'owner', 'editor')
    )
);

-- 7. Verify everything is set up correctly
SELECT 
    'user_payments columns' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND table_schema = 'public'
AND column_name IN ('organization', 'is_test', 'role', 'department')
ORDER BY column_name;

-- 8. Check if premium tables exist
SELECT 
    'premium tables' as check_type,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events')
ORDER BY table_name;

-- 9. Check RLS policies
SELECT 
    'RLS policies' as check_type,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events')
ORDER BY tablename, policyname;