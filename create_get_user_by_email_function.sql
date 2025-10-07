-- Create a function to get user by email from auth.users
-- This is needed because we can't directly query auth.users from the client

CREATE OR REPLACE FUNCTION get_user_by_email(email_input text)
RETURNS TABLE(id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email = email_input
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email TO service_role;