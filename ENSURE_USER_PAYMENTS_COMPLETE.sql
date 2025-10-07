-- Ensure user_payments table has all required columns
-- Run this BEFORE the premium features migration

-- 1. First check current structure
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add any missing columns
-- Add organization column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'organization' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN organization VARCHAR(255);
    END IF;
END $$;

-- Add is_test column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'is_test' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN is_test BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'role' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN role VARCHAR(50) DEFAULT 'viewer';
    END IF;
END $$;

-- Add department column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_payments' 
                   AND column_name = 'department' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_payments ADD COLUMN department VARCHAR(255);
    END IF;
END $$;

-- 3. Verify all columns now exist
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Now you can run the premium features migration (APPLY_PREMIUM_FEATURES_MIGRATION.sql)