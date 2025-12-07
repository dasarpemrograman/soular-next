/**
 * Authentication Helper Functions
 *
 * Helper functions for managing authentication and user sessions in Supabase.
 * These functions handle common operations like login, logout, session management,
 * and user profile operations.
 */

import { createClient } from "@/lib/supabase/client";

/**
 * Get the current authenticated user (client-side)
 */
export async function getCurrentUser() {
    try {
        const supabase = createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        return { user, error: null };
    } catch (error) {
        return { user: null, error: error as Error };
    }
}

/**
 * Get the current user's session
 */
export async function getSession() {
    try {
        const supabase = createClient();
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        return { session, error: null };
    } catch (error) {
        return { session: null, error: error as Error };
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    name: string,
) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                },
            },
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export async function signInWithOAuth(provider: "google" | "github") {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Sign out the current user
 */
export async function signOut() {
    try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
    try {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
    try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Update user email
 */
export async function updateEmail(newEmail: string) {
    try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            email: newEmail,
        });

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Get user profile from profiles table
 */
export async function getUserProfile(userId: string) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: {
        name?: string;
        avatar?: string;
        bio?: string;
    },
) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId)
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
    const { user } = await getCurrentUser();
    return !!user;
}

/**
 * Check if user has premium access
 */
export async function isPremiumUser() {
    try {
        const { user } = await getCurrentUser();
        if (!user) return false;

        const { data } = await getUserProfile(user.id);
        return data?.is_premium || false;
    } catch {
        return false;
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
    callback: (user: { id: string; email?: string } | null) => void,
) {
    const supabase = createClient();
    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });

    return () => {
        subscription.unsubscribe();
    };
}
