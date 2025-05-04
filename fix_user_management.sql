-- Create a function to delete users that can be called from the application
CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN := FALSE;
BEGIN
  -- First try to delete from profiles
  BEGIN
    DELETE FROM profiles WHERE id = user_id;
    -- If we get here, the profile deletion succeeded or there was no profile
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors from profile deletion
    RAISE NOTICE 'Error deleting profile: %', SQLERRM;
  END;
  
  -- Then try to delete from auth.users
  BEGIN
    DELETE FROM auth.users WHERE id = user_id;
    success := TRUE;
  EXCEPTION WHEN OTHERS THEN
    -- Try alternative methods
    BEGIN
      PERFORM auth.users.delete_user(user_id);
      success := TRUE;
    EXCEPTION WHEN OTHERS THEN
      -- Try marking as deleted
      BEGIN
        UPDATE auth.users SET deleted_at = NOW() WHERE id = user_id;
        success := TRUE;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'All deletion methods failed: %', SQLERRM;
        success := FALSE;
      END;
    END;
  END;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to delete users by email that can be called from the application
CREATE OR REPLACE FUNCTION public.delete_user_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  success BOOLEAN := FALSE;
BEGIN
  -- Find the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = LOWER(user_email);
  
  IF user_id IS NULL THEN
    RETURN FALSE; -- User not found
  END IF;
  
  -- Use the delete_user_by_id function
  RETURN public.delete_user_by_id(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
