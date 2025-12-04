-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'curator', 'admin')),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Films table
CREATE TABLE IF NOT EXISTS films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  synopsis TEXT,
  description TEXT,
  director TEXT,
  year INTEGER,
  duration INTEGER, -- in minutes
  genre TEXT[],
  tags TEXT[],
  language TEXT,
  country TEXT,
  poster_url TEXT,
  thumbnail_url TEXT,
  video_url TEXT, -- HLS playlist URL (m3u8)
  trailer_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  curator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Film cast and crew
CREATE TABLE IF NOT EXISTS film_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('actor', 'director', 'producer', 'writer', 'cinematographer', 'editor', 'composer')),
  character_name TEXT, -- for actors
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User film favorites
CREATE TABLE IF NOT EXISTS film_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id)
);

-- User film ratings
CREATE TABLE IF NOT EXISTS film_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id)
);

-- Watch progress tracking
CREATE TABLE IF NOT EXISTS watch_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  location TEXT,
  location_type TEXT CHECK (location_type IN ('online', 'offline', 'hybrid')),
  event_type TEXT CHECK (event_type IN ('screening', 'workshop', 'discussion', 'festival', 'other')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  image_url TEXT,
  capacity INTEGER,
  attendee_count INTEGER DEFAULT 0,
  registration_url TEXT,
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2),
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registration_data JSONB, -- for storing additional form data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Forum threads
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'film-discussion', 'technical', 'events', 'feedback')),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum posts (replies to threads)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE, -- for nested replies
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Film collections/playlists
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  curator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Films in collections
CREATE TABLE IF NOT EXISTS collection_films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, film_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_films_curator ON films(curator_id);
CREATE INDEX IF NOT EXISTS idx_films_published ON films(is_published);
CREATE INDEX IF NOT EXISTS idx_films_slug ON films(slug);
CREATE INDEX IF NOT EXISTS idx_films_genre ON films USING GIN(genre);
CREATE INDEX IF NOT EXISTS idx_films_tags ON films USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_film_credits_film ON film_credits(film_id);
CREATE INDEX IF NOT EXISTS idx_film_favorites_user ON film_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_film_favorites_film ON film_favorites(film_id);
CREATE INDEX IF NOT EXISTS idx_film_ratings_user ON film_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_film_ratings_film ON film_ratings(film_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user ON watch_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_collections_curator ON collections(curator_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collection_films_collection ON collection_films(collection_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Films policies
CREATE POLICY "Published films are viewable by everyone"
  ON films FOR SELECT
  USING (is_published = true OR curator_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'curator')
  ));

CREATE POLICY "Curators and admins can insert films"
  ON films FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'curator')
  ));

CREATE POLICY "Curators can update own films, admins can update all"
  ON films FOR UPDATE
  USING (
    curator_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete films"
  ON films FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Film credits policies
CREATE POLICY "Film credits are viewable by everyone"
  ON film_credits FOR SELECT
  USING (true);

CREATE POLICY "Curators and admins can manage film credits"
  ON film_credits FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'curator')
  ));

-- Film favorites policies
CREATE POLICY "Users can view own favorites"
  ON film_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favorites"
  ON film_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON film_favorites FOR DELETE
  USING (user_id = auth.uid());

-- Film ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON film_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON film_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ratings"
  ON film_ratings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own ratings"
  ON film_ratings FOR DELETE
  USING (user_id = auth.uid());

-- Watch progress policies
CREATE POLICY "Users can view own watch progress"
  ON watch_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own watch progress"
  ON watch_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own watch progress"
  ON watch_progress FOR UPDATE
  USING (user_id = auth.uid());

-- Events policies
CREATE POLICY "Published events are viewable by everyone"
  ON events FOR SELECT
  USING (is_published = true OR organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'curator')
  ));

CREATE POLICY "Curators and admins can insert events"
  ON events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'curator')
  ));

CREATE POLICY "Organizers can update own events, admins can update all"
  ON events FOR UPDATE
  USING (
    organizer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Event registrations policies
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_id AND e.organizer_id = auth.uid()
  ));

CREATE POLICY "Users can insert own registrations"
  ON event_registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own registrations"
  ON event_registrations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own registrations"
  ON event_registrations FOR DELETE
  USING (user_id = auth.uid());

-- Forum threads policies
CREATE POLICY "Forum threads are viewable by everyone"
  ON forum_threads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors and admins can update threads"
  ON forum_threads FOR UPDATE
  USING (
    author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete threads"
  ON forum_threads FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Forum posts policies
CREATE POLICY "Forum posts are viewable by everyone"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors and admins can update posts"
  ON forum_posts FOR UPDATE
  USING (
    author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authors and admins can delete posts"
  ON forum_posts FOR DELETE
  USING (
    author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Collections policies
CREATE POLICY "Public collections are viewable by everyone"
  ON collections FOR SELECT
  USING (is_public = true OR curator_id = auth.uid());

CREATE POLICY "Authenticated users can create collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Curators can update own collections"
  ON collections FOR UPDATE
  USING (curator_id = auth.uid());

CREATE POLICY "Curators can delete own collections"
  ON collections FOR DELETE
  USING (curator_id = auth.uid());

-- Collection films policies
CREATE POLICY "Collection films inherit collection visibility"
  ON collection_films FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM collections c WHERE c.id = collection_id AND (c.is_public = true OR c.curator_id = auth.uid())
  ));

CREATE POLICY "Collection curators can manage films"
  ON collection_films FOR ALL
  USING (EXISTS (
    SELECT 1 FROM collections c WHERE c.id = collection_id AND c.curator_id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_films_updated_at BEFORE UPDATE ON films
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_film_ratings_updated_at BEFORE UPDATE ON film_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update film average rating
CREATE OR REPLACE FUNCTION update_film_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE films
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM film_ratings
    WHERE film_id = COALESCE(NEW.film_id, OLD.film_id)
  )
  WHERE id = COALESCE(NEW.film_id, OLD.film_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_film_rating_on_insert AFTER INSERT ON film_ratings
  FOR EACH ROW EXECUTE FUNCTION update_film_rating();

CREATE TRIGGER update_film_rating_on_update AFTER UPDATE ON film_ratings
  FOR EACH ROW EXECUTE FUNCTION update_film_rating();

CREATE TRIGGER update_film_rating_on_delete AFTER DELETE ON film_ratings
  FOR EACH ROW EXECUTE FUNCTION update_film_rating();

-- Function to update forum thread reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET reply_count = (
    SELECT COUNT(*)
    FROM forum_posts
    WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id)
  ),
  last_activity_at = NOW()
  WHERE id = COALESCE(NEW.thread_id, OLD.thread_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_reply_count_on_insert AFTER INSERT ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

CREATE TRIGGER update_thread_reply_count_on_delete AFTER DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Function to handle new user creation (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_film_views(film_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE films
  SET view_count = view_count + 1
  WHERE id = film_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_thread_views(thread_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_threads
  SET view_count = view_count + 1
  WHERE id = thread_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events
  SET attendee_count = (
    SELECT COUNT(*)
    FROM event_registrations
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
      AND status = 'registered'
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_attendee_count_on_insert AFTER INSERT ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

CREATE TRIGGER update_event_attendee_count_on_update AFTER UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

CREATE TRIGGER update_event_attendee_count_on_delete AFTER DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

-- ============================================================================
-- STORAGE BUCKETS (for reference - create these in Supabase dashboard)
-- ============================================================================

-- Create these buckets in the Supabase dashboard:
-- 1. films (for video files and HLS segments)
-- 2. posters (for film poster images)
-- 3. thumbnails (for film thumbnails)
-- 4. avatars (for user profile pictures)
-- 5. events (for event images)

-- Storage policies should be:
-- - Public read access for all buckets
-- - Authenticated write access for avatars
-- - Curator/admin write access for films, posters, thumbnails, events
