-- =====================================================
-- FIX GET_USER_FAVORITES FUNCTION
-- =====================================================
-- Quick fix to update the get_user_favorites function to return
-- the correct field names matching the actual database schema

-- Drop the old function
DROP FUNCTION IF EXISTS public.get_user_favorites(UUID);

-- Recreate with correct field names
CREATE OR REPLACE FUNCTION public.get_user_favorites(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    youtube_url TEXT,
    thumbnail TEXT,
    duration INTEGER,
    created_at TIMESTAMPTZ,
    favorited_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.title,
        f.description,
        f.category,
        f.youtube_url,
        f.thumbnail,
        f.duration,
        f.created_at,
        uf.created_at as favorited_at
    FROM public.films f
    INNER JOIN public.user_favorites uf ON f.id = uf.film_id
    WHERE uf.user_id = user_uuid
    ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_favorites(UUID) TO authenticated;
