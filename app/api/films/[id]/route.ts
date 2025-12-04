import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get film with related data
    const { data: film, error } = await supabase
      .from('films')
      .select(`
        *,
        curator:profiles!curator_id(id, username, full_name, avatar_url),
        credits:film_credits(id, person_name, role, character_name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Film not found' },
        { status: 404 }
      )
    }

    // Check if user has access to unpublished films
    if (!film.is_published) {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || (film.curator_id !== user.id)) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id || '')
          .single()

        if (!profile || !['admin', 'curator'].includes(profile.role)) {
          return NextResponse.json(
            { error: 'Film not found' },
            { status: 404 }
          )
        }
      }
    }

    // Increment view count
    await supabase.rpc('increment_film_views', { film_id_param: id })

    // Get user-specific data if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    let userInteractions = null

    if (user) {
      const [favoriteResult, ratingResult, progressResult] = await Promise.all([
        supabase
          .from('film_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('film_id', id)
          .maybeSingle(),
        supabase
          .from('film_ratings')
          .select('rating')
          .eq('user_id', user.id)
          .eq('film_id', id)
          .maybeSingle(),
        supabase
          .from('watch_progress')
          .select('progress_seconds, completed')
          .eq('user_id', user.id)
          .eq('film_id', id)
          .maybeSingle(),
      ])

      userInteractions = {
        isFavorite: !!favoriteResult.data,
        userRating: ratingResult.data?.rating || null,
        watchProgress: progressResult.data || null,
      }
    }

    return NextResponse.json(
      {
        film,
        userInteractions
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Film GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Get film to check ownership
    const { data: film } = await supabase
      .from('films')
      .select('curator_id')
      .eq('id', id)
      .single()

    if (!film) {
      return NextResponse.json(
        { error: 'Film not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = film.curator_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update this film' },
        { status: 403 }
      )
    }

    const updateData = await request.json()

    // Remove fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.created_at
    delete updateData.view_count
    delete updateData.rating
    if (!isAdmin) {
      delete updateData.curator_id
    }

    // Update film
    const { data, error } = await supabase
      .from('films')
      .update(updateData)
      .eq('id', id)
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
        message: 'Film updated successfully',
        film: data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Film PATCH error:', error)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete films' },
        { status: 403 }
      )
    }

    // Delete film
    const { error } = await supabase
      .from('films')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Film deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Film DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
