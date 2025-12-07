// ============================================
// HOUR 25: Events Listing API
// ============================================
// API endpoint for fetching events with filtering and pagination

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// GET /api/events - Get events list
// ============================================
// Query params:
// - status: 'upcoming' | 'past' | 'all' (default: upcoming)
// - limit: number (default: 12)
// - offset: number (default: 0)
// - search: string (optional)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const status = searchParams.get('status') || 'upcoming';
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';

    // Build query
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' });

    // Filter by status
    const now = new Date().toISOString();
    if (status === 'upcoming') {
      query = query.gte('event_date', now);
    } else if (status === 'past') {
      query = query.lt('event_date', now);
    }
    // 'all' means no date filter

    // Search filter
    if (search.trim()) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    // Order by event date
    if (status === 'past') {
      query = query.order('event_date', { ascending: false });
    } else {
      query = query.order('event_date', { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Return events with pagination info
    return NextResponse.json({
      events: events || [],
      total: count || 0,
      limit,
      offset,
      hasMore: count ? offset + limit < count : false,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
