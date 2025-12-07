"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ConnectionDetails {
    url: string | undefined;
    hasAnonKey: boolean;
    sessionExists: boolean;
    databaseAccessible: boolean;
    errorMessage?: string;
}

export default function TestSupabasePage() {
    const [status, setStatus] = useState<
        "idle" | "testing" | "success" | "error"
    >("idle");
    const [message, setMessage] = useState("");
    const [details, setDetails] = useState<ConnectionDetails | null>(null);

    const testConnection = async () => {
        setStatus("testing");
        setMessage("Testing connection...");

        try {
            // Check if env variables exist first
            if (
                !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ) {
                setStatus("error");
                setMessage(
                    "❌ Environment variables not set! Please complete HOUR 1 setup first.",
                );
                setDetails({
                    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    sessionExists: false,
                    databaseAccessible: false,
                    errorMessage:
                        "Missing environment variables. See setup instructions below.",
                });
                return;
            }

            const supabase = createClient();

            // Test 1: Check if client is created
            setMessage("✓ Supabase client created");

            // Test 2: Try to get session (auth check)
            const {
                data: { session },
                error: authError,
            } = await supabase.auth.getSession();

            if (authError && authError.message !== "Auth session missing!") {
                throw authError;
            }

            setMessage("✓ Auth module working");

            // Test 3: Try a simple database query (will fail if table doesn't exist yet)
            const { error } = await supabase
                .from("profiles")
                .select("count")
                .limit(1);

            const connectionDetails = {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                sessionExists: !!session,
                databaseAccessible: !error,
                errorMessage: error?.message,
            };

            setDetails(connectionDetails);

            if (error && error.code !== "42P01") {
                // 42P01 = table doesn't exist (that's okay)
                setMessage(
                    `⚠️ Connection works but database query failed: ${error.message}`,
                );
                setStatus("success");
            } else {
                setMessage("✅ Supabase connection fully working!");
                setStatus("success");
            }
        } catch (err) {
            setStatus("error");
            const errorMsg = err instanceof Error ? err.message : String(err);

            if (errorMsg.includes("fetch")) {
                setMessage(
                    "❌ Failed to fetch - Check your SUPABASE_URL and restart dev server!",
                );
            } else {
                setMessage(`❌ Connection failed: ${errorMsg}`);
            }

            console.error("Connection error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="container mx-auto max-w-2xl">
                <h1 className="text-4xl font-bold mb-8">
                    Supabase Connection Test
                </h1>

                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Status</h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={testConnection}
                                disabled={status === "testing"}
                                variant="premium"
                            >
                                {status === "testing"
                                    ? "Testing..."
                                    : "Test Connection"}
                            </Button>
                            <div className="text-xs text-muted-foreground">
                                Make sure you completed HOUR 1 setup first!
                            </div>
                        </div>

                        {status !== "idle" && (
                            <div
                                className={`p-4 rounded-lg ${
                                    status === "success"
                                        ? "bg-green-500/10 text-green-500"
                                        : status === "error"
                                          ? "bg-red-500/10 text-red-500"
                                          : "bg-blue-500/10 text-blue-500"
                                }`}
                            >
                                <p className="font-medium">{message}</p>
                            </div>
                        )}

                        {details && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">
                                    Connection Details:
                                </h3>
                                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                                    {JSON.stringify(details, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Setup Instructions
                    </h2>
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <p>If the test fails, make sure you have:</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li>
                                Created a Supabase project at{" "}
                                <a
                                    href="https://supabase.com"
                                    className="text-primary underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    supabase.com
                                </a>
                            </li>
                            <li>
                                Copied your Project URL and anon key from
                                Supabase Dashboard → Settings → API
                            </li>
                            <li>
                                Created a{" "}
                                <code className="bg-muted px-1 py-0.5 rounded">
                                    .env.local
                                </code>{" "}
                                file in the project root
                                (soular-next/.env.local)
                            </li>
                            <li>
                                Added your Supabase credentials to{" "}
                                <code className="bg-muted px-1 py-0.5 rounded">
                                    .env.local
                                </code>
                                :
                            </li>
                        </ol>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-2">
                            {`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your_very_long_key`}
                        </pre>

                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm">
                                <strong className="text-yellow-600">
                                    ⚠️ Important:
                                </strong>{" "}
                                After creating/editing .env.local, you MUST
                                restart your dev server!
                            </p>
                            <code className="block mt-2 text-xs bg-black/50 p-2 rounded">
                                Stop server (Ctrl+C) → npm run dev
                            </code>
                        </div>

                        <p className="mt-4 text-xs">
                            <strong>Note:</strong> The database query might fail
                            if you haven&apos;t created the tables yet
                            (that&apos;s expected for HOUR 2).
                        </p>
                    </div>
                </Card>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-2">📚 Need Help?</p>
                    <p className="text-sm text-muted-foreground mb-2">
                        Read{" "}
                        <code className="bg-background px-1 py-0.5 rounded">
                            HOUR_1_SETUP.md
                        </code>{" "}
                        for detailed setup instructions.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        After successful connection, proceed to HOUR 3 to create
                        database schema.
                    </p>
                </div>
            </div>
        </div>
    );
}
