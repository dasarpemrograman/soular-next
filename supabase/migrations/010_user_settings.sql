-- ============================================
-- HOUR 35: User Settings & Preferences Migration
-- ============================================
-- Creates user_settings table for preferences and notification settings

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    email_on_reply BOOLEAN DEFAULT TRUE,
    email_on_mention BOOLEAN DEFAULT TRUE,
    email_on_like BOOLEAN DEFAULT FALSE,
    email_on_event BOOLEAN DEFAULT TRUE,
    email_on_moderation BOOLEAN DEFAULT TRUE,

    push_notifications BOOLEAN DEFAULT TRUE,
    push_on_reply BOOLEAN DEFAULT TRUE,
    push_on_mention BOOLEAN DEFAULT TRUE,
    push_on_like BOOLEAN DEFAULT FALSE,
    push_on_event BOOLEAN DEFAULT TRUE,
    push_on_moderation BOOLEAN DEFAULT TRUE,

    -- Privacy settings
    show_email BOOLEAN DEFAULT FALSE,
    show_activity BOOLEAN DEFAULT TRUE,
    allow_mentions BOOLEAN DEFAULT TRUE,
    allow_direct_messages BOOLEAN DEFAULT TRUE,

    -- Display preferences
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'id' CHECK (language IN ('id', 'en')),
    posts_per_page INTEGER DEFAULT 20 CHECK (posts_per_page BETWEEN 10 AND 100),

    -- Email digest
    email_digest VARCHAR(20) DEFAULT 'daily' CHECK (email_digest IN ('never', 'daily', 'weekly')),
    digest_day INTEGER DEFAULT 1 CHECK (digest_day BETWEEN 0 AND 6), -- 0 = Sunday

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_user_settings_email_digest ON public.user_settings(email_digest) WHERE email_digest != 'never';

-- Add comment
COMMENT ON TABLE public.user_settings IS 'User preferences and notification settings';

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings"
    ON public.user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
    ON public.user_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
    ON public.user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete own settings"
    ON public.user_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get or create user settings
CREATE OR REPLACE FUNCTION get_or_create_user_settings(p_user_id UUID)
RETURNS public.user_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_settings public.user_settings;
BEGIN
    -- Try to get existing settings
    SELECT * INTO v_settings
    FROM public.user_settings
    WHERE user_id = p_user_id;

    -- If not found, create default settings
    IF NOT FOUND THEN
        INSERT INTO public.user_settings (user_id)
        VALUES (p_user_id)
        RETURNING * INTO v_settings;
    END IF;

    RETURN v_settings;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trigger_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- Function to check if user allows specific notification type
CREATE OR REPLACE FUNCTION should_send_notification(
    p_user_id UUID,
    p_notification_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_settings public.user_settings;
    v_should_send BOOLEAN := TRUE;
BEGIN
    -- Get user settings
    SELECT * INTO v_settings
    FROM public.user_settings
    WHERE user_id = p_user_id;

    -- If no settings found, assume user wants notifications
    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;

    -- Check if push notifications are enabled
    IF NOT v_settings.push_notifications THEN
        RETURN FALSE;
    END IF;

    -- Check specific notification type
    CASE p_notification_type
        WHEN 'reply' THEN
            v_should_send := v_settings.push_on_reply;
        WHEN 'mention' THEN
            v_should_send := v_settings.push_on_mention;
        WHEN 'like' THEN
            v_should_send := v_settings.push_on_like;
        WHEN 'event_reminder', 'event_cancelled' THEN
            v_should_send := v_settings.push_on_event;
        WHEN 'user_banned', 'role_changed', 'discussion_pinned', 'discussion_locked', 'post_deleted' THEN
            v_should_send := v_settings.push_on_moderation;
        ELSE
            v_should_send := TRUE;
    END CASE;

    RETURN v_should_send;
END;
$$;

-- Function to check if user allows mentions
CREATE OR REPLACE FUNCTION user_allows_mentions(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_allow_mentions BOOLEAN;
BEGIN
    SELECT allow_mentions INTO v_allow_mentions
    FROM public.user_settings
    WHERE user_id = p_user_id;

    -- If no settings found, default to TRUE
    RETURN COALESCE(v_allow_mentions, TRUE);
END;
$$;

-- ============================================
-- UPDATE NOTIFICATION CREATION FUNCTION
-- ============================================
-- Update the create_notification function to check user preferences

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
    v_should_send BOOLEAN;
BEGIN
    -- Don't create notification if user is the actor
    IF p_user_id = p_actor_id THEN
        RETURN NULL;
    END IF;

    -- Check if user wants this type of notification
    v_should_send := should_send_notification(p_user_id, p_type);

    IF NOT v_should_send THEN
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

-- ============================================
-- DEFAULT SETTINGS FOR EXISTING USERS
-- ============================================
-- Create default settings for users who don't have them yet

INSERT INTO public.user_settings (user_id)
SELECT p.id
FROM public.profiles p
LEFT JOIN public.user_settings s ON p.id = s.user_id
WHERE s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_settings TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_user_settings TO authenticated;
GRANT EXECUTE ON FUNCTION should_send_notification TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION user_allows_mentions TO postgres, authenticated, service_role;
