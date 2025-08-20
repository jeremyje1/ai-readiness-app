-- Migration: Add is_test flag to user_payments for segregating test data
-- Date: 2025-08-20
-- Purpose:
--   Provide a non-destructive way to mark internal / QA payment rows so analytics and
--   reporting can exclude them without deleting historical behavior.
-- Changes:
--   1. Add boolean column is_test (default false) if it does not already exist.
--   2. Backfill known internal tester email(s) to set is_test = true.
--   3. Add index to support filtering on is_test.
-- Safety:
--   - Column addition is additive.
--   - Backfill restricted to explicit email list below.
--   - You can append more emails safely later.

DO $$ BEGIN
  -- Add column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema='public' AND table_name='user_payments' AND column_name='is_test'
  ) THEN
    ALTER TABLE public.user_payments ADD COLUMN is_test boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create index (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_payments_is_test ON public.user_payments(is_test);

-- Backfill: mark known tester accounts (edit list as needed)
UPDATE public.user_payments
   SET is_test = true
 WHERE lower(email) IN (
  'jeremy.estrella@gmail.com'
 );

-- Verification:
-- SELECT count(*) FILTER (WHERE is_test) AS test_rows, count(*) AS total FROM public.user_payments;
-- SELECT * FROM public.user_payments WHERE is_test ORDER BY created_at DESC LIMIT 20;
