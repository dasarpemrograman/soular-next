import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/collections/[id]/films
 * Add a film to a collection (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: collectionId } = await params;
    const body = await request.json();

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { film_id, display_order } = body;

    if (!film_id) {
      return NextResponse.json(
        { error: "film_id is required" },
        { status: 400 }
      );
    }

    // Check if collection exists
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Check if film exists
    const { data: film, error: filmError } = await supabase
      .from("films")
      .select("id")
      .eq("id", film_id)
      .single();

    if (filmError || !film) {
      return NextResponse.json(
        { error: "Film not found" },
        { status: 404 }
      );
    }

    // Add film to collection
    const { data: filmCollection, error } = await supabase
      .from("film_collections")
      .insert({
        collection_id: collectionId,
        film_id,
        display_order: display_order || 0,
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate error
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Film already in collection" },
          { status: 409 }
        );
      }
      console.error("Error adding film to collection:", error);
      return NextResponse.json(
        { error: "Failed to add film to collection" },
        { status: 500 }
      );
    }

    return NextResponse.json(filmCollection, { status: 201 });
  } catch (error) {
    console.error("Unexpected error adding film to collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/[id]/films
 * Remove a film from a collection (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: collectionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const filmId = searchParams.get("film_id");

    if (!filmId) {
      return NextResponse.json(
        { error: "film_id query parameter is required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Remove film from collection
    const { error } = await supabase
      .from("film_collections")
      .delete()
      .eq("collection_id", collectionId)
      .eq("film_id", filmId);

    if (error) {
      console.error("Error removing film from collection:", error);
      return NextResponse.json(
        { error: "Failed to remove film from collection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error removing film from collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
