-- =====================================================
-- FORUM TABLE MIGRATION
-- =====================================================
-- This migration creates the forum_discussions and forum_posts tables
-- for managing community discussions and posts.

-- =====================================================
-- 1. CREATE FORUM_DISCUSSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.forum_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('general', 'filmmaking', 'technical', 'showcase', 'feedback', 'events', 'other')),
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE FORUM_POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES public.forum_discussions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    is_solution BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE POST_LIKES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.forum_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_forum_discussions_author ON public.forum_discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_discussions_category ON public.forum_discussions(category);
CREATE INDEX IF NOT EXISTS idx_forum_discussions_pinned ON public.forum_discussions(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_forum_discussions_activity ON public.forum_discussions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_discussion ON public.forum_posts(discussion_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent ON public.forum_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_post ON public.forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_user ON public.forum_post_likes(user_id);

-- =====================================================
-- 5. CREATE UPDATED_AT TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS set_forum_discussions_updated_at ON public.forum_discussions;
CREATE TRIGGER set_forum_discussions_updated_at
    BEFORE UPDATE ON public.forum_discussions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_forum_posts_updated_at ON public.forum_posts;
CREATE TRIGGER set_forum_posts_updated_at
    BEFORE UPDATE ON public.forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. CREATE TRIGGER TO UPDATE LAST_ACTIVITY_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_discussion_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forum_discussions
    SET last_activity_at = NOW(),
        reply_count = (
            SELECT COUNT(*)
            FROM public.forum_posts
            WHERE discussion_id = NEW.discussion_id
        )
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_created ON public.forum_posts;
CREATE TRIGGER on_post_created
    AFTER INSERT ON public.forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_discussion_activity();

-- =====================================================
-- 7. CREATE TRIGGER TO UPDATE LIKE COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forum_posts
    SET like_count = (
        SELECT COUNT(*)
        FROM public.forum_post_likes
        WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_like_changed ON public.forum_post_likes;
CREATE TRIGGER on_like_changed
    AFTER INSERT OR DELETE ON public.forum_post_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_post_like_count();

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.forum_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CREATE RLS POLICIES FOR FORUM_DISCUSSIONS
-- =====================================================

-- Everyone can view discussions
DROP POLICY IF EXISTS "Discussions are viewable by everyone" ON public.forum_discussions;
CREATE POLICY "Discussions are viewable by everyone"
    ON public.forum_discussions
    FOR SELECT
    USING (true);

-- Authenticated users can create discussions
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON public.forum_discussions;
CREATE POLICY "Authenticated users can create discussions"
    ON public.forum_discussions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Authors can update their own discussions
DROP POLICY IF EXISTS "Authors can update their discussions" ON public.forum_discussions;
CREATE POLICY "Authors can update their discussions"
    ON public.forum_discussions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own discussions
DROP POLICY IF EXISTS "Authors can delete their discussions" ON public.forum_discussions;
CREATE POLICY "Authors can delete their discussions"
    ON public.forum_discussions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- =====================================================
-- 10. CREATE RLS POLICIES FOR FORUM_POSTS
-- =====================================================

-- Everyone can view posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.forum_posts;
CREATE POLICY "Posts are viewable by everyone"
    ON public.forum_posts
    FOR SELECT
    USING (true);

-- Authenticated users can create posts
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
CREATE POLICY "Authenticated users can create posts"
    ON public.forum_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
DROP POLICY IF EXISTS "Authors can update their posts" ON public.forum_posts;
CREATE POLICY "Authors can update their posts"
    ON public.forum_posts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own posts
DROP POLICY IF EXISTS "Authors can delete their posts" ON public.forum_posts;
CREATE POLICY "Authors can delete their posts"
    ON public.forum_posts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- =====================================================
-- 11. CREATE RLS POLICIES FOR FORUM_POST_LIKES
-- =====================================================

-- Users can view all likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.forum_post_likes;
CREATE POLICY "Likes are viewable by everyone"
    ON public.forum_post_likes
    FOR SELECT
    USING (true);

-- Users can like posts
DROP POLICY IF EXISTS "Users can like posts" ON public.forum_post_likes;
CREATE POLICY "Users can like posts"
    ON public.forum_post_likes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts
DROP POLICY IF EXISTS "Users can unlike posts" ON public.forum_post_likes;
CREATE POLICY "Users can unlike posts"
    ON public.forum_post_likes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- 12. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to increment discussion view count
CREATE OR REPLACE FUNCTION public.increment_discussion_views(discussion_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.forum_discussions
    SET view_count = view_count + 1
    WHERE id = discussion_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has liked a post
CREATE OR REPLACE FUNCTION public.has_user_liked_post(post_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.forum_post_likes
        WHERE post_id = post_uuid
        AND user_id = user_uuid
    );
$$ LANGUAGE SQL STABLE;

-- Function to get discussion with post count
CREATE OR REPLACE FUNCTION public.get_discussion_stats(discussion_uuid UUID)
RETURNS TABLE (
    post_count BIGINT,
    view_count INTEGER,
    last_activity TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(fp.id),
        fd.view_count,
        fd.last_activity_at
    FROM public.forum_discussions fd
    LEFT JOIN public.forum_posts fp ON fp.discussion_id = fd.id
    WHERE fd.id = discussion_uuid
    GROUP BY fd.id, fd.view_count, fd.last_activity_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 13. INSERT SAMPLE DATA
-- =====================================================

-- Note: This uses dummy UUIDs for author_id since we don't have real users yet
-- You should update these with real user IDs once authentication is implemented

INSERT INTO public.forum_discussions (id, title, content, author_id, category, tags, is_pinned, view_count, reply_count) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'Welcome to the Soular Community Forum!',
    'Welcome everyone! This is our community space to discuss filmmaking, share ideas, get feedback, and connect with fellow creators. Feel free to introduce yourself and share what brings you to our community.',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'general',
    ARRAY['welcome', 'introduction'],
    true,
    156,
    8
),
(
    '10000000-0000-0000-0000-000000000002',
    'Tips for shooting in low light conditions',
    'I''m working on a documentary that requires a lot of night/indoor shooting. What are your best tips for getting clean footage in low light? Camera settings, equipment recommendations, or post-processing techniques?',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'technical',
    ARRAY['cinematography', 'low-light', 'tips'],
    false,
    89,
    12
),
(
    '10000000-0000-0000-0000-000000000003',
    'Just finished my first short documentary!',
    'After 6 months of work, I finally finished my first short documentary about local street artists. It was an incredible learning experience. Happy to answer any questions from fellow beginners!',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'showcase',
    ARRAY['documentary', 'beginner', 'completed'],
    false,
    67,
    15
),
(
    '10000000-0000-0000-0000-000000000004',
    'Best practices for conducting interviews?',
    'I''m planning to interview several people for my upcoming documentary. What are your best practices for making interviewees comfortable and getting authentic responses? Any equipment or setup tips?',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'filmmaking',
    ARRAY['interviews', 'documentary', 'audio'],
    false,
    103,
    9
),
(
    '10000000-0000-0000-0000-000000000005',
    'Looking for collaborators on climate change doc',
    'I''m developing a documentary series about climate change solutions in Southeast Asia. Looking for cinematographers, editors, or researchers interested in collaborating. This is a passion project but may have funding opportunities.',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'general',
    ARRAY['collaboration', 'climate', 'documentary'],
    false,
    45,
    6
),
(
    '10000000-0000-0000-0000-000000000006',
    'Feedback wanted: Rough cut of my film',
    'I''ve put together a rough cut of my 15-minute documentary about traditional craftsmen. Would love to get feedback on pacing, storytelling, and overall impact. Link in comments.',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'feedback',
    ARRAY['feedback', 'rough-cut', 'traditional-crafts'],
    false,
    78,
    11
),
(
    '10000000-0000-0000-0000-000000000007',
    'Which editing software do you recommend?',
    'I''m transitioning from hobby filmmaking to more serious projects. Currently using basic software but ready to invest in professional tools. What do you all use and recommend? DaVinci Resolve, Premiere Pro, Final Cut?',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'technical',
    ARRAY['editing', 'software', 'recommendations'],
    false,
    134,
    18
),
(
    '10000000-0000-0000-0000-000000000008',
    'Documentary Ethics: When to stop filming?',
    'Encountered a situation while filming where a subject became emotional and vulnerable. How do you balance capturing authentic moments with respecting privacy and dignity? Would love to hear your experiences.',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'filmmaking',
    ARRAY['ethics', 'documentary', 'discussion'],
    false,
    92,
    14
),
(
    '10000000-0000-0000-0000-000000000009',
    'Monthly Challenge: One-Minute Stories',
    'Let''s do a monthly challenge! Create a one-minute documentary about something in your immediate surroundings. Share your work and let''s learn from each other. Deadline: end of month!',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'events',
    ARRAY['challenge', 'community', 'short-form'],
    true,
    201,
    24
),
(
    '10000000-0000-0000-0000-000000000010',
    'Resources for learning color grading',
    'I want to improve my color grading skills. Can anyone recommend good tutorials, courses, or YouTube channels? Specifically interested in documentary grading (natural look, not heavy stylization).',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'technical',
    ARRAY['color-grading', 'learning', 'resources'],
    false,
    118,
    10
);

-- Insert some sample posts for the first discussion
INSERT INTO public.forum_posts (discussion_id, author_id, content) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'Thanks for having me! I''m a documentary filmmaker from Jakarta, excited to learn from this community.'
),
(
    '10000000-0000-0000-0000-000000000001',
    'b0c2ff8d-9711-445e-a1ea-31c104f94a12',
    'Hello everyone! Aspiring filmmaker here, just got my first camera and ready to start creating!'
);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.forum_discussions TO authenticated;
GRANT SELECT ON public.forum_discussions TO anon;
GRANT ALL ON public.forum_posts TO authenticated;
GRANT SELECT ON public.forum_posts TO anon;
GRANT ALL ON public.forum_post_likes TO authenticated;
GRANT SELECT ON public.forum_post_likes TO anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: forum_discussions, forum_posts, forum_post_likes
-- RLS enabled and policies created
-- Helper functions created
-- Sample data inserted (10 discussions, 2 posts)
-- =====================================================
