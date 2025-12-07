-- =====================================================
-- HOUR 30: ADMIN ROLES & MODERATION
-- =====================================================
-- This migration adds role-based access control for admin/moderation

-- =====================================================
-- 1. ADD ROLE COLUMN TO PROFILES
-- =====================================================

-- Add role column (default 'user')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
    END IF;
END $$;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role) WHERE role IN ('moderator', 'admin');

-- =====================================================
-- 2. CREATE HELPER FUNCTIONS FOR ROLE CHECKS
-- =====================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('moderator', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE MODERATION LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('pin', 'unpin', 'lock', 'unlock', 'delete_discussion', 'delete_post', 'ban_user', 'unban_user')),
    target_type TEXT NOT NULL CHECK (target_type IN ('discussion', 'post', 'user')),
    target_id UUID NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for moderation logs
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator ON public.moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON public.moderation_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created ON public.moderation_logs(created_at DESC);

-- Enable RLS on moderation logs
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only moderators/admins can view moderation logs
DROP POLICY IF EXISTS "Moderation logs viewable by moderators and admins" ON public.moderation_logs;
CREATE POLICY "Moderation logs viewable by moderators and admins"
    ON public.moderation_logs
    FOR SELECT
    USING (is_moderator_or_admin());

-- Only moderators/admins can create moderation logs
DROP POLICY IF EXISTS "Moderation logs creatable by moderators and admins" ON public.moderation_logs;
CREATE POLICY "Moderation logs creatable by moderators and admins"
    ON public.moderation_logs
    FOR INSERT
    WITH CHECK (is_moderator_or_admin() AND auth.uid() = moderator_id);

-- =====================================================
-- 4. ADD BAN FIELDS TO PROFILES
-- =====================================================

-- Add is_banned and ban_reason columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN is_banned BOOLEAN DEFAULT false,
        ADD COLUMN ban_reason TEXT,
        ADD COLUMN banned_at TIMESTAMPTZ,
        ADD COLUMN banned_by UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- Create index for banned users
CREATE INDEX IF NOT EXISTS profiles_banned_idx ON public.profiles(is_banned) WHERE is_banned = true;

-- =====================================================
-- 5. UPDATE FORUM RLS POLICIES FOR MODERATION
-- =====================================================

-- Update discussion update policy to allow moderators/admins
DROP POLICY IF EXISTS "Users can update their own discussions or moderators can update any" ON public.forum_discussions;
CREATE POLICY "Users can update their own discussions or moderators can update any"
    ON public.forum_discussions
    FOR UPDATE
    USING (auth.uid() = author_id OR is_moderator_or_admin());

-- Update discussion delete policy to allow moderators/admins
DROP POLICY IF EXISTS "Users can delete their own discussions or moderators can delete any" ON public.forum_discussions;
CREATE POLICY "Users can delete their own discussions or moderators can delete any"
    ON public.forum_discussions
    FOR DELETE
    USING (auth.uid() = author_id OR is_moderator_or_admin());

-- Update post delete policy to allow moderators/admins
DROP POLICY IF EXISTS "Users can delete their own posts or moderators can delete any" ON public.forum_posts;
CREATE POLICY "Users can delete their own posts or moderators can delete any"
    ON public.forum_posts
    FOR DELETE
    USING (auth.uid() = author_id OR is_moderator_or_admin());

-- =====================================================
-- 6. PREVENT BANNED USERS FROM POSTING
-- =====================================================

-- Function to check if user is not banned
CREATE OR REPLACE FUNCTION is_not_banned()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND is_banned = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update discussion insert policy to prevent banned users
DROP POLICY IF EXISTS "Authenticated users can insert discussions" ON public.forum_discussions;
CREATE POLICY "Authenticated users can insert discussions"
    ON public.forum_discussions
    FOR INSERT
    WITH CHECK (auth.uid() = author_id AND is_not_banned());

-- Update post insert policy to prevent banned users
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.forum_posts;
CREATE POLICY "Authenticated users can insert posts"
    ON public.forum_posts
    FOR INSERT
    WITH CHECK (auth.uid() = author_id AND is_not_banned());

-- =====================================================
-- 7. CREATE MODERATION STATISTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW moderation_stats AS
SELECT
    COUNT(*) FILTER (WHERE action_type IN ('pin', 'unpin')) as total_pin_actions,
    COUNT(*) FILTER (WHERE action_type IN ('lock', 'unlock')) as total_lock_actions,
    COUNT(*) FILTER (WHERE action_type = 'delete_discussion') as total_discussion_deletions,
    COUNT(*) FILTER (WHERE action_type = 'delete_post') as total_post_deletions,
    COUNT(*) FILTER (WHERE action_type IN ('ban_user', 'unban_user')) as total_ban_actions,
    COUNT(DISTINCT moderator_id) as active_moderators,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as actions_last_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as actions_last_7d
FROM public.moderation_logs;

-- Grant select on view to authenticated users with moderator role
GRANT SELECT ON moderation_stats TO authenticated;

-- =====================================================
-- 8. CREATE FUNCTION TO LOG MODERATION ACTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION log_moderation_action(
    p_action_type TEXT,
    p_target_type TEXT,
    p_target_id UUID,
    p_reason TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    -- Only allow moderators/admins to log actions
    IF NOT is_moderator_or_admin() THEN
        RAISE EXCEPTION 'Only moderators and admins can log moderation actions';
    END IF;

    INSERT INTO public.moderation_logs (
        moderator_id,
        action_type,
        target_type,
        target_id,
        reason,
        metadata
    ) VALUES (
        auth.uid(),
        p_action_type,
        p_target_type,
        p_target_id,
        p_reason,
        p_metadata
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant execute on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_moderator_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_not_banned() TO authenticated;
GRANT EXECUTE ON FUNCTION log_moderation_action(TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;

-- =====================================================
-- 10. CREATE INITIAL ADMIN USER (OPTIONAL)
-- =====================================================
-- Uncomment and replace with your user ID to make yourself admin:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';

-- =====================================================
-- NOTES
-- =====================================================
-- After running this migration:
-- 1. Update at least one user to 'admin' role manually in Supabase dashboard
-- 2. Moderators can: pin, lock, delete discussions/posts
-- 3. Admins can: do everything moderators can + manage user roles + ban users
-- 4. Banned users cannot create discussions or posts
-- 5. All moderation actions are logged in moderation_logs table
