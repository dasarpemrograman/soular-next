-- Fix get_my_profile function
DROP FUNCTION IF EXISTS public.get_my_profile();

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  id UUID, 
  name TEXT, 
  username TEXT, 
  email TEXT, 
  avatar TEXT,
  bio TEXT, 
  is_premium BOOLEAN, 
  created_at TIMESTAMPTZ, 
  updated_at TIMESTAMPTZ
) AS 27744
BEGIN
  RETURN QUERY 
  SELECT 
    p.id, 
    p.name, 
    p.username, 
    p.email, 
    p.avatar, 
    p.bio,
    p.is_premium, 
    p.created_at, 
    p.updated_at
  FROM public.profiles p 
  WHERE p.id = auth.uid();
END;
27744 LANGUAGE plpgsql SECURITY DEFINER;
