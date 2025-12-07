-- ============================================
-- MIGRATION: Add username and email to profiles
-- ============================================
-- Adds username and email columns to profiles table
-- This fixes the issue where notifications and other features expect these columns

-- Add username column (defaults to name for existing users)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add email column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username);

-- Create index on email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Update existing profiles to set username from name
UPDATE public.profiles
SET username = LOWER(REPLACE(name, ' ', '_'))
WHERE username IS NULL;

-- Update existing profiles to set email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Make username NOT NULL after populating
ALTER TABLE public.profiles
ALTER COLUMN username SET NOT NULL;

-- Update the handle_new_user function to include username and email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base username from email or name
  base_username := COALESCE(
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')),
    'user_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
  );

  final_username := base_username;

  -- Ensure username is unique by appending numbers if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || '_' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, name, username, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    final_username,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON COLUMN public.profiles.username IS 'Unique username for the user';
COMMENT ON COLUMN public.profiles.email IS 'User email address (synced from auth.users)';

-- Update get_my_profile function to include new columns
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
