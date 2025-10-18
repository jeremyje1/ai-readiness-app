-- ============================================
-- QUICK FIX: Add phone column to demo_leads
-- ============================================
-- Copy and paste this into Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- ============================================

-- Add phone column
ALTER TABLE demo_leads
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Verify it was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'demo_leads'
  AND column_name = 'phone';

-- Test query to ensure no errors
SELECT id, first_name, last_name, email, phone, institution_name
FROM demo_leads
LIMIT 5;
