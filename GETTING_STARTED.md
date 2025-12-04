# 🚀 Getting Started with Soular Next

Welcome! This guide will help you get Soular Next up and running in **30 minutes**.

## ✅ Prerequisites

Before you begin, make sure you have:

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **npm** or **pnpm** installed
- [ ] A **Supabase account** (free tier is perfect)
- [ ] A web browser
- [ ] A code editor (VS Code recommended)

---

## 📝 Quick Setup (30 Minutes)

### Step 1: Supabase Setup (10 minutes)

#### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `soular-next`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your location
4. Click **"Create new project"**
5. Wait ~2 minutes for setup ☕

#### 1.2 Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them soon):
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (KEEP SECRET!)
   ```

#### 1.3 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"+ New query"**
3. Open `supabase/schema.sql` from this project
4. Copy ALL the contents and paste into SQL Editor
5. Click **"Run"** (bottom right)
6. You should see: "Success. No rows returned"

✅ You now have 13 tables with full security!

#### 1.4 Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create these 5 buckets (all public):

**Bucket 1: `avatars`**
- Click "New bucket"
- Name: `avatars`
- Public: ✅ Yes

**Bucket 2: `posters`**
- Name: `posters`
- Public: ✅ Yes

**Bucket 3: `thumbnails`**
- Name: `thumbnails`
- Public: ✅ Yes

**Bucket 4: `films`**
- Name: `films`
- Public: ✅ Yes

**Bucket 5: `events`**
- Name: `events`
- Public: ✅ Yes

#### 1.5 Configure Authentication

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Add `http://localhost:3000/api/auth/callback`
3. Go to **Authentication** → **Providers**
4. Ensure **Email** is enabled
5. (Optional) Disable email confirmation for development

---

### Step 2: Project Setup (5 minutes)

#### 2.1 Install Dependencies

```bash
cd soular-next
npm install
```

#### 2.2 Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your credentials
```

Open `.env.local` and add your Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: Use YOUR actual keys from Step 1.2!

---

### Step 3: Load Sample Data (5 minutes)

#### 3.1 Add Seed Data

1. Go back to Supabase **SQL Editor**
2. Click **"+ New query"**
3. Open `supabase/seed.sql` from this project
4. Copy and paste the contents
5. Click **"Run"**

This adds:
- 6 sample films (Indonesian documentaries)
- 5 sample events
- 5 forum threads
- 3 collections

#### 3.2 Create Your Admin User

Still in SQL Editor, run this to create yourself as admin:

```sql
-- First, we need to create a user through the signup API
-- We'll update them to admin after
```

Actually, let's do this through the app after it starts!

---

### Step 4: Start the App (2 minutes)

```bash
npm run dev
```

Visit: **http://localhost:3000**

🎉 **You should see the app with live data!**

---

### Step 5: Create Your Admin Account (3 minutes)

#### 5.1 Test the API

Open a new terminal and test signup:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@soular.local",
    "password": "admin123456",
    "full_name": "Admin User"
  }'
```

#### 5.2 Make Yourself Admin

1. Go to Supabase **Table Editor**
2. Open the `profiles` table
3. Find your user (email: admin@soular.local)
4. Click to edit the row
5. Change `role` from `user` to `admin`
6. Click "Save"

#### 5.3 Update Sample Content

The seed data doesn't have curator_id set. Let's fix that:

```sql
-- Get your user ID
SELECT id FROM profiles WHERE email = 'admin@soular.local';
-- Copy the UUID

-- Update all content with your ID (replace YOUR-USER-ID)
UPDATE films SET curator_id = 'YOUR-USER-ID' WHERE curator_id IS NULL;
UPDATE events SET organizer_id = 'YOUR-USER-ID' WHERE organizer_id IS NULL;
UPDATE forum_threads SET author_id = 'YOUR-USER-ID' WHERE author_id IS NULL;
UPDATE collections SET curator_id = 'YOUR-USER-ID' WHERE curator_id IS NULL;
```

---

### Step 6: Verify Everything Works (5 minutes)

#### Check Homepage ✅
- Visit http://localhost:3000
- You should see:
  - Featured films section (4 films)
  - Community events section (3 events)
  - All with real data from database

#### Check Films Page ✅
- Visit http://localhost:3000/koleksi
- You should see:
  - 6 sample films
  - Search bar working
  - Category filters working
  - Film cards with ratings and genres

#### Check Events Page ✅
- Visit http://localhost:3000/acara
- You should see:
  - 5 upcoming events
  - Event type filters
  - Dates properly formatted
  - Registration buttons

#### Check Forum Page ✅
- Visit http://localhost:3000/forum
- You should see:
  - 5 discussion threads
  - Category filters
  - Reply counts
  - Time ago in Indonesian

---

## 🎯 What You Have Now

### Backend ✅
- ✅ PostgreSQL database with 13 tables
- ✅ Row Level Security enabled
- ✅ Authentication system
- ✅ File storage (5 buckets)
- ✅ API endpoints for films, events, forum
- ✅ Sample data loaded

### Frontend ✅
- ✅ Homepage with real data
- ✅ Films collection page with search & filters
- ✅ Events page with filters & pagination
- ✅ Forum page with categories
- ✅ Loading states
- ✅ Error handling
- ✅ Indonesian localization

### Cost 💰
- ✅ **$0/month** (using free tiers)
- Supabase Free: 500MB DB, 1GB storage
- Vercel Free: Unlimited requests

---

## 📚 Next Steps

### Immediate (Required for full functionality)

1. **Create Detail Pages**
   - Film detail page at `/film/[slug]`
   - Event detail page at `/acara/[slug]`
   - Forum thread page at `/forum/[slug]`

2. **Add Authentication UI**
   - Login page
   - Signup page
   - Profile page

3. **Add Video Player**
   - HLS video player component
   - Watch progress tracking

### Nice to Have

1. **Admin Dashboard**
   - Manage films, events, users
   - Upload content
   - Moderate forum

2. **Interactive Features**
   - Like/favorite films
   - Rate films
   - Comment on films
   - Register for events

3. **User Profile**
   - Edit profile
   - Upload avatar
   - View watch history
   - Manage favorites

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 📖 Documentation

- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Detailed backend guide
- **[SETUP_STEPS.md](./SETUP_STEPS.md)** - Step-by-step setup
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - API usage examples
- **[FRONTEND_INTEGRATION_COMPLETE.md](./FRONTEND_INTEGRATION_COMPLETE.md)** - Integration details
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Production deployment

---

## 🐛 Troubleshooting

### "Invalid API key" error
```bash
# Check your .env.local file
cat .env.local

# Make sure the keys match your Supabase project
# Restart the dev server after changing .env.local
```

### No data showing
```bash
# Check if seed data is loaded
# Go to Supabase → Table Editor → films table
# You should see 6 films

# If empty, run seed.sql again in SQL Editor
```

### Images not loading
```bash
# Check storage buckets exist
# Go to Supabase → Storage
# Should see: avatars, posters, thumbnails, films, events

# Check buckets are public
# Click bucket → Settings → Make public
```

### "Permission denied" errors
```bash
# Check RLS policies are applied
# Go to Supabase → SQL Editor
# Run: SELECT * FROM profiles WHERE email = 'your-email';
# Verify role is set correctly

# Make sure you ran the full schema.sql
```

---

## 🎓 Learning Resources

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Supabase YouTube](https://www.youtube.com/c/supabase)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)

### React Query
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## 💬 Support

### Common Issues

**Q: Films/Events/Forum not loading?**
A: Check browser console for errors. Verify API keys in .env.local.

**Q: Can I use my own images?**
A: Yes! Upload to Supabase Storage buckets, then update URLs in database.

**Q: How do I add more films?**
A: Use the API endpoint POST /api/films (need admin/curator role).

**Q: Can I deploy to production?**
A: Yes! See DEPLOYMENT_CHECKLIST.md for steps.

### Need Help?

1. Check the documentation files in this project
2. Visit [Supabase Discord](https://discord.supabase.com)
3. Check GitHub Issues (if this is a GitHub project)

---

## ✅ Success Checklist

Before continuing development, make sure:

- [ ] Supabase project created and configured
- [ ] Database schema applied successfully
- [ ] Storage buckets created (5 total)
- [ ] Environment variables set in .env.local
- [ ] Dependencies installed (npm install)
- [ ] Seed data loaded in database
- [ ] Dev server running (npm run dev)
- [ ] Homepage loads with real data
- [ ] Films page shows 6 sample films
- [ ] Events page shows 5 sample events
- [ ] Forum page shows 5 threads
- [ ] No console errors in browser
- [ ] Admin user created and role set

---

## 🎉 You're All Set!

Your Soular Next app is now running with:
- ✅ Real backend powered by Supabase
- ✅ Real-time data in the frontend
- ✅ Search, filters, and pagination
- ✅ Sample content to explore
- ✅ $0/month hosting cost

**Next:** Start building the detail pages or adding authentication UI!

Happy coding! 🚀

---

**Last Updated:** December 2024
**Setup Time:** ~30 minutes
**Difficulty:** Beginner-friendly