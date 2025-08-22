-- Migration: Ensure primary tester email is not flagged as test so normal access flows work
-- Date: 2025-08-22
-- Safe to run repeatedly (idempotent update)

UPDATE public.user_payments
   SET is_test = false
 WHERE lower(email) = 'jeremy.estrella@gmail.com'
   AND is_test = true;

-- Verification (manual):
-- SELECT id, email, is_test, access_granted, created_at FROM public.user_payments WHERE lower(email)='jeremy.estrella@gmail.com' ORDER BY created_at DESC LIMIT 5;
