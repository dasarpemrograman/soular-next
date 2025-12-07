-- ============================================
-- HOUR 4: Films Table
-- ============================================
-- This migration creates the films table with categories and YouTube URLs
-- and sets up Row Level Security (RLS) policies

-- ============================================
-- FILMS TABLE
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
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
-- Index for faster lookups by slug
CREATE INDEX IF NOT EXISTS films_slug_idx ON public.films(slug);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS films_category_idx ON public.films(category);

-- Index for year filtering
CREATE INDEX IF NOT EXISTS films_year_idx ON public.films(year);

-- Index for premium films
CREATE INDEX IF NOT EXISTS films_premium_idx ON public.films(is_premium) WHERE is_premium = true;

-- Full-text search index on title and description
CREATE INDEX IF NOT EXISTS films_search_idx ON public.films USING gin(to_tsvector('indonesian', title || ' ' || COALESCE(description, '')));

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on films table
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all films (public read)
CREATE POLICY "Films are viewable by everyone"
  ON public.films
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert films
CREATE POLICY "Authenticated users can insert films"
  ON public.films
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update films
CREATE POLICY "Authenticated users can update films"
  ON public.films
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete films
CREATE POLICY "Authenticated users can delete films"
  ON public.films
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
DROP TRIGGER IF EXISTS on_film_updated ON public.films;
CREATE TRIGGER on_film_updated
  BEFORE UPDATE ON public.films
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_film_views(film_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.films
  SET view_count = view_count + 1
  WHERE id = film_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- SAMPLE DATA
-- ============================================
-- Insert sample films (only if table is empty)
INSERT INTO public.films (title, slug, description, director, year, duration, category, youtube_url, thumbnail, is_premium)
SELECT * FROM (VALUES
  (
    'Kisah Kota Yang Terlupakan',
    'kisah-kota-yang-terlupakan',
    'Sebuah dokumenter mendalam tentang transformasi Bandung dari masa kolonial hingga era digital, melalui mata para seniman lokal.',
    'Rina Kartika',
    2024,
    95,
    'Dokumenter',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop',
    true
  ),
  (
    'Melodi Nusantara',
    'melodi-nusantara',
    'Perjalanan musikal yang mengeksplorasi kekayaan musik tradisional Indonesia dari Sabang sampai Merauke.',
    'Ahmad Fadli',
    2024,
    108,
    'Musikal',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=900&fit=crop',
    true
  ),
  (
    'Jejak Rimba',
    'jejak-rimba',
    'Petualangan visual yang mengikuti ekspedisi peneliti muda ke jantung hutan Indonesia.',
    'Maya Sari',
    2023,
    92,
    'Petualangan',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600&h=900&fit=crop',
    false
  ),
  (
    'Suara Dari Timur',
    'suara-dari-timur',
    'Drama keluarga yang mengangkat isu identitas dan akar budaya di Papua.',
    'Budi Santoso',
    2024,
    115,
    'Drama',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop',
    true
  ),
  (
    'Bayangan Masa Lalu',
    'bayangan-masa-lalu',
    'Thriller psikologis tentang seorang jurnalis yang menyelidiki kasus hilangnya sebuah desa.',
    'Dian Sastro',
    2023,
    98,
    'Thriller',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop',
    false
  ),
  (
    'Cahaya Di Ufuk Timur',
    'cahaya-di-ufuk-timur',
    'Kisah inspiratif seorang guru yang mengabdikan hidupnya untuk pendidikan di daerah terpencil.',
    'Joko Anwar',
    2024,
    103,
    'Drama',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=900&fit=crop',
    true
  ),
  (
    'Resonansi',
    'resonansi',
    'Film eksperimental yang mengeksplorasi hubungan antara suara, cahaya, dan emosi manusia.',
    'Kamila Andini',
    2023,
    87,
    'Eksperimental',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600&h=900&fit=crop',
    false
  ),
  (
    'Warisan Leluhur',
    'warisan-leluhur',
    'Dokumenter tentang upaya pelestarian tradisi dan kearifan lokal di berbagai suku di Indonesia.',
    'Garin Nugroho',
    2024,
    120,
    'Dokumenter',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&h=900&fit=crop',
    true
  ),
  (
    'Tawa Di Tengah Badai',
    'tawa-di-tengah-badai',
    'Komedi situasi yang menggambarkan kehidupan sehari-hari keluarga urban di Jakarta.',
    'Raditya Dika',
    2024,
    95,
    'Komedi',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop',
    false
  ),
  (
    'Misteri Pulau Terlarang',
    'misteri-pulau-terlarang',
    'Horor supernatural tentang sekelompok peneliti yang terjebak di pulau berhantu.',
    'Joko Anwar',
    2023,
    102,
    'Horor',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop',
    false
  )
) AS v(title, slug, description, director, year, duration, category, youtube_url, thumbnail, is_premium)
WHERE NOT EXISTS (SELECT 1 FROM public.films LIMIT 1);

-- ============================================
-- COMMENTS (for documentation)
-- ============================================
COMMENT ON TABLE public.films IS 'Films catalog with YouTube URLs for streaming';
COMMENT ON COLUMN public.films.id IS 'Unique film identifier';
COMMENT ON COLUMN public.films.title IS 'Film title';
COMMENT ON COLUMN public.films.slug IS 'URL-friendly slug for routing';
COMMENT ON COLUMN public.films.description IS 'Film synopsis/description';
COMMENT ON COLUMN public.films.director IS 'Director name';
COMMENT ON COLUMN public.films.year IS 'Release year';
COMMENT ON COLUMN public.films.duration IS 'Film duration in minutes';
COMMENT ON COLUMN public.films.category IS 'Film category/genre';
COMMENT ON COLUMN public.films.youtube_url IS 'YouTube video URL for streaming';
COMMENT ON COLUMN public.films.thumbnail IS 'Film poster/thumbnail URL';
COMMENT ON COLUMN public.films.is_premium IS 'Premium content flag';
COMMENT ON COLUMN public.films.view_count IS 'Number of views';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Grant access to authenticated users
GRANT ALL ON public.films TO authenticated;

-- Grant read access to anon users
GRANT SELECT ON public.films TO anon;
