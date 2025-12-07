import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/collections/[id]
 * Get a single collection with its films
 * Supports both UUID and slug
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Check if id is a UUID or slug
        const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                id,
            );

        // Get collection
        let collectionQuery = supabase
            .from("collections")
            .select(
                `
        id,
        title,
        slug,
        description,
        icon,
        color,
        film_count,
        created_at,
        updated_at
      `,
            )
            .eq("is_published", true);

        if (isUuid) {
            collectionQuery = collectionQuery.eq("id", id);
        } else {
            collectionQuery = collectionQuery.eq("slug", id);
        }

        const { data: collection, error: collectionError } =
            await collectionQuery.single();

        if (collectionError || !collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 },
            );
        }

        // Get films in collection
        const { data: filmCollections, error: filmsError } = await supabase
            .from("film_collections")
            .select(
                `
        display_order,
        film:films (
          id,
          title,
          slug,
          description,
          director,
          year,
          duration,
          category,
          thumbnail,
          is_premium,
          rating,
          view_count,
          created_at
        )
      `,
            )
            .eq("collection_id", collection.id)
            .order("display_order", { ascending: true });

        if (filmsError) {
            console.error("Error fetching collection films:", filmsError);
            return NextResponse.json(
                { error: "Failed to fetch collection films" },
                { status: 500 },
            );
        }

        // Transform the data
        const films =
            filmCollections
                ?.map((fc) => {
                    const filmData = fc.film;
                    if (Array.isArray(filmData) && filmData.length > 0) {
                        return {
                            ...filmData[0],
                            display_order: fc.display_order,
                        };
                    }
                    return {
                        ...filmData,
                        display_order: fc.display_order,
                    };
                })
                .filter(
                    (film) =>
                        film &&
                        typeof film === "object" &&
                        "id" in film &&
                        film.id,
                ) || [];

        return NextResponse.json({
            ...collection,
            films,
        });
    } catch (error) {
        console.error("Unexpected error fetching collection:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

/**
 * PUT /api/collections/[id]
 * Update a collection (admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const body = await request.json();

        // Check if user is authenticated and is admin
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

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update collection
        const updateData: {
            title?: string;
            description?: string;
            icon?: string | null;
            color?: string | null;
            is_published?: boolean;
            slug?: string;
            updated_at?: string;
        } = {};
        if (body.title) updateData.title = body.title;
        if (body.description) updateData.description = body.description;
        if (body.icon !== undefined) updateData.icon = body.icon;
        if (body.color !== undefined) updateData.color = body.color;
        if (body.is_published !== undefined)
            updateData.is_published = body.is_published;
        if (body.slug) updateData.slug = body.slug;

        updateData.updated_at = new Date().toISOString();

        const { data: collection, error } = await supabase
            .from("collections")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating collection:", error);
            return NextResponse.json(
                { error: "Failed to update collection" },
                { status: 500 },
            );
        }

        return NextResponse.json(collection);
    } catch (error) {
        console.error("Unexpected error updating collection:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/collections/[id]
 * Delete a collection (admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Check if user is authenticated and is admin
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

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete collection (will cascade delete film_collections)
        const { error } = await supabase
            .from("collections")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting collection:", error);
            return NextResponse.json(
                { error: "Failed to delete collection" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unexpected error deleting collection:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
