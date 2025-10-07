-- Add a test user to user_payments table
-- Run this after you've signed up for premium through Stripe

-- First, verify the user_payments table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any users in the system
SELECT id, email 
FROM auth.users 
LIMIT 5;

-- If you see users above, use one of those IDs in the INSERT below
-- Otherwise, create a test user first

-- Check for existing constraints on user_payments
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.user_payments'::regclass;

-- Insert a test premium user (replace the email with your actual email)
-- NOTE: This uses a simple INSERT without ON CONFLICT since stripe_session_id may not have a unique constraint
INSERT INTO public.user_payments (
    user_id,
    email,
    name,
    organization,
    tier,
    stripe_customer_id,
    stripe_session_id,
    payment_amount,
    payment_status,
    access_granted
) 
SELECT 
    id as user_id,
    'your-email@example.com', -- Replace with your email
    'Your Name', -- Replace with your name
    'Your Organization', -- Replace with your organization
    'premium',
    'cus_test_' || substr(md5(random()::text), 1, 14),
    'cs_test_' || substr(md5(random()::text), 1, 24),
    49900, -- $499.00 in cents
    'completed',
    true
FROM auth.users 
WHERE email = 'your-email@example.com' -- Replace with your email
AND NOT EXISTS (
    SELECT 1 FROM public.user_payments 
    WHERE user_id = auth.users.id
);

-- Alternative simpler insert if the above doesn't work
-- This creates a test user payment record directly
/*
INSERT INTO public.user_payments (
    id,
    user_id,
    email,
    name,
    organization,
    tier,
    stripe_customer_id,
    stripe_session_id,
    payment_amount,
    payment_status,
    access_granted
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM auth.users WHERE email = 'your-email@example.com'), -- Replace with your email
    'your-email@example.com', -- Replace with your email
    'Your Name', -- Replace with your name
    'Your Organization', -- Replace with your organization
    'premium',
    'cus_test_manual_' || substr(md5(random()::text), 1, 10),
    'cs_test_manual_' || substr(md5(random()::text), 1, 20),
    49900, -- $499.00 in cents
    'completed',
    true
);
*/

-- Verify the insert worked
SELECT * FROM public.user_payments 
WHERE email = 'your-email@example.com'; -- Replace with your email