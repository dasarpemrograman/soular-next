# Soular Next - Database Migrations

This directory contains database migrations and seed data for the Soular Next platform.

## Quick Start

### Option 1: Use the Consolidated Migration (Recommended for Fresh Setup)

If you're setting up the database for the first time, use the consolidated migration:

```bash
# Using Supabase CLI
supabase db reset

# Or manually run:
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/100_complete_schema.sql

# Then seed the data:
psql -h your-db-host -U postgres -d postgres -f supabase/seed.sql
```

### Option 2: Run Individual Migrations (For Incremental Updates)

If you need to run migrations incrementally:

```bash
# Run migrations in order
supabase migration up

# Or manually:
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/001_profiles_table.sql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/002_films_table.sql
# ... continue in order
```

## File Structure

### Main Files

- **`100_complete_schema.sql`** - Consolidated migration with complete schema
  - All tables, indexes, triggers, RLS policies, and functions
  - Use this for fresh database setup
  - Includes: profiles, films, events, forum, collections, notifications, settings

- **`seed.sql`** - Test data for development
  - 12 sample films across all categories
  - 4 thematic collections
  - 8 sample events
  - Run after main migration

### Individual Migrations (Legacy)

These are kept for reference and incremental updates:

1. `001_profiles_table.sql` - User profiles with auth integration
2. `002_films_table.sql` - Films catalog with YouTube URLs
3. `003_events_table.sql` - Events and registrations
4. `004_forum_table.sql` - Forum discussions and posts
5. `005_user_favorites_table.sql` - User film favorites
6. `006_storage_avatars.sql` - Avatar storage bucket
7. `007_fix_forum_fkeys.sql` - Fix foreign key relationships
8. `008_admin_roles.sql` - Role-based access control
9. `009_notifications.sql` - Notification system
10. `010_user_settings.sql` - User preferences
11. `011_add_username_email_to_profiles.sql` - Profile enhancements
12. `012_collections_table.sql` - Thematic film collections

## Post-Migration Setup

After running migrations, you need to:

### 1. Create Admin User

```sql
-- Sign up through the app first, then:
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 2. Verify Tables Created

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- collections
-- event_registrations
-- events
-- film_collections
-- films
-- forum_discussion_likes
-- forum_discussions
-- forum_post_likes
-- forum_posts
-- moderation_logs
-- notifications
-- profiles
-- user_favorites
-- user_settings
```

### 3. Test RLS Policies

```sql
-- Test as authenticated user
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Verify you can read films
SELECT * FROM public.films LIMIT 5;

-- Verify you can insert your own profile
-- (This happens automatically on signup)
```

## Database Schema Overview

### Core Tables

- **profiles** - User profiles (extends auth.users)
  - Fields: name, username, email, avatar, bio, role, is_premium
  - RLS: Public read, owner write
  
- **films** - Film catalog
  - Fields: title, director, year, category, youtube_url, rating
  - RLS: Public read, authenticated write
  
- **events** - Community events
  - Fields: title, date, location, max_participants, host_id
  - RLS: Public read, host manage
  
- **event_registrations** - User event sign-ups
  - RLS: Users view own, hosts view event registrations

### Community Features

- **forum_discussions** - Discussion threads
- **forum_posts** - Replies to discussions
- **forum_discussion_likes** - Discussion likes
- **forum_post_likes** - Post likes
- **collections** - Curated film collections
- **film_collections** - Films in collections (junction table)

### User Features

- **user_favorites** - User's favorite films
- **notifications** - In-app notifications
- **user_settings** - Notification and display preferences

### Admin Features

- **moderation_logs** - Audit log for moderation actions
- Role-based access (user, moderator, admin)
- Ban system for users

## Key Features

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Public read access where appropriate
- User can manage own data
- Admin/moderator elevated permissions
- Service role full access

### Triggers

- Auto-create profile on user signup
- Update `updated_at` timestamps
- Update counts (likes, replies, films in collections)
- Send notifications on user actions

### Helper Functions

- `is_admin()` - Check if current user is admin
- `is_moderator_or_admin()` - Check if user has moderation rights
- `is_not_banned()` - Check if user is not banned
- `create_notification()` - Create notification for user
- `get_event_participant_count()` - Get event registration count
- `is_event_full()` - Check if event has reached capacity

### Storage Buckets

- **avatars** - User avatar images
  - Public read
  - Users can upload/update/delete own avatars
  - Path format: `{user_id}/avatar.jpg`

## Troubleshooting

### Migration Fails

```bash
# Reset database completely
supabase db reset

# Or drop all tables manually
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, public;
```

### RLS Policy Issues

```sql
-- Disable RLS temporarily for testing (NOT in production!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Missing Permissions

```sql
-- Grant permissions to authenticated role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

## Development Tips

1. **Always test locally first** using Supabase local development
2. **Backup production data** before running migrations
3. **Use transactions** for complex migrations
4. **Document breaking changes** in migration comments
5. **Test RLS policies** with different user roles

## Production Deployment

```bash
# 1. Backup production database
supabase db dump > backup_$(date +%Y%m%d).sql

# 2. Run migration
supabase db push

# 3. Verify critical tables
supabase db remote get

# 4. Test application
# - Sign up new user
# - Browse films
# - Register for event
# - Create forum post
```

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Review RLS policies in migration files
- Test queries in Supabase SQL Editor
- Check server logs for detailed errors

---

**Last Updated:** 2024
**Schema Version:** 100 (Consolidated)
**Supabase Version:** 2.x