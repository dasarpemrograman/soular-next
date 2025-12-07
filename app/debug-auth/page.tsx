"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DebugAuthPage() {
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = async () => {
        try {
            setLoading(true);
            setError(null);
            const supabase = createClient();

            // Get user
            const { data: userData, error: userError } =
                await supabase.auth.getUser();
            console.log("User data:", userData);
            console.log("User error:", userError);

            // Get session
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();
            console.log("Session data:", sessionData);
            console.log("Session error:", sessionError);

            setUser(userData.user);
            setSession(sessionData.session);

            if (userError) {
                setError(userError.message);
            }
        } catch (err) {
            console.error("Error checking auth:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();

        // Subscribe to auth changes
        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state change:", event, session);
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">
                    Authentication Debug
                </h1>

                <Card className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Auth State</h2>
                        <Button onClick={checkAuth} disabled={loading}>
                            {loading ? "Loading..." : "Refresh"}
                        </Button>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">User:</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                                {user ? JSON.stringify(user, null, 2) : "null"}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Session:</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                                {session
                                    ? JSON.stringify(session, null, 2)
                                    : "null"}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Status:</h3>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm">
                                    <strong>Authenticated:</strong>{" "}
                                    {user ? "✅ Yes" : "❌ No"}
                                </p>
                                <p className="text-sm">
                                    <strong>Session Active:</strong>{" "}
                                    {session ? "✅ Yes" : "❌ No"}
                                </p>
                                <p className="text-sm">
                                    <strong>Email:</strong>{" "}
                                    {user?.email || "N/A"}
                                </p>
                                <p className="text-sm">
                                    <strong>User ID:</strong> {user?.id || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">
                                Environment Variables:
                            </h3>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm">
                                    <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
                                    {process.env.NEXT_PUBLIC_SUPABASE_URL
                                        ? "✅ Set"
                                        : "❌ Not Set"}
                                </p>
                                <p className="text-sm">
                                    <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{" "}
                                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                                        ? "✅ Set"
                                        : "❌ Not Set"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">
                                localStorage Check:
                            </h3>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm">
                                    <strong>Supabase Auth Token:</strong>{" "}
                                    {typeof window !== "undefined" &&
                                    localStorage.getItem(
                                        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`,
                                    )
                                        ? "✅ Found"
                                        : "❌ Not Found"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => (window.location.href = "/login")}
                            variant="outline"
                        >
                            Go to Login
                        </Button>
                        <Button
                            onClick={() => (window.location.href = "/signup")}
                            variant="outline"
                        >
                            Go to Signup
                        </Button>
                        <Button
                            onClick={async () => {
                                const supabase = createClient();
                                await supabase.auth.signOut();
                                checkAuth();
                            }}
                            variant="destructive"
                        >
                            Sign Out
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
