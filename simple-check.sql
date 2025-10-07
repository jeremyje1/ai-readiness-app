-- Simple check: Does organization column exist?
SELECT 
    COUNT(*) as organization_column_exists
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_payments'
AND column_name = 'organization';

-- List ALL columns in user_payments
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_payments'
ORDER BY ordinal_position;