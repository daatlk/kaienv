-- Add is_deleted column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END
$$;

-- Create a function to forcefully delete a user by ID
CREATE OR REPLACE FUNCTION public.delete_user_by_id_force(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete from profiles table
  DELETE FROM public.profiles WHERE id = user_id_param;
  
  -- If we had other tables with user references, we would delete from them here
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
