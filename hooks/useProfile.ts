// ============================================
// HOUR 23: Profile Hooks
// ============================================
// React Query hooks for profile management

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// ============================================
// TYPES
// ============================================
export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface UploadAvatarResponse {
  url: string;
  path: string;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchProfile(): Promise<Profile> {
  const response = await fetch('/api/profile');

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

async function updateProfile(data: UpdateProfileData): Promise<Profile> {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  return response.json();
}

async function uploadAvatar(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/profile/avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload avatar');
  }

  return response.json();
}

async function deleteAvatar(): Promise<void> {
  const response = await fetch('/api/profile/avatar', {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete avatar');
  }
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch the current user's profile
 */
export function useProfile() {
  return useQuery<Profile, Error>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if unauthorized
      if (error.message === 'Unauthorized') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to update the current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, UpdateProfileData>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(['profile'], data);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });
}

/**
 * Hook to upload an avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation<UploadAvatarResponse, Error, File>({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      // Update the profile cache with new avatar URL
      queryClient.setQueryData(['profile'], (old: Profile | undefined) => {
        if (!old) return old;
        return {
          ...old,
          avatar: data.url,
        };
      });
    },
    onError: (error) => {
      console.error('Error uploading avatar:', error);
    },
  });
}

/**
 * Hook to delete the current avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      // Remove avatar from profile cache
      queryClient.setQueryData(['profile'], (old: Profile | undefined) => {
        if (!old) return old;
        return {
          ...old,
          avatar: null,
        };
      });
    },
    onError: (error) => {
      console.error('Error deleting avatar:', error);
    },
  });
}

/**
 * Combined hook for avatar operations
 */
export function useAvatar() {
  const upload = useUploadAvatar();
  const remove = useDeleteAvatar();

  return {
    upload: upload.mutate,
    uploadAsync: upload.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    isUploading: upload.isPending,
    isRemoving: remove.isPending,
    uploadError: upload.error,
    removeError: remove.error,
  };
}
