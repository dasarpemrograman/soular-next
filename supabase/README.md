# Soular Next - Supabase Database

Complete database schema and setup for the Soular Next platform - a community-driven Indonesian film platform.

## 📁 Directory Structure

```
supabase/
├── migrations/               # Database migration files
│   ├── 100_complete_schema.sql    # ⭐ Main consolidated migration
│   ├── 001-012_*.sql             # Individual migrations (legacy)
│   └── README.md                 # Detailed migration docs
├── seed.sql                  # Sample test data
├── verify_migration.sql      # Migration verification script
├── setup.sh                  # Automated setup script
├── QUICK_START.md           # 5-minute setup guide
└── README.md                # This file
```

## 🚀 Quick Start

### For First-Time Setup (Recommended)

```bash
# 1. Run the automated setup script
./supabase/setup.sh

# 2. Or manually with Supabase CLI
supabase db reset

# 3. Verify installation
supabase db execute < supabase/verify_migration.sql
```

### Using Supabase Dashboard

1. Go to https://app.supabase.com → Your Project
2. Navigate to **SQL Editor** → **New Query**
3. Copy content of `migrations/100_complete_schema.sql`
4. Click **Run** (Ctrl+Enter)
5. Repeat for `seed.sql` (optional, for test data)

**📖 For detailed instructions, see [QUICK_START.md](QUICK_START.md)**

## 📊 Database Schema

### Core Tables

| Table | Description | Key Features |
|-------|-------------|--------------|
| `profiles` | User profiles | Auto-created on signup, roles, bans |
| `films` | Film catalog | Categories, YouTube URLs, ratings |
| `events` | Community events | Workshops, screenings, networking |
| `event_registrations` | Event sign-ups | Capacity limits, waitlist |

### Community Features

| Table | Description | Key Features |
|-------|-------------|--------------|
| `forum_discussions` | Discussion threads | Categories, tags, pinning, locking |
| `forum_posts` | Thread replies | Nested conversations |
| `forum_discussion_likes` | Discussion likes | Auto-counted |
| `forum_post_likes` | Post likes | Auto-counted |
| `collections` | Film collections | Thematic curation |
| `film_collections` | Films in collections | Custom ordering |

### User Features

| Table | Description | Key Features |
|-------|-------------|--------------|
| `user_favorites` | Favorite films | Quick access |
| `notifications` | In-app notifications | Auto-triggered, unread tracking |
| `user_settings` | Preferences | Email/push settings, theme, language |

### Admin & Moderation

| Table | Description | Key Features |
|-------|-------------|--------------|
| `moderation_logs` | Moderation actions | Audit trail, reason tracking |

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- ✅ **Public Read**: Films, events, forum posts viewable by all
- ✅ **Owner Write**: Users can only modify their own data
- ✅ **Role-Based Access**: Admin/moderator elevated permissions
- ✅ **Service Role**: Full access for backend operations

### User Roles

- **User** (default) - Can post, comment, register for events
- **Moderator** - Can pin, lock, delete discussions/posts
- **Admin** - Full access + user management + collections

### Ban System

- Admins can ban users with reason tracking
- Banned users cannot create content
- Ban expires automatically (optional)
- All moderation actions logged

## 🎯 Key Features

### Auto-Triggers

- ✅ Create profile on user signup
- ✅ Update timestamps automatically
- ✅ Auto-count likes, replies, film collections
- ✅ Send notifications on replies, likes, moderation

### Helper Functions

```sql
-- Role checks
is_admin()                    -- Check if current user is admin
is_moderator_or_admin()       -- Check moderation privileges
is_not_banned()               -- Check if user can post

-- Notifications
create_notification(...)      -- Send notification to user
mark_notification_read(id)    -- Mark as read
get_unread_count()           -- Get unread count

-- Events
get_event_participant_count(id)  -- Get registration count
is_event_full(id)                -- Check capacity
```

### Full-Text Search

- Indonesian language support
- Search films by title and description
- Optimized with GIN indexes

## 📦 Sample Data

The `seed.sql` file includes:

- ✅ 12 sample films across all categories
- ✅ 4 thematic collections
- ✅ 8 sample events (workshops, screenings, etc.)
- ✅ Realistic metadata and descriptions

**⚠️ Only use seed data in development!**

## 🛠️ Setup & Deployment

### Local Development

```bash
# Start Supabase locally
supabase start

# Run migrations
supabase db reset

# Seed data
supabase db execute < supabase/seed.sql

# Verify
supabase db execute < supabase/verify_migration.sql
```

### Production Deployment

```bash
# 1. Backup existing data
supabase db dump > backup_$(date +%Y%m%d).sql

# 2. Link to production
supabase link --project-ref your-prod-ref

# 3. Push migrations
supabase db push

# 4. Verify (DON'T seed in production!)
supabase db execute < supabase/verify_migration.sql
```

## 🔧 Post-Setup Configuration

### 1. Create Admin User

After signing up through the app:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 2. Configure Storage

Avatar storage is auto-configured, but verify:

```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

### 3. Test RLS Policies

```sql
-- Should work (public read)
SELECT * FROM public.films LIMIT 5;

-- Should work (authenticated)
SET request.jwt.claims = '{"sub": "user-uuid"}';
SELECT * FROM public.events LIMIT 5;
```

## 🐛 Troubleshooting

### "relation does not exist"

**Problem:** Migration didn't complete

**Solution:**
```bash
supabase db reset
```

### "permission denied"

**Problem:** RLS blocking access

**Solution:** Verify you're authenticated:
```sql
SELECT auth.uid(); -- Should return your user ID
```

### "function does not exist"

**Problem:** Migration partially ran

**Solution:** Re-run complete migration:
```bash
supabase db execute < supabase/migrations/100_complete_schema.sql
```

### Can't create profiles on signup

**Problem:** Trigger not installed

**Solution:**
```sql
-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, re-run migration
```

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[migrations/README.md](migrations/README.md)** - Detailed migration docs
- **Supabase Docs** - https://supabase.com/docs
- **PostgreSQL Docs** - https://www.postgresql.org/docs/

## ✅ Verification Checklist

After setup, verify:

- [ ] All 14 tables created
- [ ] RLS enabled on all tables
- [ ] Storage bucket 'avatars' exists
- [ ] Can sign up new users
- [ ] Profiles auto-created with username
- [ ] Can browse films
- [ ] Admin user created
- [ ] Environment variables set
- [ ] Next.js app connects successfully

Run verification script:
```bash
supabase db execute < supabase/verify_migration.sql
```

## 🔄 Migration Updates

### Adding New Migrations

```bash
# Create new migration
supabase migration new your_feature_name

# Edit the generated file
nano supabase/migrations/[timestamp]_your_feature_name.sql

# Apply locally
supabase db reset

# Push to production
supabase db push
```

### Rolling Back

```bash
# View migration history
supabase migration list

# Reset to specific migration
supabase db reset --version [timestamp]
```

## 📊 Database Statistics

After running migrations:

- **Tables:** 14
- **Functions:** 16+
- **Triggers:** 9
- **RLS Policies:** 40+
- **Indexes:** 30+
- **Foreign Keys:** 20+

## 🤝 Contributing

When adding new features:

1. Create migration in `migrations/` folder
2. Add RLS policies for security
3. Document in migration file
4. Update this README
5. Test locally before production

## 📞 Support

- **Issues:** Check [Troubleshooting](#-troubleshooting) section
- **Supabase Community:** https://github.com/supabase/supabase/discussions
- **PostgreSQL Help:** https://www.postgresql.org/support/

## 📄 License

Part of the Soular Next project.

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Database Schema Version:** 100 (Consolidated)

🎬 **Soular Next** - Empowering Indonesian Cinema 🇮🇩