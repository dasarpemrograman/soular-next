import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/films - Fetch films with filters and pagination
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
                `title.ilike.%${search}%,description.ilike.%${search}%`,
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
                { status: 500 },
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
            { status: 500 },
        );
    }
}

// POST /api/films - Create a new film
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized - Please login to upload films" },
                { status: 401 },
            );
        }

        // Parse request body
        const body = await request.json();
        const {
            title,
            slug,
            description,
            director,
            year,
            duration,
            category,
            youtube_url,
            thumbnail,
            is_premium,
            is_published,
        } = body;

        // Validate required fields
        if (!title || !director || !category || !youtube_url) {
            return NextResponse.json(
                {
                    error: "Missing required fields",
                    details:
                        "title, director, category, and youtube_url are required",
                },
                { status: 400 },
            );
        }

        // Validate category
        const validCategories = [
            "Dokumenter",
            "Drama",
            "Eksperimental",
            "Musikal",
            "Thriller",
            "Horor",
            "Komedi",
            "Petualangan",
        ];

        if (!validCategories.includes(category)) {
            return NextResponse.json(
                {
                    error: "Invalid category",
                    details: `Category must be one of: ${validCategories.join(", ")}`,
                },
                { status: 400 },
            );
        }

        // Generate slug if not provided
        const finalSlug =
            slug ||
            title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();

        // Check if slug already exists
        const { data: existingFilm } = await supabase
            .from("films")
            .select("id")
            .eq("slug", finalSlug)
            .single();

        if (existingFilm) {
            return NextResponse.json(
                {
                    error: "Slug already exists",
                    details:
                        "A film with this slug already exists. Please use a different title.",
                },
                { status: 409 },
            );
        }

        // Insert the new film
        const { data: newFilm, error: insertError } = await supabase
            .from("films")
            .insert({
                title,
                slug: finalSlug,
                description: description || null,
                director,
                year: year || new Date().getFullYear(),
                duration: duration || 0,
                category,
                youtube_url,
                thumbnail: thumbnail || null,
                is_premium: is_premium || false,
                is_published: is_published !== false, // Default to true
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting film:", insertError);
            return NextResponse.json(
                {
                    error: "Failed to create film",
                    details: insertError.message,
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                message: "Film created successfully",
                film: newFilm,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Unexpected error creating film:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
