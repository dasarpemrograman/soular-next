// ============================================
// HOUR 25: Event Detail API
// ============================================
// API endpoint for fetching a single event by ID

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// GET /api/events/[id] - Get event by ID
// ============================================
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
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Fetch the event
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching event:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event' },
        { status: 500 }
      );
    }

    // If user is authenticated, check if they're registered
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isRegistered = false;
    if (user) {
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();

      isRegistered = !!registration;
    }

    return NextResponse.json({
      ...event,
      is_registered: isRegistered,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
