// ============================================
// HOUR 23: Avatar Upload API
// ============================================
// API endpoint for uploading user avatar to Supabase Storage

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// POST /api/profile/avatar - Upload avatar
// ============================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user's profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile with avatar:', updateError);
      // Avatar uploaded but profile not updated - not critical
      // Return the URL anyway so the client can retry the profile update
    }

    return NextResponse.json({
      url: publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/profile/avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/profile/avatar - Delete current avatar
// ============================================
export async function DELETE() {
  try {
    const supabase = await createClient();

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

    // Get current profile to find avatar path
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.avatar) {
      return NextResponse.json(
        { error: 'No avatar to delete' },
        { status: 400 }
      );
    }

    // Extract path from URL if it's a full URL
    let filePath = profile.avatar;
    if (filePath.includes('/storage/v1/object/public/avatars/')) {
      filePath = filePath.split('/storage/v1/object/public/avatars/')[1];
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting avatar from storage:', deleteError);
      // Continue anyway to remove from profile
    }

    // Remove avatar from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error removing avatar from profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/profile/avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
