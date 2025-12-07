// ============================================
// HOUR 27: Forum Hooks
// ============================================
// React Query hooks for forum discussions and posts management

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// ============================================
// TYPES
// ============================================
export interface ForumDiscussion {
    id: string;
    title: string;
    content: string;
    author_id: string;
    category: string;
    tags: string[];
    is_pinned: boolean;
    is_locked: boolean;
    view_count: number;
    reply_count: number;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
    profiles: {
        id: string;
        name: string;
        avatar: string | null;
    };
    is_author?: boolean;
}

export interface ForumPost {
    id: string;
    discussion_id: string;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    profiles: {
        id: string;
        name: string;
        avatar: string | null;
    };
    forum_discussions?: {
        id: string;
        title: string;
    };
    is_author?: boolean;
}

export interface UserForumActivity {
    profile: {
        id: string;
        name: string;
        avatar: string | null;
    };
    discussions: ForumDiscussion[];
    posts: ForumPost[];
    stats: {
        total_discussions: number;
        total_posts: number;
    };
}

export interface DiscussionsParams {
    category?: string;
    sort?: "latest" | "popular" | "most_replies";
    limit?: number;
    offset?: number;
    search?: string;
}

export interface DiscussionsResponse {
    discussions: ForumDiscussion[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export interface CreateDiscussionData {
    title: string;
    content: string;
    category: string;
    tags?: string[];
}

export interface UpdateDiscussionData {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
}

export interface CreatePostData {
    content: string;
}

export interface UpdatePostData {
    content: string;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchDiscussions(
    params: DiscussionsParams = {},
): Promise<DiscussionsResponse> {
    const searchParams = new URLSearchParams();

    if (params.category) searchParams.set("category", params.category);
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());
    if (params.search) searchParams.set("search", params.search);

    const response = await fetch(`/api/forum?${searchParams.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch discussions");
    }

    return response.json();
}

async function fetchDiscussion(id: string): Promise<ForumDiscussion> {
    const response = await fetch(`/api/forum/${id}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Discussion not found");
        }
        throw new Error("Failed to fetch discussion");
    }

    return response.json();
}

async function createDiscussion(
    data: CreateDiscussionData,
): Promise<ForumDiscussion> {
    const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create discussion");
    }

    return response.json();
}

async function updateDiscussion(
    id: string,
    data: UpdateDiscussionData,
): Promise<ForumDiscussion> {
    const response = await fetch(`/api/forum/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update discussion");
    }

    return response.json();
}

async function deleteDiscussion(id: string): Promise<void> {
    const response = await fetch(`/api/forum/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete discussion");
    }
}

async function fetchPosts(discussionId: string): Promise<ForumPost[]> {
    const response = await fetch(`/api/forum/${discussionId}/posts`);

    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }

    return response.json();
}

async function createPost(
    discussionId: string,
    data: CreatePostData,
): Promise<ForumPost> {
    const response = await fetch(`/api/forum/${discussionId}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
    }

    return response.json();
}

async function updatePost(
    postId: string,
    data: UpdatePostData,
): Promise<ForumPost> {
    const response = await fetch(`/api/forum/posts/${postId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
    }

    return response.json();
}

async function deletePost(postId: string): Promise<void> {
    const response = await fetch(`/api/forum/posts/${postId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete post");
    }
}

async function likeDiscussion(discussionId: string): Promise<void> {
    const response = await fetch(`/api/forum/${discussionId}/like`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to like discussion");
    }
}

async function unlikeDiscussion(discussionId: string): Promise<void> {
    const response = await fetch(`/api/forum/${discussionId}/like`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unlike discussion");
    }
}

async function checkLikeStatus(
    discussionId: string,
): Promise<{ is_liked: boolean }> {
    const response = await fetch(`/api/forum/${discussionId}/like`);

    if (!response.ok) {
        throw new Error("Failed to check like status");
    }

    return response.json();
}

async function fetchUserActivity(userId: string): Promise<UserForumActivity> {
    const response = await fetch(`/api/forum/user/${userId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("User not found");
        }
        throw new Error("Failed to fetch user activity");
    }

    return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch forum discussions list
 */
export function useDiscussions(params: DiscussionsParams = {}) {
    return useQuery<DiscussionsResponse, Error>({
        queryKey: ["discussions", params],
        queryFn: () => fetchDiscussions(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch a single discussion by ID
 */
export function useDiscussion(id: string) {
    return useQuery<ForumDiscussion, Error>({
        queryKey: ["discussion", id],
        queryFn: () => fetchDiscussion(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to create a new discussion
 */
export function useCreateDiscussion() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<ForumDiscussion, Error, CreateDiscussionData>({
        mutationFn: createDiscussion,
        onSuccess: (data) => {
            // Invalidate discussions list
            queryClient.invalidateQueries({ queryKey: ["discussions"] });
            // Navigate to the new discussion
            router.push(`/forum/${data.id}`);
        },
        onError: (error) => {
            // If unauthorized, redirect to login
            if (error.message === "Unauthorized") {
                router.push("/login?redirect=/forum");
            }
        },
    });
}

/**
 * Hook to update a discussion
 */
export function useUpdateDiscussion(id: string) {
    const queryClient = useQueryClient();

    return useMutation<ForumDiscussion, Error, UpdateDiscussionData>({
        mutationFn: (data) => updateDiscussion(id, data),
        onSuccess: (data) => {
            // Update the discussion cache
            queryClient.setQueryData(["discussion", id], data);
            // Invalidate discussions list
            queryClient.invalidateQueries({ queryKey: ["discussions"] });
        },
    });
}

/**
 * Hook to delete a discussion
 */
export function useDeleteDiscussion() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<void, Error, string>({
        mutationFn: deleteDiscussion,
        onSuccess: (_, id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: ["discussion", id] });
            // Invalidate discussions list
            queryClient.invalidateQueries({ queryKey: ["discussions"] });
            // Navigate back to forum
            router.push("/forum");
        },
    });
}

/**
 * Hook to fetch posts for a discussion
 */
export function usePosts(discussionId: string) {
    return useQuery<ForumPost[], Error>({
        queryKey: ["posts", discussionId],
        queryFn: () => fetchPosts(discussionId),
        enabled: !!discussionId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to create a new post/reply
 */
export function useCreatePost(discussionId: string) {
    const queryClient = useQueryClient();

    return useMutation<ForumPost, Error, CreatePostData>({
        mutationFn: (data) => createPost(discussionId, data),
        onSuccess: () => {
            // Invalidate posts list
            queryClient.invalidateQueries({
                queryKey: ["posts", discussionId],
            });
            // Invalidate discussion (to update reply count)
            queryClient.invalidateQueries({
                queryKey: ["discussion", discussionId],
            });
        },
    });
}

/**
 * Hook to update a post
 */
export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation<
        ForumPost,
        Error,
        { postId: string; data: UpdatePostData }
    >({
        mutationFn: ({ postId, data }) => updatePost(postId, data),
        onSuccess: (updatedPost) => {
            // Invalidate posts for this discussion
            queryClient.invalidateQueries({
                queryKey: ["posts", updatedPost.discussion_id],
            });
        },
    });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { postId: string; discussionId: string }>({
        mutationFn: ({ postId }) => deletePost(postId),
        onSuccess: (_, { discussionId }) => {
            // Invalidate posts list
            queryClient.invalidateQueries({
                queryKey: ["posts", discussionId],
            });
            // Invalidate discussion (to update reply count)
            queryClient.invalidateQueries({
                queryKey: ["discussion", discussionId],
            });
        },
    });
}

/**
 * Hook to check if user has liked a discussion
 */
export function useLikeStatus(discussionId: string) {
    return useQuery<{ is_liked: boolean }, Error>({
        queryKey: ["like-status", discussionId],
        queryFn: () => checkLikeStatus(discussionId),
        enabled: !!discussionId,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Hook to like a discussion
 */
export function useLikeDiscussion() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<void, Error, string>({
        mutationFn: likeDiscussion,
        onSuccess: (_, discussionId) => {
            // Update like status
            queryClient.setQueryData(["like-status", discussionId], {
                is_liked: true,
            });
            // Invalidate discussion to update like count
            queryClient.invalidateQueries({
                queryKey: ["discussion", discussionId],
            });
        },
        onError: (error) => {
            if (error.message === "Unauthorized") {
                router.push("/login?redirect=/forum");
            }
        },
    });
}

/**
 * Hook to unlike a discussion
 */
export function useUnlikeDiscussion() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: unlikeDiscussion,
        onSuccess: (_, discussionId) => {
            // Update like status
            queryClient.setQueryData(["like-status", discussionId], {
                is_liked: false,
            });
            // Invalidate discussion to update like count
            queryClient.invalidateQueries({
                queryKey: ["discussion", discussionId],
            });
        },
    });
}

/**
 * Combined hook for like operations
 */
export function useDiscussionLike(discussionId: string) {
    const status = useLikeStatus(discussionId);
    const like = useLikeDiscussion();
    const unlike = useUnlikeDiscussion();

    const toggle = () => {
        if (status.data?.is_liked) {
            unlike.mutate(discussionId);
        } else {
            like.mutate(discussionId);
        }
    };

    return {
        isLiked: status.data?.is_liked || false,
        isLoading: status.isLoading,
        isToggling: like.isPending || unlike.isPending,
        toggle,
        like: () => like.mutate(discussionId),
        unlike: () => unlike.mutate(discussionId),
        error: like.error || unlike.error,
    };
}

/**
 * Hook to fetch user's forum activity
 */
export function useUserActivity(userId: string) {
    return useQuery<UserForumActivity, Error>({
        queryKey: ["user-activity", userId],
        queryFn: () => fetchUserActivity(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
