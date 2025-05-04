-- Delete specific users by ID
DO $$
DECLARE
  -- Replace these with the actual user IDs you want to delete
  user_ids UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ];
  user_id UUID;
  deletion_result TEXT;
BEGIN
  FOREACH user_id IN ARRAY user_ids
  LOOP
    -- Try multiple deletion methods for each user
    BEGIN
      -- First try to delete from profiles if it exists
      BEGIN
        DELETE FROM profiles WHERE id = user_id;
        RAISE NOTICE 'Deleted profile for user %', user_id;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No profile found or error deleting profile for user %: %', user_id, SQLERRM;
      END;
      
      -- Then try direct deletion from auth.users
      BEGIN
        DELETE FROM auth.users WHERE id = user_id;
        deletion_result := 'Deleted directly from auth.users';
      EXCEPTION WHEN OTHERS THEN
        -- If direct deletion fails, try the auth.delete_user function
        BEGIN
          PERFORM auth.users.delete_user(user_id);
          deletion_result := 'Deleted using auth.users.delete_user function';
        EXCEPTION WHEN OTHERS THEN
          -- If that fails too, try marking as deleted
          BEGIN
            UPDATE auth.users SET deleted_at = NOW() WHERE id = user_id;
            deletion_result := 'Marked as deleted';
          EXCEPTION WHEN OTHERS THEN
            -- Last resort - try a raw SQL approach
            BEGIN
              EXECUTE 'DELETE FROM auth.users WHERE id = $1' USING user_id;
              deletion_result := 'Deleted using raw SQL';
            EXCEPTION WHEN OTHERS THEN
              deletion_result := 'All deletion methods failed: ' || SQLERRM;
            END;
          END;
        END;
      END;
      
      RAISE NOTICE 'User %: %', user_id, deletion_result;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Unexpected error processing user %: %', user_id, SQLERRM;
    END;
  END LOOP;
END $$;

-- Delete specific users by email
DO $$
DECLARE
  -- Replace these with the actual email addresses you want to delete
  user_emails TEXT[] := ARRAY[
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  ];
  user_email TEXT;
  user_id UUID;
  deletion_result TEXT;
BEGIN
  FOREACH user_email IN ARRAY user_emails
  LOOP
    -- Find the user ID first
    SELECT id INTO user_id FROM auth.users WHERE email = LOWER(user_email);
    
    IF user_id IS NULL THEN
      RAISE NOTICE 'User not found with email: %', user_email;
      CONTINUE;
    END IF;
    
    -- Try multiple deletion methods for each user
    BEGIN
      -- First try to delete from profiles if it exists
      BEGIN
        DELETE FROM profiles WHERE id = user_id;
        RAISE NOTICE 'Deleted profile for user % (%)', user_email, user_id;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No profile found or error deleting profile for user % (%): %', user_email, user_id, SQLERRM;
      END;
      
      -- Then try direct deletion from auth.users
      BEGIN
        DELETE FROM auth.users WHERE id = user_id;
        deletion_result := 'Deleted directly from auth.users';
      EXCEPTION WHEN OTHERS THEN
        -- If direct deletion fails, try the auth.delete_user function
        BEGIN
          PERFORM auth.users.delete_user(user_id);
          deletion_result := 'Deleted using auth.users.delete_user function';
        EXCEPTION WHEN OTHERS THEN
          -- If that fails too, try marking as deleted
          BEGIN
            UPDATE auth.users SET deleted_at = NOW() WHERE id = user_id;
            deletion_result := 'Marked as deleted';
          EXCEPTION WHEN OTHERS THEN
            -- Last resort - try a raw SQL approach
            BEGIN
              EXECUTE 'DELETE FROM auth.users WHERE id = $1' USING user_id;
              deletion_result := 'Deleted using raw SQL';
            EXCEPTION WHEN OTHERS THEN
              deletion_result := 'All deletion methods failed: ' || SQLERRM;
            END;
          END;
        END;
      END;
      
      RAISE NOTICE 'User % (%): %', user_email, user_id, deletion_result;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Unexpected error processing user % (%): %', user_email, user_id, SQLERRM;
    END;
  END LOOP;
END $$;
