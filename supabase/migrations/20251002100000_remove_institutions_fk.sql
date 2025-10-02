-- Hotfix: Remove institutions foreign key constraint
-- The institutions table doesn't exist, causing signup failures

-- Drop the foreign key constraint on institution_id if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_profiles_institution_id_fkey'
    ) THEN
        ALTER TABLE public.user_profiles
        DROP CONSTRAINT user_profiles_institution_id_fkey;

        RAISE NOTICE 'Dropped constraint user_profiles_institution_id_fkey';
    ELSE
        RAISE NOTICE 'Constraint user_profiles_institution_id_fkey does not exist';
    END IF;
END $$;

-- Verify the constraint is gone
SELECT
    'Remaining foreign key constraints on user_profiles:' as message,
    conname as constraint_name
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass
AND contype = 'f';
