-- Fix the delete_expired_password_tokens function to properly work with the API
-- The function should return an integer count of deleted rows

-- Drop the existing function if it exists
drop function if exists public.delete_expired_password_tokens();

-- Create the function that returns the count of deleted rows
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

-- Add a comment for documentation
comment on function public.delete_expired_password_tokens() is 'Deletes used or expired password setup tokens and returns the number of rows deleted';

-- Grant execute permission to authenticated users (for API access via service role)
grant execute on function public.delete_expired_password_tokens() to authenticated;
grant execute on function public.delete_expired_password_tokens() to service_role;