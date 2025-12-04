import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event has capacity
    if (event.capacity && event.attendee_count >= event.capacity) {
      return NextResponse.json(
        { error: 'Event is at full capacity' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingRegistration) {
      if (existingRegistration.status === 'cancelled') {
        // Reactivate cancelled registration
        const { data, error } = await supabase
          .from('event_registrations')
          .update({ status: 'registered' })
          .eq('id', existingRegistration.id)
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
            message: 'Registration reactivated successfully',
            registration: data
          },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Get optional registration data from request body
    const body = await request.json().catch(() => ({}))
    const registrationData = body.registration_data || null

    // Create registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: id,
        user_id: user.id,
        status: 'registered',
        registration_data: registrationData
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
        message: 'Successfully registered for event',
        registration: data
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Event registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update registration status to cancelled
    const { data, error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Registration not found or already cancelled' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: 'Registration cancelled successfully',
        registration: data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Event unregister error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
