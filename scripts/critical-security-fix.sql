-- CRITICAL DATABASE SECURITY FIXES
-- Copy and paste this into your Supabase SQL Editor

-- ==============================================
-- 1. ENABLE ROW LEVEL SECURITY ON PUBLIC TABLES
-- ==============================================

-- Enable RLS on tables that are missing it
ALTER TABLE IF EXISTS public.enterprise_algorithm_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessment_metrics ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. CREATE BASIC RLS POLICIES
-- ==============================================

-- Basic policy for enterprise_algorithm_changelog
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'enterprise_algorithm_changelog' 
        AND policyname = 'Enable read for authenticated users'
    ) THEN
        CREATE POLICY "Enable read for authenticated users" ON public.enterprise_algorithm_changelog
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Basic policy for institutions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'institutions' 
        AND policyname = 'Enable read for authenticated users'
    ) THEN
        CREATE POLICY "Enable read for authenticated users" ON public.institutions
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Basic policy for institution_memberships
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'institution_memberships' 
        AND policyname = 'Enable read for authenticated users'
    ) THEN
        CREATE POLICY "Enable read for authenticated users" ON public.institution_memberships
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Basic policy for assessment_metrics
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'assessment_metrics' 
        AND policyname = 'Enable read for authenticated users'
    ) THEN
        CREATE POLICY "Enable read for authenticated users" ON public.assessment_metrics
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- ==============================================
-- 3. FIX SECURITY DEFINER VIEWS
-- ==============================================

-- Drop existing SECURITY DEFINER views (they will be handled separately)
-- We'll just drop them for now since the base tables don't exist
DROP VIEW IF EXISTS public.intake_forms_with_status CASCADE;
DROP VIEW IF EXISTS public.user_approval_workload CASCADE;
DROP VIEW IF EXISTS public.recent_approval_activity CASCADE;
DROP VIEW IF EXISTS public.compliance_dashboard CASCADE;
DROP VIEW IF EXISTS public.approved_tools_with_vendor CASCADE;
DROP VIEW IF EXISTS public.approval_summary CASCADE;
DROP VIEW IF EXISTS public.vendor_dashboard CASCADE;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('enterprise_algorithm_changelog', 'institutions', 'institution_memberships', 'assessment_metrics')
ORDER BY tablename;

-- Success message
SELECT 'Critical security fixes applied successfully!' as status;
