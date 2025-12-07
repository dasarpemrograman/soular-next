// ============================================
// HOUR 27: Forum Posts (Replies) API
// ============================================
// API endpoint for fetching and creating posts/replies in a discussion

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// GET /api/forum/[id]/posts - Get posts for a discussion
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate discussion ID
    if (!id) {
      return NextResponse.json(
        { error: 'Discussion ID is required' },
        { status: 400 }
      );
    }

    // Check if discussion exists
    const { data: discussion, error: discussionError } = await supabase
      .from('forum_discussions')
      .select('id')
      .eq('id', id)
      .single();

    if (discussionError || !discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Fetch posts for this discussion
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles!forum_posts_author_id_fkey (
          id,
          name,
          avatar
        )
      `)
      .eq('discussion_id', id)
      .order('created_at', { ascending: true });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Get current user to check if they authored any posts
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Add is_author flag to each post
    const postsWithAuthorship = posts?.map(post => ({
      ...post,
      is_author: user?.id === post.author_id,
    })) || [];

    return NextResponse.json(postsWithAuthorship);
  } catch (error) {
    console.error('Unexpected error in GET /api/forum/[id]/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/forum/[id]/posts - Create new post/reply
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

    // Validate discussion ID
    if (!id) {
      return NextResponse.json(
        { error: 'Discussion ID is required' },
        { status: 400 }
      );
    }

    // Check if discussion exists and is not locked
    const { data: discussion, error: discussionError } = await supabase
      .from('forum_discussions')
      .select('id, is_locked, reply_count')
      .eq('id', id)
      .single();

    if (discussionError || !discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    if (discussion.is_locked) {
      return NextResponse.json(
        { error: 'This discussion is locked and cannot receive new posts' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be 5,000 characters or less' },
        { status: 400 }
      );
    }

    // Create the post
    const { data: post, error: createError } = await supabase
      .from('forum_posts')
      .insert({
        discussion_id: id,
        author_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        profiles!forum_posts_author_id_fkey (
          id,
          name,
          avatar
        )
      `)
      .single();

    if (createError) {
      console.error('Error creating post:', createError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // Update discussion reply count and last activity
    const { error: updateError } = await supabase
      .from('forum_discussions')
      .update({
        reply_count: (discussion.reply_count || 0) + 1,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating discussion stats:', updateError);
      // Don't fail the request if this update fails
    }

    return NextResponse.json(
      {
        ...post,
        is_author: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/forum/[id]/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
