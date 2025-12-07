-- Check if there are users without profiles
SELECT 
    u.id,
    u.email,
    p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create missing profiles for any users without them
INSERT INTO public.profiles (id, name, username, email, avatar)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', u.email),
    LOWER(REPLACE(COALESCE(u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1)), ' ', '_')) || '_' || SUBSTRING(u.id::TEXT FROM 1 FOR 8),
    u.email,
    u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users now have profiles
SELECT 
    COUNT(*) as users_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count,
    COUNT(*) = (SELECT COUNT(*) FROM public.profiles) as all_synced
FROM auth.users;
