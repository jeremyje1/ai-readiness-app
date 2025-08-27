-- TEMPORARY FIX: Disable RLS on institutions table
-- WARNING: This makes institutions table accessible to all authenticated users
-- Use only for immediate testing, then apply proper RLS policies

ALTER TABLE public.institutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_memberships DISABLE ROW LEVEL SECURITY;

SELECT 'RLS temporarily disabled for institutions - APPLY PROPER POLICIES ASAP!' as warning;
