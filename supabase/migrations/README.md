# Soular Next Database Migrations

This directory contains SQL migration files for the Soular Next application database (Supabase/PostgreSQL).

## Migration Order

Run these migrations in order:

1. **001_profiles_table.sql** - Creates profiles table with RLS policies
2. **002_films_table.sql** - Creates films table and related tables
3. **003_events_table.sql** - Creates events and event registrations tables
4. **004_forum_table.sql** - Creates forum discussions, posts, and likes tables
5. **005_user_favorites_table.sql** - Creates user favorites table
6. **006_storage_avatars.sql** - Sets up storage bucket for user avatars
7. **007_fix_forum_fkeys.sql** - ⚠️ **REQUIRED FIX** - Updates forum foreign keys to reference profiles instead of auth.users
8. **008_admin_roles.sql** - Adds admin/moderator roles, bans, and moderation logging (Hour 30)
9. **009_notifications.sql** - Creates notification system with auto-triggers (Hours 33-34)
10. **010_user_settings.sql** - Creates user settings and preferences table (Hour 35)
11. **011_add_username_email_to_profiles.sql** - ⚠️ **REQUIRED FIX** - Adds username and email columns to profiles
12. **012_collections_table.sql** - Creates collections and film_collections tables (Hour 37)

## How to Apply Migrations

### Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the content of each migration file (in order)
5. Click **Run** to execute
6. Verify success before moving to the next migration

### Using Supabase CLI

```bash
# Apply all migrations
supabase db push

# Or apply individually
supabase db execute < supabase/migrations/001_profiles_table.sql
supabase db execute < supabase/migrations/002_films_table.sql
# ... etc
```

## ⚠️ Important Notes

### Migration 007 (Fix Forum Foreign Keys)

**This migration is CRITICAL for the forum to work properly.**

If you've already run migration 004 and the forum is giving foreign key errors, you MUST run migration 007 to fix the relationships.

**What it does:**
- Drops old foreign key constraints that referenced `auth.users`
- Creates new foreign key constraints that reference `public.profiles`
- Creates the `forum_discussion_likes` table (needed for like functionality)
- Adds `like_count` column to discussions
- Sets up triggers to auto-update like counts
- Adds RLS policies for discussion likes

### Migration 008 (Admin Roles & Moderation)

**Added in Hour 30 for moderation features.**

**What it does:**
- Adds `role` column to profiles (user/moderator/admin)
- Adds ban fields to profiles (is_banned, ban_reason, ban_expires_at)
- Creates `moderation_logs` table for tracking all moderation actions
- Adds helper functions: `is_admin()`, `is_moderator_or_admin()`, `is_not_banned()`
- Creates `moderation_stats` view for dashboard
- Updates RLS policies to respect roles and bans

**After running:**
Set at least one user as admin:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

### Migration 009 (Notifications System)

**Added in Hours 33-34 for real-time notifications.**

**What it does:**
- Creates `notifications` table with RLS policies
- Adds auto-notification triggers for forum replies and likes
- Creates helper functions: `create_notification()`, `mark_notification_read()`, `mark_all_notifications_read()`
- Supports notification types: reply, mention, like, moderation actions, events
- Includes conditional checks - only creates triggers if forum tables exist

**Features:**
- Users receive notifications when someone replies to their discussion
- Users receive notifications when someone likes their discussion
- Notifications include actor info and clickable links
- Auto-cleanup function for old read notifications (30 days)

### Migration 010 (User Settings & Preferences)

**Added in Hour 35 for user customization.**

**What it does:**
- Creates `user_settings` table with comprehensive preferences
- Email notification preferences (per notification type)
- Push notification preferences (per notification type)
- Privacy settings (show email, show activity, allow mentions, allow DMs)
- Display preferences (theme, language, posts per page)
- Email digest settings (never/daily/weekly)
- Updates notification creation to respect user preferences
- Auto-creates default settings for existing users

**After running:**
All existing users will automatically get default settings created.

### Migration 011 (Username & Email Columns)

**⚠️ CRITICAL FIX - Required for notifications and other features to work.**

**What it does:**
- Adds `username` column to profiles (unique)
- Adds `email` column to profiles
- Populates username from existing name field
- Populates email from auth.users
- Updates `handle_new_user()` function to set username and email on signup
- Ensures unique usernames with auto-incrementing suffix if needed

**Why it's needed:**
Many features (notifications, forum, admin) expect `username` and `email` columns in profiles table, but the original migration only had `name`.

### Migration 012 (Collections System)

**Added in Hour 37 for thematic film collections.**

**What it does:**
- Creates `collections` table for thematic film groupings
- Creates `film_collections` junction table linking films to collections
- Adds auto-counting trigger to update `film_count` on collections
- Includes helper functions: `get_collections_with_films()`, `get_collection_films()`
- Seeds sample collections (Dokumenter Kota Bandung, Sinema dengan Sentuhan Ajaib, etc.)
- Sets up RLS policies (public can view, only admins can manage)

**Features:**
- Thematic film curation by admins
- Custom display order for films in each collection
- Auto-updating film counts
- Sample data included for testing

### After Running Migrations

1. **Verify tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Verify foreign keys:**
   ```sql
   SELECT
       tc.table_name, 
       tc.constraint_name, 
       tc.constraint_type,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
   JOIN information_schema.constraint_column_usage AS ccu
       ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
   WHERE tc.constraint_type = 'FOREIGN KEY' 
       AND tc.table_schema = 'public'
       AND tc.table_name LIKE 'forum%'
   ORDER BY tc.table_name;
   ```

## Tables Created

### Core Tables
- `profiles` - User profiles (extends auth.users)
- `films` - Film catalog
- `user_favorites` - User's favorite films
- `collections` - Thematic film collections
- `film_collections` - Junction table for films in collections

### Events
- `events` - Community events
- `event_registrations` - Event sign-ups

### Forum
- `forum_discussions` - Discussion threads
- `forum_posts` - Replies to discussions
- `forum_post_likes` - Likes on posts
- `forum_discussion_likes` - Likes on discussions

### Admin & Moderation (Hour 30)
- `moderation_logs` - Logs of all moderation actions
- `moderation_stats` view - Statistics for moderation dashboard
- Role system added to `profiles` (user/moderator/admin)
- Ban system added to `profiles` (is_banned, ban_reason, ban_expires_at)

### Notifications (Hours 33-34)
- `notifications` - User notifications for platform events
- Auto-triggers for replies and discussion likes
- Support for: reply, mention, like, moderation actions, events

### User Settings (Hour 35)
- `user_settings` - User preferences and notification settings
- Email and push notification preferences
- Privacy and interaction settings
- Display and language preferences

### Storage
- `avatars` bucket - User profile pictures

## Troubleshooting

### "Could not find a relationship" Error

This means migration 007 hasn't been applied. The API is trying to join `forum_discussions` with `profiles`, but the foreign key still points to `auth.users`.

**Solution:** Run migration 007.

### "Profile doesn't exist" Error

This happens when a user signs up but doesn't have a profile record yet. 

**Solution:** Check that the trigger in migration 001 is working:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If missing, re-run migration 001.

### RLS Blocking Access

If you're getting permission errors, check RLS policies:

```sql
-- View all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'forum_discussions';
```

## Common Issues & Fixes

### "column profiles_1.username does not exist"

This error means migration 011 hasn't been applied yet. The notifications system and other features need the `username` column.

**Solution:** Run migration 011 (`011_add_username_email_to_profiles.sql`).

### Existing profiles without username

If you have existing profiles before running migration 011, the migration will:
1. Auto-generate usernames from the `name` field
2. Sync email from `auth.users`
3. Ensure all usernames are unique

## Development vs Production

- **Development:** You can drop and recreate tables if needed
- **Production:** Always use migrations and NEVER drop tables with data

## Testing Notifications

After running migration 009, test the notification system:

1. **Create a test discussion** in the forum
2. **Reply to the discussion** with a different user
3. **Check notifications** for the original poster:
   ```sql
   SELECT * FROM notifications WHERE user_id = 'ORIGINAL_POSTER_ID';
   ```
4. **Like a discussion** and verify the author gets notified

## API Endpoints Available

### Admin (Hours 31-32)
- `GET /api/admin/users` - List all users with filters
- `POST /api/admin/users/[userId]/ban` - Ban user
- `DELETE /api/admin/users/[userId]/ban` - Unban user
- `PATCH /api/admin/users/[userId]/role` - Change user role
- `GET /api/admin/stats` - Moderation statistics
- `GET /api/admin/moderation-logs` - Moderation action logs

### Notifications (Hours 33-34)
- `GET /api/notifications` - Get user's notifications
- `PATCH /api/notifications/[id]` - Mark notification as read
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Collections (Hour 37)
- `GET /api/collections` - List all collections with pagination
- `GET /api/collections/[id]` - Get single collection with films
- `POST /api/collections` - Create collection (admin only)
- `PUT /api/collections/[id]` - Update collection (admin only)
- `DELETE /api/collections/[id]` - Delete collection (admin only)
- `POST /api/collections/[id]/films` - Add film to collection (admin only)
- `DELETE /api/collections/[id]/films` - Remove film from collection (admin only)

## Need Help?

Check the Supabase documentation:
- https://supabase.com/docs/guides/database/migrations
- https://supabase.com/docs/guides/auth/row-level-security