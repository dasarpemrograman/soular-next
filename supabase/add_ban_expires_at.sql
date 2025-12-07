-- Quick fix: Add ban_expires_at column to profiles table
-- Run this in Supabase SQL Editor

-- Add ban_expires_at column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN public.profiles.ban_expires_at IS 'Timestamp when the ban expires (NULL for permanent bans)';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS profiles_ban_expires_at_idx ON public.profiles(ban_expires_at)
WHERE ban_expires_at IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'ban_expires_at';
