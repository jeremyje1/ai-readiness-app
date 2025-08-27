-- Quick Fix for Institution Creation RLS Issue
-- Paste this into your Supabase SQL Editor and run it

-- Drop overly restrictive policies
DROP POLICY IF EXISTS "Users can read their institutions" ON public.institutions;
DROP POLICY IF EXISTS "Super admins can modify institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins can modify memberships" ON public.institution_memberships;

-- Allow authenticated users to create institutions
CREATE POLICY "Users can create institutions" ON public.institutions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow reading institutions (more permissive for now)
CREATE POLICY "Users can read institutions" ON public.institutions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow updating institutions by admins
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

-- Allow users to create their own memberships
CREATE POLICY "Users can create memberships" ON public.institution_memberships
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- Allow membership updates
CREATE POLICY "Users can modify memberships" ON public.institution_memberships
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    (
      user_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.institution_memberships im
        WHERE im.user_id = auth.uid()
        AND im.institution_id = institution_memberships.institution_id
        AND im.role IN ('admin', 'super_admin')
      )
    )
  );

SELECT 'Institution creation fix applied successfully!' as status;
