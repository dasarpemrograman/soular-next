# Soular Next - Backend Setup Guide

This guide will walk you through setting up the complete backend infrastructure for Soular Next using Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Git

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: soular-next (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup to complete (~2 minutes)

### 2. Get API Keys

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **Keep this secret!**

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### 4. Run Database Migrations

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the schema

This will create:
- All database tables (profiles, films, events, forum, etc.)
- Row Level Security (RLS) policies
- Database functions and triggers
- Indexes for optimal performance

### 5. Set Up Storage Buckets

1. Go to **Storage** in your Supabase Dashboard
2. Create the following buckets:

   **Bucket: `avatars`**
   - Public: ✅ Yes
   - File size limit: 2 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

   **Bucket: `posters`**
   - Public: ✅ Yes
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

   **Bucket: `thumbnails`**
   - Public: ✅ Yes
   - File size limit: 2 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

   **Bucket: `events`**
   - Public: ✅ Yes
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

   **Bucket: `films`**
   - Public: ✅ Yes
   - File size limit: 500 MB (or higher for video files)
   - Allowed MIME types: `video/mp4, video/webm, application/x-mpegURL`

3. Configure bucket policies (in SQL Editor):

   ```sql
   -- Allow authenticated users to upload avatars
   CREATE POLICY "Users can upload own avatar"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'avatars');

   -- Allow curators/admins to upload to film buckets
   CREATE POLICY "Curators can upload films"
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

   -- Public read access for all buckets
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   TO public
   USING (true);
   ```

### 6. Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Configure Email/Password settings:
   - Enable Email provider: ✅
   - Enable email confirmations: Your choice (recommended for production)
3. Set up email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

4. Configure Site URL and Redirect URLs:
   - Go to **Authentication** → **URL Configuration**
   - Add your site URL: `http://localhost:3000` (development)
   - Add redirect URLs: `http://localhost:3000/api/auth/callback`

### 7. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📁 Project Structure

```
soular-next/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── signup/
│   │   │   ├── signin/
│   │   │   ├── signout/
│   │   │   └── callback/
│   │   ├── films/             # Film CRUD operations
│   │   │   └── [id]/
│   │   ├── events/            # Event management
│   │   │   └── [id]/
│   │   │       └── register/
│   │   ├── forum/             # Forum threads & posts
│   │   │   └── [id]/
│   │   │       └── posts/
│   │   └── upload/            # File upload handler
├── lib/
│   └── supabase/
│       ├── server.ts          # Server-side Supabase client
│       └── client.ts          # Client-side Supabase client
├── hooks/
│   └── useAuth.ts             # Authentication hook
├── supabase/
│   └── schema.sql             # Database schema
└── middleware.ts              # Auth session refresh
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/callback` - OAuth/email confirmation callback

### Films

- `GET /api/films` - List films (with pagination, filters)
- `POST /api/films` - Create film (curator/admin only)
- `GET /api/films/[id]` - Get single film
- `PATCH /api/films/[id]` - Update film (owner/admin)
- `DELETE /api/films/[id]` - Delete film (admin only)

### Events

- `GET /api/events` - List events
- `POST /api/events` - Create event (curator/admin)
- `POST /api/events/[id]/register` - Register for event
- `DELETE /api/events/[id]/register` - Cancel registration

### Forum

- `GET /api/forum` - List threads
- `POST /api/forum` - Create thread
- `GET /api/forum/[id]/posts` - Get thread posts
- `POST /api/forum/[id]/posts` - Reply to thread

### Upload

- `POST /api/upload` - Upload file to storage
- `DELETE /api/upload` - Delete file from storage

## 🎯 Usage Examples

### Client-Side Authentication

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'

export default function LoginForm() {
  const { signIn, signUp, user, loading } = useAuth()

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password)
      console.log('Signed in!')
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (user) return <div>Welcome, {user.email}!</div>

  return <form>{/* Your form here */}</form>
}
```

### Fetching Films with React Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export default function FilmsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['films'],
    queryFn: async () => {
      const res = await fetch('/api/films?limit=12')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading films...</div>

  return (
    <div>
      {data?.films?.map((film) => (
        <div key={film.id}>{film.title}</div>
      ))}
    </div>
  )
}
```

### Server-Side Data Fetching

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function FilmPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  const { data: film } = await supabase
    .from('films')
    .select('*')
    .eq('slug', params.slug)
    .single()

  return <div>{film?.title}</div>
}
```

### Uploading Files

```typescript
'use client'

export default function UploadForm() {
  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'posters')
    formData.append('folder', 'film-posters')

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    console.log('Uploaded:', data.url)
  }

  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
}
```

## 🎬 Video Streaming Setup (HLS)

For video streaming, we use HLS (HTTP Live Streaming):

### 1. Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### 2. Convert Video to HLS

```bash
ffmpeg -i input.mp4 \
  -profile:v baseline \
  -level 3.0 \
  -start_number 0 \
  -hls_time 10 \
  -hls_list_size 0 \
  -f hls \
  output/playlist.m3u8
```

This creates:
- `playlist.m3u8` - The playlist file
- `segment0.ts`, `segment1.ts`, etc. - Video segments

### 3. Upload HLS Files to Storage

1. Upload all `.ts` segment files and the `.m3u8` playlist to the `films` bucket
2. Store the URL to `playlist.m3u8` in the `video_url` field of your film

### 4. Play with HLS.js

```typescript
'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(videoRef.current)
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src
    }
  }, [src])

  return <video ref={videoRef} controls />
}
```

## 🔒 Security Best Practices

1. **Never expose service role key** - Only use in server-side code
2. **Row Level Security (RLS)** - Already enabled on all tables
3. **Validate user input** - Always validate on server-side
4. **Rate limiting** - Consider adding rate limiting for production
5. **CORS** - Configure in Supabase Dashboard if using external domains

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel domain)
6. Deploy!

### Update Supabase URLs

After deployment:
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your production URL: `https://your-app.vercel.app`
3. Add redirect URL: `https://your-app.vercel.app/api/auth/callback`

## 📊 Database Backup

Always backup your database regularly:

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or download from Dashboard → Database → Backups
```

## 🔄 Migration from Supabase (Zero Lock-in)

If you ever want to migrate away from Supabase:

1. **Export your data:**
   ```bash
   pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
   ```

2. **Import to new PostgreSQL:**
   ```bash
   psql -h your-new-db.com -U user -d database < backup.sql
   ```

3. **Update environment variables** to point to your new database

4. **Replace Supabase client** with standard PostgreSQL client (e.g., `pg` or Prisma)

## 🆘 Troubleshooting

### "Invalid API key" error
- Check `.env.local` file exists and has correct keys
- Restart dev server after adding environment variables

### "Permission denied" on database operations
- Check RLS policies are properly set up
- Verify user role in profiles table

### Files not uploading
- Verify storage buckets exist
- Check bucket policies allow uploads
- Verify file size limits

### Authentication not working
- Check Site URL and Redirect URLs in Supabase Dashboard
- Verify middleware.ts is properly configured
- Check browser console for errors

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Query Docs](https://tanstack.com/query/latest)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

## 💰 Costs

**Free Tier Limits (Supabase):**
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

**When to upgrade:**
- More than 500 MB of data
- More than 1 GB of files
- Need custom domains for auth
- Want automated backups

Estimated cost: **$0/month** for small projects, **$25/month** for Pro tier if you exceed free limits.

---

**Need help?** Check the [Supabase Discord](https://discord.supabase.com) or [GitHub Discussions](https://github.com/supabase/supabase/discussions)