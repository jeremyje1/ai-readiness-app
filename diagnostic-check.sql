-- DIAGNOSTIC: Check if user_payments columns exist
-- Run this to see what actually happened in step 1

SELECT 
    'user_payments structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_payments'
ORDER BY ordinal_position;

-- Check if the table exists at all
SELECT 
    'table exists check' as info,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name = 'user_payments';