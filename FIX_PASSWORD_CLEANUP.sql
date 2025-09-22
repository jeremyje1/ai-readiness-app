-- ============================================
-- FIX FOR PASSWORD TOKEN CLEANUP FUNCTION
-- ============================================
-- This migration creates the missing delete_expired_password_tokens function
-- that is required by the password token cleanup cron job.
--
-- TO APPLY THIS FIX:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this entire SQL script
-- 5. Click "Run" to execute
-- ============================================

-- Step 1: Drop any existing function to avoid conflicts
drop function if exists public.delete_expired_password_tokens();

-- Step 2: Create the function that returns the count of deleted rows
create or replace function public.delete_expired_password_tokens()
returns integer
language sql
security definer
set search_path = public
as $$
  with deleted as (
    delete from auth_password_setup_tokens
    where used_at is not null
       or expires_at < now()
    returning 1
  )
  select coalesce(count(*)::integer, 0) from deleted;
$$;

-- Step 3: Add documentation for the function
comment on function public.delete_expired_password_tokens() is 
  'Deletes used or expired password setup tokens and returns the number of rows deleted. Called by the password cleanup cron job.';

-- Step 4: Grant necessary permissions
grant execute on function public.delete_expired_password_tokens() to authenticated;
grant execute on function public.delete_expired_password_tokens() to service_role;
grant execute on function public.delete_expired_password_tokens() to anon;

-- Step 5: Verify the function was created (this will show the function definition)
select 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
from pg_proc 
where proname = 'delete_expired_password_tokens' 
  and pronamespace = (select oid from pg_namespace where nspname = 'public');

-- ============================================
-- VERIFICATION
-- After running this script, you should see:
-- 1. "Success. No rows returned" for the DROP and CREATE statements
-- 2. A result showing the function definition
-- 
-- The GitHub Action should then work properly on the next run.
-- ============================================