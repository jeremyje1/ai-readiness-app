-- Ensure Supabase auth helper functions exist for local and fresh installs.
-- Hosted Supabase projects already ship with these helpers; this migration
-- safely skips creation when privileges are missing or the functions exist.

DO $migration$
BEGIN
  -- auth.jwt(): expose JWT claims as jsonb
  BEGIN
    PERFORM 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'jwt'
      AND n.nspname = 'auth'
      AND pg_get_function_identity_arguments(p.oid) = ''
      AND pg_get_function_result(p.oid) = 'jsonb';

    IF FOUND THEN
      RAISE NOTICE 'auth.jwt() already exists; skipping creation.';
    ELSE
      EXECUTE $fn$CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $_jwt$
DECLARE
  claims_text text;
BEGIN
  claims_text := current_setting('request.jwt.claims', true);
  IF claims_text IS NULL OR claims_text = '' THEN
    RETURN '{}'::jsonb;
  END IF;
  BEGIN
    RETURN claims_text::jsonb;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN '{}'::jsonb;
  END;
END;
$_jwt$;
$fn$;
      RAISE NOTICE 'auth.jwt() created.';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping auth.jwt() creation due to insufficient privileges: %', SQLERRM;
  END;

  -- auth.role(): fetch role claim as text
  BEGIN
    PERFORM 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'role'
      AND n.nspname = 'auth'
      AND pg_get_function_identity_arguments(p.oid) = ''
      AND pg_get_function_result(p.oid) = 'text';

    IF FOUND THEN
      RAISE NOTICE 'auth.role() already exists; skipping creation.';
    ELSE
      EXECUTE $fn$CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
STABLE
AS $_role$
  SELECT auth.jwt()->>'role';
$_role$;
$fn$;
      RAISE NOTICE 'auth.role() created.';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping auth.role() creation due to insufficient privileges: %', SQLERRM;
  END;

  -- auth.email(): convenience accessor for email claim
  BEGIN
    PERFORM 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'email'
      AND n.nspname = 'auth'
      AND pg_get_function_identity_arguments(p.oid) = ''
      AND pg_get_function_result(p.oid) = 'text';

    IF FOUND THEN
      RAISE NOTICE 'auth.email() already exists; skipping creation.';
    ELSE
      EXECUTE $fn$CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql
STABLE
AS $_email$
  SELECT auth.jwt()->>'email';
$_email$;
$fn$;
      RAISE NOTICE 'auth.email() created.';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping auth.email() creation due to insufficient privileges: %', SQLERRM;
  END;

  -- auth.uid(): safe UUID casting of the sub claim
  BEGIN
    PERFORM 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'uid'
      AND n.nspname = 'auth'
      AND pg_get_function_identity_arguments(p.oid) = ''
      AND pg_get_function_result(p.oid) = 'uuid';

    IF FOUND THEN
      RAISE NOTICE 'auth.uid() already exists; skipping creation.';
    ELSE
      EXECUTE $fn$CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $_uid$
DECLARE
  sub_claim text;
BEGIN
  sub_claim := auth.jwt()->>'sub';
  IF sub_claim IS NULL THEN
    RETURN NULL;
  END IF;
  BEGIN
    RETURN sub_claim::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN NULL;
  END;
END;
$_uid$;
$fn$;
      RAISE NOTICE 'auth.uid() created.';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping auth.uid() creation due to insufficient privileges: %', SQLERRM;
  END;
END;
$migration$;
