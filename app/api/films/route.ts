import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('films')
      .select('*, curator:profiles!curator_id(id, username, full_name, avatar_url)', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (genre) {
      query = query.contains('genre', [genre])
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,director.ilike.%${search}%`)
    }

    if (featured === 'true') {
      query = query.gte('view_count', 100).order('view_count', { ascending: false })
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
        films: data,
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
    console.error('Films GET error:', error)
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
        { error: 'Forbidden: Only curators and admins can create films' },
        { status: 403 }
      )
    }

    const filmData = await request.json()

    // Generate slug from title
    const slug = filmData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Insert film
    const { data, error } = await supabase
      .from('films')
      .insert({
        ...filmData,
        slug: filmData.slug || slug,
        curator_id: user.id,
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
        message: 'Film created successfully',
        film: data
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Films POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
