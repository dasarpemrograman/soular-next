# Backend Implementation Guide for Soular Platform
## The Opinionated, Zero Lock-In, All-Free Approach

> **Philosophy**: Build a production-ready backend using 100% free services with zero vendor lock-in. Everything runs on open standards and can be migrated anywhere, anytime.

## Table of Contents
1. [Current Status & Implementation Checklist](#current-status--implementation-checklist)
2. [Simplified Implementation Plan](#simplified-implementation-plan)
3. [Architecture Decision](#architecture-decision)
4. [The Stack (All Free, Zero Lock-In)](#the-stack-all-free-zero-lock-in)
5. [Database Setup with Supabase](#database-setup-with-supabase)
6. [Complete Implementation](#complete-implementation)
7. [Authentication Strategy](#authentication-strategy)
8. [File Storage with Supabase Storage](#file-storage-with-supabase-storage)
9. [Video Streaming](#video-streaming)
10. [Deployment on Vercel](#deployment-on-vercel)
11. [Migration Path (Zero Lock-In Guarantee)](#migration-path-zero-lock-in-guarantee)

---

## Current Status & Implementation Checklist

### ✅ What's Already Built (Frontend Only)

**Pages:**
- ✅ Homepage (`/`) - Hero section, curated films, thematic collections, community events
- ✅ Collection Page (`/koleksi`) - Film grid with category filters
- ✅ Events Page (`/acara`) - Event listings with type filters
- ✅ Forum Page (`/forum`) - Discussion threads display

**Components:**
- ✅ Header with navigation
- ✅ Footer
- ✅ Hero section
- ✅ Curated films section
- ✅ Thematic collections
- ✅ Community events section
- ✅ Film cards
- ✅ Event cards
- ✅ Forum thread cards
- ✅ UI components (shadcn/ui)

**Styling & UX:**
- ✅ Tailwind CSS with custom theme
- ✅ Dark mode support
- ✅ Framer Motion animations
- ✅ Responsive design
- ✅ Custom gradient effects

### ❌ What's NOT Implemented (Backend & Features)

**Critical Missing Infrastructure:**
- ❌ No database setup
- ❌ No API routes (`app/api/` folder doesn't exist)
- ❌ No Supabase integration
- ❌ No environment variables configured
- ❌ No authentication system
- ❌ No file storage setup
- ❌ No video streaming infrastructure

**All Data is Static/Hardcoded:**
- ❌ Film data hardcoded in components
- ❌ Event data hardcoded in components
- ❌ Forum threads hardcoded
- ❌ User data doesn't exist
- ❌ No real-time updates
- ❌ No data persistence

---

## Sequential 1-Hour Work Blocks

> **Goal**: Break down the 50-hour implementation into manageable 1-hour tasks that can be completed sequentially.

---

### 🔴 HOUR 1: Supabase Project Setup
**Deliverable**: Working Supabase connection

**Tasks:**
1. Create free Supabase project at supabase.com
2. Copy project URL and anon key
3. Create `.env.local` and `.env.example` files
4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
5. Install Supabase packages: `npm install @supabase/supabase-js @supabase/ssr`

**Files Created:**
- `.env.local`
- `.env.example`

---

### 🔴 HOUR 2: Supabase Client Configuration
**Deliverable**: Reusable Supabase clients for client and server

**Tasks:**
1. Create `lib/supabase/client.ts` - browser client
2. Create `lib/supabase/server.ts` - server client with cookies
3. Test connection with a simple query

**Files Created:**
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

---

### 🔴 HOUR 3: Database Schema - Users & Profiles
**Deliverable**: User profiles table with RLS

**Tasks:**
1. Open Supabase SQL Editor
2. Create `profiles` table (extends auth.users)
3. Add columns: id, name, avatar, bio, is_premium, created_at
4. Setup RLS policies (users can read all, update own)
5. Create trigger to auto-create profile on signup

**Tables Created:**
- `profiles`

---

### 🔴 HOUR 4: Database Schema - Films
**Deliverable**: Films table with categories

**Tasks:**
1. Create `films` table
2. Add columns: id, title, slug, description, director, year, duration, category, youtube_url, thumbnail, is_premium, created_at
3. Setup RLS (anyone can read, only admins can write)
4. Insert 5-10 sample films manually

**Tables Created:**
- `films`

---

### 🔴 HOUR 5: Database Schema - Events & Forum
**Deliverable**: Events and forum tables

**Tasks:**
1. Create `events` table (id, title, description, date, time, type, location, thumbnail, max_attendees)
2. Create `event_registrations` table (user_id, event_id)
3. Create `forum_threads` table (id, title, content, category, author_id, created_at)
4. Create `forum_replies` table (id, thread_id, content, author_id, created_at)
5. Setup RLS policies
6. Insert sample data

**Tables Created:**
- `events`
- `event_registrations`
- `forum_threads`
- `forum_replies`

---

### 🔴 HOUR 6: Database Schema - Relationships & Extras
**Deliverable**: Supporting tables for favorites, likes, collections

**Tasks:**
1. Create `film_favorites` table (user_id, film_id)
2. Create `thread_likes` table (user_id, thread_id)
3. Create `collections` table (id, title, description, icon, color)
4. Create `collection_films` table (collection_id, film_id)
5. Setup RLS policies
6. Insert sample collections

**Tables Created:**
- `film_favorites`
- `thread_likes`
- `collections`
- `collection_films`

---

### 🔴 HOUR 7: Authentication - Login Page
**Deliverable**: Working login page

**Tasks:**
1. Create `app/login/page.tsx`
2. Build login form (email, password)
3. Implement Supabase auth login
4. Handle errors and show messages
5. Redirect to homepage on success

**Files Created:**
- `app/login/page.tsx`

---

### 🔴 HOUR 8: Authentication - Signup Page
**Deliverable**: Working signup page

**Tasks:**
1. Create `app/signup/page.tsx`
2. Build signup form (name, email, password)
3. Implement Supabase auth signup
4. Auto-create profile via trigger
5. Redirect to login on success

**Files Created:**
- `app/signup/page.tsx`

---

### 🔴 HOUR 9: Authentication - Auth Hook & Context
**Deliverable**: useAuth hook for global auth state

**Tasks:**
1. Create `hooks/useAuth.ts`
2. Implement auth state management
3. Add login, logout, signup functions
4. Listen to auth state changes
5. Test in components

**Files Created:**
- `hooks/useAuth.ts`

---

### 🔴 HOUR 10: Authentication - Header Integration
**Deliverable**: Header shows login/logout based on auth state

**Tasks:**
1. Update `components/Header.tsx`
2. Use `useAuth()` hook
3. Show user name and avatar when logged in
4. Change "Masuk" to "Logout" button
5. Add logout functionality

**Files Modified:**
- `components/Header.tsx`

---

### 🔴 HOUR 11: Authentication - Protected Routes
**Deliverable**: Middleware to protect routes

**Tasks:**
1. Create `middleware.ts`
2. Check auth for protected routes
3. Redirect to login if not authenticated
4. Test with /profile or /settings

**Files Created:**
- `middleware.ts`

---

### 🔴 HOUR 12: Films API - List Films
**Deliverable**: API endpoint to fetch films

**Tasks:**
1. Create `app/api/films/route.ts`
2. Implement GET handler
3. Add filtering by category
4. Add basic search by title
5. Add pagination (limit/offset)
6. Return JSON response

**Files Created:**
- `app/api/films/route.ts`

---

### 🔴 HOUR 13: Films API - Single Film
**Deliverable**: API endpoint for film details

**Tasks:**
1. Create `app/api/films/[id]/route.ts`
2. Implement GET handler
3. Fetch film by ID
4. Handle not found error
5. Return film data

**Files Created:**
- `app/api/films/[id]/route.ts`

---

### 🔴 HOUR 14: Films Hook - useFilms
**Deliverable**: React Query hook for films list

**Tasks:**
1. Create `hooks/useFilms.ts`
2. Use React Query (already installed)
3. Fetch from API with filters
4. Handle loading and error states
5. Add refetch functionality

**Files Created:**
- `hooks/useFilms.ts`

---

### 🔴 HOUR 15: Films Page - Connect to API
**Deliverable**: Collection page shows real data

**Tasks:**
1. Update `app/koleksi/page.tsx`
2. Replace static data with `useFilms()` hook
3. Make category filter work
4. Add loading skeleton
5. Handle empty state

**Files Modified:**
- `app/koleksi/page.tsx`

---

### 🔴 HOUR 16: Homepage - Connect to API
**Deliverable**: Homepage shows real films

**Tasks:**
1. Update `components/CuratedSection.tsx`
2. Use `useFilms()` hook with limit
3. Update `components/HeroSection.tsx` with featured film
4. Add loading states

**Files Modified:**
- `components/CuratedSection.tsx`
- `components/HeroSection.tsx`

---

### 🔴 HOUR 17: Film Detail Page - Layout
**Deliverable**: Film detail page structure

**Tasks:**
1. Create `app/film/[id]/page.tsx`
2. Create layout (hero, player area, details)
3. Fetch film data using `useFilm()` hook
4. Display film info
5. Add loading and error states

**Files Created:**
- `app/film/[id]/page.tsx`
- `hooks/useFilm.ts`

---

### 🔴 HOUR 18: YouTube Player Component
**Deliverable**: Working YouTube embed

**Tasks:**
1. Create `components/YouTubePlayer.tsx`
2. Accept YouTube URL prop
3. Extract video ID
4. Render iframe with responsive wrapper
5. Add controls and autoplay options

**Files Created:**
- `components/YouTubePlayer.tsx`

---

### 🔴 HOUR 19: Film Detail - Complete Integration
**Deliverable**: Fully functional film detail page

**Tasks:**
1. Integrate YouTubePlayer in film page
2. Add related films section
3. Add back to collection button
4. Test with different films
5. Handle premium films (show lock if not premium user)

**Files Modified:**
- `app/film/[id]/page.tsx`

---

### 🔴 HOUR 20: Film Favorites - API
**Deliverable**: API to favorite/unfavorite films

**Tasks:**
1. Create `app/api/films/[id]/favorite/route.ts`
2. Implement POST (add favorite)
3. Implement DELETE (remove favorite)
4. Check if already favorited
5. Require authentication

**Files Created:**
- `app/api/films/[id]/favorite/route.ts`

---

### 🔴 HOUR 21: Film Favorites - UI
**Deliverable**: Favorite button on film cards

**Tasks:**
1. Add favorite button to film cards
2. Use optimistic updates
3. Show heart icon (filled if favorited)
4. Handle auth required (redirect to login)
5. Update film detail page

**Files Modified:**
- `components/ui/card.tsx` (or create FilmCard component)
- `app/film/[id]/page.tsx`

---

### 🔴 HOUR 22: Search Functionality
**Deliverable**: Basic search working

**Tasks:**
1. Add search input to header
2. Create search state
3. Update films API call with search param
4. Implement debounced search
5. Show results in collection page

**Files Modified:**
- `components/Header.tsx`
- `app/koleksi/page.tsx`

---

### 🔴 HOUR 23: Events API - List Events
**Deliverable**: API endpoint for events

**Tasks:**
1. Create `app/api/events/route.ts`
2. Implement GET handler
3. Add filter by type
4. Add filter by upcoming/past
5. Return events with registration count

**Files Created:**
- `app/api/events/route.ts`

---

### 🔴 HOUR 24: Events API - Single Event
**Deliverable**: API for event details

**Tasks:**
1. Create `app/api/events/[id]/route.ts`
2. Implement GET handler
3. Include registration status for current user
4. Handle not found

**Files Created:**
- `app/api/events/[id]/route.ts`

---

### 🔴 HOUR 25: Events Page - Connect to API
**Deliverable**: Events page shows real data

**Tasks:**
1. Create `hooks/useEvents.ts`
2. Update `app/acara/page.tsx`
3. Replace static data with API data
4. Make type filter work
5. Add loading states

**Files Created:**
- `hooks/useEvents.ts`

**Files Modified:**
- `app/acara/page.tsx`

---

### 🔴 HOUR 26: Event Detail Page
**Deliverable**: Event detail page with registration

**Tasks:**
1. Create `app/acara/[id]/page.tsx`
2. Display event details
3. Add registration button
4. Show attendee count
5. Handle loading and errors

**Files Created:**
- `app/acara/[id]/page.tsx`

---

### 🟡 HOUR 27: Event Registration API
**Deliverable**: Register/unregister for events

**Tasks:**
1. Create `app/api/events/[id]/register/route.ts`
2. Implement POST (register)
3. Implement DELETE (unregister)
4. Check capacity
5. Prevent duplicate registrations

**Files Created:**
- `app/api/events/[id]/register/route.ts`

---

### 🟡 HOUR 28: Event Registration UI
**Deliverable**: Working registration button

**Tasks:**
1. Add registration button to event detail
2. Toggle between "Daftar" and "Batal Pendaftaran"
3. Show loading state
4. Update attendee count
5. Handle auth required

**Files Modified:**
- `app/acara/[id]/page.tsx`

---

### 🟡 HOUR 29: Homepage Events - Connect to API
**Deliverable**: Homepage shows real events

**Tasks:**
1. Update `components/CommunityEvents.tsx`
2. Use `useEvents()` hook with limit
3. Add loading states
4. Link to event detail pages

**Files Modified:**
- `components/CommunityEvents.tsx`

---

### 🟡 HOUR 30: Forum API - List Threads
**Deliverable**: API endpoint for forum threads

**Tasks:**
1. Create `app/api/forum/route.ts`
2. Implement GET (list threads)
3. Add category filter
4. Include reply count and like count
5. Add pagination

**Files Created:**
- `app/api/forum/route.ts`

---

### 🟡 HOUR 31: Forum API - Single Thread
**Deliverable**: API for thread details with replies

**Tasks:**
1. Create `app/api/forum/[id]/route.ts`
2. Implement GET (thread + replies)
3. Include author info
4. Sort replies by date

**Files Created:**
- `app/api/forum/[id]/route.ts`

---

### 🟡 HOUR 32: Forum Page - Connect to API
**Deliverable**: Forum page shows real threads

**Tasks:**
1. Create `hooks/useForum.ts`
2. Update `app/forum/page.tsx`
3. Replace static data
4. Make category filter work
5. Add loading states

**Files Created:**
- `hooks/useForum.ts`

**Files Modified:**
- `app/forum/page.tsx`

---

### 🟡 HOUR 33: Forum Thread Detail Page
**Deliverable**: Thread detail with replies

**Tasks:**
1. Create `app/forum/[id]/page.tsx`
2. Display thread content
3. Show all replies
4. Display author info
5. Add loading states

**Files Created:**
- `app/forum/[id]/page.tsx`

---

### 🟡 HOUR 34: Forum - Create Thread
**Deliverable**: Create new thread functionality

**Tasks:**
1. Create `app/forum/new/page.tsx`
2. Build thread form (title, content, category)
3. Implement POST to forum API
4. Redirect to new thread
5. Require authentication

**Files Created:**
- `app/forum/new/page.tsx`

---

### 🟡 HOUR 35: Forum - Reply to Thread
**Deliverable**: Reply functionality

**Tasks:**
1. Create `app/api/forum/[id]/replies/route.ts`
2. Implement POST handler
3. Add reply form to thread detail page
4. Refresh thread after reply
5. Require authentication

**Files Created:**
- `app/api/forum/[id]/replies/route.ts`

**Files Modified:**
- `app/forum/[id]/page.tsx`

---

### 🟡 HOUR 36: Forum - Like Thread
**Deliverable**: Like/unlike functionality

**Tasks:**
1. Create `app/api/forum/[id]/like/route.ts`
2. Implement POST/DELETE handlers
3. Add like button to threads
4. Show like count
5. Toggle heart icon

**Files Created:**
- `app/api/forum/[id]/like/route.ts`

**Files Modified:**
- `app/forum/page.tsx`
- `app/forum/[id]/page.tsx`

---

### 🟢 HOUR 37: Collections API
**Deliverable**: API for collections

**Tasks:**
1. Create `app/api/collections/route.ts`
2. Implement GET (list collections)
3. Create `app/api/collections/[id]/route.ts`
4. Get collection with films
5. Test with sample data

**Files Created:**
- `app/api/collections/route.ts`
- `app/api/collections/[id]/route.ts`

---

### 🟢 HOUR 38: Collections Page - Connect to API
**Deliverable**: Collections show real data

**Tasks:**
1. Create `hooks/useCollections.ts`
2. Update `components/ThematicCollections.tsx`
3. Replace static data
4. Add loading states

**Files Created:**
- `hooks/useCollections.ts`

**Files Modified:**
- `components/ThematicCollections.tsx`

---

### 🟢 HOUR 39: Collection Detail Page
**Deliverable**: Collection detail with films

**Tasks:**
1. Create `app/koleksi/[slug]/page.tsx`
2. Display collection info
3. Show films in collection
4. Add back to collections button
5. Handle loading/errors

**Files Created:**
- `app/koleksi/[slug]/page.tsx`

---

### 🟢 HOUR 40: Premium Page - Mockup
**Deliverable**: Premium pricing page

**Tasks:**
1. Create `app/premium/page.tsx`
2. Design pricing cards (mock)
3. Add features comparison
4. Add "Get Premium" buttons (non-functional)
5. Show premium benefits

**Files Created:**
- `app/premium/page.tsx`

---

### 🟢 HOUR 41: Premium Modal
**Deliverable**: Premium modal component

**Tasks:**
1. Create `components/PremiumModal.tsx`
2. Show when clicking Premium button
3. Display pricing options
4. Add "Coming Soon" message
5. Link to premium page

**Files Created:**
- `components/PremiumModal.tsx`

**Files Modified:**
- `components/Header.tsx`

---

### 🟢 HOUR 42: Premium Badge & Gating
**Deliverable**: Premium badges and content locks

**Tasks:**
1. Show premium badge on user profile
2. Add lock icon on premium films
3. Show "Upgrade" prompt for premium content
4. Test with premium and non-premium users
5. Update film detail page

**Files Modified:**
- `app/film/[id]/page.tsx`
- `components/Header.tsx`

---

### 🟡 HOUR 43: Mobile Navigation
**Deliverable**: Working mobile menu

**Tasks:**
1. Create `components/MobileNav.tsx`
2. Use Sheet component (shadcn/ui)
3. Connect hamburger menu button
4. Add navigation links
5. Close on route change

**Files Created:**
- `components/MobileNav.tsx`

**Files Modified:**
- `components/Header.tsx`

---

### 🟡 HOUR 44: Loading States
**Deliverable**: Skeleton loaders for all pages

**Tasks:**
1. Create `components/LoadingState.tsx`
2. Create film card skeleton
3. Create event card skeleton
4. Add to all pages with data fetching
5. Test loading experience

**Files Created:**
- `components/LoadingState.tsx`

**Files Modified:**
- `app/koleksi/page.tsx`
- `app/acara/page.tsx`
- `app/forum/page.tsx`

---

### 🟡 HOUR 45: Error & Empty States
**Deliverable**: Error and empty state components

**Tasks:**
1. Create `components/ErrorState.tsx`
2. Create `components/EmptyState.tsx`
3. Add to pages (no results, errors)
4. Add retry buttons
5. Test edge cases

**Files Created:**
- `components/ErrorState.tsx`
- `components/EmptyState.tsx`

**Files Modified:**
- All pages with data fetching

---

### 🟡 HOUR 46: Toast Notifications
**Deliverable**: Toast notifications for actions

**Tasks:**
1. Setup Sonner (already installed)
2. Add toasts for login/logout
3. Add toasts for favorites
4. Add toasts for registration
5. Add toasts for forum actions

**Files Modified:**
- All files with user actions

---

### 🟡 HOUR 47: User Profile Page
**Deliverable**: Basic user profile

**Tasks:**
1. Create `app/profile/page.tsx`
2. Show user info (name, email, avatar)
3. Show favorite films
4. Show registered events
5. Show forum threads

**Files Created:**
- `app/profile/page.tsx`

---

### 🟡 HOUR 48: Bug Fixes & Polish
**Deliverable**: Fix obvious bugs

**Tasks:**
1. Test all flows end-to-end
2. Fix navigation issues
3. Fix responsive design issues
4. Ensure consistent styling
5. Fix console errors

**Files Modified:**
- Various files as needed

---

### 🟡 HOUR 49: Data Seeding
**Deliverable**: Populated database

**Tasks:**
1. Add 20+ films to database
2. Add 10+ events
3. Add 15+ forum threads
4. Add collections with films
5. Test with real data

**Database Updates:**
- Insert statements in Supabase

---

### 🟡 HOUR 50: Final Testing & Documentation
**Deliverable**: Production-ready app

**Tasks:**
1. Test all features
2. Update README.md
3. Document setup steps
4. Test on mobile devices
5. Deploy to Vercel (optional)

**Files Modified:**
- `README.md`

---

## Quick Reference Summary

**Total Hours: 50**

- **Hours 1-6**: Backend Setup (Supabase, Database Schema)
- **Hours 7-11**: Authentication (Login, Signup, Auth Hook)
- **Hours 12-22**: Films (API, Pages, Player, Favorites, Search)
- **Hours 23-29**: Events (API, Pages, Registration)
- **Hours 30-36**: Forum (API, Pages, Threads, Replies, Likes)
- **Hours 37-39**: Collections (API, Pages)
- **Hours 40-42**: Premium Mockup
- **Hours 43-50**: UI Polish, Testing, Deployment

**Priority Breakdown:**
- 🔴 Critical (Must Have): Hours 1-22 (22 hours)
- 🟡 Important (Should Have): Hours 23-36, 43-50 (22 hours)
- 🟢 Nice to Have: Hours 37-42 (6 hours)

---

## Removed/Excluded Features

**NOT Implementing (Keep It Simple):**
- ❌ Notifications system (removed)
- ❌ Internationalization (removed)
- ❌ SEO optimization (removed)
- ❌ Analytics dashboard (removed)
- ❌ Social features (profiles, following, sharing)
- ❌ Admin dashboard (use Supabase dashboard)
- ❌ Content management UI (use Supabase dashboard)
- ❌ Video upload/transcoding (use YouTube)
- ❌ Real payment system (mockup only)
- ❌ Email notifications (removed)
- ❌ Advanced search (basic only)
- ❌ User roles/permissions (basic only)
- ❌ Watch history/analytics (removed)
- ❌ Comments on films (removed)

---

## Simplified Summary

**Overall Progress: ~8% Complete**

**Simplified Estimated Work Remaining:**
- 🔴 Critical (Must Have): ~26 hours (Backend, Auth, Films)
- 🟡 Important (Should Have): ~18 hours (Events, Forum, UI)
- 🟢 Nice to Have: ~6 hours (Collections, Premium mockup)

**Total: ~50 hours of development work** (down from 330 hours!)

**Key Simplifications:**
1. YouTube embeds instead of video infrastructure
2. No payment processing (mockup only)
3. No notifications
4. No i18n
5. No SEO
6. Basic features only
7. Use Supabase dashboard for admin tasks

---


## Architecture Decision

### ❌ What We're NOT Using (And Why)

- **AWS/Azure/GCP**: Expensive, complex billing, vendor lock-in
- **MongoDB Atlas**: Limited free tier, proprietary query language
- **Firebase**: Google lock-in, proprietary APIs
- **Prisma**: ORM overhead, migration complexity
- **Auth0/Clerk**: Paid tiers required for production
- **Cloudinary**: Limited free tier, pricing traps

### ✅ What We ARE Using (And Why)

**Single Source of Truth: Supabase (Self-Hostable PostgreSQL + Auth + Storage)**

- **100% Open Source**: Built on PostgreSQL, PostgREST, GoTrue
- **Generous Free Tier**: 500MB database, 1GB storage, 50K monthly active users
- **Zero Lock-In**: Standard PostgreSQL - migrate to Railway, Neon, or self-hosted anytime
- **All-in-One**: Database, Auth, Storage, Real-time in one place
- **No ORM Needed**: Direct SQL with TypeScript types

---

## The Stack (All Free, Zero Lock-In)

```
Frontend:  Next.js 16 (App Router) - Already set ✅
Database:  Supabase (PostgreSQL)   - Free forever tier
Auth:      Supabase Auth           - Included, unlimited
Storage:   Supabase Storage        - 1GB free
Streaming: Self-hosted HLS         - Free, no limits
Deploy:    Vercel                  - Free for personal/small teams
Email:     Resend                  - 3000 emails/month free
```

**Total Monthly Cost: $0**
**Vendor Lock-In: 0%**
**Migration Difficulty: Easy (it's just PostgreSQL!)**

---

## Database Setup with Supabase

### Step 1: Create Supabase Project

```bash
# Visit https://supabase.com and create a free project
# Note: You get a real PostgreSQL database, not a toy
```

### Step 2: Install Supabase Client

```bash
npm install @supabase/supabase-js
npm install @supabase/ssr
```

### Step 3: Database Schema (Pure SQL - No Lock-In!)

```sql
-- migrations/001_initial_schema.sql
-- This is STANDARD PostgreSQL - works anywhere!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'curator', 'admin')),
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- FILMS
-- ============================================
CREATE TABLE films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  director TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  category TEXT NOT NULL CHECK (category IN (
    'dokumenter', 'drama', 'eksperimental', 
    'musikal', 'thriller', 'petualangan'
  )),
  thumbnail TEXT NOT NULL,
  poster_url TEXT,
  trailer_url TEXT,
  video_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  curator_id UUID REFERENCES profiles(id),
  curator_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_films_slug ON films(slug);
CREATE INDEX idx_films_category ON films(category);
CREATE INDEX idx_films_curator ON films(curator_id);

ALTER TABLE films ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published films viewable by all"
  ON films FOR SELECT
  USING (is_published = true OR auth.uid() = curator_id);

CREATE POLICY "Curators can create films"
  ON films FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('curator', 'admin')
    )
  );

-- ============================================
-- COLLECTIONS
-- ============================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  film_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE film_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(film_id, collection_id)
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections viewable by all"
  ON collections FOR SELECT USING (true);

CREATE POLICY "Film collections viewable by all"
  ON film_collections FOR SELECT USING (true);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('live_qa', 'watch_party', 'workshop', 'screening')),
  event_date TIMESTAMPTZ NOT NULL,
  event_time TEXT NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  location TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  host TEXT NOT NULL,
  max_attendees INTEGER DEFAULT 0,
  current_attendees INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(type);

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by all"
  ON events FOR SELECT USING (is_published = true);

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FORUM
-- ============================================
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'analisis_film', 'behind_the_scenes', 
    'diskusi_umum', 'rekomendasi', 'komunitas'
  )),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE thread_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Threads viewable by all"
  ON forum_threads FOR SELECT USING (true);

CREATE POLICY "Users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Posts viewable by all"
  ON forum_posts FOR SELECT USING (true);

CREATE POLICY "Users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- ============================================
-- USER INTERACTIONS
-- ============================================
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0, -- seconds
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id)
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id)
);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watch history"
  ON watch_history FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_films_updated_at
  BEFORE UPDATE ON films
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update reply count on new post
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET reply_count = reply_count + 1
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_reply_count
  AFTER INSERT ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();
```

### Step 4: Setup Supabase Client

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Complete Implementation

### API Route: Films

```typescript
// app/api/films/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  let query = supabase
    .from('films')
    .select('*, curator:profiles!curator_id(id, name, avatar)', { count: 'exact' })
    .eq('is_published', true)
    .range(from, to)
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (category && category !== 'Semua') {
    query = query.eq('category', category.toLowerCase())
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,director.ilike.%${search}%`)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({
    films: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Check if user is curator/admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['curator', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Create slug
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  const { data, error } = await supabase
    .from('films')
    .insert({
      ...body,
      slug,
      curator_id: user.id,
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
```

```typescript
// app/api/films/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('films')
    .select(`
      *,
      curator:profiles!curator_id(id, name, avatar, bio),
      film_collections(
        collection:collections(*)
      )
    `)
    .eq('id', params.id)
    .single()
  
  if (error) {
    return NextResponse.json({ error: 'Film not found' }, { status: 404 })
  }
  
  // Increment view count
  await supabase.rpc('increment_film_views', { film_id: params.id })
  
  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('films')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { error } = await supabase
    .from('films')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
```

### API Route: Events

```typescript
// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const type = searchParams.get('type')
  const upcoming = searchParams.get('upcoming') === 'true'
  
  let query = supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('event_date', { ascending: true })
  
  if (type && type !== 'Semua') {
    query = query.eq('type', type.toLowerCase())
  }
  
  if (upcoming) {
    query = query.gte('event_date', new Date().toISOString())
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

```typescript
// app/api/events/[id]/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check event capacity
  const { data: event } = await supabase
    .from('events')
    .select('max_attendees, current_attendees')
    .eq('id', params.id)
    .single()
  
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }
  
  if (event.max_attendees > 0 && event.current_attendees >= event.max_attendees) {
    return NextResponse.json({ error: 'Event is full' }, { status: 400 })
  }
  
  // Register user
  const { data, error } = await supabase
    .from('event_registrations')
    .insert({
      user_id: user.id,
      event_id: params.id,
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Already registered' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Increment attendee count
  await supabase.rpc('increment_event_attendees', { event_id: params.id })
  
  return NextResponse.json(data, { status: 201 })
}
```

### API Route: Forum

```typescript
// app/api/forum/threads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  let query = supabase
    .from('forum_threads')
    .select(`
      *,
      author:profiles!author_id(id, name, avatar)
    `, { count: 'exact' })
    .range(from, to)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({
    threads: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  const { data, error } = await supabase
    .from('forum_threads')
    .insert({
      ...body,
      slug,
      author_id: user.id,
    })
    .select(`
      *,
      author:profiles!author_id(id, name, avatar)
    `)
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
```

---

## Authentication Strategy

### Supabase Auth (Built-in, Free, Self-Hostable)

```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { email, password, name } = await request.json()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
```

```typescript
// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { email, password } = await request.json()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
```

```typescript
// app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json({ success: true })
}
```

### Client-Side Auth Hooks

```typescript
// hooks/use-auth.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

---

## File Storage with Supabase Storage

### Setup Storage Buckets

```sql
-- Run in Supabase SQL Editor
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('films', 'films', true),
  ('posters', 'posters', true),
  ('avatars', 'avatars', true),
  ('thumbnails', 'thumbnails', true);

-- Storage policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('films', 'posters', 'avatars', 'thumbnails'));

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('films', 'posters', 'avatars', 'thumbnails')
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (auth.uid()::text = owner);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (auth.uid()::text = owner);
```

### Upload API

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const formData = await request.formData()
  const file = formData.get('file') as File
  const bucket = formData.get('bucket') as string || 'films'
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${user.id}/${fileName}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return NextResponse.json({ url: publicUrl })
}
```

---

## Video Streaming

### Self-Hosted HLS (No Vendor, No Limits)

```typescript
// lib/video/hls.ts
// Use FFmpeg to convert videos to HLS format
// This runs on your server - no Mux, no Cloudflare Stream fees

export async function convertToHLS(inputPath: string, outputDir: string) {
  const { execSync } = require('child_process')
  
  // Generate HLS playlist
  const command = `
    ffmpeg -i ${inputPath} \
      -codec: copy \
      -start_number 0 \
      -hls_time 10 \
      -hls_list_size 0 \
      -f hls \
      ${outputDir}/playlist.m3u8
  `
  
  execSync(command)
  
  return `${outputDir}/playlist.m3u8`
}
```

### Video Player API

```typescript
// app/api/films/[id]/stream/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  // Check if user has access
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: film } = await supabase
    .from('films')
    .select('is_premium, video_url')
    .eq('id', params.id)
    .single()
  
  if (!film) {
    return NextResponse.json({ error: 'Film not found' }, { status: 404 })
  }
  
  // Check premium access
  if (film.is_premium && !user) {
    return NextResponse.json({ error: 'Premium content requires login' }, { status: 401 })
  }
  
  if (film.is_premium && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, premium_until')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_premium || (profile.premium_until && new Date(profile.premium_until) < new Date())) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }
  }
  
  // Return video URL (HLS playlist)
  return NextResponse.json({ streamUrl: film.video_url })
}
```

---

## Deployment on Vercel

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Cost: $0/month** (Vercel free tier is generous for hobby projects)

---

## Migration Path (Zero Lock-In Guarantee)

### Migrate from Supabase to Self-Hosted PostgreSQL

```bash
# 1. Export your database (it's just PostgreSQL!)
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# 2. Import to Railway/Neon/Self-hosted
psql -h your-new-host.com -U postgres -d postgres < backup.sql

# 3. Update environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-self-hosted-postgrest.com
```

### Migrate to Different Storage

```typescript
// Your files are stored with standard URLs
// Just update the storage adapter:

// From Supabase Storage
const url = supabase.storage.from('films').getPublicUrl(path)

// To S3
const url = `https://${bucket}.s3.amazonaws.com/${path}`

// To Cloudflare R2
const url = `https://${bucket}.r2.cloudflarestorage.com/${path}`
```

**Migration Time: ~2 hours**
**Breaking Changes: 0**
**Vendor Lock-In: 0%**

---

## Frontend Integration

### React Query Hooks

```typescript
// hooks/use-films.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useFilms(params?: any) {
  return useQuery({
    queryKey: ['films', params],
    queryFn: async () => {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`/api/films?${query}`)
      if (!res.ok) throw new Error('Failed to fetch films')
      return res.json()
    },
  })
}

export function useFilm(id: string) {
  return useQuery({
    queryKey: ['film', id],
    queryFn: async () => {
      const res = await fetch(`/api/films/${id}`)
      if (!res.ok) throw new Error('Failed to fetch film')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useFavoriteFilm() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (filmId: string) => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, film_id: filmId })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['films'] })
    },
  })
}
```

### Update Components

```typescript
// components/CuratedSection.tsx
'use client'

import { useFilms } from '@/hooks/use-films'

export const CuratedSection = () => {
  const { data, isLoading } = useFilms({ limit: 4, page: 1 })
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <section className="py-20 bg-background">
      {/* ... existing JSX ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.films.map((film: any) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
    </section>
  )
}
```

---

## Final Checklist

- [x] ✅ **Database**: PostgreSQL (Supabase) - Free tier, self-hostable
- [x] ✅ **Auth**: Supabase Auth - Built-in, unlimited users
- [x] ✅ **Storage**: Supabase Storage - 1GB free, expandable
- [x] ✅ **Streaming**: Self-hosted HLS - No limits, no fees
- [x] ✅ **Deploy**: Vercel - Free for hobby projects
- [x] ✅ **Zero Lock-In**: Everything runs on open standards
- [x] ✅ **Migration Path**: ~2 hours to self-hosted
- [x] ✅ **Monthly Cost**: $0

---

## Next Steps

1. **Create Supabase Project** (5 minutes)
   - Visit supabase.com
   - Create free project
   - Save credentials

2. **Run Database Schema** (5 minutes)
   - Copy SQL from this guide
   - Paste in Supabase SQL Editor
   - Execute

3. **Setup Environment** (2 minutes)
   - Add Supabase credentials to `.env.local`
   - Install dependencies: `npm install @supabase/supabase-js @supabase/ssr`

4. **Implement API Routes** (1-2 hours)
   - Copy API route examples
   - Customize as needed

5. **Update Frontend** (1 hour)
   - Replace mock data with API calls
   - Add auth flows

6. **Deploy** (10 minutes)
   - Push to GitHub
   - Connect to Vercel
   - Done!

**Total Implementation Time: 4-5 hours**
**Total Cost: $0**
**Vendor Lock-In: 0%**

---

## Why This Stack Wins

1. **Free Forever**: All services have generous free tiers
2. **Zero Lock-In**: PostgreSQL is portable, Supabase is self-hostable
3. **Production Ready**: Supabase powers thousands of production apps
4. **Simple**: No complex ORM, no microservices overhead
5. **Fast**: Direct PostgreSQL queries, CDN-cached assets
6. **Scalable**: Upgrade to paid tier only when you need it

**Stop paying for vendor lock-in. Start building with open standards.**