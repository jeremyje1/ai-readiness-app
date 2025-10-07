
CREATE TABLE IF NOT EXISTS public.user_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    tier VARCHAR(100) NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR(255) NOT NULL,
    payment_amount INTEGER NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'completed',
    access_granted BOOLEAN DEFAULT TRUE,
    access_revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_test BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'viewer',
    department VARCHAR(100),
    CONSTRAINT user_payments_role_check CHECK (role::text = ANY (ARRAY['admin','manager','contributor','reviewer','viewer']))
);

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
        ALTER TABLE public.user_payments ADD COLUMN department VARCHAR(100);
    END IF;
END $$;

-- Add unique constraint on stripe_session_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'user_payments' 
                   AND constraint_type = 'UNIQUE' 
                   AND table_schema = 'public'
                   AND constraint_name = 'user_payments_stripe_session_id_key') THEN
        ALTER TABLE public.user_payments 
        ADD CONSTRAINT user_payments_stripe_session_id_key UNIQUE (stripe_session_id);
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;