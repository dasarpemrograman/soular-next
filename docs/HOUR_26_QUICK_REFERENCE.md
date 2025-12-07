# Hour 26: Events System Frontend - Quick Reference

## New Pages

### 1. Events Listing (`/events`)
Browse all events with filters and search.

**URL**: `http://localhost:3000/events`

**Features**:
- Filter by: Upcoming, Past, All
- Search by title/description/location
- Pagination (Load More)
- Event cards with image, date, location

**Usage**:
```tsx
// Link to events page
<Link href="/events">Browse Events</Link>

// Link with search
<Link href="/events?search=meditation">Search Meditation Events</Link>

// Link with status filter
<Link href="/events?status=upcoming">Upcoming Events</Link>
```

---

### 2. Event Detail (`/events/[id]`)
View full event details and register.

**URL**: `http://localhost:3000/events/{event-id}`

**Features**:
- Full event information
- Registration button
- Share event
- Add to calendar
- Organizer info

**Usage**:
```tsx
// Link to event detail
<Link href={`/events/${eventId}`}>View Event</Link>

// With registration prompt
router.push(`/events/${eventId}#register`);
```

---

### 3. My Events (`/my-events`)
Manage your event registrations.

**URL**: `http://localhost:3000/my-events`

**Features**:
- Tabs: Upcoming / Past
- Unregister from events
- Stats dashboard
- Protected route (requires login)

**Usage**:
```tsx
// Link to my events
<Link href="/my-events">My Events</Link>
```

---

## Code Examples

### Using Events Hooks

```tsx
import { useEvents, useEvent, useMyEvents, useEventRegistration } from '@/hooks/useEvents';

// List events
function EventsList() {
  const { data, isLoading } = useEvents({ 
    status: 'upcoming',
    search: '',
    limit: 12,
    offset: 0
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
      {data?.hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}

// Event detail
function EventDetail({ id }: { id: string }) {
  const { data: event, isLoading, error } = useEvent(id);

  if (error) return <div>Event not found</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
    </div>
  );
}

// Registration
function RegisterButton({ eventId }: { eventId: string }) {
  const { isRegistered, toggle, isRegistering } = useEventRegistration(eventId);

  return (
    <button onClick={toggle} disabled={isRegistering}>
      {isRegistered ? 'Unregister' : 'Register'}
    </button>
  );
}

// My events
function MyEventsList() {
  const { data: events, isLoading } = useMyEvents();

  const upcoming = events?.filter(e => new Date(e.event_date) > new Date());
  
  return (
    <div>
      <h2>Upcoming Events ({upcoming?.length})</h2>
      {upcoming?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

---

## Components Available

### Registration Button
Smart button that handles authentication and registration state.

```tsx
import { useEventRegistration } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';

function RegistrationButton({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { isRegistered, toggle, isRegistering } = useEventRegistration(eventId);

  const handleClick = () => {
    if (!user) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }
    toggle();
  };

  return (
    <button onClick={handleClick} disabled={isRegistering}>
      {isRegistering ? 'Processing...' : isRegistered ? 'Registered' : 'Register'}
    </button>
  );
}
```

### Share Button
Share event with Web Share API or clipboard fallback.

```tsx
function ShareButton({ event }) {
  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Join me at ${event.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  return <button onClick={handleShare}>Share</button>;
}
```

### Add to Calendar
Generate Google Calendar link.

```tsx
function AddToCalendarButton({ event }) {
  const handleAddToCalendar = () => {
    const eventDate = new Date(event.event_date);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date) => 
      date.toISOString().replace(/-|:|\.\d+/g, '');

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(eventDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(url, '_blank');
  };

  return <button onClick={handleAddToCalendar}>Add to Calendar</button>;
}
```

---

## TypeScript Types

```typescript
// Event from listing
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

// Registered event (from My Events)
interface RegisteredEvent extends Event {
  registration_status: string;
  registered_at: string;
  registration_id: string;
}

// Events list response
interface EventsResponse {
  events: Event[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Query parameters
interface EventsParams {
  status?: 'upcoming' | 'past' | 'all';
  limit?: number;
  offset?: number;
  search?: string;
}
```

---

## Common Patterns

### Protected Event Pages
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyEventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/my-events');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>My Events Content</div>;
}
```

### Event Card Component
```tsx
function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();

  return (
    <Link href={`/events/${event.id}`}>
      <div className="event-card">
        <img src={event.image_url || '/placeholder.jpg'} alt={event.title} />
        <span className={isUpcoming ? 'upcoming' : 'past'}>
          {isUpcoming ? 'Upcoming' : 'Past'}
        </span>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <p>{eventDate.toLocaleDateString()}</p>
        <p>{event.location}</p>
      </div>
    </Link>
  );
}
```

### Search with URL State
```tsx
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

function EventsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);

  const { data } = useEvents({ search });

  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events..."
      />
      {/* Results */}
    </div>
  );
}
```

---

## Navigation

### Header Link
Already updated in `components/Header.tsx`:
```tsx
<Link href="/events">Events</Link>
```

### From Other Pages
```tsx
// From profile
<Link href="/my-events">
  <Button>My Events</Button>
</Link>

// From home
<Link href="/events">
  <Button>Browse Events</Button>
</Link>

// From film detail
<Link href="/events?search=meditation">
  <Button>Related Events</Button>
</Link>
```

---

## Styling Classes (Tailwind)

### Event Card
```tsx
<div className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
  {/* Content */}
</div>
```

### Status Badge
```tsx
<span className={`px-3 py-1 rounded-full text-xs font-medium ${
  isUpcoming ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
}`}>
  {isUpcoming ? 'Upcoming' : 'Past'}
</span>
```

### Gradient Overlay
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
```

---

## Testing Guide

### Manual Testing

1. **Events Listing**
   ```
   1. Visit /events
   2. Should see upcoming events
   3. Click "Past" tab → see past events
   4. Search "yoga" → see filtered results
   5. Click "Load More" → see more events
   ```

2. **Event Detail**
   ```
   1. Click any event card
   2. Should see full details
   3. Click "Register" (logged in) → confirm registration
   4. Click "Share" → test share functionality
   5. Click "Add to Calendar" → opens Google Calendar
   ```

3. **My Events**
   ```
   1. Visit /my-events (must be logged in)
   2. See registered events in tabs
   3. Click "Unregister" → confirm → event removed
   4. View stats dashboard
   ```

### API Testing
```bash
# List events
curl http://localhost:3000/api/events?status=upcoming

# Get event detail
curl http://localhost:3000/api/events/{id}

# My registered events (requires auth cookie)
curl http://localhost:3000/api/my-events -H "Cookie: ..."
```

---

## Troubleshooting

### Events not showing
- Check migration 003 is run
- Verify events table has data
- Check date format (ISO 8601)
- Inspect network tab for API errors

### Registration not working
- Verify user is authenticated
- Check event hasn't passed
- Check max_participants limit
- Inspect console for errors

### Images not loading
- Verify image_url is valid
- Check CORS if external images
- Fallback gradient should show
- Use Next.js Image component

### "Unauthorized" on My Events
- User must be logged in
- Check session is valid
- Redirect to login working?
- Clear cookies and re-login

---

## Performance Tips

1. **Image Optimization**: Always use Next.js `Image` component
2. **Pagination**: Use `limit` and `offset` to reduce payload
3. **Caching**: React Query caches for 5 minutes
4. **Lazy Loading**: Images load as needed
5. **Suspense**: Prevents blocking renders

---

## Accessibility

- ✅ Semantic HTML (`<article>`, `<nav>`, `<main>`)
- ✅ Alt text on images
- ✅ Button labels clear
- ✅ Color + text for status (not just color)
- ✅ Keyboard navigation works
- ✅ Focus indicators visible

---

## Next Steps

**Completed**: Events System ✅
**Next**: Forum System (Hours 27-28)
- Forum posts listing
- Create/edit posts
- Comments and replies
- Likes and reactions