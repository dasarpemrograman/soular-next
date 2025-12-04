# 🎬 Soular Next

A modern film streaming and community platform built with Next.js 15, React 19, and Supabase.

## ✨ Features

- 🎥 **Film Streaming** - HLS video streaming with watch progress tracking
- 🎫 **Events Management** - Screenings, workshops, and film festivals
- 💬 **Community Forum** - Discuss films and connect with other cinephiles
- 📚 **Collections** - Curated film playlists
- ⭐ **Ratings & Reviews** - Rate and favorite films
- 👤 **User Profiles** - Customizable profiles with role-based access
- 🔒 **Secure Authentication** - Email/password auth with Supabase
- 📱 **Responsive Design** - Beautiful UI with Tailwind CSS and Radix UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works!)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd soular-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and API keys from Project Settings → API
   - See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed instructions

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Set up the database**
   
   - Open Supabase Dashboard → SQL Editor
   - Run the SQL from `supabase/schema.sql`
   - Create storage buckets (avatars, posters, thumbnails, films, events)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## 📖 Documentation

- **[Backend Setup Guide](./BACKEND_SETUP.md)** - Complete backend implementation guide
- **[Backend Implementation Plan](./BACKEND_IMPLEMENTATION_GUIDE.md)** - Original implementation plan

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - App Router with React Server Components
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Supabase** - Complete backend solution
  - PostgreSQL database
  - Authentication
  - Storage
  - Row Level Security (RLS)
- **Next.js API Routes** - Server-side endpoints

## 📁 Project Structure

```
soular-next/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── films/           # Film CRUD operations
│   │   ├── events/          # Event management
│   │   ├── forum/           # Forum threads & posts
│   │   └── upload/          # File upload handler
│   ├── acara/               # Events pages
│   ├── koleksi/             # Collections pages
│   ├── forum/               # Forum pages
│   └── page.tsx             # Home page
├── components/              # React components
├── hooks/                   # Custom React hooks
│   └── useAuth.ts          # Authentication hook
├── lib/
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   └── types/              # TypeScript types
│       └── database.ts     # Database types
├── supabase/
│   └── schema.sql          # Database schema
└── middleware.ts           # Auth session management
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/callback` - Auth callback handler

### Films
- `GET /api/films` - List films (paginated)
- `POST /api/films` - Create film (curator/admin)
- `GET /api/films/[id]` - Get single film
- `PATCH /api/films/[id]` - Update film
- `DELETE /api/films/[id]` - Delete film (admin)

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
- `POST /api/upload` - Upload file
- `DELETE /api/upload` - Delete file

## 🎯 Usage Examples

### Using the Auth Hook

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, signIn, signOut, isAuthenticated } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signIn(email, password)}>Sign In</button>
      )}
    </div>
  )
}
```

### Fetching Data with React Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export default function FilmsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['films'],
    queryFn: async () => {
      const res = await fetch('/api/films')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data?.films?.map(film => (
        <div key={film.id}>{film.title}</div>
      ))}
    </div>
  )
}
```

### Server-Side Data Fetching

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function FilmPage({ params }) {
  const supabase = await createClient()
  
  const { data: film } = await supabase
    .from('films')
    .select('*')
    .eq('id', params.id)
    .single()

  return <div>{film?.title}</div>
}
```

## 🔒 Database Schema

The application uses PostgreSQL with the following main tables:

- **profiles** - User profiles and metadata
- **films** - Film catalog with metadata
- **film_credits** - Cast and crew information
- **film_favorites** - User favorites
- **film_ratings** - User ratings
- **watch_progress** - Video playback tracking
- **events** - Event listings
- **event_registrations** - Event sign-ups
- **forum_threads** - Forum discussions
- **forum_posts** - Thread replies
- **collections** - Curated film lists
- **notifications** - User notifications

All tables have Row Level Security (RLS) policies for secure data access.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy!

### Post-Deployment

Update Supabase authentication URLs:
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your production URL and callback URL

## 💰 Costs

**Development (Free):**
- Supabase Free Tier: $0/month
- Vercel Free Tier: $0/month

**Production (when you exceed free limits):**
- Supabase Pro: $25/month
- Vercel Pro: $20/month

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Server-side API key protection
- ✅ Input validation with Zod
- ✅ CORS protection
- ✅ Authentication required for sensitive operations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For detailed setup instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit [Supabase Discord](https://discord.supabase.com)

---

Made with ❤️ for film enthusiasts