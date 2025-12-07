// ============================================
// HOUR 27: Forum Discussion Detail API
// ============================================
// API endpoint for fetching, updating, and deleting a single forum discussion

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================
// GET /api/forum/[id] - Get discussion by ID
// ============================================
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Validate ID
        if (!id) {
            return NextResponse.json(
                { error: "Discussion ID is required" },
                { status: 400 },
            );
        }

        // Fetch the discussion with author info
        const { data: discussion, error } = await supabase
            .from("forum_discussions")
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
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Discussion not found" },
                    { status: 404 },
                );
            }
            console.error("Error fetching discussion:", error);
            return NextResponse.json(
                { error: "Failed to fetch discussion" },
                { status: 500 },
            );
        }

        // Increment view count (fire and forget)
        supabase
            .from("forum_discussions")
            .update({ view_count: (discussion.view_count || 0) + 1 })
            .eq("id", id)
            .then();

        // Check if current user is the author
        const {
            data: { user },
        } = await supabase.auth.getUser();

        return NextResponse.json({
            ...discussion,
            is_author: user?.id === discussion.author_id,
        });
    } catch (error) {
        console.error("Unexpected error in GET /api/forum/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// ============================================
// PATCH /api/forum/[id] - Update discussion
// ============================================
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

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

        // Validate ID
        if (!id) {
            return NextResponse.json(
                { error: "Discussion ID is required" },
                { status: 400 },
            );
        }

        // Check if discussion exists and user is the author
        const { data: existing, error: fetchError } = await supabase
            .from("forum_discussions")
            .select("author_id, is_locked")
            .eq("id", id)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json(
                { error: "Discussion not found" },
                { status: 404 },
            );
        }

        if (existing.author_id !== user.id) {
            return NextResponse.json(
                { error: "You can only edit your own discussions" },
                { status: 403 },
            );
        }

        if (existing.is_locked) {
            return NextResponse.json(
                { error: "This discussion is locked and cannot be edited" },
                { status: 403 },
            );
        }

        // Parse request body
        const body = await request.json();
        const { title, content, category, tags } = body;

        // Build updates object
        const updates: {
            title?: string;
            content?: string;
            category?: string;
            tags?: string[];
            updated_at?: string;
        } = {};

        // Validate and add title if provided
        if (title !== undefined) {
            if (typeof title !== "string" || title.trim().length === 0) {
                return NextResponse.json(
                    { error: "Title must be a non-empty string" },
                    { status: 400 },
                );
            }
            if (title.length > 200) {
                return NextResponse.json(
                    { error: "Title must be 200 characters or less" },
                    { status: 400 },
                );
            }
            updates.title = title.trim();
        }

        // Validate and add content if provided
        if (content !== undefined) {
            if (typeof content !== "string" || content.trim().length === 0) {
                return NextResponse.json(
                    { error: "Content must be a non-empty string" },
                    { status: 400 },
                );
            }
            if (content.length > 10000) {
                return NextResponse.json(
                    { error: "Content must be 10,000 characters or less" },
                    { status: 400 },
                );
            }
            updates.content = content.trim();
        }

        // Validate and add category if provided
        if (category !== undefined) {
            const validCategories = [
                "general",
                "filmmaking",
                "technical",
                "showcase",
                "feedback",
                "events",
                "other",
            ];
            if (!validCategories.includes(category)) {
                return NextResponse.json(
                    { error: "Invalid category" },
                    { status: 400 },
                );
            }
            updates.category = category;
        }

        // Validate and add tags if provided
        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                return NextResponse.json(
                    { error: "Tags must be an array" },
                    { status: 400 },
                );
            }
            updates.tags = tags
                .filter(
                    (tag: unknown): tag is string =>
                        typeof tag === "string" && tag.trim().length > 0,
                )
                .slice(0, 5)
                .map((tag: string) => tag.trim().toLowerCase());
        }

        // If no valid updates, return error
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 },
            );
        }

        // Set updated_at timestamp
        updates.updated_at = new Date().toISOString();

        // Update the discussion
        const { data: discussion, error: updateError } = await supabase
            .from("forum_discussions")
            .update(updates)
            .eq("id", id)
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

        if (updateError) {
            console.error("Error updating discussion:", updateError);
            return NextResponse.json(
                { error: "Failed to update discussion" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            ...discussion,
            is_author: true,
        });
    } catch (error) {
        console.error("Unexpected error in PATCH /api/forum/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// ============================================
// DELETE /api/forum/[id] - Delete discussion
// ============================================
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

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

        // Validate ID
        if (!id) {
            return NextResponse.json(
                { error: "Discussion ID is required" },
                { status: 400 },
            );
        }

        // Check if discussion exists and user is the author
        const { data: existing, error: fetchError } = await supabase
            .from("forum_discussions")
            .select("author_id")
            .eq("id", id)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json(
                { error: "Discussion not found" },
                { status: 404 },
            );
        }

        if (existing.author_id !== user.id) {
            return NextResponse.json(
                { error: "You can only delete your own discussions" },
                { status: 403 },
            );
        }

        // Delete the discussion (cascade will delete related posts)
        const { error: deleteError } = await supabase
            .from("forum_discussions")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Error deleting discussion:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete discussion" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            message: "Discussion deleted successfully",
        });
    } catch (error) {
        console.error("Unexpected error in DELETE /api/forum/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
