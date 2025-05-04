-- Function to safely delete a user by email
CREATE OR REPLACE FUNCTION safely_delete_user_by_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  result TEXT;
BEGIN
  -- Find the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = LOWER(user_email);
  
  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Delete from profiles first (if exists)
  BEGIN
    DELETE FROM profiles WHERE id = user_id;
    result := 'Deleted from profiles. ';
  EXCEPTION WHEN OTHERS THEN
    result := 'No profile found or error deleting profile: ' || SQLERRM || '. ';
  END;
  
  -- Then delete from auth.users
  BEGIN
    DELETE FROM auth.users WHERE id = user_id;
    result := result || 'Deleted from auth.users.';
  EXCEPTION WHEN OTHERS THEN
    result := result || 'Error deleting from auth.users: ' || SQLERRM;
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely delete a user by ID
CREATE OR REPLACE FUNCTION safely_delete_user_by_id(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Delete from profiles first (if exists)
  BEGIN
    DELETE FROM profiles WHERE id = user_id;
    result := 'Deleted from profiles. ';
  EXCEPTION WHEN OTHERS THEN
    result := 'No profile found or error deleting profile: ' || SQLERRM || '. ';
  END;
  
  -- Then delete from auth.users
  BEGIN
    DELETE FROM auth.users WHERE id = user_id;
    result := result || 'Deleted from auth.users.';
  EXCEPTION WHEN OTHERS THEN
    result := result || 'Error deleting from auth.users: ' || SQLERRM;
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative approach using direct SQL with error handling
CREATE OR REPLACE FUNCTION force_delete_user_by_id(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Try to delete directly with SQL
  BEGIN
    EXECUTE 'DELETE FROM auth.users WHERE id = $1' USING user_id;
    result := 'User deleted using direct SQL.';
  EXCEPTION WHEN OTHERS THEN
    -- If that fails, try to use the Supabase auth.users API
    BEGIN
      EXECUTE 'SELECT auth.users.delete_user($1)' USING user_id;
      result := 'User deleted using auth.users.delete_user function.';
    EXCEPTION WHEN OTHERS THEN
      -- Last resort - update the user to mark as deleted
      BEGIN
        EXECUTE 'UPDATE auth.users SET deleted_at = NOW() WHERE id = $1' USING user_id;
        result := 'Could not delete user, marked as deleted instead.';
      EXCEPTION WHEN OTHERS THEN
        result := 'All deletion methods failed: ' || SQLERRM;
      END;
    END;
  END;
  
  -- Also try to delete from profiles
  BEGIN
    DELETE FROM profiles WHERE id = user_id;
    result := result || ' Profile deleted.';
  EXCEPTION WHEN OTHERS THEN
    result := result || ' Profile deletion failed or not found.';
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT safely_delete_user_by_email('user@example.com');
-- SELECT safely_delete_user_by_id('00000000-0000-0000-0000-000000000000');
-- SELECT force_delete_user_by_id('00000000-0000-0000-0000-000000000000');
