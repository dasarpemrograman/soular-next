"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, PlayCircle, FileText } from "lucide-react";

export default function SetupPage() {
    const [testResult, setTestResult] = useState<{
        success: boolean;
        error?: string;
        details?: string;
        message?: string;
        tests?: unknown;
        nextSteps?: string[];
    } | null>(null);
    const [testing, setTesting] = useState(false);

    const openSupabase = () => {
        window.open("https://supabase.com/dashboard", "_blank");
    };

    const testDatabase = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const response = await fetch("/api/test-db");
            const data = await response.json();
            setTestResult(data);
        } catch (err) {
            setTestResult({
                success: false,
                error: "Failed to connect to API",
                details: err instanceof Error ? err.message : String(err),
            });
        } finally {
            setTesting(false);
        }
    };

    const migrations = [
        {
            hour: 3,
            title: "Profiles Table",
            description: "User profiles with Row Level Security",
            file: "supabase/migrations/001_profiles_table.sql",
            creates: [
                "profiles table (extends auth.users)",
                "Columns: id, name, avatar, bio, is_premium",
                "RLS policies (anyone can read, users can update own)",
                "Auto-create profile trigger on signup",
                "Auto-update updated_at timestamp",
            ],
        },
        {
            hour: 4,
            title: "Films Table",
            description: "Films catalog with YouTube URLs and sample data",
            file: "supabase/migrations/002_films_table.sql",
            creates: [
                "films table with all metadata",
                "Columns: title, slug, description, director, year, duration, category, youtube_url, thumbnail, is_premium",
                "RLS policies (public read, authenticated write)",
                "Helper functions (increment views, generate slug)",
                "10 sample films with real data",
            ],
        },
        {
            hour: 5,
            title: "Events Table",
            description: "Community events and user registrations",
            file: "supabase/migrations/003_events_table.sql",
            creates: [
                "events table with full event details",
                "event_registrations table (many-to-many)",
                "Event types: workshop, screening, discussion, networking, other",
                "RLS policies (public read events, users manage own registrations)",
                "Helper functions (participant count, is full, is registered)",
                "10 sample events (workshops, screenings, etc.)",
            ],
        },
        {
            hour: 6,
            title: "Forum Table",
            description: "Community discussions, posts, and likes",
            file: "supabase/migrations/004_forum_table.sql",
            creates: [
                "forum_discussions table (threads)",
                "forum_posts table (replies with threading)",
                "forum_post_likes table (like system)",
                "Categories: general, filmmaking, technical, showcase, feedback, events",
                "Features: pinned, locked, view count, reply count",
                "RLS policies (public read, authenticated write/update own)",
                "Auto-update reply count and last activity",
                "10 sample discussions + 2 posts",
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Database Setup</h1>
                    <p className="text-muted-foreground">
                        Follow these steps to set up your database schema
                    </p>
                </div>

                {/* Environment Variables */}
                <Card className="p-6 mb-6 bg-blue-500/5 border-blue-500/20">
                    <h2 className="text-xl font-bold mb-3">
                        1. Environment Variables
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create a{" "}
                        <code className="bg-muted px-2 py-1 rounded">
                            .env.local
                        </code>{" "}
                        file in your project root with:
                    </p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
                    </pre>
                    <p className="text-sm text-muted-foreground mt-3">
                        Get these values from your Supabase project settings →
                        API
                    </p>
                </Card>

                {/* Migrations */}
                {migrations.map((migration) => (
                    <Card key={migration.hour} className="p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    HOUR {migration.hour}: {migration.title}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {migration.description}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openSupabase}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Supabase
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    📋 Instructions:
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm">
                                    <li>
                                        Open the migration file:{" "}
                                        <code className="bg-background px-2 py-1 rounded">
                                            {migration.file}
                                        </code>
                                    </li>
                                    <li>Copy the entire SQL content</li>
                                    <li>
                                        Open your Supabase Dashboard → SQL
                                        Editor
                                    </li>
                                    <li>Click &quot;New Query&quot;</li>
                                    <li>Paste the SQL code</li>
                                    <li>
                                        Click &quot;Run&quot; or press
                                        Ctrl+Enter
                                    </li>
                                    <li>Wait for success message</li>
                                </ol>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2 text-sm">
                                    What this creates:
                                </h3>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {migration.creates.map((item, idx) => (
                                        <li key={idx}>✅ {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>
                                    Migration file location: {migration.file}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Verification */}
                <Card className="p-6 mb-6 bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold">🔍 Verify Setup</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={testDatabase}
                            disabled={testing}
                        >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            {testing ? "Testing..." : "Test Database"}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                        After running the SQL migrations, verify everything is
                        working:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
                        <li>
                            Go to Table Editor → Check all tables exist
                            (profiles, films, events, forum_discussions,
                            forum_posts, forum_post_likes, event_registrations)
                        </li>
                        <li>Click on each table → Check columns are correct</li>
                        <li>
                            Go to Authentication → Policies → Check RLS policies
                            exist
                        </li>
                        <li>
                            OR click &quot;Test Database&quot; button above for
                            automatic verification
                        </li>
                    </ol>

                    {testResult && (
                        <div
                            className={`p-4 rounded-lg ${
                                testResult.success
                                    ? "bg-green-500/10 border border-green-500/20"
                                    : "bg-red-500/10 border border-red-500/20"
                            }`}
                        >
                            <p
                                className={`font-semibold mb-2 ${
                                    testResult.success
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {testResult.success
                                    ? "✅ Success!"
                                    : "❌ Error"}
                            </p>
                            <pre className="text-xs overflow-x-auto bg-background/50 p-2 rounded">
                                {JSON.stringify(testResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </Card>

                {/* Troubleshooting */}
                <Card className="p-6 mb-6">
                    <h3 className="font-bold mb-3">🐛 Troubleshooting</h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold">
                                Error: &quot;relation already exists&quot;
                            </p>
                            <p className="text-muted-foreground">
                                The table is already created. You can skip this
                                step or drop the table first.
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold">
                                Error: &quot;permission denied&quot;
                            </p>
                            <p className="text-muted-foreground">
                                Make sure you&apos;re using the SQL Editor in
                                your Supabase Dashboard (not psql or other
                                client).
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold">
                                Error: &quot;Failed to fetch&quot;
                            </p>
                            <p className="text-muted-foreground">
                                Check that your .env.local file has the correct
                                Supabase URL and anon key, and restart your dev
                                server.
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold">Trigger not working</p>
                            <p className="text-muted-foreground">
                                Run the SQL again. It will recreate the
                                triggers.
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm font-semibold text-green-600 mb-1">
                        ✅ Database Schema Complete
                    </p>
                    <p className="text-sm text-muted-foreground">
                        After running all four SQL migrations successfully,
                        you&apos;ll have profiles, films, events, and forum
                        tables ready. All core database schema is complete!
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Next steps: Test authentication at{" "}
                        <a href="/login" className="text-primary underline">
                            /login
                        </a>{" "}
                        or{" "}
                        <a href="/signup" className="text-primary underline">
                            /signup
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
