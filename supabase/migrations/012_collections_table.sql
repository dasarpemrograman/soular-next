-- Migration: Collections and Film Collections Tables
-- Description: Create tables for thematic film collections
-- Dependencies: 002_films_table.sql

-- ============================================
-- COLLECTIONS TABLE
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_published ON public.collections(is_published);

-- ============================================
-- FILM COLLECTIONS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.film_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(film_id, collection_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_film_collections_film ON public.film_collections(film_id);
CREATE INDEX IF NOT EXISTS idx_film_collections_collection ON public.film_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_film_collections_order ON public.film_collections(collection_id, display_order);

-- ============================================
-- TRIGGER: Update film_count on collections
-- ============================================
CREATE OR REPLACE FUNCTION update_collection_film_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.collections
    SET film_count = film_count + 1,
        updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.collections
    SET film_count = GREATEST(film_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_collection_film_count ON public.film_collections;
CREATE TRIGGER trigger_update_collection_film_count
  AFTER INSERT OR DELETE ON public.film_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_film_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_collections ENABLE ROW LEVEL SECURITY;

-- Collections: Everyone can view published collections
DROP POLICY IF EXISTS "Collections viewable by all" ON public.collections;
CREATE POLICY "Collections viewable by all"
  ON public.collections FOR SELECT
  USING (is_published = true);

-- Collections: Only admins can insert/update/delete
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Film Collections: Everyone can view
DROP POLICY IF EXISTS "Film collections viewable by all" ON public.film_collections;
CREATE POLICY "Film collections viewable by all"
  ON public.film_collections FOR SELECT
  USING (true);

-- Film Collections: Only admins can insert/update/delete
DROP POLICY IF EXISTS "Admins can manage film collections" ON public.film_collections;
CREATE POLICY "Admins can manage film collections"
  ON public.film_collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Insert sample collections
INSERT INTO public.collections (title, slug, description, icon, color, is_published)
VALUES
  (
    'Dokumenter Kota Bandung',
    'dokumenter-kota-bandung',
    'Jelajahi sejarah dan transformasi Kota Kembang',
    'Compass',
    'from-amber-500/20 to-orange-500/20',
    true
  ),
  (
    'Sinema dengan Sentuhan Ajaib',
    'sinema-sentuhan-ajaib',
    'Realisme magis dalam karya sineas Indonesia',
    'Zap',
    'from-teal-500/20 to-cyan-500/20',
    true
  ),
  (
    'Kisah Lokal, Resonansi Global',
    'kisah-lokal-resonansi-global',
    'Cerita dari Indonesia untuk dunia',
    'Heart',
    'from-rose-500/20 to-pink-500/20',
    true
  ),
  (
    'Avant-Garde Indonesia',
    'avant-garde-indonesia',
    'Eksperimen berani sineas kontemporer',
    'Film',
    'from-violet-500/20 to-purple-500/20',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get collections with film count
CREATE OR REPLACE FUNCTION get_collections_with_films()
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  film_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.slug,
    c.description,
    c.icon,
    c.color,
    COUNT(fc.film_id) as film_count,
    c.created_at,
    c.updated_at
  FROM public.collections c
  LEFT JOIN public.film_collections fc ON c.id = fc.collection_id
  WHERE c.is_published = true
  GROUP BY c.id, c.title, c.slug, c.description, c.icon, c.color, c.created_at, c.updated_at
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get films in a collection
CREATE OR REPLACE FUNCTION get_collection_films(collection_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  director TEXT,
  year INTEGER,
  duration INTEGER,
  category TEXT,
  thumbnail TEXT,
  is_premium BOOLEAN,
  rating NUMERIC,
  view_count INTEGER,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.slug,
    f.description,
    f.director,
    f.year,
    f.duration,
    f.category,
    f.thumbnail,
    f.is_premium,
    f.rating,
    f.view_count,
    fc.display_order
  FROM public.films f
  INNER JOIN public.film_collections fc ON f.id = fc.film_id
  INNER JOIN public.collections c ON fc.collection_id = c.id
  WHERE c.slug = collection_slug
    AND c.is_published = true
    AND f.is_published = true
  ORDER BY fc.display_order ASC, f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.collections IS 'Thematic film collections curated by admins';
COMMENT ON TABLE public.film_collections IS 'Junction table linking films to collections';
COMMENT ON FUNCTION update_collection_film_count() IS 'Auto-updates film_count when films are added/removed from collections';
