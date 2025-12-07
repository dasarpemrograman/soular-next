import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        // Get query parameters
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Start building the query
        let query = supabase
            .from("films")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false });

        // Apply category filter
        if (category && category !== "all") {
            query = query.eq("category", category);
        }

        // Apply search filter (search in title and description)
        if (search) {
            query = query.or(
                `title.ilike.%${search}%,description.ilike.%${search}%`
            );
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Execute query
        const { data: films, error, count } = await query;

        if (error) {
            console.error("Error fetching films:", error);
            return NextResponse.json(
                { error: "Failed to fetch films", details: error.message },
                { status: 500 }
            );
        }

        // Return response with pagination metadata
        return NextResponse.json({
            films: films || [],
            pagination: {
                total: count || 0,
                limit,
                offset,
                hasMore: (count || 0) > offset + limit,
            },
        });
    } catch (error) {
        console.error("Unexpected error in films API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
