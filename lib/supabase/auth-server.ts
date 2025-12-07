/**
 * Server-Side Authentication Helper Functions
 *
 * Helper functions for managing authentication on the server-side.
 * These functions can only be used in Server Components and API Routes.
 * For client-side auth, use lib/supabase/auth.ts instead.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Get the current authenticated user (server-side)
 */
export async function getCurrentUser() {
    try {
        const supabase = await createClient();
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
 * Get the current user's session (server-side)
 */
export async function getSession() {
    try {
        const supabase = await createClient();
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
 * Get user profile from profiles table (server-side)
 */
export async function getUserProfile(userId: string) {
    try {
        const supabase = await createClient();
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
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated() {
    const { user } = await getCurrentUser();
    return !!user;
}

/**
 * Check if user has premium access (server-side)
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
 * Require authentication - throws error if not authenticated
 * Use this in API routes or Server Actions
 */
export async function requireAuth() {
    const { user, error } = await getCurrentUser();

    if (error || !user) {
        throw new Error("Unauthorized - Please log in");
    }

    return user;
}

/**
 * Require premium access - throws error if not premium
 * Use this in API routes or Server Actions for premium features
 */
export async function requirePremium() {
    const user = await requireAuth();
    const isPremium = await isPremiumUser();

    if (!isPremium) {
        throw new Error("Premium access required");
    }

    return user;
}
