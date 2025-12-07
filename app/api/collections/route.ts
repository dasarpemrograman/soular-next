import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/collections
 * List all published collections
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get collections with film count
    const { data: collections, error, count } = await supabase
      .from("collections")
      .select(`
        id,
        title,
        slug,
        description,
        icon,
        color,
        film_count,
        created_at,
        updated_at
      `, { count: "exact" })
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching collections:", error);
      return NextResponse.json(
        { error: "Failed to fetch collections" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      collections: collections || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections
 * Create a new collection (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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

    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create collection
    const { data: collection, error } = await supabase
      .from("collections")
      .insert({
        title: body.title,
        slug,
        description: body.description,
        icon: body.icon || null,
        color: body.color || null,
        is_published: body.is_published !== undefined ? body.is_published : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating collection:", error);
      return NextResponse.json(
        { error: "Failed to create collection" },
        { status: 500 }
      );
    }

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Unexpected error creating collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
