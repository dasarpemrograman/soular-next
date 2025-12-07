import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/films/[id]/comments/[commentId] - Update a comment
export async function PATCH(
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
            if (typeof rating !== "number" || rating < 1 || rating > 5) {
                return NextResponse.json(
                    { error: "Rating must be between 1 and 5" },
                    { status: 400 },
                );
            }
        }

        // Check if comment exists and user owns it
        const { data: existingComment, error: fetchError } = await supabase
            .from("film_comments")
            .select("id, user_id")
            .eq("id", commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 },
            );
        }

        if (existingComment.user_id !== user.id) {
            return NextResponse.json(
                { error: "You can only edit your own comments" },
                { status: 403 },
            );
        }

        // Update comment
        const { data: updatedComment, error: updateError } = await supabase
            .from("film_comments")
            .update({
                comment: comment.trim(),
                rating: rating || null,
            })
            .eq("id", commentId)
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

        if (updateError) {
            console.error("Error updating comment:", updateError);
            return NextResponse.json(
                { error: "Failed to update comment" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            comment: updatedComment,
        });
    } catch (error) {
        console.error("Error in update comment route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// DELETE /api/films/[id]/comments/[commentId] - Delete a comment
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

        // Check if comment exists
        const { data: existingComment, error: fetchError } = await supabase
            .from("film_comments")
            .select("id, user_id")
            .eq("id", commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 },
            );
        }

        // Check if user owns the comment or is moderator/admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const isModerator =
            profile?.role === "moderator" || profile?.role === "admin";
        const isOwner = existingComment.user_id === user.id;

        if (!isOwner && !isModerator) {
            return NextResponse.json(
                { error: "You can only delete your own comments" },
                { status: 403 },
            );
        }

        // Delete comment
        const { error: deleteError } = await supabase
            .from("film_comments")
            .delete()
            .eq("id", commentId);

        if (deleteError) {
            console.error("Error deleting comment:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete comment" },
                { status: 500 },
            );
        }

        // If moderator deleted someone else's comment, log it
        if (isModerator && !isOwner) {
            await supabase.rpc("log_moderation_action", {
                p_action_type: "delete_post",
                p_target_type: "comment",
                p_target_id: commentId,
                p_reason: "Comment deleted by moderator",
            });
        }

        return NextResponse.json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        console.error("Error in delete comment route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
