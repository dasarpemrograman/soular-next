import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Validate ID
        if (!id) {
            return NextResponse.json(
                { error: "Film ID is required" },
                { status: 400 }
            );
        }

        // Fetch film by ID
        const { data: film, error } = await supabase
            .from("films")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Film not found" },
                    { status: 404 }
                );
            }

            console.error("Error fetching film:", error);
            return NextResponse.json(
                { error: "Failed to fetch film", details: error.message },
                { status: 500 }
            );
        }

        // Return film data
        return NextResponse.json({ film });
    } catch (error) {
        console.error("Unexpected error in film API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
