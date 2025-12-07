"use client";

import { useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: AuthError | null;
}

interface UseAuthReturn extends AuthState {
    signUp: (email: string, password: string, name?: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error getting session:", error);
                    setAuthState({
                        user: null,
                        session: null,
                        loading: false,
                        error,
                    });
                    return;
                }

                setAuthState({
                    user: session?.user ?? null,
                    session: session,
                    loading: false,
                    error: null,
                });
            } catch (err) {
                console.error("Error initializing auth:", err);
                setAuthState({
                    user: null,
                    session: null,
                    loading: false,
                    error: err as AuthError,
                });
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth state changed:", event, session?.user?.email);

                setAuthState({
                    user: session?.user ?? null,
                    session: session,
                    loading: false,
                    error: null,
                });

                // Refresh the page on sign in/out to update server components
                if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
                    router.refresh();
                }
            }
        );

        // Cleanup subscription
        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const signUp = async (
        email: string,
        password: string,
        name?: string
    ): Promise<{ user: User | null; error: AuthError | null }> => {
        const supabase = createClient();

        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name || "",
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setAuthState((prev) => ({ ...prev, loading: false, error }));
                return { user: null, error };
            }

            setAuthState({
                user: data.user,
                session: data.session,
                loading: false,
                error: null,
            });

            return { user: data.user, error: null };
        } catch (err) {
            const authError = err as AuthError;
            setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
            return { user: null, error: authError };
        }
    };

    const signIn = async (
        email: string,
        password: string
    ): Promise<{ user: User | null; error: AuthError | null }> => {
        const supabase = createClient();

        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setAuthState((prev) => ({ ...prev, loading: false, error }));
                return { user: null, error };
            }

            setAuthState({
                user: data.user,
                session: data.session,
                loading: false,
                error: null,
            });

            return { user: data.user, error: null };
        } catch (err) {
            const authError = err as AuthError;
            setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
            return { user: null, error: authError };
        }
    };

    const signOut = async (): Promise<void> => {
        const supabase = createClient();

        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Error signing out:", error);
                setAuthState((prev) => ({ ...prev, loading: false, error }));
                return;
            }

            setAuthState({
                user: null,
                session: null,
                loading: false,
                error: null,
            });

            // Redirect to home page
            router.push("/");
            router.refresh();
        } catch (err) {
            console.error("Error during sign out:", err);
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: err as AuthError
            }));
        }
    };

    const resetPassword = async (
        email: string
    ): Promise<{ error: AuthError | null }> => {
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });

            if (error) {
                return { error };
            }

            return { error: null };
        } catch (err) {
            return { error: err as AuthError };
        }
    };

    const updatePassword = async (
        newPassword: string
    ): Promise<{ error: AuthError | null }> => {
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                return { error };
            }

            return { error: null };
        } catch (err) {
            return { error: err as AuthError };
        }
    };

    return {
        user: authState.user,
        session: authState.session,
        loading: authState.loading,
        error: authState.error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
    };
}
