-- Fix RLS Policies for Institution Creation
-- This script updates the RLS policies to allow proper institution creation during registration

-- Drop ALL existing institution policies first
DROP POLICY IF EXISTS "Users can read their institutions" ON public.institutions;
DROP POLICY IF EXISTS "Super admins can modify institutions" ON public.institutions;
DROP POLICY IF EXISTS "Users can create institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins can update institutions" ON public.institutions;
DROP POLICY IF EXISTS "Super admins can delete institutions" ON public.institutions;

-- Create more permissive policies for institutions
-- Allow authenticated users to read institutions they're members of
CREATE POLICY "Users can read their institutions" ON public.institutions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    (
      -- Users can read institutions they're members of
      EXISTS (
        SELECT 1 FROM public.institution_memberships im
        WHERE im.user_id = auth.uid()
        AND im.institution_id = institutions.id
      )
      OR
      -- Allow reading during registration flow (temporary)
      auth.uid() IS NOT NULL
    )
  );

-- Allow authenticated users to create institutions (for registration)
CREATE POLICY "Users can create institutions" ON public.institutions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Only allow updates by admins of the institution
CREATE POLICY "Admins can update institutions" ON public.institutions
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.institution_memberships im
      WHERE im.user_id = auth.uid()
      AND im.institution_id = institutions.id
      AND im.role IN ('admin', 'super_admin')
    )
  );

-- Only allow deletes by super admins
CREATE POLICY "Super admins can delete institutions" ON public.institutions
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Update institution_memberships policies to allow creation during registration
DROP POLICY IF EXISTS "Admins can modify memberships" ON public.institution_memberships;
DROP POLICY IF EXISTS "Users can create their own membership" ON public.institution_memberships;
DROP POLICY IF EXISTS "Admins can delete memberships" ON public.institution_memberships;
DROP POLICY IF EXISTS "Users can create memberships" ON public.institution_memberships;
DROP POLICY IF EXISTS "Users can modify memberships" ON public.institution_memberships;

-- Allow users to create their own initial membership
CREATE POLICY "Users can create their own membership" ON public.institution_memberships
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- Allow admins to modify memberships in their institution
CREATE POLICY "Admins can modify memberships" ON public.institution_memberships
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    (
      -- Users can update their own membership
      user_id = auth.uid()
      OR
      -- Admins can update memberships in their institution
      EXISTS (
        SELECT 1 FROM public.institution_memberships im
        WHERE im.user_id = auth.uid()
        AND im.institution_id = institution_memberships.institution_id
        AND im.role IN ('admin', 'super_admin')
      )
    )
  );

-- Allow admins to delete memberships
CREATE POLICY "Admins can delete memberships" ON public.institution_memberships
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.institution_memberships im
      WHERE im.user_id = auth.uid()
      AND im.institution_id = institution_memberships.institution_id
      AND im.role IN ('admin', 'super_admin')
    )
  );

-- Verification query
SELECT 'RLS policies updated successfully!' as status;
