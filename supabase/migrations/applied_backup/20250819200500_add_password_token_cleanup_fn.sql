-- Function to delete expired or used password setup tokens
create or replace function delete_expired_password_tokens()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth_password_setup_tokens
  where (expires_at < now()) or used_at is not null;
end;
$$;
