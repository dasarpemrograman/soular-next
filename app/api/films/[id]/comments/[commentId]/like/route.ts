import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/films/[id]/comments/[commentId]/like - Like a comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> },
) {
    try {
        const supabase = await createClient();
        const { commentId } = await params;

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

        // Check if comment exists
        const { data: comment, error: commentError } = await supabase
            .from("film_comments")
            .select("id")
            .eq("id", commentId)
            .single();

        if (commentError || !comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 },
            );
        }

        // Check if already liked
        const { data: existingLike } = await supabase
            .from("film_comment_likes")
            .select("id")
            .eq("comment_id", commentId)
            .eq("user_id", user.id)
            .single();

        if (existingLike) {
            return NextResponse.json(
                { error: "You already liked this comment" },
                { status: 400 },
            );
        }

        // Insert like
        const { error: likeError } = await supabase
            .from("film_comment_likes")
            .insert({
                comment_id: commentId,
                user_id: user.id,
            });

        if (likeError) {
            console.error("Error liking comment:", likeError);
            return NextResponse.json(
                { error: "Failed to like comment" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Comment liked successfully",
        });
    } catch (error) {
        console.error("Error in like comment route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// DELETE /api/films/[id]/comments/[commentId]/like - Unlike a comment
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> },
) {
    try {
        const supabase = await createClient();
        const { commentId } = await params;

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

        // Delete like
        const { error: unlikeError } = await supabase
            .from("film_comment_likes")
            .delete()
            .eq("comment_id", commentId)
            .eq("user_id", user.id);

        if (unlikeError) {
            console.error("Error unliking comment:", unlikeError);
            return NextResponse.json(
                { error: "Failed to unlike comment" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Comment unliked successfully",
        });
    } catch (error) {
        console.error("Error in unlike comment route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
