
-- Function to block a user
CREATE OR REPLACE FUNCTION public.block_user(blocker UUID, blocked UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into blocked_users table
  INSERT INTO public.blocked_users (blocker_id, blocked_id)
  VALUES (blocker, blocked)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to unblock a user
CREATE OR REPLACE FUNCTION public.unblock_user(blocker UUID, blocked UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from blocked_users table
  DELETE FROM public.blocked_users
  WHERE blocker_id = blocker AND blocked_id = blocked;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
