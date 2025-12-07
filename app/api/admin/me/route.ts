// ============================================
// HOUR 30: Current User Role API
// ============================================
// Endpoint to get current user's role and permissions

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
                {
                    role: "guest",
                    is_admin: false,
                    is_moderator: false,
                },
                { status: 200 },
            );
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, is_banned")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                {
                    role: "user",
                    is_admin: false,
                    is_moderator: false,
                    is_banned: false,
                },
                { status: 200 },
            );
        }

        const isAdmin = profile.role === "admin";
        const isModerator = profile.role === "moderator" || isAdmin;

        return NextResponse.json({
            role: profile.role,
            is_admin: isAdmin,
            is_moderator: isModerator,
            is_banned: profile.is_banned || false,
        });
    } catch (error) {
        console.error("Error in user role API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
