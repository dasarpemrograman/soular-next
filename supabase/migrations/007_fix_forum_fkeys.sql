-- =====================================================
-- FIX FORUM FOREIGN KEY RELATIONSHIPS
-- =====================================================
-- This migration fixes the foreign key relationships in forum tables
-- to reference public.profiles instead of auth.users

-- =====================================================
-- 1. DROP EXISTING FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop forum_discussions author_id foreign key
ALTER TABLE public.forum_discussions
    DROP CONSTRAINT IF EXISTS forum_discussions_author_id_fkey;

-- Drop forum_posts author_id foreign key
ALTER TABLE public.forum_posts
    DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;

-- Drop forum_post_likes user_id foreign key
ALTER TABLE public.forum_post_likes
    DROP CONSTRAINT IF EXISTS forum_post_likes_user_id_fkey;

-- =====================================================
-- 2. ADD NEW FOREIGN KEY CONSTRAINTS TO PROFILES
-- =====================================================

-- Add forum_discussions author_id foreign key to profiles
ALTER TABLE public.forum_discussions
    ADD CONSTRAINT forum_discussions_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- Add forum_posts author_id foreign key to profiles
ALTER TABLE public.forum_posts
    ADD CONSTRAINT forum_posts_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- Add forum_post_likes user_id foreign key to profiles
ALTER TABLE public.forum_post_likes
    ADD CONSTRAINT forum_post_likes_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- =====================================================
-- 3. CREATE DISCUSSION_LIKES TABLE (if not exists)
-- =====================================================
-- This is needed for the like functionality on discussions

CREATE TABLE IF NOT EXISTS public.forum_discussion_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES public.forum_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

-- Create index for discussion likes
CREATE INDEX IF NOT EXISTS idx_forum_discussion_likes_discussion ON public.forum_discussion_likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_forum_discussion_likes_user ON public.forum_discussion_likes(user_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on forum_discussion_likes if not already enabled
ALTER TABLE public.forum_discussion_likes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES FOR DISCUSSION LIKES
-- =====================================================

-- Allow users to view all discussion likes
DROP POLICY IF EXISTS "Discussion likes are viewable by everyone" ON public.forum_discussion_likes;
CREATE POLICY "Discussion likes are viewable by everyone"
    ON public.forum_discussion_likes
    FOR SELECT
    USING (true);

-- Allow authenticated users to create their own likes
DROP POLICY IF EXISTS "Users can create their own discussion likes" ON public.forum_discussion_likes;
CREATE POLICY "Users can create their own discussion likes"
    ON public.forum_discussion_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
DROP POLICY IF EXISTS "Users can delete their own discussion likes" ON public.forum_discussion_likes;
CREATE POLICY "Users can delete their own discussion likes"
    ON public.forum_discussion_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. ADD LIKE_COUNT COLUMN TO DISCUSSIONS (if not exists)
-- =====================================================

-- Add like_count column to forum_discussions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'forum_discussions'
        AND column_name = 'like_count'
    ) THEN
        ALTER TABLE public.forum_discussions
        ADD COLUMN like_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- 7. CREATE FUNCTION TO UPDATE DISCUSSION LIKE COUNT
-- =====================================================

-- Function to update discussion like count
CREATE OR REPLACE FUNCTION update_discussion_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_discussions
        SET like_count = like_count + 1
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_discussions
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE TRIGGERS FOR LIKE COUNT
-- =====================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_discussion_like_count ON public.forum_discussion_likes;

-- Create trigger for discussion like count
CREATE TRIGGER trigger_update_discussion_like_count
    AFTER INSERT OR DELETE ON public.forum_discussion_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_discussion_like_count();

-- =====================================================
-- 9. REFRESH LIKE COUNTS (for existing data)
-- =====================================================

-- Update like_count for all existing discussions
UPDATE public.forum_discussions d
SET like_count = (
    SELECT COUNT(*)
    FROM public.forum_discussion_likes l
    WHERE l.discussion_id = d.id
);
