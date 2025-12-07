// ============================================
// HOUR 29: User Forum Activity API
// ============================================
// Get user's forum discussions and posts

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    try {
        const supabase = await createClient();
        const { userId } = await params;

        // Get user's discussions
        const { data: discussions, error: discussionsError } = await supabase
            .from("forum_discussions")
            .select(
                `
        id,
        title,
        content,
        category,
        tags,
        is_pinned,
        is_locked,
        view_count,
        reply_count,
        created_at,
        updated_at,
        profiles:author_id (
          id,
          name,
          avatar
        )
      `,
            )
            .eq("author_id", userId)
            .order("created_at", { ascending: false });

        if (discussionsError) {
            console.error("Error fetching user discussions:", discussionsError);
            return NextResponse.json(
                { error: "Failed to fetch discussions" },
                { status: 500 },
            );
        }

        // Get user's posts
        const { data: posts, error: postsError } = await supabase
            .from("forum_posts")
            .select(
                `
        id,
        discussion_id,
        content,
        created_at,
        updated_at,
        profiles:author_id (
          id,
          name,
          avatar
        ),
        forum_discussions!inner (
          id,
          title
        )
      `,
            )
            .eq("author_id", userId)
            .order("created_at", { ascending: false });

        if (postsError) {
            console.error("Error fetching user posts:", postsError);
            return NextResponse.json(
                { error: "Failed to fetch posts" },
                { status: 500 },
            );
        }

        // Get user profile info
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, name, avatar")
            .eq("id", userId)
            .single();

        if (profileError) {
            console.error("Error fetching user profile:", profileError);
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            profile,
            discussions: discussions || [],
            posts: posts || [],
            stats: {
                total_discussions: discussions?.length || 0,
                total_posts: posts?.length || 0,
            },
        });
    } catch (error) {
        console.error("Error in user activity API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
