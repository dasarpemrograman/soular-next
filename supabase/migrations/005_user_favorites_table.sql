-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, film_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_film_id ON public.user_favorites(film_id);
CREATE INDEX idx_user_favorites_created_at ON public.user_favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
    ON public.user_favorites
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can add their own favorites"
    ON public.user_favorites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
    ON public.user_favorites
    FOR DELETE
    USING (auth.uid() = user_id);

-- Helper function to check if a film is favorited by the current user
CREATE OR REPLACE FUNCTION public.is_film_favorited(film_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_favorites
        WHERE user_id = auth.uid()
        AND film_id = film_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's favorite films
CREATE OR REPLACE FUNCTION public.get_user_favorites(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    youtube_url TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    favorited_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.title,
        f.description,
        f.category,
        f.youtube_url,
        f.thumbnail_url,
        f.duration_minutes,
        f.created_at,
        uf.created_at as favorited_at
    FROM public.films f
    INNER JOIN public.user_favorites uf ON f.id = uf.film_id
    WHERE uf.user_id = user_uuid
    ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON public.user_favorites TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_film_favorited(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_favorites(UUID) TO authenticated;
