import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/admin/users/[userId]/ban - Ban a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const { userId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is moderator or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'moderator' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { reason, duration_days } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Ban reason is required' }, { status: 400 });
    }

    // Calculate ban_expires_at if duration is provided
    let ban_expires_at = null;
    if (duration_days && duration_days > 0) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration_days);
      ban_expires_at = expiresAt.toISOString();
    }

    // Update user profile to ban them
    const { error: banError } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: reason,
        ban_expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (banError) {
      console.error('Error banning user:', banError);
      return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
    }

    // Log the moderation action
    const { error: logError } = await supabase.rpc('log_moderation_action', {
      p_moderator_id: user.id,
      p_action: 'user_banned',
      p_target_type: 'user',
      p_target_id: userId,
      p_reason: reason,
      p_metadata: {
        duration_days,
        ban_expires_at,
      },
    });

    if (logError) {
      console.error('Error logging moderation action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'User banned successfully',
    });
  } catch (error) {
    console.error('Error in ban user route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId]/ban - Unban a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const { userId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is moderator or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'moderator' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update user profile to unban them
    const { error: unbanError } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        ban_reason: null,
        ban_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (unbanError) {
      console.error('Error unbanning user:', unbanError);
      return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 });
    }

    // Log the moderation action
    const { error: logError } = await supabase.rpc('log_moderation_action', {
      p_moderator_id: user.id,
      p_action: 'user_unbanned',
      p_target_type: 'user',
      p_target_id: userId,
      p_reason: 'User unbanned by moderator',
    });

    if (logError) {
      console.error('Error logging moderation action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'User unbanned successfully',
    });
  } catch (error) {
    console.error('Error in unban user route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
