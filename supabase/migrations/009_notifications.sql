-- ============================================
-- HOUR 33: Notifications System Migration
-- ============================================
-- Creates notifications table and related functions

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'reply',
        'mention',
        'like',
        'discussion_pinned',
        'discussion_locked',
        'post_deleted',
        'user_banned',
        'role_changed',
        'event_reminder',
        'event_cancelled'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Add comment
COMMENT ON TABLE public.notifications IS 'User notifications for various platform events';

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- System can insert notifications for any user
-- (This will be done via service role key in the backend)
CREATE POLICY "Service role can insert notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    -- Don't create notification if user is the actor
    IF p_user_id = p_actor_id THEN
        RETURN NULL;
    END IF;

    -- Insert notification
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        link,
        actor_id,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_link,
        p_actor_id,
        p_metadata
    ) RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE
    WHERE id = p_notification_id
    AND user_id = auth.uid();

    RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE
    WHERE user_id = auth.uid()
    AND is_read = FALSE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM public.notifications
    WHERE user_id = auth.uid()
    AND is_read = FALSE;

    RETURN v_count;
END;
$$;

-- Function to delete old read notifications (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE is_read = TRUE
    AND created_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- ============================================
-- TRIGGERS FOR AUTO-NOTIFICATIONS
-- ============================================

-- Trigger function to notify on new reply
CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_discussion_title TEXT;
    v_discussion_author_id UUID;
    v_actor_username TEXT;
BEGIN
    -- Get discussion info
    SELECT title, author_id
    INTO v_discussion_title, v_discussion_author_id
    FROM public.forum_discussions
    WHERE id = NEW.discussion_id;

    -- Get actor username
    SELECT username
    INTO v_actor_username
    FROM public.profiles
    WHERE id = NEW.author_id;

    -- Notify discussion author (if not the one who replied)
    IF v_discussion_author_id != NEW.author_id THEN
        PERFORM create_notification(
            v_discussion_author_id,
            'reply',
            'New reply on your discussion',
            v_actor_username || ' replied to "' || v_discussion_title || '"',
            '/forum/' || NEW.discussion_id,
            NEW.author_id,
            jsonb_build_object(
                'discussion_id', NEW.discussion_id,
                'post_id', NEW.id
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for replies (only if forum_posts table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'forum_posts'
    ) THEN
        DROP TRIGGER IF EXISTS trigger_notify_on_reply ON public.forum_posts;
        CREATE TRIGGER trigger_notify_on_reply
            AFTER INSERT ON public.forum_posts
            FOR EACH ROW
            EXECUTE FUNCTION notify_on_reply();
    END IF;
END $$;

-- Trigger function to notify on discussion like
CREATE OR REPLACE FUNCTION notify_on_discussion_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_discussion_title TEXT;
    v_discussion_author_id UUID;
    v_actor_username TEXT;
BEGIN
    -- Get discussion info
    SELECT title, author_id
    INTO v_discussion_title, v_discussion_author_id
    FROM public.forum_discussions
    WHERE id = NEW.discussion_id;

    -- Get actor username
    SELECT username
    INTO v_actor_username
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Notify discussion author
    IF v_discussion_author_id != NEW.user_id THEN
        PERFORM create_notification(
            v_discussion_author_id,
            'like',
            'Someone liked your discussion',
            v_actor_username || ' liked "' || v_discussion_title || '"',
            '/forum/' || NEW.discussion_id,
            NEW.user_id,
            jsonb_build_object(
                'discussion_id', NEW.discussion_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for discussion likes (only if forum_discussion_likes table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'forum_discussion_likes'
    ) THEN
        DROP TRIGGER IF EXISTS trigger_notify_on_discussion_like ON public.forum_discussion_likes;
        CREATE TRIGGER trigger_notify_on_discussion_like
            AFTER INSERT ON public.forum_discussion_likes
            FOR EACH ROW
            EXECUTE FUNCTION notify_on_discussion_like();
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.notifications TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications TO postgres, service_role;
