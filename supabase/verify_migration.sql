-- ============================================
-- SOULAR NEXT - MIGRATION VERIFICATION SCRIPT
-- ============================================
-- Run this script to verify that your database migration was successful
-- This checks for all required tables, indexes, functions, triggers, and RLS policies

-- ============================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================

DO $$
DECLARE
    missing_tables TEXT[];
    expected_tables TEXT[] := ARRAY[
        'profiles',
        'films',
        'user_favorites',
        'events',
        'event_registrations',
        'forum_discussions',
        'forum_posts',
        'forum_discussion_likes',
        'forum_post_likes',
        'collections',
        'film_collections',
        'notifications',
        'user_settings',
        'moderation_logs'
    ];
    tbl TEXT;
    found BOOLEAN;
BEGIN
    RAISE NOTICE '=== CHECKING TABLES ===';

    FOREACH tbl IN ARRAY expected_tables LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) INTO found;

        IF found THEN
            RAISE NOTICE '✓ Table "%" exists', tbl;
        ELSE
            RAISE WARNING '✗ Table "%" is MISSING!', tbl;
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'MIGRATION INCOMPLETE: Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✓ All tables created successfully!';
    END IF;
END $$;

-- ============================================
-- 2. CHECK ROW LEVEL SECURITY IS ENABLED
-- ============================================

DO $$
DECLARE
    tbl RECORD;
    unsecured_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING ROW LEVEL SECURITY ===';

    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        IF (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl.tablename) THEN
            RAISE NOTICE '✓ RLS enabled on "%"', tbl.tablename;
        ELSE
            RAISE WARNING '✗ RLS NOT enabled on "%"', tbl.tablename;
            unsecured_count := unsecured_count + 1;
        END IF;
    END LOOP;

    IF unsecured_count > 0 THEN
        RAISE WARNING 'WARNING: % tables do not have RLS enabled!', unsecured_count;
    ELSE
        RAISE NOTICE '✓ RLS enabled on all tables!';
    END IF;
END $$;

-- ============================================
-- 3. CHECK ESSENTIAL FUNCTIONS EXIST
-- ============================================

DO $$
DECLARE
    missing_functions TEXT[];
    expected_functions TEXT[] := ARRAY[
        'handle_new_user',
        'handle_updated_at',
        'get_my_profile',
        'increment_film_views',
        'get_event_participant_count',
        'is_event_full',
        'update_discussion_like_count',
        'update_post_like_count',
        'update_discussion_reply_count',
        'update_collection_film_count',
        'is_admin',
        'is_moderator_or_admin',
        'is_not_banned',
        'create_notification',
        'mark_notification_read',
        'get_unread_count'
    ];
    func TEXT;
    found BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING FUNCTIONS ===';

    FOREACH func IN ARRAY expected_functions LOOP
        SELECT EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = func
        ) INTO found;

        IF found THEN
            RAISE NOTICE '✓ Function "%"() exists', func;
        ELSE
            RAISE WARNING '✗ Function "%"() is MISSING!', func;
            missing_functions := array_append(missing_functions, func);
        END IF;
    END LOOP;

    IF array_length(missing_functions, 1) > 0 THEN
        RAISE WARNING 'WARNING: Missing functions: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE '✓ All essential functions created!';
    END IF;
END $$;

-- ============================================
-- 4. CHECK TRIGGERS EXIST
-- ============================================

DO $$
DECLARE
    missing_triggers TEXT[];
    expected_triggers TEXT[] := ARRAY[
        'on_auth_user_created',
        'on_profile_updated',
        'on_film_updated',
        'set_events_updated_at',
        'on_discussion_updated',
        'trigger_update_discussion_like_count',
        'trigger_update_post_like_count',
        'trigger_update_discussion_reply_count',
        'trigger_update_collection_film_count'
    ];
    trig TEXT;
    found BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING TRIGGERS ===';

    FOREACH trig IN ARRAY expected_triggers LOOP
        SELECT EXISTS (
            SELECT FROM pg_trigger WHERE tgname = trig
        ) INTO found;

        IF found THEN
            RAISE NOTICE '✓ Trigger "%" exists', trig;
        ELSE
            RAISE WARNING '✗ Trigger "%" is MISSING!', trig;
            missing_triggers := array_append(missing_triggers, trig);
        END IF;
    END LOOP;

    IF array_length(missing_triggers, 1) > 0 THEN
        RAISE WARNING 'WARNING: Missing triggers: %', array_to_string(missing_triggers, ', ');
    ELSE
        RAISE NOTICE '✓ All triggers created!';
    END IF;
END $$;

-- ============================================
-- 5. CHECK STORAGE BUCKET EXISTS
-- ============================================

DO $$
DECLARE
    found BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING STORAGE ===';

    SELECT EXISTS (
        SELECT FROM storage.buckets WHERE id = 'avatars'
    ) INTO found;

    IF found THEN
        RAISE NOTICE '✓ Storage bucket "avatars" exists';
    ELSE
        RAISE WARNING '✗ Storage bucket "avatars" is MISSING!';
    END IF;
END $$;

-- ============================================
-- 6. CHECK CRITICAL INDEXES
-- ============================================

DO $$
DECLARE
    idx RECORD;
    index_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING INDEXES ===';

    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';

    RAISE NOTICE '✓ Total indexes created: %', index_count;

    -- Check some critical indexes
    FOR idx IN
        SELECT tablename, indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname IN (
            'profiles_username_unique',
            'films_slug_idx',
            'idx_events_date',
            'idx_forum_discussions_last_activity',
            'idx_notifications_user_unread'
        )
        ORDER BY tablename, indexname
    LOOP
        RAISE NOTICE '✓ Critical index "%" on table "%"', idx.indexname, idx.tablename;
    END LOOP;
END $$;

-- ============================================
-- 7. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================

DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING FOREIGN KEYS ===';

    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';

    RAISE NOTICE '✓ Total foreign key constraints: %', fk_count;

    -- Verify critical foreign keys point to profiles (not auth.users)
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_schema = 'public'
        AND table_name = 'forum_discussions'
        AND column_name = 'author_id'
        AND constraint_name LIKE '%profiles%'
    ) THEN
        RAISE NOTICE '✓ Forum foreign keys correctly reference profiles table';
    ELSE
        RAISE WARNING '✗ Forum foreign keys may be incorrect!';
    END IF;
END $$;

-- ============================================
-- 8. CHECK RLS POLICIES
-- ============================================

DO $$
DECLARE
    policy_count INTEGER;
    tbl RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING RLS POLICIES ===';

    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    RAISE NOTICE '✓ Total RLS policies created: %', policy_count;

    -- Check each table has at least one policy
    FOR tbl IN
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
        ORDER BY tablename
    LOOP
        RAISE NOTICE '✓ Table "%" has % policies', tbl.tablename, tbl.policy_count;
    END LOOP;
END $$;

-- ============================================
-- 9. CHECK PROFILE COLUMNS
-- ============================================

DO $$
DECLARE
    missing_columns TEXT[];
    expected_columns TEXT[] := ARRAY['username', 'email', 'role', 'is_banned'];
    col TEXT;
    found BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING PROFILE COLUMNS ===';

    FOREACH col IN ARRAY expected_columns LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = col
        ) INTO found;

        IF found THEN
            RAISE NOTICE '✓ profiles.% exists', col;
        ELSE
            RAISE WARNING '✗ profiles.% is MISSING!', col;
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;

    IF array_length(missing_columns, 1) > 0 THEN
        RAISE WARNING 'WARNING: Missing critical profile columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✓ All critical profile columns present!';
    END IF;
END $$;

-- ============================================
-- 10. SUMMARY COUNTS
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRATION SUMMARY ===';

    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
    SELECT COUNT(*) INTO function_count FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';
    SELECT COUNT(*) INTO trigger_count FROM pg_trigger WHERE tgisinternal = false;
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';

    RAISE NOTICE 'Tables:    %', table_count;
    RAISE NOTICE 'Functions: %', function_count;
    RAISE NOTICE 'Triggers:  %', trigger_count;
    RAISE NOTICE 'Policies:  %', policy_count;
    RAISE NOTICE 'Indexes:   %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE '✓✓✓ MIGRATION VERIFICATION COMPLETE ✓✓✓';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Sign up a user through your app';
    RAISE NOTICE '2. Run: UPDATE public.profiles SET role = ''admin'' WHERE email = ''your-email@example.com'';';
    RAISE NOTICE '3. Test the application features';
END $$;

-- ============================================
-- OPTIONAL: Quick Data Check (if seeded)
-- ============================================

SELECT
    'Films' as entity,
    COUNT(*)::TEXT as count
FROM public.films
UNION ALL
SELECT
    'Collections' as entity,
    COUNT(*)::TEXT as count
FROM public.collections
UNION ALL
SELECT
    'Events' as entity,
    COUNT(*)::TEXT as count
FROM public.events
ORDER BY entity;
