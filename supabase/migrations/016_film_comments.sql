-- Migration: Film Comments and Reviews System
-- Allows users to comment on films and rate them

-- =====================================================
-- 1. CREATE FILM_COMMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.film_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS film_comments_film_id_idx ON public.film_comments(film_id);
CREATE INDEX IF NOT EXISTS film_comments_user_id_idx ON public.film_comments(user_id);
CREATE INDEX IF NOT EXISTS film_comments_created_at_idx ON public.film_comments(created_at DESC);

-- Add comments
COMMENT ON TABLE public.film_comments IS 'User comments and reviews on films';
COMMENT ON COLUMN public.film_comments.rating IS 'Optional rating from 1-5 stars';

-- =====================================================
-- 2. CREATE FILM_COMMENT_LIKES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.film_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.film_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS film_comment_likes_comment_id_idx ON public.film_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS film_comment_likes_user_id_idx ON public.film_comment_likes(user_id);

-- Add comment
COMMENT ON TABLE public.film_comment_likes IS 'Likes on film comments';

-- =====================================================
-- 3. ADD LIKE_COUNT TO FILM_COMMENTS
-- =====================================================

ALTER TABLE public.film_comments
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- =====================================================
-- 4. CREATE TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Trigger to update updated_at on film_comments
CREATE OR REPLACE FUNCTION update_film_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER film_comments_updated_at
BEFORE UPDATE ON public.film_comments
FOR EACH ROW
EXECUTE FUNCTION update_film_comment_updated_at();

-- Trigger to increment like_count when a like is added
CREATE OR REPLACE FUNCTION increment_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.film_comments
  SET like_count = like_count + 1
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER film_comment_like_added
AFTER INSERT ON public.film_comment_likes
FOR EACH ROW
EXECUTE FUNCTION increment_comment_like_count();

-- Trigger to decrement like_count when a like is removed
CREATE OR REPLACE FUNCTION decrement_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.film_comments
  SET like_count = like_count - 1
  WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER film_comment_like_removed
AFTER DELETE ON public.film_comment_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_comment_like_count();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.film_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_comment_likes ENABLE ROW LEVEL SECURITY;

-- film_comments policies
-- Anyone can read comments
CREATE POLICY "Anyone can view film comments"
ON public.film_comments
FOR SELECT
USING (true);

-- Authenticated users can insert comments (if not banned)
CREATE POLICY "Authenticated users can create comments"
ON public.film_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND is_not_banned()
);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.film_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments, moderators can delete any
CREATE POLICY "Users can delete own comments"
ON public.film_comments
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR is_moderator_or_admin()
);

-- film_comment_likes policies
-- Anyone can see likes
CREATE POLICY "Anyone can view comment likes"
ON public.film_comment_likes
FOR SELECT
USING (true);

-- Authenticated users can like comments
CREATE POLICY "Authenticated users can like comments"
ON public.film_comment_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can unlike comments
CREATE POLICY "Users can unlike comments"
ON public.film_comment_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to get comments for a film with user info
CREATE OR REPLACE FUNCTION get_film_comments(p_film_id UUID, p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  id UUID,
  film_id UUID,
  user_id UUID,
  username TEXT,
  user_avatar TEXT,
  comment TEXT,
  rating INTEGER,
  like_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fc.id,
    fc.film_id,
    fc.user_id,
    p.username,
    p.avatar as user_avatar,
    fc.comment,
    fc.rating,
    fc.like_count,
    fc.created_at,
    fc.updated_at,
    EXISTS(
      SELECT 1 FROM public.film_comment_likes fcl
      WHERE fcl.comment_id = fc.id AND fcl.user_id = auth.uid()
    ) as is_liked
  FROM public.film_comments fc
  JOIN public.profiles p ON fc.user_id = p.id
  WHERE fc.film_id = p_film_id
  ORDER BY fc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get average rating for a film
CREATE OR REPLACE FUNCTION get_film_average_rating(p_film_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1)
  INTO avg_rating
  FROM public.film_comments
  WHERE film_id = p_film_id AND rating IS NOT NULL;

  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comment count for a film
CREATE OR REPLACE FUNCTION get_film_comment_count(p_film_id UUID)
RETURNS INTEGER AS $$
DECLARE
  comment_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO comment_count
  FROM public.film_comments
  WHERE film_id = p_film_id;

  RETURN COALESCE(comment_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_film_comments(UUID, INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_film_average_rating(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_film_comment_count(UUID) TO authenticated, anon;

-- =====================================================
-- 8. ADD COMMENT_COUNT TO FILMS TABLE
-- =====================================================

-- Add column to track comment count on films table
ALTER TABLE public.films
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Trigger to increment film comment_count
CREATE OR REPLACE FUNCTION increment_film_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.films
  SET comment_count = comment_count + 1
  WHERE id = NEW.film_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER film_comment_added
AFTER INSERT ON public.film_comments
FOR EACH ROW
EXECUTE FUNCTION increment_film_comment_count();

-- Trigger to decrement film comment_count
CREATE OR REPLACE FUNCTION decrement_film_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.films
  SET comment_count = comment_count - 1
  WHERE id = OLD.film_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER film_comment_deleted
AFTER DELETE ON public.film_comments
FOR EACH ROW
EXECUTE FUNCTION decrement_film_comment_count();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables were created
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('film_comments', 'film_comment_likes')
  ) THEN
    RAISE NOTICE 'Film comments system created successfully!';
  END IF;
END $$;
