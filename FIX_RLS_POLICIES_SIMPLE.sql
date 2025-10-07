-- FIX RLS POLICIES - SIMPLE VERSION
-- This drops all existing policies and recreates them with proper references

-- First, drop all existing policies on premium tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop policies on team_members
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'team_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_members', r.policyname);
    END LOOP;
    
    -- Drop policies on implementation_phases
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'implementation_phases'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.implementation_phases', r.policyname);
    END LOOP;
    
    -- Drop policies on implementation_tasks
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'implementation_tasks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.implementation_tasks', r.policyname);
    END LOOP;
    
    -- Drop policies on roi_metrics
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'roi_metrics'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.roi_metrics', r.policyname);
    END LOOP;
    
    -- Drop policies on calendar_events
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'calendar_events'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.calendar_events', r.policyname);
    END LOOP;
END $$;

-- Now create new policies with a simpler approach
-- We'll use EXISTS instead of IN for better clarity

-- team_members policies
CREATE POLICY "team_members_select" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = team_members.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "team_members_insert" ON public.team_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = team_members.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "team_members_update" ON public.team_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = team_members.organization
            AND user_payments.access_granted = true
        )
    );

-- implementation_phases policies
CREATE POLICY "implementation_phases_select" ON public.implementation_phases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = implementation_phases.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "implementation_phases_insert" ON public.implementation_phases
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = implementation_phases.organization
            AND user_payments.access_granted = true
        )
    );

-- implementation_tasks policies
CREATE POLICY "implementation_tasks_select" ON public.implementation_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = implementation_tasks.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "implementation_tasks_insert" ON public.implementation_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = implementation_tasks.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "implementation_tasks_update" ON public.implementation_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = implementation_tasks.organization
            AND user_payments.access_granted = true
        )
    );

-- roi_metrics policies
CREATE POLICY "roi_metrics_select" ON public.roi_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = roi_metrics.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "roi_metrics_insert" ON public.roi_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = roi_metrics.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "roi_metrics_update" ON public.roi_metrics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = roi_metrics.organization
            AND user_payments.access_granted = true
        )
    );

-- calendar_events policies
CREATE POLICY "calendar_events_select" ON public.calendar_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = calendar_events.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "calendar_events_insert" ON public.calendar_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = calendar_events.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "calendar_events_update" ON public.calendar_events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = calendar_events.organization
            AND user_payments.access_granted = true
        )
    );

CREATE POLICY "calendar_events_delete" ON public.calendar_events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_payments 
            WHERE user_payments.user_id = auth.uid() 
            AND user_payments.organization = calendar_events.organization
            AND user_payments.access_granted = true
        )
    );

-- Verify the policies were created
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('team_members', 'implementation_phases', 'implementation_tasks', 'roi_metrics', 'calendar_events')
ORDER BY tablename, policyname;