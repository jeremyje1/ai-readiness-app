-- Migration: Enhance RLS for user_payments to allow email fallback + linking
-- Date: 2025-08-20
-- Purpose:
--  1. Allow a logged-in user to SELECT a payment row that was created for their email
--     but not yet linked to their user_id (race between Stripe webhook + auth account provisioning).
--  2. Allow that user to UPDATE (claim) the row by setting user_id exactly to their auth.uid().
--  3. Consolidate the original SELECT policy into a broader condition.
--
-- Safety:
--  - Only rows with user_id IS NULL and matching email become visible.
--  - UPDATE policy restricts claiming to those rows and enforces user_id = auth.uid() post-update.
--
-- NOTE: Supabase JWT email claim reference uses auth.jwt() ->> 'email'. We apply lower() for case-insensitive match.

DO $$ BEGIN
  -- Drop legacy narrow select policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
     WHERE schemaname = 'public' 
       AND tablename = 'user_payments' 
       AND policyname = 'Users can view their own payment records'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view their own payment records" ON public.user_payments';
  END IF;
END $$;

-- Broader SELECT policy (user owns row OR row unclaimed but email matches)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname='public'
       AND tablename='user_payments'
       AND policyname='Users can view user_payments (owned or unlinked email)'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view user_payments (owned or unlinked email)" ON public.user_payments FOR SELECT USING ( auth.uid() = user_id OR ( user_id IS NULL AND lower(email) = lower(auth.jwt() ->> ''email'') ) )';
  END IF;
END $$;

-- Allow user to claim (link) an unclaimed payment row by setting user_id to their uid
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname='public'
       AND tablename='user_payments'
       AND policyname='Users can claim unlinked payment'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can claim unlinked payment" ON public.user_payments FOR UPDATE USING ( user_id IS NULL AND lower(email) = lower(auth.jwt() ->> ''email'') ) WITH CHECK ( auth.uid() = user_id )';
  END IF;
END $$;

-- (Optional) You may later remove the legacy policy name references in documentation.

-- Verification Query (manual):
-- SELECT policyname, command, permissive FROM pg_policies WHERE tablename='user_payments';
