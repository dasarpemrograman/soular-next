// ============================================
// HOUR 33: Notifications Hooks
// ============================================
// React Query hooks for notifications system

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// TYPES
// ============================================

export interface Notification {
    id: string;
    user_id: string;
    type:
        | "reply"
        | "mention"
        | "like"
        | "discussion_pinned"
        | "discussion_locked"
        | "post_deleted"
        | "user_banned"
        | "role_changed"
        | "event_reminder"
        | "event_cancelled";
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    actor_id: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    actor?: {
        id: string;
        username: string;
        avatar: string | null;
    } | null;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    limit: number;
    offset: number;
}

export interface UnreadCountResponse {
    count: number;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false,
): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    if (unreadOnly) {
        params.append("unread_only", "true");
    }

    const response = await fetch(`/api/notifications?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch notifications");
    }

    return response.json();
}

async function fetchUnreadCount(): Promise<UnreadCountResponse> {
    const response = await fetch("/api/notifications/unread-count");

    if (!response.ok) {
        throw new Error("Failed to fetch unread count");
    }

    return response.json();
}

async function markNotificationAsRead(
    notificationId: string,
): Promise<{ success: boolean }> {
    const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark notification as read");
    }

    return response.json();
}

async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            error.error || "Failed to mark all notifications as read",
        );
    }

    return response.json();
}

async function deleteNotification(
    notificationId: string,
): Promise<{ success: boolean }> {
    const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete notification");
    }

    return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch user's notifications
 */
export function useNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false,
) {
    return useQuery<NotificationsResponse, Error>({
        queryKey: ["notifications", limit, offset, unreadOnly],
        queryFn: () => fetchNotifications(limit, offset, unreadOnly),
        staleTime: 1000 * 30, // 30 seconds
    });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
    return useQuery<UnreadCountResponse, Error>({
        queryKey: ["notifications-unread-count"],
        queryFn: fetchUnreadCount,
        staleTime: 1000 * 15, // 15 seconds
        refetchInterval: 1000 * 60, // Refetch every minute
    });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean }, Error, string>({
        mutationFn: markNotificationAsRead,
        onSuccess: (data, notificationId) => {
            // Invalidate notifications list
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            // Invalidate unread count
            queryClient.invalidateQueries({
                queryKey: ["notifications-unread-count"],
            });
        },
    });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean }, Error>({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            // Invalidate notifications list
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            // Invalidate unread count
            queryClient.invalidateQueries({
                queryKey: ["notifications-unread-count"],
            });
        },
    });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean }, Error, string>({
        mutationFn: deleteNotification,
        onSuccess: (data, notificationId) => {
            // Invalidate notifications list
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            // Invalidate unread count
            queryClient.invalidateQueries({
                queryKey: ["notifications-unread-count"],
            });
        },
    });
}

/**
 * Combined hook for notification actions
 */
export function useNotificationActions() {
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    return {
        markAsRead: (id: string) => markAsRead.mutate(id),
        markAllAsRead: () => markAllAsRead.mutate(),
        deleteNotification: (id: string) => deleteNotification.mutate(id),
        isMarking: markAsRead.isPending,
        isMarkingAll: markAllAsRead.isPending,
        isDeleting: deleteNotification.isPending,
    };
}
