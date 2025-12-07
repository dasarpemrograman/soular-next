-- ============================================
-- SOULAR NEXT - COMPLETE SCHEMA MIGRATION
-- ============================================
-- This migration creates the complete database schema for Soular Next
-- Consolidates all tables, RLS policies, triggers, and functions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Extends auth.users with additional user information

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar TEXT,
  bio TEXT,
  is_premium BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  banned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS profiles_name_idx ON public.profiles(name);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_premium_idx ON public.profiles(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role) WHERE role IN ('moderator', 'admin');
CREATE INDEX IF NOT EXISTS profiles_banned_idx ON public.profiles(is_banned) WHERE is_banned = true;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := COALESCE(
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')),
    'user_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
  );

  final_username := base_username;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Helper function: Get current user profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  id UUID, name TEXT, username TEXT, email TEXT, avatar TEXT,
  bio TEXT, is_premium BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY SELECT p.id, p.name, p.username, p.email, p.avatar, p.bio,
    p.is_premium, p.created_at, p.updated_at
  FROM public.profiles p WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. FILMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  director TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT NOT NULL CHECK (category IN ('Dokumenter', 'Drama', 'Eksperimental', 'Musikal', 'Thriller', 'Horor', 'Komedi', 'Petualangan')),
  youtube_url TEXT NOT NULL,
  thumbnail TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for films
CREATE INDEX IF NOT EXISTS films_slug_idx ON public.films(slug);
CREATE INDEX IF NOT EXISTS films_category_idx ON public.films(category);
CREATE INDEX IF NOT EXISTS films_year_idx ON public.films(year);
CREATE INDEX IF NOT EXISTS films_premium_idx ON public.films(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS films_published_idx ON public.films(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS films_search_idx ON public.films USING gin(to_tsvector('indonesian', title || ' ' || COALESCE(description, '')));

-- Enable RLS
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;

-- RLS Policies for films
CREATE POLICY "Films are viewable by everyone"
  ON public.films FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert films"
  ON public.films FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update films"
  ON public.films FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete films"
  ON public.films FOR DELETE TO authenticated USING (true);

-- Trigger: Update updated_at
DROP TRIGGER IF EXISTS on_film_updated ON public.films;
CREATE TRIGGER on_film_updated
  BEFORE UPDATE ON public.films
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Helper function: Increment view count
CREATE OR REPLACE FUNCTION public.increment_film_views(film_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.films SET view_count = view_count + 1 WHERE id = film_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. USER FAVORITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_film_id ON public.user_favorites(film_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at DESC);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. EVENTS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'screening', 'discussion', 'networking', 'other')),
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  online_link TEXT,
  max_participants INTEGER,
  image_url TEXT,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON public.events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Event hosts can update their events"
  ON public.events FOR UPDATE TO authenticated
  USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Event hosts can delete their events"
  ON public.events FOR DELETE TO authenticated USING (auth.uid() = host_id);

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Event Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled', 'waitlist')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view event registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = event_registrations.event_id AND events.host_id = auth.uid()));

CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their registrations"
  ON public.event_registrations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registrations"
  ON public.event_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Event helper functions
CREATE OR REPLACE FUNCTION public.get_event_participant_count(event_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.event_registrations
  WHERE event_id = event_uuid AND status IN ('registered', 'attended');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.is_event_full(event_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT CASE WHEN e.max_participants IS NULL THEN false
    ELSE public.get_event_participant_count(event_uuid) >= e.max_participants END
  FROM public.events e WHERE e.id = event_uuid;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 5. FORUM TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.forum_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('general', 'filmmaking', 'technical', 'showcase', 'feedback', 'events', 'other')),
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_discussions_author ON public.forum_discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_discussions_category ON public.forum_discussions(category);
CREATE INDEX IF NOT EXISTS idx_forum_discussions_last_activity ON public.forum_discussions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_discussions_pinned ON public.forum_discussions(is_pinned) WHERE is_pinned = true;

ALTER TABLE public.forum_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussions are viewable by everyone"
  ON public.forum_discussions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert discussions"
  ON public.forum_discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own discussions"
  ON public.forum_discussions FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own discussions"
  ON public.forum_discussions FOR DELETE TO authenticated USING (auth.uid() = author_id);

DROP TRIGGER IF EXISTS on_discussion_updated ON public.forum_discussions;
CREATE TRIGGER on_discussion_updated
  BEFORE UPDATE ON public.forum_discussions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Forum Posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.forum_discussions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_discussion ON public.forum_posts(discussion_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON public.forum_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Forum Discussion Likes
CREATE TABLE IF NOT EXISTS public.forum_discussion_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.forum_discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_discussion_likes_discussion ON public.forum_discussion_likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_forum_discussion_likes_user ON public.forum_discussion_likes(user_id);

ALTER TABLE public.forum_discussion_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussion likes are viewable by everyone"
  ON public.forum_discussion_likes FOR SELECT USING (true);

CREATE POLICY "Users can create their own discussion likes"
  ON public.forum_discussion_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussion likes"
  ON public.forum_discussion_likes FOR DELETE USING (auth.uid() = user_id);

-- Forum Post Likes
CREATE TABLE IF NOT EXISTS public.forum_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_post_likes_post ON public.forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_user ON public.forum_post_likes(user_id);

ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post likes are viewable by everyone"
  ON public.forum_post_likes FOR SELECT USING (true);

CREATE POLICY "Users can create their own post likes"
  ON public.forum_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes"
  ON public.forum_post_likes FOR DELETE USING (auth.uid() = user_id);

-- Forum triggers for counts
CREATE OR REPLACE FUNCTION update_discussion_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_discussions SET like_count = like_count + 1 WHERE id = NEW.discussion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_discussions SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.discussion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_discussion_like_count ON public.forum_discussion_likes;
CREATE TRIGGER trigger_update_discussion_like_count
  AFTER INSERT OR DELETE ON public.forum_discussion_likes
  FOR EACH ROW EXECUTE FUNCTION update_discussion_like_count();

CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_like_count ON public.forum_post_likes;
CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON public.forum_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE OR REPLACE FUNCTION update_discussion_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_discussions
    SET reply_count = reply_count + 1, last_activity_at = NOW()
    WHERE id = NEW.discussion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_discussions
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.discussion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_discussion_reply_count ON public.forum_posts;
CREATE TRIGGER trigger_update_discussion_reply_count
  AFTER INSERT OR DELETE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_discussion_reply_count();

-- ============================================
-- 6. COLLECTIONS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  film_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_published ON public.collections(is_published);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections viewable by all"
  ON public.collections FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.film_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(film_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_film_collections_film ON public.film_collections(film_id);
CREATE INDEX IF NOT EXISTS idx_film_collections_collection ON public.film_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_film_collections_order ON public.film_collections(collection_id, display_order);

ALTER TABLE public.film_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Film collections viewable by all"
  ON public.film_collections FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION update_collection_film_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.collections SET film_count = film_count + 1, updated_at = NOW() WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.collections SET film_count = GREATEST(film_count - 1, 0), updated_at = NOW() WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_collection_film_count ON public.film_collections;
CREATE TRIGGER trigger_update_collection_film_count
  AFTER INSERT OR DELETE ON public.film_collections
  FOR EACH ROW EXECUTE FUNCTION update_collection_film_count();

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'like', 'discussion_pinned', 'discussion_locked', 'post_deleted', 'user_banned', 'role_changed', 'event_reminder', 'event_cancelled')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. USER SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  email_on_reply BOOLEAN DEFAULT TRUE,
  email_on_mention BOOLEAN DEFAULT TRUE,
  email_on_like BOOLEAN DEFAULT FALSE,
  email_on_event BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  push_on_reply BOOLEAN DEFAULT TRUE,
  push_on_mention BOOLEAN DEFAULT TRUE,
  push_on_like BOOLEAN DEFAULT FALSE,
  push_on_event BOOLEAN DEFAULT TRUE,
  show_email BOOLEAN DEFAULT FALSE,
  show_activity BOOLEAN DEFAULT TRUE,
  allow_mentions BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language VARCHAR(10) DEFAULT 'id' CHECK (language IN ('id', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 9. MODERATION LOGS TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator ON public.moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON public.moderation_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created ON public.moderation_logs(created_at DESC);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- 11. HELPER FUNCTIONS
-- ============================================

-- Role check functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_moderator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_not_banned()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notification functions
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID, p_type TEXT, p_title TEXT, p_message TEXT,
  p_link TEXT DEFAULT NULL, p_actor_id UUID DEFAULT NULL, p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_notification_id UUID;
BEGIN
  IF p_user_id = p_actor_id THEN RETURN NULL; END IF;
  INSERT INTO public.notifications (user_id, type, title, message, link, actor_id, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_actor_id, p_metadata)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.notifications SET is_read = TRUE
  WHERE id = p_notification_id AND user_id = auth.uid();
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.notifications
  WHERE user_id = auth.uid() AND is_read = FALSE;
  RETURN v_count;
END;
$$;

-- ============================================
-- 12. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated, service_role;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
