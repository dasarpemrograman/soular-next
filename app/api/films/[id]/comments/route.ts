import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/films/[id]/comments - Get comments for a film
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id: filmId } = await params;

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        // Use the helper function to get comments with user info
        const { data: comments, error } = await supabase.rpc(
            "get_film_comments",
            {
                p_film_id: filmId,
                p_limit: limit,
                p_offset: offset,
            },
        );

        if (error) {
            console.error("Error fetching comments:", error);
            return NextResponse.json(
                { error: "Failed to fetch comments" },
                { status: 500 },
            );
        }

        // Get total count
        const { count } = await supabase
            .from("film_comments")
            .select("*", { count: "exact", head: true })
            .eq("film_id", filmId);

        // Get average rating
        const { data: avgRating } = await supabase.rpc(
            "get_film_average_rating",
            { p_film_id: filmId },
        );

        return NextResponse.json({
            comments: comments || [],
            total: count || 0,
            average_rating: avgRating || 0,
            limit,
            offset,
        });
    } catch (error) {
        console.error("Error in get comments route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST /api/films/[id]/comments - Create a new comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id: filmId } = await params;

        // Get current user
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
        const { comment, rating } = body;

        // Validate input
        if (!comment || comment.trim() === "") {
            return NextResponse.json(
                { error: "Comment is required" },
                { status: 400 },
            );
        }

        if (rating !== null && rating !== undefined) {
            if (
                typeof rating !== "number" ||
                rating < 1 ||
                rating > 5
            ) {
                return NextResponse.json(
                    { error: "Rating must be between 1 and 5" },
                    { status: 400 },
                );
            }
        }

        // Check if film exists
        const { data: film, error: filmError } = await supabase
            .from("films")
            .select("id")
            .eq("id", filmId)
            .single();

        if (filmError || !film) {
            return NextResponse.json(
                { error: "Film not found" },
                { status: 404 },
            );
        }

        // Insert comment
        const { data: newComment, error: insertError } = await supabase
            .from("film_comments")
            .insert({
                film_id: filmId,
                user_id: user.id,
                comment: comment.trim(),
                rating: rating || null,
            })
            .select(
                `
                id,
                film_id,
                user_id,
                comment,
                rating,
                like_count,
                created_at,
                updated_at
            `,
            )
            .single();

        if (insertError) {
            console.error("Error creating comment:", insertError);
            return NextResponse.json(
                { error: "Failed to create comment" },
                { status: 500 },
            );
        }

        // Get user info to return with comment
        const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar")
            .eq("id", user.id)
            .single();

        return NextResponse.json(
            {
                success: true,
                comment: {
                    ...newComment,
                    username: profile?.username || "Unknown",
                    user_avatar: profile?.avatar || null,
                    is_liked: false,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error in create comment route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
