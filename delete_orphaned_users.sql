-- Delete users in auth.users that don't have corresponding profiles
DO $$
DECLARE
  orphaned_user RECORD;
  deletion_result TEXT;
  counter INT := 0;
BEGIN
  -- Find all users in auth.users that don't have profiles
  FOR orphaned_user IN 
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Try to delete each orphaned user
    BEGIN
      -- Try direct deletion first
      EXECUTE 'DELETE FROM auth.users WHERE id = $1' USING orphaned_user.id;
      deletion_result := 'Deleted directly';
    EXCEPTION WHEN OTHERS THEN
      -- If direct deletion fails, try marking as deleted
      BEGIN
        EXECUTE 'UPDATE auth.users SET deleted_at = NOW() WHERE id = $1' USING orphaned_user.id;
        deletion_result := 'Marked as deleted';
      EXCEPTION WHEN OTHERS THEN
        deletion_result := 'Failed to delete: ' || SQLERRM;
      END;
    END;
    
    RAISE NOTICE 'User % (%): %', orphaned_user.email, orphaned_user.id, deletion_result;
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Processed % orphaned users', counter;
END $$;
