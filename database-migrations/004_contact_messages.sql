-- Migration: Create contact_messages table to persist contact form submissions
-- Date: 2025-08-22
-- Purpose:
--   1. Persist inbound contact form submissions for follow-up / CRM integration.
--   2. Provide basic structure for spam review (spam_score) and processing workflow (processed flag).
--   3. Restrict visibility: only service_role can read; anonymous can insert via API handler using service role key (server-side).
-- Safety:
--   * Idempotent creation using IF NOT EXISTS checks.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address INET,
  spam_score INT DEFAULT 0,
  honeypot_tripped BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_processed ON public.contact_messages(processed);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Only service_role can select/update/delete; inserts done by service role in API.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_messages' AND policyname='Service role full access contact_messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role full access contact_messages" ON public.contact_messages FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (true)';
  END IF;
END $$;

-- Grant minimal privileges (RLS still applies)
GRANT ALL ON public.contact_messages TO service_role;
GRANT INSERT ON public.contact_messages TO authenticated; -- (Optional) allow future direct inserts; selection still blocked by RLS unless service_role

-- Verification (manual):
-- SELECT * FROM pg_policies WHERE tablename='contact_messages';
-- INSERT test (service role context) and ensure row stored.
