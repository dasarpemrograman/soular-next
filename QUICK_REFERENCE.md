# 🚀 Quick Reference Guide - Soular Next Backend

A fast reference for common tasks and API usage patterns.

## 🔑 Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Common API Patterns

### Authentication

```typescript
// Sign Up
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "username": "johndoe"
}

// Sign In
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Sign Out
POST /api/auth/signout
```

### Films

```typescript
// Get all films (with filters)
GET /api/films?page=1&limit=12&genre=Documentary&search=jakarta

// Get single film
GET /api/films/[film-id]

// Create film (curator/admin only)
POST /api/films
{
  "title": "My Documentary",
  "synopsis": "A short description",
  "director": "Director Name",
  "year": 2024,
  "duration": 90,
  "genre": ["Documentary"],
  "tags": ["social", "culture"],
  "is_published": true
}

// Update film
PATCH /api/films/[film-id]
{
  "title": "Updated Title",
  "is_published": true
}

// Delete film (admin only)
DELETE /api/films/[film-id]
```

### Events

```typescript
// Get all events
GET /api/events?upcoming=true&type=screening

// Create event (curator/admin only)
POST /api/events
{
  "title": "Film Screening",
  "description": "Join us for a special screening",
  "location": "Jakarta Arts Building",
  "location_type": "offline",
  "event_type": "screening",
  "start_date": "2024-03-15T19:00:00Z",
  "capacity": 100,
  "is_free": true,
  "is_published": true
}

// Register for event
POST /api/events/[event-id]/register
{
  "registration_data": {
    "phone": "+62123456789",
    "dietary_requirements": "Vegetarian"
  }
}

// Cancel registration
DELETE /api/events/[event-id]/register
```

### Forum

```typescript
// Get all threads
GET /api/forum?category=film-discussion&page=1

// Create thread
POST /api/forum
{
  "title": "Best documentaries of 2024",
  "content": "What are your favorite documentaries this year?",
  "category": "film-discussion"
}

// Get thread posts
GET /api/forum/[thread-id]/posts

// Reply to thread
POST /api/forum/[thread-id]/posts
{
  "content": "My favorite is...",
  "parent_post_id": null  // or post-id for nested reply
}
```

### Upload

```typescript
// Upload file
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('bucket', 'posters')
formData.append('folder', 'film-posters')

POST /api/upload
Body: formData

Response:
{
  "url": "https://xxxxx.supabase.co/storage/v1/object/public/posters/...",
  "path": "film-posters/timestamp-random.jpg",
  "bucket": "posters"
}

// Delete file
DELETE /api/upload
{
  "bucket": "posters",
  "path": "film-posters/timestamp-random.jpg"
}
```

## 🪝 React Hooks

### useAuth Hook

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const {
    user,           // Current user object
    profile,        // User profile data
    session,        // Auth session
    loading,        // Loading state
    isAuthenticated,// Boolean
    isAdmin,        // Is user admin?
    isCurator,      // Is user curator or admin?
    isPremium,      // Is user premium?
    signIn,         // (email, password) => Promise
    signUp,         // (email, password, metadata) => Promise
    signOut,        // () => Promise
    updateProfile   // (updates) => Promise
  } = useAuth()

  // Usage
  const handleSignIn = async () => {
    await signIn('user@example.com', 'password')
  }

  const handleSignUp = async () => {
    await signUp('user@example.com', 'password', {
      full_name: 'John Doe',
      username: 'johndoe'
    })
  }

  const handleUpdateProfile = async () => {
    await updateProfile({
      full_name: 'New Name',
      bio: 'My bio'
    })
  }

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>

  return <div>Welcome, {profile?.full_name}</div>
}
```

### React Query Patterns

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Fetch films
function FilmsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['films', { page: 1, limit: 12 }],
    queryFn: async () => {
      const res = await fetch('/api/films?page=1&limit=12')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.films?.map(film => (
        <div key={film.id}>{film.title}</div>
      ))}
    </div>
  )
}

// Create film mutation
function CreateFilmForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (filmData) => {
      const res = await fetch('/api/films', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filmData)
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['films'] })
    }
  })

  const handleSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Film'}
      </button>
    </form>
  )
}
```

## 🗄️ Direct Supabase Queries

### Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function FilmPage({ params }) {
  const supabase = await createClient()

  // Simple query
  const { data: film, error } = await supabase
    .from('films')
    .select('*')
    .eq('id', params.id)
    .single()

  // Query with relations
  const { data: filmWithData } = await supabase
    .from('films')
    .select(`
      *,
      curator:profiles!curator_id(id, username, full_name),
      credits:film_credits(person_name, role)
    `)
    .eq('id', params.id)
    .single()

  // Insert
  const { data, error } = await supabase
    .from('films')
    .insert({ title: 'New Film', slug: 'new-film' })
    .select()
    .single()

  // Update
  const { data, error } = await supabase
    .from('films')
    .update({ title: 'Updated Title' })
    .eq('id', filmId)
    .select()
    .single()

  // Delete
  const { error } = await supabase
    .from('films')
    .delete()
    .eq('id', filmId)

  return <div>{film?.title}</div>
}
```

### Client Components

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

function FilmsList() {
  const [films, setFilms] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchFilms() {
      const { data } = await supabase
        .from('films')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10)

      setFilms(data || [])
    }

    fetchFilms()
  }, [])

  return (
    <div>
      {films.map(film => (
        <div key={film.id}>{film.title}</div>
      ))}
    </div>
  )
}
```

## 📤 File Upload Examples

### Client-Side Upload

```typescript
'use client'

import { useState } from 'react'

function UploadForm() {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', e.target.files[0])
    formData.append('bucket', 'posters')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      setUrl(data.url)
      console.log('Uploaded:', data.url)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        accept="image/*"
      />
      {uploading && <p>Uploading...</p>}
      {url && <img src={url} alt="Uploaded" />}
    </div>
  )
}
```

## 🎬 Video Player (HLS)

```typescript
'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(videoUrl)
      hls.attachMedia(videoRef.current)

      return () => {
        hls.destroy()
      }
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = videoUrl
    }
  }, [videoUrl])

  return (
    <video
      ref={videoRef}
      controls
      className="w-full"
    />
  )
}
```

## 🔐 Protected Routes

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return <div>Admin content</div>
}

// Client Component
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedClient() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
    if (!loading && !isAdmin) {
      router.push('/')
    }
  }, [isAuthenticated, isAdmin, loading, router])

  if (loading) return <div>Loading...</div>

  return <div>Protected content</div>
}
```

## 📊 Common Database Queries

```typescript
// Get user's favorite films
const { data } = await supabase
  .from('film_favorites')
  .select('film_id, films(*)')
  .eq('user_id', userId)

// Get films with average rating
const { data } = await supabase
  .from('films')
  .select('*, film_ratings(rating)')
  .eq('is_published', true)

// Get events with registration status
const { data } = await supabase
  .from('events')
  .select(`
    *,
    registrations:event_registrations!inner(status)
  `)
  .eq('event_registrations.user_id', userId)

// Search films
const { data } = await supabase
  .from('films')
  .select('*')
  .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  .eq('is_published', true)

// Get forum thread with post count
const { data } = await supabase
  .from('forum_threads')
  .select('*, author:profiles(*)')
  .order('last_activity_at', { ascending: false })

// Increment view count (using RPC)
await supabase.rpc('increment_film_views', {
  film_id_param: filmId
})
```

## 🎨 TypeScript Types

```typescript
import type {
  Film,
  FilmWithCurator,
  Event,
  ForumThread,
  Profile
} from '@/lib/types/database'

// Use in components
interface FilmCardProps {
  film: FilmWithCurator
}

function FilmCard({ film }: FilmCardProps) {
  return (
    <div>
      <h2>{film.title}</h2>
      <p>By {film.curator?.full_name}</p>
    </div>
  )
}

// API response typing
interface FilmsResponse {
  films: FilmWithCurator[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## 🐛 Common Debugging

```typescript
// Log Supabase errors
const { data, error } = await supabase.from('films').select('*')

if (error) {
  console.error('Supabase error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  })
}

// Check user session
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Check RLS policies
// If query returns empty but data exists, check RLS policies
const { data, error } = await supabase
  .from('films')
  .select('*')

console.log('Data:', data, 'Error:', error)
```

## 📦 Storage Buckets

```
avatars      - User profile pictures (2MB limit)
posters      - Film poster images (5MB limit)
thumbnails   - Film thumbnail images (2MB limit)
films        - Video files and HLS segments (500MB limit)
events       - Event banner images (5MB limit)
```

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [HLS.js Docs](https://github.com/video-dev/hls.js/)

---

**Quick Tip:** Always use server-side validation and never expose the service role key to the client!