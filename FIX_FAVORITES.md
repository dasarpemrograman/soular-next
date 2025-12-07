# Fix Favorites Function

## Problem
The `get_user_favorites` database function was returning incorrect field names that don't match the actual database schema:
- ❌ `thumbnail_url` (doesn't exist) → ✅ `thumbnail` (actual column)
- ❌ `duration_minutes` (doesn't exist) → ✅ `duration` (actual column)

Additionally, the API was calling the function with the wrong parameter name:
- ❌ `user_id` → ✅ `user_uuid`

## Solution

### 1. Fix Applied to API
Updated `/app/api/favorites/route.ts` to use the correct parameter name:
```typescript
// Before
{ user_id: user.id }

// After
{ user_uuid: user.id }
```

### 2. Fix Needed in Database
The database function needs to be updated to return the correct field names.

## How to Apply Database Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/fix_favorites_function.sql`
4. Click **Run**
5. Verify success message

### Option 2: Using Supabase CLI
```bash
# Navigate to project directory
cd soular-next

# Run the migration
supabase db push --dry-run  # Preview changes
supabase db push            # Apply changes
```

### Option 3: Manual SQL Execution
Run this SQL directly in your Supabase SQL Editor:

```sql
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
```

## Verification

After applying the fix, verify it works:

1. Log in to your application
2. Navigate to `/favorites` page
3. You should see your favorited films without errors
4. Check browser console - no "PGRST202" errors should appear

## What Changed

### Database Function Changes
| Before | After |
|--------|-------|
| `thumbnail_url TEXT` | `thumbnail TEXT` |
| `duration_minutes INTEGER` | `duration INTEGER` |
| Returns non-existent columns | Returns actual database columns |

### API Changes
| Before | After |
|--------|-------|
| `{ user_id: user.id }` | `{ user_uuid: user.id }` |
| Parameter name mismatch | Matches function signature |

## Files Modified
- ✅ `app/api/favorites/route.ts` - API parameter fix
- 📝 `supabase/migrations/013_fix_get_user_favorites_function.sql` - New migration
- 📝 `supabase/fix_favorites_function.sql` - Quick fix SQL

## Related Issues
This fix is part of a larger effort to standardize field names across the application. Similar fixes were applied to:
- Film collection pages
- Film detail pages
- Hero section
- Curated section

All components now use the correct field names: `thumbnail` and `duration`.