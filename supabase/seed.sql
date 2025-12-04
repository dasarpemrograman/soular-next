-- Seed Data for Soular Next
-- This script adds sample data for testing and development

-- ============================================================================
-- SAMPLE PROFILES (USERS)
-- ============================================================================
-- Note: These users need to be created through Supabase Auth first
-- This section assumes you have created test users and inserts their profiles
-- Replace the UUIDs with actual user IDs from your auth.users table

-- Example: Create admin user profile
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
-- UPDATE profiles SET role = 'curator' WHERE email = 'curator@example.com';

-- ============================================================================
-- SAMPLE FILMS
-- ============================================================================

INSERT INTO films (title, slug, synopsis, description, director, year, duration, genre, tags, language, country, is_premium, is_published, rating) VALUES
(
  'Midnight in Jakarta',
  'midnight-in-jakarta',
  'A contemplative journey through the streets of Jakarta at night, exploring the lives of those who come alive after dark.',
  'This poetic documentary follows various individuals navigating Jakarta''s nighttime landscape. From street vendors to taxi drivers, each person shares their story of survival, dreams, and the unique magic that emerges when the sun sets over the bustling metropolis.',
  'Rahmat Setiawan',
  2023,
  87,
  ARRAY['Documentary', 'Drama'],
  ARRAY['urban', 'night', 'jakarta', 'social'],
  'Indonesian',
  'Indonesia',
  false,
  true,
  4.5
),
(
  'Whispers of the Archipelago',
  'whispers-of-the-archipelago',
  'An intimate portrait of island life in the Indonesian archipelago, capturing traditions that are slowly fading away.',
  'Through stunning cinematography and patient observation, this film documents the daily rituals and ceremonies of communities living on remote islands. The film serves as both a celebration and a meditation on cultural preservation in the face of modernization.',
  'Sari Kusuma',
  2022,
  102,
  ARRAY['Documentary', 'Cultural'],
  ARRAY['tradition', 'culture', 'islands', 'heritage'],
  'Indonesian',
  'Indonesia',
  false,
  true,
  4.7
),
(
  'The Last Wayang Master',
  'the-last-wayang-master',
  'A master puppeteer struggles to keep the ancient art of wayang kulit alive in contemporary Indonesia.',
  'This documentary follows Ki Joko, one of the last traditional wayang kulit masters, as he teaches a new generation of puppeteers. The film explores the tension between preserving tradition and adapting to modern audiences, while showcasing the intricate beauty of this UNESCO-recognized art form.',
  'Bambang Prasetyo',
  2021,
  95,
  ARRAY['Documentary', 'Art'],
  ARRAY['wayang', 'tradition', 'puppetry', 'unesco'],
  'Indonesian',
  'Indonesia',
  true,
  true,
  4.8
),
(
  'Nusantara Echoes',
  'nusantara-echoes',
  'A musical journey across Indonesia, discovering the diverse sounds that make up the archipelago''s rich sonic tapestry.',
  'From gamelan orchestras to contemporary experimental musicians, this film explores Indonesia''s musical diversity. The documentary weaves together performances, interviews, and stunning landscapes to create a sensory experience that celebrates the nation''s cultural wealth.',
  'Dewi Anggraini',
  2023,
  78,
  ARRAY['Documentary', 'Music'],
  ARRAY['music', 'gamelan', 'culture', 'diversity'],
  'Indonesian',
  'Indonesia',
  false,
  true,
  4.4
),
(
  'Shadows of Borobudur',
  'shadows-of-borobudur',
  'A mystical narrative exploring the legends and spiritual significance of the Borobudur temple.',
  'Blending documentary footage with dramatic reenactments, this film delves into the mysteries surrounding Borobudur. Ancient stories come alive as historians, archaeologists, and spiritual practitioners share their perspectives on this monumental Buddhist temple.',
  'Andi Nugroho',
  2020,
  88,
  ARRAY['Documentary', 'Historical'],
  ARRAY['borobudur', 'buddhism', 'temple', 'history'],
  'Indonesian',
  'Indonesia',
  false,
  true,
  4.3
),
(
  'Flavors of Home',
  'flavors-of-home',
  'A heartwarming exploration of Indonesian cuisine through the stories of home cooks and street food vendors.',
  'Food becomes a lens for understanding Indonesian culture in this delicious documentary. From rendang to nasi goreng, each dish tells a story of family, migration, and identity. The film celebrates the unsung heroes who keep culinary traditions alive.',
  'Lisa Maharani',
  2023,
  92,
  ARRAY['Documentary', 'Food'],
  ARRAY['food', 'cuisine', 'cooking', 'culture'],
  'Indonesian',
  'Indonesia',
  false,
  true,
  4.6
);

-- ============================================================================
-- SAMPLE FILM CREDITS
-- ============================================================================

-- Credits for "Midnight in Jakarta"
INSERT INTO film_credits (film_id, person_name, role)
SELECT id, 'Rahmat Setiawan', 'director' FROM films WHERE slug = 'midnight-in-jakarta';
INSERT INTO film_credits (film_id, person_name, role)
SELECT id, 'Agung Wibowo', 'cinematographer' FROM films WHERE slug = 'midnight-in-jakarta';
INSERT INTO film_credits (film_id, person_name, role)
SELECT id, 'Tina Surya', 'editor' FROM films WHERE slug = 'midnight-in-jakarta';

-- Credits for "Whispers of the Archipelago"
INSERT INTO film_credits (film_id, person_name, role)
SELECT id, 'Sari Kusuma', 'director' FROM films WHERE slug = 'whispers-of-the-archipelago';
INSERT INTO film_credits (film_id, person_name, role)
SELECT id, 'Eko Purnomo', 'cinematographer' FROM films WHERE slug = 'whispers-of-the-archipelago';

-- Credits for "The Last Wayang Master"
INSERT INTO film_credits (film_id, person_name, role)
SELECT id, 'Bambang Prasetyo', 'director' FROM films WHERE slug = 'the-last-wayang-master';
INSERT INTO film_credits (film_id, person_name, role)
SELECT id, 'Ki Joko Susilo', 'actor' FROM films WHERE slug = 'the-last-wayang-master';

-- ============================================================================
-- SAMPLE EVENTS
-- ============================================================================

INSERT INTO events (title, slug, description, location, location_type, event_type, start_date, end_date, capacity, is_free, is_published) VALUES
(
  'Indonesian Documentary Festival 2024',
  'indonesian-documentary-festival-2024',
  'Join us for a week-long celebration of Indonesian documentary filmmaking. Featuring screenings, workshops, and panel discussions with acclaimed filmmakers from across the archipelago.',
  'Jakarta Arts Building, South Jakarta',
  'offline',
  'festival',
  '2024-03-15 09:00:00+00',
  '2024-03-22 18:00:00+00',
  500,
  true,
  true
),
(
  'Masterclass: The Art of Documentary Storytelling',
  'masterclass-documentary-storytelling',
  'Learn from award-winning documentary filmmaker Sari Kusuma as she shares her techniques for crafting compelling narratives. This intensive workshop covers story development, interviewing, and ethical considerations in documentary work.',
  'Online via Zoom',
  'online',
  'workshop',
  '2024-02-10 14:00:00+00',
  '2024-02-10 17:00:00+00',
  50,
  false,
  true
),
(
  'Screening: Whispers of the Archipelago',
  'screening-whispers-archipelago',
  'Special screening of "Whispers of the Archipelago" followed by Q&A with director Sari Kusuma. Discover the beauty and traditions of Indonesia''s remote islands through this stunning documentary.',
  'Kineforum Jakarta',
  'offline',
  'screening',
  '2024-02-05 19:00:00+00',
  '2024-02-05 21:30:00+00',
  150,
  true,
  true
),
(
  'Film Discussion: Preserving Cultural Heritage Through Cinema',
  'discussion-cultural-heritage-cinema',
  'Join our panel of filmmakers, cultural preservationists, and scholars as they discuss the role of documentary film in protecting and promoting Indonesia''s rich cultural heritage.',
  'Cultural Center, Yogyakarta',
  'hybrid',
  'discussion',
  '2024-03-01 15:00:00+00',
  '2024-03-01 17:00:00+00',
  100,
  true,
  true
),
(
  'Short Film Competition: Voices of Nusantara',
  'short-film-competition-voices-nusantara',
  'Calling all emerging filmmakers! Submit your short documentary (under 15 minutes) exploring any aspect of Indonesian culture, society, or environment. Winners receive production grants and festival screening opportunities.',
  'Online Submission',
  'online',
  'other',
  '2024-01-15 00:00:00+00',
  '2024-04-15 23:59:00+00',
  null,
  true,
  true
);

-- ============================================================================
-- SAMPLE FORUM THREADS
-- ============================================================================

INSERT INTO forum_threads (title, slug, content, category, is_pinned) VALUES
(
  'Welcome to Soular Community!',
  'welcome-to-soular-community',
  'Welcome to the Soular community forum! This is a space for film enthusiasts, documentary lovers, and cultural explorers to connect, share, and discuss.

Please introduce yourself and let us know what brings you here. What kind of films are you interested in? Are you a filmmaker, student, or simply a passionate viewer?

Looking forward to building this community together!',
  'general',
  true
),
(
  'Best Indonesian Documentaries of 2023',
  'best-indonesian-documentaries-2023',
  'As we wrap up 2023, I thought it would be great to discuss our favorite Indonesian documentaries from this year.

My top pick is "Whispers of the Archipelago" - the cinematography is absolutely breathtaking and it really made me appreciate the diversity of our culture.

What are your favorites? Let''s create a community-curated list!',
  'film-discussion',
  false
),
(
  'Tips for aspiring documentary filmmakers',
  'tips-aspiring-documentary-filmmakers',
  'I''m planning to make my first short documentary about traditional batik makers in my hometown. For those who have experience in documentary filmmaking, what advice would you give to someone just starting out?

Equipment recommendations, storytelling tips, common mistakes to avoid - I''d love to hear it all!',
  'technical',
  false
),
(
  'Upcoming film festivals in Southeast Asia',
  'upcoming-film-festivals-southeast-asia',
  'I''m compiling a list of documentary film festivals happening in Southeast Asia in 2024. Here''s what I have so far:

- Indonesian Documentary Festival (Jakarta, March)
- Singapore International Film Festival (November)
- Freedom Film Festival (Malaysia, September)

Please add any others you know about! This could be a helpful resource for both viewers and filmmakers.',
  'events',
  false
),
(
  'Discussion: The role of documentary in social change',
  'discussion-documentary-social-change',
  'I recently watched several Indonesian documentaries that tackle important social issues - environmental degradation, cultural preservation, inequality, etc.

It made me wonder: how effective are documentaries in actually creating social change? Do they raise awareness? Do they influence policy? Or do they mainly preach to the converted?

Would love to hear different perspectives on this.',
  'film-discussion',
  false
);

-- ============================================================================
-- SAMPLE COLLECTIONS
-- ============================================================================

INSERT INTO collections (title, slug, description, is_public) VALUES
(
  'Essential Indonesian Documentaries',
  'essential-indonesian-documentaries',
  'A curated collection of must-watch Indonesian documentary films that showcase the diversity, culture, and contemporary issues of the archipelago.',
  true
),
(
  'Cultural Heritage Series',
  'cultural-heritage-series',
  'Films exploring Indonesia''s rich cultural traditions, from traditional arts to ancient temples.',
  true
),
(
  'New Voices in Documentary',
  'new-voices-documentary',
  'Featuring emerging Indonesian documentary filmmakers who are bringing fresh perspectives and innovative storytelling techniques.',
  true
);

-- Add films to collections
INSERT INTO collection_films (collection_id, film_id, position)
SELECT c.id, f.id, 1
FROM collections c, films f
WHERE c.slug = 'essential-indonesian-documentaries'
AND f.slug = 'whispers-of-the-archipelago';

INSERT INTO collection_films (collection_id, film_id, position)
SELECT c.id, f.id, 2
FROM collections c, films f
WHERE c.slug = 'essential-indonesian-documentaries'
AND f.slug = 'midnight-in-jakarta';

INSERT INTO collection_films (collection_id, film_id, position)
SELECT c.id, f.id, 1
FROM collections c, films f
WHERE c.slug = 'cultural-heritage-series'
AND f.slug = 'the-last-wayang-master';

INSERT INTO collection_films (collection_id, film_id, position)
SELECT c.id, f.id, 2
FROM collections c, films f
WHERE c.slug = 'cultural-heritage-series'
AND f.slug = 'shadows-of-borobudur';

-- ============================================================================
-- NOTES
-- ============================================================================

-- To use this seed data:
-- 1. First run schema.sql to create all tables
-- 2. Create at least one user through Supabase Auth signup
-- 3. Update that user's role to 'curator' or 'admin' in the profiles table
-- 4. Run this seed.sql file
-- 5. You can then associate the curator_id and organizer_id with actual user IDs

-- To update curator/organizer IDs after creating users:
-- UPDATE films SET curator_id = 'your-user-uuid' WHERE curator_id IS NULL;
-- UPDATE events SET organizer_id = 'your-user-uuid' WHERE organizer_id IS NULL;
-- UPDATE forum_threads SET author_id = 'your-user-uuid' WHERE author_id IS NULL;
-- UPDATE collections SET curator_id = 'your-user-uuid' WHERE curator_id IS NULL;
