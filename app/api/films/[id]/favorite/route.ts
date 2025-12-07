import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST - Add film to favorites
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: filmId } = await params;

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Validate film ID
        if (!filmId) {
            return NextResponse.json(
                { error: "Film ID is required" },
                { status: 400 }
            );
        }

        // Check if film exists
        const { data: film, error: filmError } = await supabase
            .from("films")
            .select("id")
            .eq("id", filmId)
            .single();

        if (filmError || !film) {
            return NextResponse.json(
                { error: "Film not found" },
                { status: 404 }
            );
        }

        // Check if already favorited
        const { data: existing } = await supabase
            .from("user_favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("film_id", filmId)
            .single();

        if (existing) {
            return NextResponse.json(
                { message: "Film already favorited", favorited: true },
                { status: 200 }
            );
        }

        // Add to favorites
        const { error: insertError } = await supabase
            .from("user_favorites")
            .insert({
                user_id: user.id,
                film_id: filmId,
            });

        if (insertError) {
            console.error("Error adding favorite:", insertError);
            return NextResponse.json(
                { error: "Failed to add favorite", details: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Film added to favorites",
            favorited: true,
        });
    } catch (error) {
        console.error("Unexpected error in favorite POST:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Remove film from favorites
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: filmId } = await params;

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Validate film ID
        if (!filmId) {
            return NextResponse.json(
                { error: "Film ID is required" },
                { status: 400 }
            );
        }

        // Delete favorite
        const { error: deleteError } = await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("film_id", filmId);

        if (deleteError) {
            console.error("Error removing favorite:", deleteError);
            return NextResponse.json(
                { error: "Failed to remove favorite", details: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Film removed from favorites",
            favorited: false,
        });
    } catch (error) {
        console.error("Unexpected error in favorite DELETE:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - Check if film is favorited
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: filmId } = await params;

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ favorited: false });
        }

        // Validate film ID
        if (!filmId) {
            return NextResponse.json(
                { error: "Film ID is required" },
                { status: 400 }
            );
        }

        // Check if favorited
        const { data, error } = await supabase
            .from("user_favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("film_id", filmId)
            .single();

        return NextResponse.json({
            favorited: !!data && !error,
        });
    } catch (error) {
        console.error("Unexpected error in favorite GET:", error);
        return NextResponse.json({ favorited: false });
    }
}
