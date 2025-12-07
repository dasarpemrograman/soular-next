import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no settings exist, create default settings
    if (settingsError && settingsError.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError) {
        console.error('Error creating default settings:', createError);
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        );
      }

      return NextResponse.json(newSettings);
    }

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in settings route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, user_id, created_at, updated_at, ...updateData } = body;

    // Validate theme
    if (updateData.theme && !['light', 'dark', 'system'].includes(updateData.theme)) {
      return NextResponse.json(
        { error: 'Invalid theme value' },
        { status: 400 }
      );
    }

    // Validate language
    if (updateData.language && !['id', 'en'].includes(updateData.language)) {
      return NextResponse.json(
        { error: 'Invalid language value' },
        { status: 400 }
      );
    }

    // Validate email_digest
    if (updateData.email_digest && !['never', 'daily', 'weekly'].includes(updateData.email_digest)) {
      return NextResponse.json(
        { error: 'Invalid email digest value' },
        { status: 400 }
      );
    }

    // Validate posts_per_page
    if (updateData.posts_per_page) {
      const ppp = parseInt(updateData.posts_per_page, 10);
      if (isNaN(ppp) || ppp < 10 || ppp > 100) {
        return NextResponse.json(
          { error: 'Posts per page must be between 10 and 100' },
          { status: 400 }
        );
      }
    }

    // Validate digest_day
    if (updateData.digest_day !== undefined) {
      const day = parseInt(updateData.digest_day, 10);
      if (isNaN(day) || day < 0 || day > 6) {
        return NextResponse.json(
          { error: 'Digest day must be between 0 (Sunday) and 6 (Saturday)' },
          { status: 400 }
        );
      }
    }

    // Update settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error in settings update route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
