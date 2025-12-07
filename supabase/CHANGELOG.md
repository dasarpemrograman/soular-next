# Soular Next Database - Changelog

All notable changes to the database schema are documented in this file.

## [1.0.0] - 2024-12-07 - Consolidated Schema

### Added - Complete Schema Migration

**File:** `migrations/100_complete_schema.sql`

This is a consolidated migration that creates the entire database schema in one file. Use this for fresh installations.

#### Core Tables
- ✅ `profiles` - User profiles extending auth.users
  - Fields: name, username, email, avatar, bio, role, is_premium, is_banned
  - Auto-create on signup via trigger
  - Unique username generation with collision handling
  
- ✅ `films` - Film catalog with YouTube streaming
  - Fields: title, slug, director, year, category, youtube_url, rating, view_count
  - Categories: Dokumenter, Drama, Eksperimental, Musikal, Thriller, Horor, Komedi, Petualangan
  - Full-text search support (Indonesian language)
  - Premium content support
  
- ✅ `events` - Community events management
  - Types: workshop, screening, discussion, networking, other
  - Support for online/offline events
  - Capacity limits with participant tracking
  
- ✅ `event_registrations` - Event sign-ups
  - Status: registered, attended, cancelled, waitlist
  - Unique constraint per user per event

#### Forum System
- ✅ `forum_discussions` - Discussion threads
  - Categories: general, filmmaking, technical, showcase, feedback, events, other
  - Features: pinning, locking, view counts, reply counts
  
- ✅ `forum_posts` - Thread replies
  - Nested conversation support
  - Like counts auto-updated
  
- ✅ `forum_discussion_likes` - Discussion likes
- ✅ `forum_post_likes` - Post likes

#### Collections System
- ✅ `collections` - Thematic film collections
  - Curated by admins
  - Custom icons and colors
  - Auto-counting film totals
  
- ✅ `film_collections` - Films in collections (junction table)
  - Custom display ordering

#### User Features
- ✅ `user_favorites` - User's favorite films
- ✅ `notifications` - In-app notifications
  - Types: reply, mention, like, moderation actions, events
  - Read/unread tracking
  - Auto-triggered on user actions
  
- ✅ `user_settings` - User preferences
  - Email notification preferences
  - Push notification preferences
  - Privacy settings (show email, allow mentions)
  - Display preferences (theme, language)

#### Admin & Moderation
- ✅ `moderation_logs` - Audit trail
  - Actions: pin, lock, delete, ban/unban
  - Reason tracking and metadata

#### Security & Triggers
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ 40+ RLS policies for fine-grained access control
- ✅ Auto-create profile trigger on user signup
- ✅ Auto-update timestamp triggers
- ✅ Auto-count triggers (likes, replies, films in collections)
- ✅ Storage bucket for avatars with RLS policies

#### Helper Functions
- `is_admin()` - Check admin role
- `is_moderator_or_admin()` - Check moderation privileges
- `is_not_banned()` - Check if user can post
- `create_notification()` - Send notifications
- `mark_notification_read()` - Mark notification as read
- `get_unread_count()` - Get unread notification count
- `get_event_participant_count()` - Get event registrations
- `is_event_full()` - Check event capacity
- `increment_film_views()` - Increment film view count

### Added - Seed Data

**File:** `seed.sql`

Test data for development:
- 12 sample films across all categories
- 4 thematic collections with films
- 8 sample events (workshops, screenings, networking)

### Added - Tools & Documentation

**Files:**
- `setup.sh` - Automated setup script with interactive prompts
- `verify_migration.sql` - Comprehensive verification script
- `QUICK_START.md` - 5-minute setup guide
- `README.md` - Complete documentation
- `migrations/README.md` - Detailed migration documentation

---

## Historical Migrations (Legacy)

These individual migrations are kept for reference and incremental updates:

### [0.12.0] - Collections System

**File:** `012_collections_table.sql`

- Created `collections` table
- Created `film_collections` junction table
- Added auto-counting trigger for film totals
- Sample collections seeded
- Admin-only RLS policies

### [0.11.0] - Profile Enhancements

**File:** `011_add_username_email_to_profiles.sql`

⚠️ **CRITICAL UPDATE** - Required for notifications and forum

- Added `username` column to profiles (unique)
- Added `email` column to profiles
- Updated `handle_new_user()` function for auto-generation
- Unique username collision handling
- Populated existing profiles with usernames

### [0.10.0] - User Settings

**File:** `010_user_settings.sql`

- Created `user_settings` table
- Email notification preferences per type
- Push notification preferences per type
- Privacy settings (email visibility, mentions)
- Display preferences (theme, language)
- Updated notification creation to respect preferences

### [0.9.0] - Notifications System

**File:** `009_notifications.sql`

- Created `notifications` table
- Auto-trigger notifications on forum replies
- Auto-trigger notifications on discussion likes
- Notification types: reply, mention, like, moderation, events
- Helper functions for notification management
- Unread count tracking
- Auto-cleanup for old notifications

### [0.8.0] - Admin Roles & Moderation

**File:** `008_admin_roles.sql`

- Added `role` column to profiles (user/moderator/admin)
- Added ban system (is_banned, ban_reason, banned_at, banned_by)
- Created `moderation_logs` table
- Role check helper functions
- Updated RLS policies for moderation
- Prevent banned users from posting
- Moderation statistics view

### [0.7.0] - Forum Foreign Key Fixes

**File:** `007_fix_forum_fkeys.sql`

⚠️ **CRITICAL FIX** - Required for forum to work

- Fixed foreign keys to reference `profiles` instead of `auth.users`
- Created `forum_discussion_likes` table
- Added `like_count` column to discussions
- Added auto-update trigger for like counts
- RLS policies for discussion likes

### [0.6.0] - Storage Avatars

**File:** `006_storage_avatars.sql`

- Created `avatars` storage bucket
- Public read access for avatars
- User-specific upload/update/delete policies
- Path format: `{user_id}/avatar.jpg`

### [0.5.0] - User Favorites

**File:** `005_user_favorites_table.sql`

- Created `user_favorites` table
- Unique constraint per user per film
- Helper function to check if film is favorited
- Helper function to get user's favorites
- RLS policies for user-specific access

### [0.4.0] - Forum System

**File:** `004_forum_table.sql`

- Created `forum_discussions` table
- Created `forum_posts` table
- Created `forum_post_likes` table
- Discussion categories and tags
- View counts and reply counts
- Pin and lock functionality
- Auto-update triggers for counts
- RLS policies for forum access

### [0.3.0] - Events System

**File:** `003_events_table.sql`

- Created `events` table
- Created `event_registrations` table
- Event types and status tracking
- Online/offline event support
- Capacity management
- Helper functions for participant counts
- RLS policies for events and registrations
- 10 sample events seeded

### [0.2.0] - Films Catalog

**File:** `002_films_table.sql`

- Created `films` table
- Film categories (8 genres)
- YouTube URL integration
- Premium content support
- View count tracking
- Full-text search indexes
- Helper functions for film operations
- 10 sample films seeded

### [0.1.0] - User Profiles

**File:** `001_profiles_table.sql`

- Created `profiles` table extending auth.users
- Auto-create profile trigger on signup
- Auto-update timestamp trigger
- Premium membership support
- RLS policies for profile access
- Helper function to get current user profile

---

## Migration Strategy

### For New Installations
Use the consolidated migration:
```bash
supabase db reset
# or
psql -f migrations/100_complete_schema.sql
```

### For Existing Installations
Run migrations incrementally in order (001-012).

### For Testing
Include seed data:
```bash
psql -f seed.sql
```

---

## Breaking Changes

### v1.0.0
- Consolidated schema may conflict with partial migrations
- Recommend fresh install for new projects

### v0.11.0
- **CRITICAL:** Added `username` column (required)
- Existing profiles auto-populated
- Applications expecting only `name` will break

### v0.8.0
- Added role system to profiles
- Default role is 'user'
- Applications may need to check roles

### v0.7.0
- **CRITICAL:** Changed forum foreign keys
- Points to `profiles` instead of `auth.users`
- Old joins will fail

---

## Future Roadmap

Planned features:
- [ ] Video streaming pipeline (direct upload)
- [ ] Advanced search with filters
- [ ] User achievements/badges
- [ ] Film reviews and ratings
- [ ] Direct messaging system
- [ ] Email digest notifications
- [ ] Analytics and insights
- [ ] Multi-language support expansion
- [ ] Mobile app sync tables

---

## Support

For issues or questions:
- Check documentation in `README.md` and `QUICK_START.md`
- Review individual migration files for detailed schema
- Consult Supabase documentation: https://supabase.com/docs

---

**Maintained by:** Soular Next Team  
**Schema Version:** 100  
**Last Updated:** December 7, 2024