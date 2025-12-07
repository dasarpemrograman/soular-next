-- ============================================
-- SOULAR NEXT - SEED DATA
-- ============================================
-- This file populates the database with realistic test data
-- Run this AFTER running the main migration (100_complete_schema.sql)

-- ============================================
-- 1. SAMPLE FILMS
-- ============================================

INSERT INTO public.films (id, title, slug, description, director, year, duration, category, youtube_url, thumbnail, is_premium, is_published, rating, view_count)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Kisah Kota Yang Terlupakan',
    'kisah-kota-yang-terlupakan',
    'Sebuah dokumenter mendalam tentang transformasi Bandung dari masa kolonial hingga era digital, melalui mata para seniman lokal.',
    'Rina Kartika',
    2024,
    95,
    'Dokumenter',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop',
    true,
    true,
    4.5,
    1234
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Melodi Nusantara',
    'melodi-nusantara',
    'Perjalanan musikal yang mengeksplorasi kekayaan musik tradisional Indonesia dari Sabang sampai Merauke.',
    'Ahmad Fadli',
    2024,
    108,
    'Musikal',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=900&fit=crop',
    true,
    true,
    4.7,
    2341
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Jejak Rimba',
    'jejak-rimba',
    'Petualangan visual yang mengikuti ekspedisi peneliti muda ke jantung hutan Indonesia.',
    'Maya Sari',
    2023,
    92,
    'Petualangan',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600&h=900&fit=crop',
    false,
    true,
    4.2,
    987
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Suara Dari Timur',
    'suara-dari-timur',
    'Drama keluarga yang mengangkat isu identitas dan akar budaya di Papua.',
    'Budi Santoso',
    2024,
    115,
    'Drama',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop',
    true,
    true,
    4.8,
    3456
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Bayangan Masa Lalu',
    'bayangan-masa-lalu',
    'Thriller psikologis tentang seorang jurnalis yang menyelidiki kasus hilangnya sebuah desa.',
    'Dian Sastro',
    2023,
    98,
    'Thriller',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop',
    false,
    true,
    4.3,
    1567
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'Cahaya Di Ufuk Timur',
    'cahaya-di-ufuk-timur',
    'Kisah inspiratif seorang guru yang mengabdikan hidupnya untuk pendidikan di daerah terpencil.',
    'Joko Anwar',
    2024,
    103,
    'Drama',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=900&fit=crop',
    true,
    true,
    4.6,
    2789
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'Resonansi',
    'resonansi',
    'Film eksperimental yang mengeksplorasi hubungan antara suara, cahaya, dan emosi manusia.',
    'Kamila Andini',
    2023,
    87,
    'Eksperimental',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600&h=900&fit=crop',
    false,
    true,
    4.1,
    654
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'Warisan Leluhur',
    'warisan-leluhur',
    'Dokumenter tentang upaya pelestarian tradisi dan kearifan lokal di berbagai suku di Indonesia.',
    'Garin Nugroho',
    2024,
    120,
    'Dokumenter',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&h=900&fit=crop',
    true,
    true,
    4.9,
    4123
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    'Tawa Di Tengah Badai',
    'tawa-di-tengah-badai',
    'Komedi situasi yang menggambarkan kehidupan sehari-hari keluarga urban di Jakarta.',
    'Raditya Dika',
    2024,
    95,
    'Komedi',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop',
    false,
    true,
    4.0,
    2234
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    'Misteri Pulau Terlarang',
    'misteri-pulau-terlarang',
    'Horor supernatural tentang sekelompok peneliti yang terjebak di pulau berhantu.',
    'Joko Anwar',
    2023,
    102,
    'Horor',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop',
    false,
    true,
    3.8,
    1876
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    'Harmoni Alam',
    'harmoni-alam',
    'Film eksperimental yang memadukan visual nature photography dengan musik ambient Indonesia.',
    'Sita Dewi',
    2024,
    75,
    'Eksperimental',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=900&fit=crop',
    false,
    true,
    4.4,
    892
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    'Perjalanan Sang Maestro',
    'perjalanan-sang-maestro',
    'Dokumenter biografi tentang perjalanan karir maestro musik gamelan Indonesia.',
    'Luki Pratama',
    2023,
    110,
    'Dokumenter',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=900&fit=crop',
    true,
    true,
    4.7,
    1543
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. SAMPLE COLLECTIONS
-- ============================================

INSERT INTO public.collections (id, title, slug, description, icon, color, is_published)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Dokumenter Kota Bandung',
    'dokumenter-kota-bandung',
    'Jelajahi sejarah dan transformasi Kota Kembang',
    'Compass',
    'from-amber-500/20 to-orange-500/20',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Sinema dengan Sentuhan Ajaib',
    'sinema-sentuhan-ajaib',
    'Realisme magis dalam karya sineas Indonesia',
    'Zap',
    'from-teal-500/20 to-cyan-500/20',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Kisah Lokal, Resonansi Global',
    'kisah-lokal-resonansi-global',
    'Cerita dari Indonesia untuk dunia',
    'Heart',
    'from-rose-500/20 to-pink-500/20',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Avant-Garde Indonesia',
    'avant-garde-indonesia',
    'Eksperimen berani sineas kontemporer',
    'Film',
    'from-violet-500/20 to-purple-500/20',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. LINK FILMS TO COLLECTIONS
-- ============================================

INSERT INTO public.film_collections (film_id, collection_id, display_order)
VALUES
  -- Dokumenter Kota Bandung
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1),
  ('10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', 2),

  -- Sinema dengan Sentuhan Ajaib
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 1),
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 2),
  ('10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 3),

  -- Kisah Lokal, Resonansi Global
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 1),
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 2),
  ('10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 3),

  -- Avant-Garde Indonesia
  ('10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 1),
  ('10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000004', 2)
ON CONFLICT (film_id, collection_id) DO NOTHING;

-- ============================================
-- 4. SAMPLE EVENTS
-- ============================================

INSERT INTO public.events (id, title, description, event_type, date, end_date, location, is_online, online_link, max_participants, image_url, status, tags)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    'Introduction to Documentary Filmmaking',
    'Join us for an interactive workshop covering the fundamentals of documentary filmmaking. Learn about storytelling, camera techniques, and post-production workflows from industry professionals.',
    'workshop',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
    'Community Center, Room 201, Bandung',
    false,
    NULL,
    30,
    'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb',
    'upcoming',
    ARRAY['filmmaking', 'documentary', 'beginners']
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'Virtual Screening: Climate Change Stories',
    'A special online screening of award-winning short documentaries about climate change, followed by a Q&A with the filmmakers.',
    'screening',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
    NULL,
    true,
    'https://zoom.us/j/example123',
    100,
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    'upcoming',
    ARRAY['screening', 'climate', 'environment', 'online']
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'Women in Film: Panel Discussion',
    'An inspiring panel discussion featuring successful women filmmakers sharing their experiences, challenges, and advice for aspiring creators.',
    'discussion',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '90 minutes',
    'Arts Theater, Main Hall, Jakarta',
    false,
    NULL,
    50,
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
    'upcoming',
    ARRAY['discussion', 'women', 'inspiration']
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    'Filmmaker Networking Mixer',
    'Connect with fellow filmmakers, producers, and cinema enthusiasts. Great opportunity to find collaborators and discuss projects over drinks and snacks.',
    'networking',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '2 hours',
    'The Riverside Café, Bandung',
    false,
    NULL,
    40,
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
    'upcoming',
    ARRAY['networking', 'community', 'social']
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    'Advanced Color Grading Techniques',
    'Dive deep into professional color grading workflows using DaVinci Resolve. This workshop is designed for intermediate to advanced filmmakers.',
    'workshop',
    NOW() + INTERVAL '28 days',
    NOW() + INTERVAL '28 days' + INTERVAL '4 hours',
    'Digital Lab, Studio B, Jakarta',
    false,
    NULL,
    15,
    'https://images.unsplash.com/photo-1536240478700-b869070f9279',
    'upcoming',
    ARRAY['post-production', 'advanced', 'technical']
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    'Indigenous Voices: Film Showcase',
    'A curated showcase of documentaries by Indigenous filmmakers, celebrating diverse stories and perspectives. Includes filmmaker introductions.',
    'screening',
    NOW() + INTERVAL '35 days',
    NOW() + INTERVAL '35 days' + INTERVAL '3 hours',
    'Cultural Center Auditorium, Yogyakarta',
    false,
    NULL,
    80,
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    'upcoming',
    ARRAY['screening', 'indigenous', 'diversity']
  ),
  (
    '30000000-0000-0000-0000-000000000007',
    'Sound Design Masterclass',
    'Master the art of sound design for documentaries. Learn recording techniques, sound editing, and creating immersive audio experiences.',
    'workshop',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '5 hours',
    'Audio Production Studio, Bandung',
    false,
    NULL,
    12,
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    'completed',
    ARRAY['audio', 'technical', 'post-production']
  ),
  (
    '30000000-0000-0000-0000-000000000008',
    'Monthly Filmmaker Meetup',
    'Our regular monthly meetup for the filmmaking community. Share your work, get feedback, and stay connected with fellow creators.',
    'networking',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
    'The Corner Brewery, Jakarta',
    false,
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1511578314322-379afb476865',
    'upcoming',
    ARRAY['community', 'networking', 'monthly']
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DATA COMPLETE
-- ============================================
--
-- NEXT STEPS:
-- 1. Sign up users through the application (authentication)
-- 2. Update at least one user to 'admin' role:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- 3. Test features:
--    - Browse films and collections
--    - Register for events
--    - Create forum discussions
--    - Add films to favorites
--
-- NOTE: User profiles will be auto-created on signup via trigger
-- Forum discussions, posts, and other user-generated content
-- should be created through the application for realistic testing
-- ============================================
