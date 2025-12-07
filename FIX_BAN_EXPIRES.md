# Fix: Add ban_expires_at Column to Profiles Table

## Problem
The admin users API is trying to select `ban_expires_at` column which doesn't exist in the database, causing a 500 error:

```
Error: column profiles.ban_expires_at does not exist
```

## Solution

### Option 1: Quick Fix (Immediate - Recommended)

Run this SQL in **Supabase SQL Editor**:

```sql
-- Add ban_expires_at column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN public.profiles.ban_expires_at IS 'Timestamp when the ban expires (NULL for permanent bans)';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS profiles_ban_expires_at_idx ON public.profiles(ban_expires_at)
WHERE ban_expires_at IS NOT NULL;
```

**Steps:**
1. Go to https://app.supabase.com → Your Project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the SQL above and paste it
5. Click **Run** (or press Ctrl+Enter)
6. Verify success message appears

### Option 2: Using Migration File

If using Supabase CLI:

```bash
# Apply the migration
supabase db execute < supabase/add_ban_expires_at.sql

# Or if you want to apply all migrations
supabase db reset
```

### Option 3: Full Migration (New Setup)

The migration `014_add_ban_expires_at.sql` has been created and the main schema `100_complete_schema.sql` has been updated.

For fresh database setup:
```bash
supabase db reset
```

## What This Column Does

- **Purpose:** Allows temporary bans that automatically expire
- **Type:** `TIMESTAMPTZ` (timestamp with timezone)
- **Nullable:** YES (NULL means permanent ban)
- **Example Usage:**
  - `ban_expires_at = '2024-12-31 23:59:59+00'` → Ban expires on Dec 31, 2024
  - `ban_expires_at = NULL` → Permanent ban

## Bonus: Auto-Unban Function

The migration also includes a function to automatically unban expired users:

```sql
-- Call this function manually or via cron job
SELECT public.unban_expired_users();
```

This function:
- Finds all users where `is_banned = true` and `ban_expires_at < NOW()`
- Sets `is_banned = false` and clears ban fields
- Returns count of users unbanned

### Setting Up Auto-Unban (Optional)

You can set up a Supabase Edge Function or cron job to run this daily:

```sql
-- In Supabase, you can use pg_cron extension
-- (Needs to be enabled by Supabase support for hosted projects)
```

## Verification

After running the SQL, verify the column exists:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'ban_expires_at';
```

Expected result:
```
column_name      | data_type                   | is_nullable
-----------------+-----------------------------+-------------
ban_expires_at   | timestamp with time zone    | YES
```

## Testing

1. **Restart your Next.js dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Test the admin users page:**
   - Navigate to http://localhost:3000/admin/users
   - The page should load without errors
   - Users list should display correctly

3. **Test banning a user with expiration:**
   - Click "Ban User" on any user
   - Enter a ban reason
   - Enter duration in days (e.g., 7)
   - Submit
   - Check the user's profile - `ban_expires_at` should be set

## Files Modified

- ✅ `supabase/migrations/014_add_ban_expires_at.sql` (new migration)
- ✅ `supabase/add_ban_expires_at.sql` (quick-fix SQL)
- ✅ `supabase/migrations/100_complete_schema.sql` (updated main schema)

## Schema Difference

**Before:**
```sql
CREATE TABLE public.profiles (
  ...
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  banned_by UUID REFERENCES public.profiles(id),
  ...
);
```

**After:**
```sql
CREATE TABLE public.profiles (
  ...
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires_at TIMESTAMPTZ,  -- NEW COLUMN
  banned_at TIMESTAMPTZ,
  banned_by UUID REFERENCES public.profiles(id),
  ...
);
```

## Related Files

The following files use `ban_expires_at`:
- `app/api/admin/users/route.ts` - Fetches the column
- `app/api/admin/users/[userId]/ban/route.ts` - Sets the expiration date
- `app/admin/users/page.tsx` - Displays expiration date in UI
- `hooks/useAdmin.ts` - TypeScript interface includes the field

All these files are already configured correctly and will work once the column is added.

---

**Status:** 🔴 Action Required  
**Priority:** High (blocks admin users page)  
**Time to Fix:** < 1 minute (run the SQL)  
**Impact:** After fix, admin panel will work completely