import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/admin/users/[userId]/role - Update user role
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    try {
        const supabase = await createClient();
        const { userId } = await params;

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

        // Check if user is admin (only admins can change roles)
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 },
            );
        }

        // Parse request body
        const body = await request.json();
        const { role } = body;

        // Validate role
        const validRoles = ["user", "moderator", "admin"];
        if (!role || !validRoles.includes(role)) {
            return NextResponse.json(
                {
                    error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
                },
                { status: 400 },
            );
        }

        // Prevent users from changing their own role
        if (userId === user.id) {
            return NextResponse.json(
                { error: "Cannot change your own role" },
                { status: 400 },
            );
        }

        // Get target user's current role
        const { data: targetProfile, error: targetError } = await supabase
            .from("profiles")
            .select("role, username")
            .eq("id", userId)
            .single();

        if (targetError || !targetProfile) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const oldRole = targetProfile.role;

        // Update user role
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                role,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (updateError) {
            console.error("Error updating user role:", updateError);
            return NextResponse.json(
                { error: "Failed to update user role" },
                { status: 500 },
            );
        }

        // Log the moderation action
        const { error: logError } = await supabase.rpc(
            "log_moderation_action",
            {
                p_action_type: "role_changed",
                p_target_type: "user",
                p_target_id: userId,
                p_reason: `Role changed from ${oldRole} to ${role}`,
                p_metadata: {
                    old_role: oldRole,
                    new_role: role,
                    username: targetProfile.username,
                },
            },
        );

        if (logError) {
            console.error("Error logging moderation action:", logError);
        }

        return NextResponse.json({
            success: true,
            message: "User role updated successfully",
            data: {
                userId,
                oldRole,
                newRole: role,
            },
        });
    } catch (error) {
        console.error("Error in update role route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
