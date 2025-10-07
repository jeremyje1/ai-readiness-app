-- STEP 1: Add columns to user_payments table
-- Run this FIRST

-- Ensure user_payments table exists
CREATE TABLE IF NOT EXISTS public.user_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'free',
    payment_amount DECIMAL(10, 2),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add columns using DO blocks to check if they exist first
DO $$
BEGIN
    -- Add organization column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_payments' 
        AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.user_payments ADD COLUMN organization VARCHAR(255);
        RAISE NOTICE 'Added organization column';
    ELSE
        RAISE NOTICE 'organization column already exists';
    END IF;

    -- Add is_test column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_payments' 
        AND column_name = 'is_test'
    ) THEN
        ALTER TABLE public.user_payments ADD COLUMN is_test BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_test column';
    ELSE
        RAISE NOTICE 'is_test column already exists';
    END IF;

    -- Add role column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_payments' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_payments ADD COLUMN role VARCHAR(50) DEFAULT 'viewer';
        RAISE NOTICE 'Added role column';
    ELSE
        RAISE NOTICE 'role column already exists';
    END IF;

    -- Add department column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_payments' 
        AND column_name = 'department'
    ) THEN
        ALTER TABLE public.user_payments ADD COLUMN department VARCHAR(100);
        RAISE NOTICE 'Added department column';
    ELSE
        RAISE NOTICE 'department column already exists';
    END IF;
END $$;

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS user_payments_user_id_unique ON public.user_payments(user_id);

-- Verify the changes
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;