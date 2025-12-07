// ============================================
// HOUR 30: Admin Lock/Unlock Discussion API
// ============================================
// Endpoint to lock or unlock forum discussions (moderator/admin only)

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id: discussionId } = await params;

        // Get current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Check if user is moderator or admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !["moderator", "admin"].includes(profile.role)) {
            return NextResponse.json(
                { error: "Forbidden - Moderator or Admin access required" },
                { status: 403 },
            );
        }

        // Get current discussion state
        const { data: discussion, error: fetchError } = await supabase
            .from("forum_discussions")
            .select("is_locked, title")
            .eq("id", discussionId)
            .single();

        if (fetchError || !discussion) {
            return NextResponse.json(
                { error: "Discussion not found" },
                { status: 404 },
            );
        }

        // Toggle lock state
        const newLockedState = !discussion.is_locked;

        const { data: updated, error: updateError } = await supabase
            .from("forum_discussions")
            .update({ is_locked: newLockedState })
            .eq("id", discussionId)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating discussion:", updateError);
            return NextResponse.json(
                { error: "Failed to update discussion" },
                { status: 500 },
            );
        }

        // Log moderation action
        await supabase.rpc("log_moderation_action", {
            p_action_type: newLockedState ? "lock" : "unlock",
            p_target_type: "discussion",
            p_target_id: discussionId,
            p_reason: null,
            p_metadata: { title: discussion.title },
        });

        return NextResponse.json({
            success: true,
            is_locked: newLockedState,
            discussion: updated,
        });
    } catch (error) {
        console.error("Error in lock discussion API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
