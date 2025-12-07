"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, User, Mail, Key } from "lucide-react";

export default function TestAuthPage() {
    const { user, session, loading, error, signUp, signIn, signOut } = useAuth();
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password123");
    const [name, setName] = useState("Test User");
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const handleSignUp = async () => {
        setActionLoading(true);
        setActionError(null);
        setActionSuccess(null);

        const { user, error } = await signUp(email, password, name);

        if (error) {
            setActionError(error.message);
        } else if (user) {
            setActionSuccess("Account created successfully! Check your email for verification.");
        }

        setActionLoading(false);
    };

    const handleSignIn = async () => {
        setActionLoading(true);
        setActionError(null);
        setActionSuccess(null);

        const { user, error } = await signIn(email, password);

        if (error) {
            setActionError(error.message);
        } else if (user) {
            setActionSuccess("Signed in successfully!");
        }

        setActionLoading(false);
    };

    const handleSignOut = async () => {
        setActionLoading(true);
        setActionError(null);
        setActionSuccess(null);

        await signOut();
        setActionSuccess("Signed out successfully!");
        setActionLoading(false);
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="container mx-auto max-w-4xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold">useAuth Hook Test</h1>
                    <p className="text-muted-foreground">
                        Test the authentication hook functionality
                    </p>
                </div>

                {/* Current Auth State */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Current Auth State</h2>

                    {loading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading auth state...</span>
                        </div>
                    ) : user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                <div>
                                    <p className="font-medium text-green-700 dark:text-green-400">
                                        Authenticated
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        You are currently signed in
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">User ID</p>
                                        <p className="text-sm font-mono break-all">{user.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{user.email || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                                        <p className="text-sm">
                                            {user.user_metadata?.name ||
                                             user.user_metadata?.full_name ||
                                             "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Session</p>
                                        <p className="text-sm">
                                            {session ? "Active" : "No session"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                    View Full User Object
                                </summary>
                                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                                    {JSON.stringify(user, null, 2)}
                                </pre>
                            </details>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-yellow-500" />
                            <div>
                                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                                    Not Authenticated
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    No user is currently signed in
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                <strong>Error:</strong> {error.message}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Auth Actions */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Test Auth Actions</h2>

                    {actionError && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>
                        </div>
                    )}

                    {actionSuccess && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-600 dark:text-green-400">{actionSuccess}</p>
                        </div>
                    )}

                    {!user ? (
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        disabled={actionLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        disabled={actionLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={actionLoading}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSignIn}
                                    disabled={actionLoading}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Sign In
                                </Button>

                                <Button
                                    onClick={handleSignUp}
                                    disabled={actionLoading}
                                    variant="premium"
                                    className="flex-1"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Sign Up
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Button
                                onClick={handleSignOut}
                                disabled={actionLoading}
                                variant="outline"
                                className="w-full"
                            >
                                {actionLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Sign Out
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Hook Info */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">useAuth Hook Features</h2>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Automatic auth state management with real-time updates</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Sign up, sign in, and sign out functions</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Password reset and update functionality</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Loading states for better UX</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Error handling built-in</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Automatic router refresh on auth changes</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
