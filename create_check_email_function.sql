-- SQL Script to create functions for checking email pre-approval

-- Function to find a user by email (accessible via RPC)
CREATE OR REPLACE FUNCTION public.find_user_by_email(email_to_find TEXT)
RETURNS TABLE (id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email
  FROM auth.users u
  WHERE u.email = LOWER(email_to_find);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if an email is pre-approved
CREATE OR REPLACE FUNCTION public.check_email_pre_approved(check_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  has_profile BOOLEAN;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = LOWER(check_email);
  
  -- If user doesn't exist, they're not pre-approved
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user has a profile
  SELECT EXISTS(
    SELECT 1 
    FROM profiles 
    WHERE id = user_id
  ) INTO has_profile;
  
  -- User is pre-approved if they have a profile
  RETURN has_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
