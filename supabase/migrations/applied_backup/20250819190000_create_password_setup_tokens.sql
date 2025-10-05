-- Password setup tokens table
create table if not exists auth_password_setup_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_password_setup_token on auth_password_setup_tokens(token);

-- Simple RLS (only service role uses it programmatically)
alter table auth_password_setup_tokens enable row level security;
create policy "service role only" on auth_password_setup_tokens for all to service_role using (true);

-- Allow authenticated users to select ONLY their own valid (unexpired, unused) token (for potential self-service verification UI)
create policy "user can view own valid token" on auth_password_setup_tokens for select to authenticated using (
  auth.uid() = user_id AND used_at IS NULL AND expires_at > now()
);
