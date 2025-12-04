import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Get posts for this thread
    const { data, error, count } = await supabase
      .from('forum_posts')
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)', { count: 'exact' })
      .eq('thread_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        posts: data,
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
    console.error('Forum posts GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Check if thread exists and is not locked
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .select('id, is_locked')
      .eq('id', id)
      .single()

    if (threadError || !thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      )
    }

    if (thread.is_locked) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      )
    }

    const postData = await request.json()

    // Validate required fields
    if (!postData.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Insert post
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        thread_id: id,
        content: postData.content,
        author_id: user.id,
        parent_post_id: postData.parent_post_id || null,
      })
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)')
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'Post created successfully',
        post: data
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Forum post POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
