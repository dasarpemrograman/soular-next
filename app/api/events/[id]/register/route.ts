// ============================================
// HOUR 25: Event Registration API
// ============================================
// API endpoints for registering/unregistering for events

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// POST /api/events/[id]/register - Register for event
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate event ID
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, max_participants')
      .eq('id', id)
      .single();

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching event:', eventError);
      return NextResponse.json(
        { error: 'Failed to fetch event' },
        { status: 500 }
      );
    }

    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 409 }
      );
    }

    // Check if event is full (if max_participants is set)
    if (event.max_participants) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (count !== null && count >= event.max_participants) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 409 }
        );
      }
    }

    // Create registration
    const { data: registration, error: registerError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: id,
        user_id: user.id,
        status: 'confirmed',
      })
      .select()
      .single();

    if (registerError) {
      console.error('Error creating registration:', registerError);
      return NextResponse.json(
        { error: 'Failed to register for event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully registered for event',
      registration,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/events/[id]/register:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/events/[id]/register - Unregister from event
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate event ID
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Delete registration
    const { error: deleteError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting registration:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unregister from event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully unregistered from event',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/events/[id]/register:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/events/[id]/register - Check registration status
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ is_registered: false });
    }

    // Validate event ID
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check registration
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('id, status, registered_at')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      is_registered: !!registration,
      registration: registration || null,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/events/[id]/register:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
