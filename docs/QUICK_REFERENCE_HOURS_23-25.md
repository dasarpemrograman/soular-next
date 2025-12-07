# Quick Reference Guide: Hours 23-25

## New Features Implemented

### 🎭 Hour 23: Profile Management
**User can now edit their profile with avatar upload**

#### Key Routes
- `/profile` - View and edit profile (protected)

#### Key Hooks
```tsx
import { useProfile, useUpdateProfile, useAvatar } from '@/hooks/useProfile';

// In your component
const { data: profile, isLoading } = useProfile();
const updateProfile = useUpdateProfile();
const { upload, remove, isUploading } = useAvatar();

// Update profile
updateProfile.mutate({ name: 'New Name', bio: 'My bio' });

// Upload avatar
upload(fileObject);

// Remove avatar
remove();
```

#### API Endpoints
```
GET    /api/profile          # Get current user's profile
PATCH  /api/profile          # Update profile
POST   /api/profile/avatar   # Upload avatar
DELETE /api/profile/avatar   # Remove avatar
```

---

### ❤️ Hour 24: Favorites List
**User can view all their favorited films**

#### Key Routes
- `/favorites` - View all favorited films (protected)

#### Existing Hooks (from previous hours)
```tsx
import { useFavorite, useFavoriteStatus } from '@/hooks/useFavorite';

// Check if film is favorited
const { data: isFavorited } = useFavoriteStatus(filmId);

// Toggle favorite
const { toggle, isLoading } = useFavorite(filmId);
```

#### API Endpoints
```
GET /api/favorites                    # Get user's favorite films
GET /api/films/[id]/favorite          # Check favorite status
POST /api/films/[id]/favorite         # Add to favorites
DELETE /api/films/[id]/favorite       # Remove from favorites
```

---

### 📅 Hour 25: Events System (Backend)
**Complete backend for event registration system**

#### Key Hooks
```tsx
import { 
  useEvents, 
  useEvent, 
  useMyEvents,
  useEventRegistration 
} from '@/hooks/useEvents';

// List events
const { data } = useEvents({ 
  status: 'upcoming',  // 'upcoming' | 'past' | 'all'
  search: 'meditation',
  limit: 12,
  offset: 0 
});

// Get single event
const { data: event } = useEvent(eventId);

// My registered events
const { data: myEvents } = useMyEvents();

// Registration operations
const { 
  isRegistered, 
  toggle, 
  register, 
  unregister,
  isRegistering 
} = useEventRegistration(eventId);
```

#### API Endpoints
```
GET    /api/events                      # List events (public)
GET    /api/events/[id]                 # Event detail (public)
GET    /api/events/[id]/register        # Check registration status
POST   /api/events/[id]/register        # Register for event (auth required)
DELETE /api/events/[id]/register        # Unregister (auth required)
GET    /api/my-events                   # User's registered events (auth required)
```

---

## Database Migrations Needed

Run this migration in Supabase SQL Editor:

```sql
-- Migration 006: Storage for Avatars
-- Copy and paste from: supabase/migrations/006_storage_avatars.sql
```

**Migrations 001-005 should already be done from previous hours.**

---

## Quick Start Testing

### Test Profile Editing
1. Login at `/login`
2. Navigate to `/profile`
3. Click "Edit Profile"
4. Change name/bio
5. Hover over avatar and upload image
6. Save changes

### Test Favorites
1. Go to `/koleksi` or any film detail page
2. Click heart icon on films
3. Navigate to `/favorites`
4. View your favorited films
5. Click to view details or unfavorite

### Test Events API
```bash
# List upcoming events
curl http://localhost:3000/api/events?status=upcoming

# Get event detail
curl http://localhost:3000/api/events/{event-id}

# Search events
curl http://localhost:3000/api/events?search=yoga
```

---

## Common Code Snippets

### Profile Avatar Component
```tsx
'use client';
import { useAvatar } from '@/hooks/useAvatar';
import { useRef } from 'react';

export function AvatarUpload() {
  const { upload, isUploading } = useAvatar();
  const fileInput = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await upload(file);
    }
  };

  return (
    <>
      <button onClick={() => fileInput.current?.click()}>
        {isUploading ? 'Uploading...' : 'Upload Avatar'}
      </button>
      <input 
        ref={fileInput}
        type="file" 
        accept="image/*"
        onChange={handleUpload}
        hidden 
      />
    </>
  );
}
```

### Events List Component
```tsx
'use client';
import { useEvents } from '@/hooks/useEvents';

export function EventsList() {
  const { data, isLoading } = useEvents({ status: 'upcoming' });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>{new Date(event.event_date).toLocaleDateString()}</p>
          <p>{event.location}</p>
        </div>
      ))}
    </div>
  );
}
```

### Event Registration Button
```tsx
'use client';
import { useEventRegistration } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';

export function RegisterButton({ eventId }: { eventId: string }) {
  const { isRegistered, toggle, isRegistering } = useEventRegistration(eventId);

  return (
    <Button 
      onClick={toggle}
      disabled={isRegistering}
      variant={isRegistered ? "outline" : "premium"}
    >
      {isRegistering 
        ? 'Processing...' 
        : isRegistered 
          ? 'Unregister' 
          : 'Register'
      }
    </Button>
  );
}
```

---

## TypeScript Types Reference

### Profile Types
```typescript
interface Profile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
}
```

### Event Types
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  organizer: string;
  max_participants: number | null;
  image_url: string | null;
  created_at: string;
  is_registered?: boolean;
}

interface EventsParams {
  status?: 'upcoming' | 'past' | 'all';
  limit?: number;
  offset?: number;
  search?: string;
}
```

---

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Protected Routes

These routes require authentication (middleware will redirect to `/login`):
- `/profile`
- `/settings`
- `/dashboard`
- `/favorites`

---

## What's Next?

### Hour 26: Events Frontend (Recommended)
- Events listing page with filters
- Event detail page with rich content
- Registration UI with confirmation
- My Events page showing registered events

### Other Options:
- Forum system (Hours 27-28)
- Admin panel (Hours 29-30)
- Search improvements
- Analytics dashboard
- Payment integration

---

## Troubleshooting

### Avatar upload fails
- Check file size (< 5MB)
- Check file type (JPEG, PNG, WebP, GIF only)
- Verify storage bucket exists in Supabase
- Check RLS policies on storage.objects

### Profile not loading
- Verify user is authenticated
- Check profile exists in `profiles` table
- Check browser console for errors
- Verify API endpoint returns 200

### Events not showing
- Check `events` table has data
- Verify migration 003 was run
- Check date filters in query
- Check browser console for errors

### "Unauthorized" errors
- Verify user is logged in
- Check session is valid
- Clear cookies and re-login
- Check Supabase auth tokens

---

## Performance Tips

1. **React Query Caching**: Hooks use 5-minute stale time
2. **Image Optimization**: Use Next.js Image component
3. **Pagination**: Events API supports limit/offset
4. **Optimistic Updates**: Profile/favorites use cache updates

---

## Security Notes

✅ All profile/favorites endpoints require authentication
✅ RLS policies protect database access
✅ Storage policies ensure users can only modify their own avatars
✅ Input validation on all API endpoints
✅ File type and size validation for uploads

---

For detailed implementation notes, see:
- `docs/HOURS_23-25_SUMMARY.md` (full documentation)
- `IMPLEMENTATION_LOG.md` (changelog)