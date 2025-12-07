// ============================================
// HOUR 25: My Events API
// ============================================
// API endpoint for fetching user's registered events

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================
// GET /api/my-events - Get user's registered events
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

        // Fetch user's event registrations with event details
        const { data: registrations, error: registrationsError } =
            await supabase
                .from("event_registrations")
                .select(
                    `
        id,
        status,
        registered_at,
        event_id,
        events (
          id,
          title,
          description,
          date,
          location,
          host_id,
          max_participants,
          image_url,
          created_at
        )
      `,
                )
                .eq("user_id", user.id)
                .order("registered_at", { ascending: false });

        if (registrationsError) {
            console.error("Error fetching registrations:", registrationsError);
            return NextResponse.json(
                { error: "Failed to fetch registered events" },
                { status: 500 },
            );
        }

        // Transform the data to a more convenient format
        const events =
            registrations?.map((reg) => ({
                ...reg.events,
                registration_status: reg.status,
                registered_at: reg.registered_at,
                registration_id: reg.id,
            })) || [];

        return NextResponse.json(events);
    } catch (error) {
        console.error("Unexpected error in GET /api/my-events:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
