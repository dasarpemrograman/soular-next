import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Test 1: Check if profiles table exists
        const { error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .limit(1);

        if (profilesError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Profiles table check failed",
                    details: profilesError.message,
                    hint: "Run HOUR 3 SQL migration in Supabase Dashboard → SQL Editor",
                },
                { status: 500 },
            );
        }

        // Test 2: Count profiles
        const { count: profileCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // Test 3: Check if films table exists
        const { error: filmsError } = await supabase
            .from("films")
            .select("*")
            .limit(1);

        if (filmsError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Films table check failed",
                    details: filmsError.message,
                    hint: "Run HOUR 4 SQL migration in Supabase Dashboard → SQL Editor",
                },
                { status: 500 },
            );
        }

        // Test 4: Count films
        const { count: filmCount } = await supabase
            .from("films")
            .select("*", { count: "exact", head: true });

        // Test 5: Check if events table exists
        const { error: eventsError } = await supabase
            .from("events")
            .select("*")
            .limit(1);

        if (eventsError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Events table check failed",
                    details: eventsError.message,
                    hint: "Run HOUR 5 SQL migration in Supabase Dashboard → SQL Editor",
                },
                { status: 500 },
            );
        }

        // Test 6: Count events
        const { count: eventCount } = await supabase
            .from("events")
            .select("*", { count: "exact", head: true });

        // Test 7: Check if event_registrations table exists
        const { error: registrationsError } = await supabase
            .from("event_registrations")
            .select("*")
            .limit(1);

        if (registrationsError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Event registrations table check failed",
                    details: registrationsError.message,
                    hint: "Run HOUR 5 SQL migration in Supabase Dashboard → SQL Editor",
                },
                { status: 500 },
            );
        }

        // Test 8: Count event registrations
        const { count: registrationCount } = await supabase
            .from("event_registrations")
            .select("*", { count: "exact", head: true });

        // Test 9: Check if forum_discussions table exists
        const { error: discussionsError } = await supabase
            .from("forum_discussions")
            .select("*")
            .limit(1);

        if (discussionsError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Forum discussions table check failed",
                    details: discussionsError.message,
                    hint: "Run HOUR 6 SQL migration in Supabase Dashboard → SQL Editor",
                },
                { status: 500 },
            );
        }

        // Test 10: Count forum discussions
        const { count: discussionCount } = await supabase
            .from("forum_discussions")
            .select("*", { count: "exact", head: true });

        // Test 11: Check if forum_posts table exists
        const { error: postsError } = await supabase
            .from("forum_posts")
            .select("*")
            .limit(1);

        if (postsError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Forum posts table check failed",
                    details: postsError.message,
                    hint: "Run HOUR 6 SQL migration in Supabase Dashboard → SQL Editor",
                },
                { status: 500 },
            );
        }

        // Test 12: Count forum posts
        const { count: postCount } = await supabase
            .from("forum_posts")
            .select("*", { count: "exact", head: true });

        // Test 13: Check if forum_post_likes table exists
        const { error: likesError } = await supabase
            .from("forum_post_likes")
            .select("*")
            .limit(1);

        if (likesError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Forum post likes table check failed",
                    details: likesError.message,
                    hint: "Run HOUR 6 SQL migration in Supabase Dashboard → SQL Editor",
                },
                { status: 500 },
            );
        }

        // Test 14: Count forum post likes
        const { count: likeCount } = await supabase
            .from("forum_post_likes")
            .select("*", { count: "exact", head: true });

        // Test 15: Get current user (if authenticated)
        const {
            data: { user },
        } = await supabase.auth.getUser();

        return NextResponse.json({
            success: true,
            message: "Database schema is working!",
            tests: {
                profilesTable: {
                    status: "✅ OK",
                    exists: true,
                    rowCount: profileCount || 0,
                },
                filmsTable: {
                    status: "✅ OK",
                    exists: true,
                    rowCount: filmCount || 0,
                },
                eventsTable: {
                    status: "✅ OK",
                    exists: true,
                    rowCount: eventCount || 0,
                },
                eventRegistrationsTable: {
                    status: "✅ OK",
                    exists: true,
                    rowCount: registrationCount || 0,
                },
                forumDiscussionsTable: {
                    status: "✅ OK",
                    exists: true,
                    rowCount: discussionCount || 0,
                },
                forumPostsTable: {
                    status: "✅ OK",
                    exists: true,
                    rowCount: postCount || 0,
                },
                forumPostLikesTable: {
                    status: "✅ OK",
                    exists: true,
                    rowCount: likeCount || 0,
                },
                authentication: {
                    status: user ? "✅ Authenticated" : "⚠️ Not logged in",
                    userId: user?.id || null,
                },
            },
            nextSteps: [
                profileCount === 0
                    ? "No profiles yet. Create a user to test auto-profile creation!"
                    : `${profileCount} profile(s) found`,
                filmCount === 0
                    ? "No films yet. Run HOUR 4 SQL to add sample films!"
                    : `${filmCount} film(s) found`,
                eventCount === 0
                    ? "No events yet. Run HOUR 5 SQL to add sample events!"
                    : `${eventCount} event(s) found`,
                registrationCount === 0
                    ? "No event registrations yet."
                    : `${registrationCount} registration(s) found`,
                discussionCount === 0
                    ? "No forum discussions yet. Run HOUR 6 SQL to add sample discussions!"
                    : `${discussionCount} discussion(s) found`,
                postCount === 0
                    ? "No forum posts yet."
                    : `${postCount} post(s) found`,
                "All database tables ready! Run HOUR 7 to implement login/signup pages",
            ],
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: "Database test failed",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
