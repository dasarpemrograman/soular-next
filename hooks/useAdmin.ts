// ============================================
// HOUR 30: Admin/Moderation Hooks
// ============================================
// React Query hooks for admin and moderation actions

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// TYPES
// ============================================

export interface ModerationLog {
    id: string;
    moderator_id: string;
    action_type:
        | "pin"
        | "unpin"
        | "lock"
        | "unlock"
        | "delete_discussion"
        | "delete_post"
        | "ban_user"
        | "unban_user";
    target_type: "discussion" | "post" | "user";
    target_id: string;
    reason: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    profiles?: {
        id: string;
        name: string;
        avatar: string | null;
    };
}

export interface ModerationStats {
    total_pin_actions: number;
    total_lock_actions: number;
    total_discussion_deletions: number;
    total_post_deletions: number;
    total_ban_actions: number;
    active_moderators: number;
    actions_last_24h: number;
    actions_last_7d: number;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    role: "user" | "moderator" | "admin";
    is_banned: boolean;
    ban_reason: string | null;
    ban_expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UsersResponse {
    users: UserProfile[];
    total: number;
    limit: number;
    offset: number;
}

// ============================================
// API FUNCTIONS
// ============================================

async function pinDiscussion(
    discussionId: string,
): Promise<{ success: boolean; is_pinned: boolean }> {
    const response = await fetch(`/api/admin/discussions/${discussionId}/pin`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to pin discussion");
    }

    return response.json();
}

async function lockDiscussion(
    discussionId: string,
): Promise<{ success: boolean; is_locked: boolean }> {
    const response = await fetch(
        `/api/admin/discussions/${discussionId}/lock`,
        {
            method: "POST",
        },
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lock discussion");
    }

    return response.json();
}

async function banUser(
    userId: string,
    reason: string,
    duration_days?: number,
): Promise<{ success: boolean }> {
    const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, duration_days }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to ban user");
    }

    return response.json();
}

async function unbanUser(userId: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unban user");
    }

    return response.json();
}

async function updateUserRole(
    userId: string,
    role: "user" | "moderator" | "admin",
): Promise<{ success: boolean }> {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user role");
    }

    return response.json();
}

async function fetchModerationLogs(
    limit: number = 50,
    offset: number = 0,
): Promise<ModerationLog[]> {
    const response = await fetch(
        `/api/admin/moderation-logs?limit=${limit}&offset=${offset}`,
    );

    if (!response.ok) {
        throw new Error("Failed to fetch moderation logs");
    }

    return response.json();
}

async function fetchModerationStats(): Promise<ModerationStats> {
    const response = await fetch("/api/admin/stats");

    if (!response.ok) {
        throw new Error("Failed to fetch moderation stats");
    }

    return response.json();
}

async function fetchCurrentUserRole(): Promise<{
    role: string;
    is_admin: boolean;
    is_moderator: boolean;
}> {
    const response = await fetch("/api/admin/me");

    if (!response.ok) {
        throw new Error("Failed to fetch user role");
    }

    return response.json();
}

async function fetchUsers(
    search: string = "",
    role: string = "",
    banned: string = "",
    limit: number = 50,
    offset: number = 0,
): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (role) params.append("role", role);
    if (banned) params.append("banned", banned);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    const response = await fetch(`/api/admin/users?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to pin/unpin a discussion
 */
export function usePinDiscussion() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean; is_pinned: boolean }, Error, string>(
        {
            mutationFn: pinDiscussion,
            onSuccess: (data, discussionId) => {
                // Invalidate discussion cache
                queryClient.invalidateQueries({
                    queryKey: ["discussion", discussionId],
                });
                // Invalidate discussions list
                queryClient.invalidateQueries({ queryKey: ["discussions"] });
            },
        },
    );
}

/**
 * Hook to lock/unlock a discussion
 */
export function useLockDiscussion() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean; is_locked: boolean }, Error, string>(
        {
            mutationFn: lockDiscussion,
            onSuccess: (data, discussionId) => {
                // Invalidate discussion cache
                queryClient.invalidateQueries({
                    queryKey: ["discussion", discussionId],
                });
                // Invalidate discussions list
                queryClient.invalidateQueries({ queryKey: ["discussions"] });
            },
        },
    );
}

/**
 * Hook to ban a user
 */
export function useBanUser() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean },
        Error,
        { userId: string; reason: string; duration_days?: number }
    >({
        mutationFn: ({ userId, reason, duration_days }) =>
            banUser(userId, reason, duration_days),
        onSuccess: (data, { userId }) => {
            // Invalidate user activity
            queryClient.invalidateQueries({
                queryKey: ["user-activity", userId],
            });
            // Invalidate moderation logs
            queryClient.invalidateQueries({ queryKey: ["moderation-logs"] });
        },
    });
}

/**
 * Hook to unban a user
 */
export function useUnbanUser() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean }, Error, string>({
        mutationFn: unbanUser,
        onSuccess: (data, userId) => {
            // Invalidate user activity
            queryClient.invalidateQueries({
                queryKey: ["user-activity", userId],
            });
            // Invalidate moderation logs
            queryClient.invalidateQueries({ queryKey: ["moderation-logs"] });
        },
    });
}

/**
 * Hook to update user role
 */
export function useUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean },
        Error,
        { userId: string; role: "user" | "moderator" | "admin" }
    >({
        mutationFn: ({ userId, role }) => updateUserRole(userId, role),
        onSuccess: (data, { userId }) => {
            // Invalidate user activity
            queryClient.invalidateQueries({
                queryKey: ["user-activity", userId],
            });
        },
    });
}

/**
 * Hook to fetch moderation logs
 */
export function useModerationLogs(limit: number = 50, offset: number = 0) {
    return useQuery<ModerationLog[], Error>({
        queryKey: ["moderation-logs", limit, offset],
        queryFn: () => fetchModerationLogs(limit, offset),
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Hook to fetch moderation statistics
 */
export function useModerationStats() {
    return useQuery<ModerationStats, Error>({
        queryKey: ["moderation-stats"],
        queryFn: fetchModerationStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get current user's role and permissions
 */
export function useCurrentUserRole() {
    return useQuery<
        { role: string; is_admin: boolean; is_moderator: boolean },
        Error
    >({
        queryKey: ["current-user-role"],
        queryFn: fetchCurrentUserRole,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook to fetch users with filtering
 */
export function useUsers(
    search: string = "",
    role: string = "",
    banned: string = "",
    limit: number = 50,
    offset: number = 0,
) {
    return useQuery<UsersResponse, Error>({
        queryKey: ["admin-users", search, role, banned, limit, offset],
        queryFn: () => fetchUsers(search, role, banned, limit, offset),
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Combined hook for moderation actions on a discussion
 */
export function useDiscussionModeration(discussionId: string) {
    const pin = usePinDiscussion();
    const lock = useLockDiscussion();

    return {
        togglePin: () => pin.mutate(discussionId),
        toggleLock: () => lock.mutate(discussionId),
        isPinning: pin.isPending,
        isLocking: lock.isPending,
        pinError: pin.error,
        lockError: lock.error,
    };
}
