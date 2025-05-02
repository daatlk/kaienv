-- Create a function to delete a user by ID
CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete from profiles table
  DELETE FROM public.profiles WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
