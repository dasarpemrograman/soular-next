-- =====================================================
-- EVENTS TABLE MIGRATION
-- =====================================================
-- This migration creates the events and event_registrations tables
-- for managing community events and user registrations.

-- =====================================================
-- 1. CREATE EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'screening', 'discussion', 'networking', 'other')),
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    is_online BOOLEAN DEFAULT false,
    online_link TEXT,
    max_participants INTEGER,
    image_url TEXT,
    host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE EVENT_REGISTRATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled', 'waitlist')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON public.events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);

-- =====================================================
-- 4. CREATE UPDATED_AT TRIGGER FOR EVENTS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_events_updated_at();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES FOR EVENTS
-- =====================================================

-- Everyone can view published events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone"
    ON public.events
    FOR SELECT
    USING (true);

-- Authenticated users can create events
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events"
    ON public.events
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = host_id);

-- Event hosts can update their own events
DROP POLICY IF EXISTS "Event hosts can update their events" ON public.events;
CREATE POLICY "Event hosts can update their events"
    ON public.events
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);

-- Event hosts can delete their own events
DROP POLICY IF EXISTS "Event hosts can delete their events" ON public.events;
CREATE POLICY "Event hosts can delete their events"
    ON public.events
    FOR DELETE
    TO authenticated
    USING (auth.uid() = host_id);

-- =====================================================
-- 7. CREATE RLS POLICIES FOR EVENT_REGISTRATIONS
-- =====================================================

-- Users can view their own registrations
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;
CREATE POLICY "Users can view their own registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Event hosts can view registrations for their events
DROP POLICY IF EXISTS "Hosts can view event registrations" ON public.event_registrations;
CREATE POLICY "Hosts can view event registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_registrations.event_id
            AND events.host_id = auth.uid()
        )
    );

-- Users can register for events
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
CREATE POLICY "Users can register for events"
    ON public.event_registrations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own registrations
DROP POLICY IF EXISTS "Users can update their registrations" ON public.event_registrations;
CREATE POLICY "Users can update their registrations"
    ON public.event_registrations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own registrations
DROP POLICY IF EXISTS "Users can cancel their registrations" ON public.event_registrations;
CREATE POLICY "Users can cancel their registrations"
    ON public.event_registrations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get event participant count
CREATE OR REPLACE FUNCTION public.get_event_participant_count(event_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.event_registrations
    WHERE event_id = event_uuid
    AND status IN ('registered', 'attended');
$$ LANGUAGE SQL STABLE;

-- Function to check if event is full
CREATE OR REPLACE FUNCTION public.is_event_full(event_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT
        CASE
            WHEN e.max_participants IS NULL THEN false
            ELSE public.get_event_participant_count(event_uuid) >= e.max_participants
        END
    FROM public.events e
    WHERE e.id = event_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if user is registered for event
CREATE OR REPLACE FUNCTION public.is_user_registered(event_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.event_registrations
        WHERE event_id = event_uuid
        AND user_id = user_uuid
        AND status = 'registered'
    );
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- 9. INSERT SAMPLE DATA
-- =====================================================

-- Note: This uses a dummy UUID for host_id since we don't have real users yet
-- You should update these with real user IDs once authentication is implemented

INSERT INTO public.events (id, title, description, event_type, date, end_date, location, is_online, online_link, max_participants, image_url, status, tags) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Introduction to Documentary Filmmaking',
    'Join us for an interactive workshop covering the fundamentals of documentary filmmaking. Learn about storytelling, camera techniques, and post-production workflows from industry professionals.',
    'workshop',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
    'Community Center, Room 201',
    false,
    NULL,
    30,
    '/images/events/documentary-workshop.jpg',
    'upcoming',
    ARRAY['filmmaking', 'documentary', 'beginners']
),
(
    '00000000-0000-0000-0000-000000000002',
    'Virtual Screening: Climate Change Stories',
    'A special online screening of award-winning short documentaries about climate change, followed by a Q&A with the filmmakers.',
    'screening',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
    NULL,
    true,
    'https://zoom.us/j/example123',
    100,
    '/images/events/climate-screening.jpg',
    'upcoming',
    ARRAY['screening', 'climate', 'environment']
),
(
    '00000000-0000-0000-0000-000000000003',
    'Women in Film: Panel Discussion',
    'An inspiring panel discussion featuring successful women filmmakers sharing their experiences, challenges, and advice for aspiring creators.',
    'discussion',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '90 minutes',
    'Arts Theater, Main Hall',
    false,
    NULL,
    50,
    '/images/events/women-in-film.jpg',
    'upcoming',
    ARRAY['discussion', 'women', 'inspiration']
),
(
    '00000000-0000-0000-0000-000000000004',
    'Filmmaker Networking Mixer',
    'Connect with fellow filmmakers, producers, and cinema enthusiasts. Great opportunity to find collaborators and discuss projects over drinks and snacks.',
    'networking',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '2 hours',
    'The Riverside Café',
    false,
    NULL,
    40,
    '/images/events/networking-mixer.jpg',
    'upcoming',
    ARRAY['networking', 'community', 'social']
),
(
    '00000000-0000-0000-0000-000000000005',
    'Advanced Color Grading Techniques',
    'Dive deep into professional color grading workflows using DaVinci Resolve. This workshop is designed for intermediate to advanced filmmakers.',
    'workshop',
    NOW() + INTERVAL '28 days',
    NOW() + INTERVAL '28 days' + INTERVAL '4 hours',
    'Digital Lab, Studio B',
    false,
    NULL,
    15,
    '/images/events/color-grading.jpg',
    'upcoming',
    ARRAY['post-production', 'advanced', 'technical']
),
(
    '00000000-0000-0000-0000-000000000006',
    'Indigenous Voices: Film Showcase',
    'A curated showcase of documentaries by Indigenous filmmakers, celebrating diverse stories and perspectives. Includes filmmaker introductions.',
    'screening',
    NOW() + INTERVAL '35 days',
    NOW() + INTERVAL '35 days' + INTERVAL '3 hours',
    'Cultural Center Auditorium',
    false,
    NULL,
    80,
    '/images/events/indigenous-showcase.jpg',
    'upcoming',
    ARRAY['screening', 'indigenous', 'diversity']
),
(
    '00000000-0000-0000-0000-000000000007',
    'Fundraising for Independent Films',
    'Learn practical strategies for funding your independent film projects, including grants, crowdfunding, and investor relations.',
    'workshop',
    NOW() + INTERVAL '42 days',
    NOW() + INTERVAL '42 days' + INTERVAL '2.5 hours',
    NULL,
    true,
    'https://meet.google.com/example',
    60,
    '/images/events/fundraising.jpg',
    'upcoming',
    ARRAY['business', 'funding', 'production']
),
(
    '00000000-0000-0000-0000-000000000008',
    'Documentary Ethics Roundtable',
    'An important discussion about ethical considerations in documentary filmmaking, including consent, representation, and storytelling responsibility.',
    'discussion',
    NOW() + INTERVAL '49 days',
    NOW() + INTERVAL '49 days' + INTERVAL '2 hours',
    'University Campus, Lecture Hall 3',
    false,
    NULL,
    45,
    '/images/events/ethics-roundtable.jpg',
    'upcoming',
    ARRAY['ethics', 'discussion', 'education']
),
(
    '00000000-0000-0000-0000-000000000009',
    'Sound Design Masterclass',
    'Master the art of sound design for documentaries. Learn recording techniques, sound editing, and creating immersive audio experiences.',
    'workshop',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '5 hours',
    'Audio Production Studio',
    false,
    NULL,
    12,
    '/images/events/sound-design.jpg',
    'completed',
    ARRAY['audio', 'technical', 'post-production']
),
(
    '00000000-0000-0000-0000-000000000010',
    'Monthly Filmmaker Meetup',
    'Our regular monthly meetup for the filmmaking community. Share your work, get feedback, and stay connected with fellow creators.',
    'networking',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
    'The Corner Brewery',
    false,
    NULL,
    NULL,
    '/images/events/monthly-meetup.jpg',
    'upcoming',
    ARRAY['community', 'networking', 'monthly']
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: events, event_registrations
-- RLS enabled and policies created
-- Helper functions created
-- Sample data inserted (10 events)
-- =====================================================
