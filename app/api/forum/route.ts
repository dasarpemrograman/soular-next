// ============================================
// HOUR 27: Forum Discussions Listing API
// ============================================
// API endpoint for fetching forum discussions with filtering and pagination

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================
// GET /api/forum - Get forum discussions list
// ============================================
// Query params:
// - category: 'general' | 'filmmaking' | 'technical' | 'showcase' | 'feedback' | 'events' | 'other' | 'all' (default: all)
// - sort: 'latest' | 'popular' | 'most_replies' (default: latest)
// - limit: number (default: 20)
// - offset: number (default: 0)
// - search: string (optional)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const category = searchParams.get("category") || "all";
        const sort = searchParams.get("sort") || "latest";
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);
        const search = searchParams.get("search") || "";

        // Build query
        let query = supabase.from("forum_discussions").select(
            `
        *,
        profiles!forum_discussions_author_id_fkey (
          id,
          name,
          avatar
        )
      `,
            { count: "exact" },
        );

        // Filter by category
        if (category !== "all") {
            query = query.eq("category", category);
        }

        // Search filter
        if (search.trim()) {
            query = query.or(
                `title.ilike.%${search}%,content.ilike.%${search}%`,
            );
        }

        // Apply sorting
        switch (sort) {
            case "popular":
                query = query.order("view_count", { ascending: false });
                break;
            case "most_replies":
                query = query.order("reply_count", { ascending: false });
                break;
            case "latest":
            default:
                query = query.order("last_activity_at", { ascending: false });
                break;
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Execute query
        const { data: discussions, error, count } = await query;

        if (error) {
            console.error("Error fetching forum discussions:", error);
            return NextResponse.json(
                { error: "Failed to fetch discussions" },
                { status: 500 },
            );
        }

        // Return discussions with pagination info
        return NextResponse.json({
            discussions: discussions || [],
            total: count || 0,
            limit,
            offset,
            hasMore: count ? offset + limit < count : false,
        });
    } catch (error) {
        console.error("Unexpected error in GET /api/forum:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// ============================================
// POST /api/forum - Create new discussion
// ============================================
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Parse request body
        const body = await request.json();
        const { title, content, category, tags } = body;

        // Validate inputs
        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 },
            );
        }

        if (title.length > 200) {
            return NextResponse.json(
                { error: "Title must be 200 characters or less" },
                { status: 400 },
            );
        }

        if (
            !content ||
            typeof content !== "string" ||
            content.trim().length === 0
        ) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 },
            );
        }

        if (content.length > 10000) {
            return NextResponse.json(
                { error: "Content must be 10,000 characters or less" },
                { status: 400 },
            );
        }

        const validCategories = [
            "general",
            "filmmaking",
            "technical",
            "showcase",
            "feedback",
            "events",
            "other",
        ];
        if (!category || !validCategories.includes(category)) {
            return NextResponse.json(
                { error: "Invalid category" },
                { status: 400 },
            );
        }

        // Validate tags if provided
        let validTags: string[] = [];
        if (tags) {
            if (!Array.isArray(tags)) {
                return NextResponse.json(
                    { error: "Tags must be an array" },
                    { status: 400 },
                );
            }
            validTags = tags
                .filter(
                    (tag: unknown): tag is string =>
                        typeof tag === "string" && tag.trim().length > 0,
                )
                .slice(0, 5) // Max 5 tags
                .map((tag: string) => tag.trim().toLowerCase());
        }

        // Create discussion
        const { data: discussion, error: createError } = await supabase
            .from("forum_discussions")
            .insert({
                title: title.trim(),
                content: content.trim(),
                author_id: user.id,
                category,
                tags: validTags,
            })
            .select(
                `
        *,
        profiles!forum_discussions_author_id_fkey (
          id,
          name,
          avatar
        )
      `,
            )
            .single();

        if (createError) {
            console.error("Error creating discussion:", createError);
            return NextResponse.json(
                { error: "Failed to create discussion" },
                { status: 500 },
            );
        }

        return NextResponse.json(discussion, { status: 201 });
    } catch (error) {
        console.error("Unexpected error in POST /api/forum:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
