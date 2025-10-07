-- STEP 3: Enable RLS and create policies
-- Run this AFTER step2-create-tables.sql

-- Enable RLS on all premium feature tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Team Members policies
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

-- Implementation Phases policies
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

-- Tasks policies
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

-- ROI Metrics policies
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

-- Calendar Events policies
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

-- Verify RLS policies were created
SELECT 
    tablename,
    policyname,
    permissive,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events')
ORDER BY tablename, policyname;