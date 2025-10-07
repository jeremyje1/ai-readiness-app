-- Add a test user to user_payments table
-- Run this after you've signed up for premium through Stripe

-- First, check if there are any users in the system
SELECT id, email 
FROM auth.users 
LIMIT 5;

-- If you see users above, use one of those IDs in the INSERT below
-- Otherwise, create a test user first

-- Insert a test premium user (replace the user_id with an actual UUID from above)
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
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'your-email@example.com'), -- Replace with your email
    'your-email@example.com', -- Replace with your email
    'Your Name', -- Replace with your name
    'Your Organization', -- Replace with your organization
    'premium',
    'cus_test_' || gen_random_uuid()::text,
    'cs_test_' || gen_random_uuid()::text,
    49900, -- $499.00 in cents
    'completed',
    true
) ON CONFLICT (stripe_session_id) DO UPDATE
SET 
    access_granted = true,
    payment_status = 'completed',
    updated_at = NOW();

-- Verify the insert worked
SELECT * FROM public.user_payments 
WHERE email = 'your-email@example.com'; -- Replace with your email