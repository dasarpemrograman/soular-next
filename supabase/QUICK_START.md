# Soular Next - Database Quick Start Guide

This guide will help you set up the Soular Next database in under 5 minutes.

## Prerequisites

- Supabase project created
- Supabase CLI installed (optional but recommended)
- PostgreSQL client (psql) or Supabase Dashboard access

## Setup Steps

### Step 1: Run the Migration

Choose one method:

#### Method A: Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://app.supabase.com
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content of `supabase/migrations/100_complete_schema.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success confirmation (~10-15 seconds)

#### Method B: Supabase CLI (Recommended)

```bash
# Navigate to your project root
cd /path/to/soular-next

# Link to your Supabase project (first time only)
supabase link --project-ref your-project-ref

# Reset database (creates fresh schema)
supabase db reset

# Or push just the migration
supabase db push
```

#### Method C: psql Command Line

```bash
# Replace with your database credentials
psql \
  -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -f supabase/migrations/100_complete_schema.sql
```

### Step 2: Seed Test Data (Optional)

Only for development/testing:

#### Supabase Dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy content of `supabase/seed.sql`
4. Paste and click **Run**

#### Supabase CLI:

```bash
supabase db execute < supabase/seed.sql
```

#### psql:

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

### Step 3: Verify Installation

Run this SQL to check all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- ✅ collections
- ✅ event_registrations
- ✅ events
- ✅ film_collections
- ✅ films
- ✅ forum_discussion_likes
- ✅ forum_discussions
- ✅ forum_post_likes
- ✅ forum_posts
- ✅ moderation_logs
- ✅ notifications
- ✅ profiles
- ✅ user_favorites
- ✅ user_settings

### Step 4: Set Up Environment Variables

Update your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: **Project Settings → API** in Supabase Dashboard

### Step 5: Create Your Admin Account

1. **Sign up** through your Next.js app (http://localhost:3000)
2. Go to Supabase Dashboard → **SQL Editor**
3. Run this query (replace with your email):

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

4. **Refresh** your app - you should now have admin access!

## Verify Everything Works

### Test 1: Authentication

```bash
# Sign up and log in through the app
# Profile should auto-create with username and email
```

### Test 2: Browse Films

```sql
-- Should return 12 films (if you ran seed.sql)
SELECT id, title, category, is_premium FROM public.films;
```

### Test 3: Check RLS Policies

```sql
-- This should work (public read)
SELECT * FROM public.films LIMIT 5;

-- This should work (authenticated users)
SELECT * FROM public.events LIMIT 5;
```

### Test 4: Test Admin Functions

```sql
-- Should return true if you're admin
SELECT is_admin();

-- Should return false if you're not banned
SELECT is_not_banned();
```

## Common Issues

### ❌ "relation does not exist"

**Problem:** Migration didn't run completely

**Solution:**
```sql
-- Check if tables exist
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return ~14 tables
-- If less, re-run migration
```

### ❌ "permission denied for table"

**Problem:** RLS is blocking access

**Solution:**
```sql
-- Verify RLS is enabled (should all be true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check if you're authenticated
SELECT auth.uid(); -- Should return your user ID
```

### ❌ "function is_admin() does not exist"

**Problem:** Helper functions weren't created

**Solution:** Re-run the migration file - functions are at the end

### ❌ Can't sign up new users

**Problem:** Trigger might not be installed

**Solution:**
```sql
-- Check if trigger exists
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- If missing, re-run migration
```

## What's Next?

After successful setup:

1. ✅ Database schema is ready
2. ✅ Sample data is loaded (if seeded)
3. ✅ Admin account is set up
4. ✅ RLS policies are active

Now you can:

- 🎬 **Browse Films** - Visit `/films`
- 📅 **View Events** - Visit `/events`
- 💬 **Forum Discussions** - Visit `/forum`
- 🎨 **Collections** - Visit `/collections`
- ⭐ **Favorites** - Sign in and favorite films
- 👤 **Profile** - Update your profile and settings

## Admin Features

As an admin, you can:

- ✏️ **Manage Collections** - Create/edit/delete film collections
- 🎬 **Manage Films** - Add/edit/delete films (via API)
- 🛡️ **Moderate Forum** - Pin, lock, delete discussions/posts
- 👥 **Manage Users** - Ban users, change roles (via `/api/admin`)
- 📊 **View Stats** - Check moderation logs and statistics

## Advanced: Custom Setup

### Add More Sample Data

Create your own seed data:

```sql
-- Add a custom film
INSERT INTO public.films (title, slug, description, director, year, duration, category, youtube_url)
VALUES (
  'My Documentary',
  'my-documentary',
  'An amazing documentary about...',
  'John Doe',
  2024,
  90,
  'Dokumenter',
  'https://www.youtube.com/watch?v=your-video-id'
);

-- Add a custom collection
INSERT INTO public.collections (title, slug, description, icon, color)
VALUES (
  'Best of 2024',
  'best-of-2024',
  'Top films from this year',
  'Trophy',
  'from-yellow-500/20 to-amber-500/20'
);
```

### Reset Database

To start over:

```bash
# Using CLI
supabase db reset

# Or manual
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, public;
```

Then re-run the migration.

## Production Deployment

### Before Deploying:

1. **Backup your data**
```bash
supabase db dump > backup.sql
```

2. **Test migration locally**
```bash
supabase db reset
supabase db push
```

3. **Run on production**
```bash
# Link to production project
supabase link --project-ref prod-project-ref

# Push migration
supabase db push
```

4. **Don't run seed.sql in production!**
   - Only run `100_complete_schema.sql`
   - Let real users create content

## Getting Help

- 📖 **Migrations README**: `supabase/migrations/README.md`
- 🌐 **Supabase Docs**: https://supabase.com/docs
- 🐛 **Check Logs**: Supabase Dashboard → Logs
- 💬 **Forum**: https://github.com/supabase/supabase/discussions

## Summary Checklist

- [ ] Migration ran successfully
- [ ] All 14 tables created
- [ ] Seed data loaded (optional)
- [ ] Environment variables set
- [ ] Admin account created
- [ ] Can sign up new users
- [ ] Can browse films
- [ ] RLS policies working
- [ ] Next.js app connected

**Setup Time:** ~5 minutes ⏱️

---

**Need help?** Open an issue or check the documentation!
