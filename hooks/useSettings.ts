// ============================================
// HOUR 35: User Settings Hooks
// ============================================
// React Query hooks for user settings and preferences

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// TYPES
// ============================================

export interface UserSettings {
    id: string;
    user_id: string;

    // Notification preferences
    email_notifications: boolean;
    email_on_reply: boolean;
    email_on_mention: boolean;
    email_on_like: boolean;
    email_on_event: boolean;
    email_on_moderation: boolean;

    push_notifications: boolean;
    push_on_reply: boolean;
    push_on_mention: boolean;
    push_on_like: boolean;
    push_on_event: boolean;
    push_on_moderation: boolean;

    // Privacy settings
    show_email: boolean;
    show_activity: boolean;
    allow_mentions: boolean;
    allow_direct_messages: boolean;

    // Display preferences
    theme: "light" | "dark" | "system";
    language: "id" | "en";
    posts_per_page: number;

    // Email digest
    email_digest: "never" | "daily" | "weekly";
    digest_day: number; // 0 = Sunday, 6 = Saturday

    // Metadata
    created_at: string;
    updated_at: string;
}

export interface UpdateSettingsData {
    // Notification preferences
    email_notifications?: boolean;
    email_on_reply?: boolean;
    email_on_mention?: boolean;
    email_on_like?: boolean;
    email_on_event?: boolean;
    email_on_moderation?: boolean;

    push_notifications?: boolean;
    push_on_reply?: boolean;
    push_on_mention?: boolean;
    push_on_like?: boolean;
    push_on_event?: boolean;
    push_on_moderation?: boolean;

    // Privacy settings
    show_email?: boolean;
    show_activity?: boolean;
    allow_mentions?: boolean;
    allow_direct_messages?: boolean;

    // Display preferences
    theme?: "light" | "dark" | "system";
    language?: "id" | "en";
    posts_per_page?: number;

    // Email digest
    email_digest?: "never" | "daily" | "weekly";
    digest_day?: number;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchSettings(): Promise<UserSettings> {
    const response = await fetch("/api/settings");

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch settings");
    }

    return response.json();
}

async function updateSettings(
    data: UpdateSettingsData,
): Promise<{ success: boolean; settings: UserSettings }> {
    const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
    }

    return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch user settings
 */
export function useSettings() {
    return useQuery<UserSettings, Error>({
        queryKey: ["user-settings"],
        queryFn: fetchSettings,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean; settings: UserSettings },
        Error,
        UpdateSettingsData
    >({
        mutationFn: updateSettings,
        onSuccess: (data) => {
            // Update the cache with new settings
            queryClient.setQueryData(["user-settings"], data.settings);
        },
    });
}

/**
 * Combined hook for settings actions
 */
export function useSettingsActions() {
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    return {
        settings,
        isLoading,
        updateSettings: (data: UpdateSettingsData) =>
            updateMutation.mutate(data),
        isUpdating: updateMutation.isPending,
        error: updateMutation.error,
    };
}
