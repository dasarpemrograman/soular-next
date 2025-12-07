// ============================================
// HOUR 27: Forum Discussion Like API
// ============================================
// API endpoint for liking/unliking forum discussions

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// GET /api/forum/[id]/like - Check if user liked discussion
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ is_liked: false });
    }

    // Check if user has liked this discussion
    const { data: like } = await supabase
      .from('forum_discussion_likes')
      .select('id')
      .eq('discussion_id', id)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      is_liked: !!like,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/forum/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/forum/[id]/like - Like discussion
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

    // Check if already liked
    const { data: existing } = await supabase
      .from('forum_discussion_likes')
      .select('id')
      .eq('discussion_id', id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already liked this discussion' },
        { status: 409 }
      );
    }

    // Create like
    const { error: likeError } = await supabase
      .from('forum_discussion_likes')
      .insert({
        discussion_id: id,
        user_id: user.id,
      });

    if (likeError) {
      console.error('Error creating like:', likeError);
      return NextResponse.json(
        { error: 'Failed to like discussion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Discussion liked successfully',
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/forum/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/forum/[id]/like - Unlike discussion
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

    // Validate discussion ID
    if (!id) {
      return NextResponse.json(
        { error: 'Discussion ID is required' },
        { status: 400 }
      );
    }

    // Delete like
    const { error: deleteError } = await supabase
      .from('forum_discussion_likes')
      .delete()
      .eq('discussion_id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting like:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unlike discussion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Discussion unliked successfully',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/forum/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
