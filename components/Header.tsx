"use client";

import { Film, Search, User, Menu, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export const Header = () => {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleLogout = async () => {
        console.log("Header: logging out");
        await signOut();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(
                `/koleksi?search=${encodeURIComponent(searchQuery.trim())}`,
            );
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    // Get user's display name from metadata or email
    const getUserDisplayName = () => {
        if (!user) return null;

        // Try to get name from user metadata
        const name = user.user_metadata?.name || user.user_metadata?.full_name;
        if (name) return name;

        // Fallback to email (without domain)
        if (user.email) {
            return user.email.split("@")[0];
        }

        return "User";
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Film className="h-7 w-7 text-primary group-hover:text-primary/80 transition-colors" />
                    <span className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                        Soular
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Beranda
                    </Link>
                    <Link
                        href="/forum"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Forum
                    </Link>
                    <Link
                        href="/koleksi"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Koleksi
                    </Link>
                    <Link
                        href="/events"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Events
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                        onClick={() => setSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {!loading && (
                        <>
                            {user ? (
                                <div className="hidden md:flex items-center gap-3">
                                    <NotificationBell />
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-premium flex items-center justify-center text-white text-sm font-medium">
                                            {getUserDisplayName()
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">
                                            {getUserDisplayName()}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="hidden md:flex"
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Masuk
                                        </Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button
                                            variant="premium"
                                            size="sm"
                                            className="hidden md:flex"
                                        >
                                            Daftar
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </>
                    )}

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Search Dialog */}
            {searchOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
                    <div className="container mx-auto px-4 max-w-2xl">
                        <div className="bg-background border border-border rounded-lg shadow-2xl">
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center gap-2 p-4"
                            >
                                <Search className="h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search films by title or description..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="flex-1 border-0 focus-visible:ring-0"
                                    autoFocus
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                    }}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </form>
                            <div className="border-t p-4 text-sm text-muted-foreground">
                                <p>Press Enter to search or ESC to close</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
