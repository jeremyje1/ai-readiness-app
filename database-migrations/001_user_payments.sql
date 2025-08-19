-- Create user_payments table for tracking paid customers
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.user_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    tier VARCHAR(100) NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR(255) NOT NULL,
    payment_amount INTEGER NOT NULL, -- in cents
    payment_status VARCHAR(50) DEFAULT 'completed',
    access_granted BOOLEAN DEFAULT true,
    access_revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON public.user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_email ON public.user_payments(email);
CREATE INDEX IF NOT EXISTS idx_user_payments_stripe_customer ON public.user_payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_tier ON public.user_payments(tier);
CREATE INDEX IF NOT EXISTS idx_user_payments_access ON public.user_payments(access_granted);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_payments
CREATE POLICY "Users can view their own payment records" ON public.user_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment records" ON public.user_payments
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.user_payments TO authenticated;
GRANT ALL ON public.user_payments TO service_role;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_payments_updated_at ON public.user_payments;
CREATE TRIGGER update_user_payments_updated_at
    BEFORE UPDATE ON public.user_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
