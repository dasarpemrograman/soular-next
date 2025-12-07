-- Migration: Add ban_expires_at column to profiles table
-- This column allows temporary bans that automatically expire

-- Add ban_expires_at column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN public.profiles.ban_expires_at IS 'Timestamp when the ban expires (NULL for permanent bans)';

-- Create index for efficient queries on expired bans
CREATE INDEX IF NOT EXISTS profiles_ban_expires_at_idx ON public.profiles(ban_expires_at)
WHERE ban_expires_at IS NOT NULL;

-- Optional: Function to auto-unban expired users (can be called via cron or manually)
CREATE OR REPLACE FUNCTION public.unban_expired_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unbanned_count INTEGER;
BEGIN
  -- Update profiles where ban has expired
  WITH unbanned AS (
    UPDATE public.profiles
    SET
      is_banned = false,
      ban_reason = NULL,
      ban_expires_at = NULL,
      updated_at = NOW()
    WHERE
      is_banned = true
      AND ban_expires_at IS NOT NULL
      AND ban_expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO unbanned_count FROM unbanned;

  RETURN unbanned_count;
END;
$$;

COMMENT ON FUNCTION public.unban_expired_users() IS 'Automatically unbans users whose ban period has expired';

-- Grant execute permission to authenticated users (will be called by cron job or admin)
GRANT EXECUTE ON FUNCTION public.unban_expired_users() TO authenticated;
