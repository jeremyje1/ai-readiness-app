-- ============================================
-- QUICK USER LOOKUP
-- Run this first to find your user info
-- ============================================

-- Show the most recent users
SELECT 
    '👤 Recent Auth Users' as info,
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
