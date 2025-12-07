// ============================================
// HOUR 30: Admin Moderation Stats API
// ============================================
// Endpoint to get moderation statistics

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

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

        // Fetch moderation stats from view
        const { data: stats, error: statsError } = await supabase
            .from("moderation_stats")
            .select("*")
            .single();

        if (statsError) {
            console.error("Error fetching moderation stats:", statsError);
            // Return default stats if view doesn't exist or error occurs
            return NextResponse.json({
                total_pin_actions: 0,
                total_lock_actions: 0,
                total_discussion_deletions: 0,
                total_post_deletions: 0,
                total_ban_actions: 0,
                active_moderators: 0,
                actions_last_24h: 0,
                actions_last_7d: 0,
            });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error in moderation stats API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
