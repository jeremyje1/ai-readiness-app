-- Fix institutions foreign key constraint issue
-- This removes the FK constraint that references a non-existent institutions table

-- Drop the foreign key constraint on institution_id if it exists
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_institution_id_fkey;

-- Make institution_id nullable and remove the constraint entirely
-- We'll just store institution data directly in user_profiles
ALTER TABLE public.user_profiles
ALTER COLUMN institution_id DROP NOT NULL;

-- Confirm the change
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass
AND contype = 'f';
