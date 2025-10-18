-- Add phone column to demo_leads table
-- Migration: 20251018_add_phone_to_demo_leads

ALTER TABLE demo_leads
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN demo_leads.phone IS 'Optional phone number for scheduling follow-up calls';

-- Create index for phone lookups (optional, useful for searching)
CREATE INDEX IF NOT EXISTS idx_demo_leads_phone ON demo_leads(phone) WHERE phone IS NOT NULL;
