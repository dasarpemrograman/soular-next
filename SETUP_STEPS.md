# 🚀 Soular Next Backend - Step-by-Step Setup Guide

Follow these exact steps to get your backend up and running in 30 minutes.

## ⏱️ Timeline: ~30 Minutes

- **Steps 1-3:** 5 minutes (Supabase account & project)
- **Step 4:** 2 minutes (Database schema)
- **Step 5:** 3 minutes (Storage setup)
- **Step 6:** 2 minutes (Environment variables)
- **Step 7:** 5 minutes (Test the setup)
- **Step 8:** 10 minutes (Add seed data & test features)

---

## 📋 Prerequisites Checklist

- [ ] Node.js 18 or higher installed (`node --version`)
- [ ] Git installed
- [ ] A web browser
- [ ] Email address for Supabase account

---

## Step 1: Create Supabase Account (2 minutes)

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub or email
4. Verify your email if required

---

## Step 2: Create New Supabase Project (3 minutes)

1. Click **"New Project"**
2. Fill in the form:
   - **Organization:** Select or create one
   - **Name:** `soular-next` (or any name)
   - **Database Password:** Generate a strong password and **SAVE IT**
   - **Region:** Choose closest to your users (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan:** Free tier is fine!

3. Click **"Create new project"**
4. Wait 1-2 minutes for setup to complete ☕

---

## Step 3: Get Your API Keys (1 minute)

Once your project is ready:

1. Go to **Settings** → **API** (in sidebar)
2. Copy and save these values:
   
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (keep this SECRET!)
   ```

3. Keep this tab open, you'll need these soon!

---

## Step 4: Set Up Database Schema (2 minutes)

1. In Supabase Dashboard, go to **SQL Editor** (in sidebar)
2. Click **"New Query"**
3. Open your project's `supabase/schema.sql` file
4. Copy the **ENTIRE** file content
5. Paste into the SQL Editor
6. Click **"Run"** (bottom right)
7. Wait for confirmation: "Success. No rows returned"

**What this did:** Created 13 tables, 40+ security policies, 7 functions, 25+ indexes

---

## Step 5: Create Storage Buckets (3 minutes)

### 5.1 Navigate to Storage
1. Go to **Storage** (in sidebar)

### 5.2 Create Buckets (repeat for each)

**Bucket 1: avatars**
- Click **"New bucket"**
- Name: `avatars`
- Public: ✅ **Yes**
- Click **"Create bucket"**

**Bucket 2: posters**
- Name: `posters`
- Public: ✅ **Yes**
- Click **"Create bucket"**

**Bucket 3: thumbnails**
- Name: `thumbnails`
- Public: ✅ **Yes**
- Click **"Create bucket"**

**Bucket 4: films**
- Name: `films`
- Public: ✅ **Yes**
- Click **"Create bucket"**

**Bucket 5: events**
- Name: `events`
- Public: ✅ **Yes**
- Click **"Create bucket"**

### 5.3 Set Storage Policies
1. Go back to **SQL Editor**
2. Run this query:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow curators/admins to upload to media buckets
CREATE POLICY "Curators can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('films', 'posters', 'thumbnails', 'events')
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('curator', 'admin')
  )
);

-- Public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (true);
```

---

## Step 6: Configure Your Project (2 minutes)

### 6.1 Navigate to Project Directory
```bash
cd soular-next
```

### 6.2 Install Dependencies
```bash
npm install
```

(Dependencies already include `@supabase/supabase-js` and `@supabase/ssr`)

### 6.3 Create Environment File
```bash
cp .env.example .env.local
```

### 6.4 Edit `.env.local`
Open `.env.local` and add your Supabase credentials from Step 3:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important:** Replace the placeholder values with YOUR actual keys!

---

## Step 7: Configure Authentication (2 minutes)

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add these URLs:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** Add this:
     ```
     http://localhost:3000/api/auth/callback
     ```

3. Go to **Authentication** → **Providers**
4. Ensure **Email** is enabled
5. **Disable** email confirmation for development (optional):
   - Go to **Authentication** → **Providers** → **Email**
   - Turn off "Confirm email"

---

## Step 8: Start Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

You should see your app running! 🎉

---

## Step 9: Test the Setup (5 minutes)

### 9.1 Test Authentication

Open a new terminal and test signup:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
  }'
```

Expected response:
```json
{
  "message": "Account created successfully",
  "user": { ... }
}
```

### 9.2 Check Database

1. Go to Supabase Dashboard → **Table Editor**
2. Select `profiles` table
3. You should see your new user!

### 9.3 Test Sign In

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

---

## Step 10: Add Seed Data (Optional, 3 minutes)

To test with sample films and events:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy content from `supabase/seed.sql`
4. Paste and click **"Run"**

This adds:
- 6 sample films
- 5 sample events
- 5 forum threads
- 3 collections

### Update Sample Data with Your User

After running seed.sql, update the data to associate with your user:

```sql
-- Get your user ID first
SELECT id FROM profiles WHERE email = 'test@example.com';

-- Update films with your user ID (replace 'YOUR-USER-ID')
UPDATE films 
SET curator_id = 'YOUR-USER-ID' 
WHERE curator_id IS NULL;

-- Update events
UPDATE events 
SET organizer_id = 'YOUR-USER-ID' 
WHERE organizer_id IS NULL;

-- Update forum threads
UPDATE forum_threads 
SET author_id = 'YOUR-USER-ID' 
WHERE author_id IS NULL;

-- Update collections
UPDATE collections 
SET curator_id = 'YOUR-USER-ID' 
WHERE curator_id IS NULL;
```

### Make Yourself an Admin

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'test@example.com';
```

---

## Step 11: Test API Endpoints (5 minutes)

### Test Films API
```bash
# Get all films
curl http://localhost:3000/api/films

# Expected: List of films with pagination
```

### Test Events API
```bash
# Get upcoming events
curl http://localhost:3000/api/events?upcoming=true

# Expected: List of events
```

### Test Forum API
```bash
# Get forum threads
curl http://localhost:3000/api/forum

# Expected: List of threads
```

---

## ✅ Verification Checklist

Before moving forward, verify:

- [ ] Supabase project created
- [ ] Database schema applied (13 tables visible in Table Editor)
- [ ] 5 storage buckets created
- [ ] Environment variables set in `.env.local`
- [ ] `npm install` completed successfully
- [ ] Development server running on http://localhost:3000
- [ ] Can sign up a user successfully
- [ ] Can sign in with created user
- [ ] User profile visible in Supabase Table Editor
- [ ] API endpoints responding (test with curl or browser)
- [ ] (Optional) Seed data loaded and visible

---

## 🎉 You're Done!

Your backend is now fully operational with:

✅ Authentication system
✅ Database with RLS security
✅ File storage
✅ API endpoints for films, events, forum
✅ Role-based access control

---

## 🚀 Next Steps

### For Developers:

1. **Connect Frontend Components**
   - Replace mock data with API calls
   - Use `useAuth()` hook for authentication
   - Implement React Query for data fetching

2. **Add Features**
   - Film upload form
   - Event creation UI
   - Forum posting interface
   - User profile page

3. **Customize**
   - Update film categories
   - Add more event types
   - Customize forum categories

### For Deployment:

See `DEPLOYMENT_CHECKLIST.md` for production deployment steps.

---

## 🐛 Troubleshooting

### "Invalid API key" Error
```bash
# Verify environment variables
cat .env.local

# Restart dev server
# Press Ctrl+C and run:
npm run dev
```

### "Permission denied" on Database
```bash
# Check if you're signed in and have the right role
# Run in Supabase SQL Editor:
SELECT * FROM profiles WHERE email = 'your-email@example.com';

# Make yourself admin:
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Can't Upload Files
```bash
# Verify buckets exist
# Go to Supabase Dashboard → Storage
# Should see: avatars, posters, thumbnails, films, events

# Verify you're curator or admin
# Run in SQL Editor:
SELECT role FROM profiles WHERE email = 'your-email@example.com';
```

### API Returns Empty Array
```bash
# Check if you loaded seed data
# Go to Table Editor → films
# Should see sample films

# If not, load seed data (Step 10)
```

---

## 📚 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard

**Local Development:** http://localhost:3000

**API Base:** http://localhost:3000/api

**Documentation:**
- Backend Setup: `BACKEND_SETUP.md`
- Quick Reference: `QUICK_REFERENCE.md`
- Deployment: `DEPLOYMENT_CHECKLIST.md`

---

## 💡 Pro Tips

1. **Keep your service role key secret** - Never commit to Git
2. **Use different Supabase projects** for dev/staging/prod
3. **Back up your database regularly** - Use Supabase backup feature
4. **Monitor your usage** - Check Supabase dashboard for limits
5. **Test RLS policies** - Make sure users can only access their data

---

## 🆘 Need Help?

- Check `BACKEND_SETUP.md` for detailed explanations
- See `QUICK_REFERENCE.md` for code examples
- Visit [Supabase Discord](https://discord.supabase.com)
- Check [Supabase Docs](https://supabase.com/docs)

---

**Congratulations! Your backend is ready to use! 🎊**