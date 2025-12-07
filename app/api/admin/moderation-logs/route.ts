// ============================================
// HOUR 30: Admin Moderation Logs API
// ============================================
// Endpoint to fetch moderation logs with pagination

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

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

        // Fetch moderation logs with moderator profile info
        const { data: logs, error: logsError } = await supabase
            .from("moderation_logs")
            .select(
                `
                id,
                moderator_id,
                action_type,
                target_type,
                target_id,
                reason,
                metadata,
                created_at,
                profiles:moderator_id (
                    id,
                    name,
                    avatar
                )
            `,
            )
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (logsError) {
            console.error("Error fetching moderation logs:", logsError);
            return NextResponse.json(
                { error: "Failed to fetch moderation logs" },
                { status: 500 },
            );
        }

        return NextResponse.json(logs || []);
    } catch (error) {
        console.error("Error in moderation logs API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
