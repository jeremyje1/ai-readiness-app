-- Migration: Create enterprise_algorithm_results table for algorithm persistence
create table if not exists public.enterprise_algorithm_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id text not null,
  user_id uuid,
  algorithm_version text not null,
  computed_at timestamptz not null default now(),
  dsch jsonb not null,
  crf jsonb not null,
  lei jsonb not null,
  oci jsonb not null,
  hoci jsonb not null,
  raw jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enterprise_algorithm_results_assessment_idx
  on public.enterprise_algorithm_results (assessment_id);

alter table public.enterprise_algorithm_results enable row level security;

-- Create policies conditionally (CREATE POLICY does not support IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enterprise_algorithm_results'
      AND policyname = 'service-role-full-access'
  ) THEN
    EXECUTE 'CREATE POLICY "service-role-full-access" ON public.enterprise_algorithm_results FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enterprise_algorithm_results'
      AND policyname = 'select-own'
  ) THEN
    EXECUTE 'CREATE POLICY "select-own" ON public.enterprise_algorithm_results FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END
$$;

-- Optional: allow authenticated users to read their own assessments if ownership linkage added
-- create policy "select-own" on public.enterprise_algorithm_results
--   for select using ( auth.role() = 'authenticated' );

create or replace function public.set_updated_at_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists enterprise_algorithm_results_set_updated_at on public.enterprise_algorithm_results;
create trigger enterprise_algorithm_results_set_updated_at
  before update on public.enterprise_algorithm_results
  for each row execute function public.set_updated_at_timestamp();
