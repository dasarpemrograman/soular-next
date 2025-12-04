import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('events')
      .select('*, organizer:profiles!organizer_id(id, username, full_name, avatar_url)', { count: 'exact' })
      .eq('is_published', true)
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (type) {
      query = query.eq('event_type', type)
    }

    if (upcoming === 'true') {
      query = query.gte('start_date', new Date().toISOString())
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        events: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Events GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is curator or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['curator', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only curators and admins can create events' },
        { status: 403 }
      )
    }

    const eventData = await request.json()

    // Generate slug from title
    const slug = eventData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Insert event
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        slug: eventData.slug || slug,
        organizer_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: data
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Events POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
