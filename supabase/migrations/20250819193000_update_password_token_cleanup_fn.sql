-- Update cleanup function to return number of rows deleted
create or replace function delete_expired_password_tokens()
returns integer
language sql
security definer
set search_path = public, pg_catalog
as $$
  with del as (
    delete from auth_password_setup_tokens
    where used_at is not null
       or expires_at < now()
    returning 1
  )
  select count(*)::int from del;
$$;

comment on function delete_expired_password_tokens() is 'Deletes used or expired password setup tokens and returns number of rows deleted.';
