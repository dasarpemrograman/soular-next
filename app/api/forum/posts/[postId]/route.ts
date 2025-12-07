// ============================================
// HOUR 27: Forum Post Update/Delete API
// ============================================
// API endpoint for updating and deleting individual forum posts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// PATCH /api/forum/posts/[postId] - Update post
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const supabase = await createClient();
    const { postId } = await params;

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

    // Validate post ID
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists and user is the author
    const { data: existing, error: fetchError } = await supabase
      .from('forum_posts')
      .select('author_id, discussion_id')
      .eq('id', postId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existing.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    // Check if discussion is locked
    const { data: discussion } = await supabase
      .from('forum_discussions')
      .select('is_locked')
      .eq('id', existing.discussion_id)
      .single();

    if (discussion?.is_locked) {
      return NextResponse.json(
        { error: 'This discussion is locked and posts cannot be edited' },
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

    // Update the post
    const { data: post, error: updateError } = await supabase
      .from('forum_posts')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select(`
        *,
        profiles!forum_posts_author_id_fkey (
          id,
          name,
          avatar
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating post:', updateError);
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...post,
      is_author: true,
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/forum/posts/[postId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/forum/posts/[postId] - Delete post
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const supabase = await createClient();
    const { postId } = await params;

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

    // Validate post ID
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists and user is the author
    const { data: existing, error: fetchError } = await supabase
      .from('forum_posts')
      .select('author_id, discussion_id')
      .eq('id', postId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existing.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete the post
    const { error: deleteError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    // Update discussion reply count
    const { data: discussion } = await supabase
      .from('forum_discussions')
      .select('reply_count')
      .eq('id', existing.discussion_id)
      .single();

    if (discussion) {
      await supabase
        .from('forum_discussions')
        .update({
          reply_count: Math.max(0, (discussion.reply_count || 0) - 1),
        })
        .eq('id', existing.discussion_id);
    }

    return NextResponse.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/forum/posts/[postId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
