-- Inspect users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Count existing rows (capped)
SELECT COUNT(*) AS total_users FROM auth.users;

-- Sample one user id/email if available
SELECT id, email
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;