// ============================================
// HOUR 24: Favorites List API
// ============================================
// API endpoint for fetching user's favorited films

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================
// GET /api/favorites - Get user's favorite films
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

        // Call the get_user_favorites database function
        const { data: favorites, error: favoritesError } = await supabase.rpc(
            "get_user_favorites",
            { user_uuid: user.id },
        );

        if (favoritesError) {
            console.error("Error fetching favorites:", favoritesError);
            return NextResponse.json(
                { error: "Failed to fetch favorites" },
                { status: 500 },
            );
        }

        // Return the favorites
        return NextResponse.json(favorites || []);
    } catch (error) {
        console.error("Unexpected error in GET /api/favorites:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
