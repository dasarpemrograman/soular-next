// ============================================
// HOUR 23: Profile API
// ============================================
// API endpoints for getting and updating user profile

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================
// GET /api/profile - Get current user's profile
// ============================================
export async function GET() {
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

        // Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Error fetching profile:", profileError);
            return NextResponse.json(
                { error: "Failed to fetch profile" },
                { status: 500 },
            );
        }

        // Also return the user's email from auth
        return NextResponse.json({
            ...profile,
            email: user.email,
        });
    } catch (error) {
        console.error("Unexpected error in GET /api/profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// ============================================
// PATCH /api/profile - Update current user's profile
// ============================================
export async function PATCH(request: NextRequest) {
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
        const { name, bio, avatar } = body;

        // Validate inputs
        const updates: {
            name?: string;
            bio?: string | null;
            avatar?: string | null;
            updated_at?: string;
        } = {};

        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length === 0) {
                return NextResponse.json(
                    { error: "Name must be a non-empty string" },
                    { status: 400 },
                );
            }
            updates.name = name.trim();
        }

        if (bio !== undefined) {
            if (typeof bio !== "string") {
                return NextResponse.json(
                    { error: "Bio must be a string" },
                    { status: 400 },
                );
            }
            updates.bio = bio.trim() || null;
        }

        if (avatar !== undefined) {
            if (typeof avatar !== "string") {
                return NextResponse.json(
                    { error: "Avatar must be a string" },
                    { status: 400 },
                );
            }
            updates.avatar = avatar || null;
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

        // Update the profile
        const { data: profile, error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating profile:", updateError);
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            ...profile,
            email: user.email,
        });
    } catch (error) {
        console.error("Unexpected error in PATCH /api/profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
