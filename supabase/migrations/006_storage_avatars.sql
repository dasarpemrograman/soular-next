-- ============================================
-- HOUR 23: Storage Bucket for Avatars (FIXED)
-- ============================================

-- 1. Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Note: RLS is already enabled on storage.objects by default in Supabase.
-- We skip 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;' to avoid Error 42501.

-- Policy: Anyone can view avatars (public read)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- HELPER FUNCTION: Get avatar URL
-- ============================================
CREATE OR REPLACE FUNCTION public.get_avatar_url(avatar_path TEXT)
RETURNS TEXT AS $$
BEGIN
  IF avatar_path IS NULL OR avatar_path = '' THEN
    return NULL;
  END IF;

  -- If it's already a full URL, return it
  IF avatar_path LIKE 'http%' THEN
    RETURN avatar_path;
  END IF;

  RETURN avatar_path;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_avatar_url IS 'Returns the public URL for an avatar path';
