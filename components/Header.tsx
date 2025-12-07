"use client";

import { Film, Search, User, Menu, LogOut, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

export const Header = () => {
    const { user, loading, signOut } = useAuth();
    const { data: profile } = useProfile();
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
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

    // Close mobile menu on ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMobileMenuOpen(false);
                setSearchOpen(false);
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    const getUserDisplayName = () => {
        if (!user) return null;
        if (profile?.name) return profile.name;
        const name = user.user_metadata?.name || user.user_metadata?.full_name;
        if (name) return name;
        if (user.email) return user.email.split("@")[0];
        return "User";
    };

    const getUserAvatar = () => {
        return profile?.avatar || null;
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Film className="h-7 w-7 text-primary group-hover:text-primary/80 transition-colors" />
                        <span className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                            Soular
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
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
                        {user && (
                            <Link href="/films/upload">
                                <Button
                                    variant="premium"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload Film
                                </Button>
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* Desktop Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Desktop User Section */}
                        {!loading && (
                            <>
                                {user ? (
                                    <div className="hidden md:flex items-center gap-3">
                                        <NotificationBell />
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                        >
                                            {getUserAvatar() ? (
                                                <img
                                                    src={getUserAvatar()!}
                                                    alt={
                                                        getUserDisplayName() ||
                                                        "User"
                                                    }
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gradient-premium flex items-center justify-center text-white text-sm font-medium">
                                                    {getUserDisplayName()
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium">
                                                {getUserDisplayName()}
                                            </span>
                                        </Link>
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

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] md:hidden"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300,
                            }}
                            className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-background shadow-2xl overflow-y-auto"
                        >
                            {/* Menu Header */}
                            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-10">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 group"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className="p-2 rounded-lg bg-gradient-premium">
                                        <Film className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                                        Soular
                                    </span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="hover:bg-muted"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="p-6 space-y-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Link
                                        href="/"
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                            <span className="text-lg">🏠</span>
                                        </div>
                                        <span className="text-base font-medium group-hover:text-primary transition-colors">
                                            Beranda
                                        </span>
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Link
                                        href="/forum"
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                            <span className="text-lg">💬</span>
                                        </div>
                                        <span className="text-base font-medium group-hover:text-primary transition-colors">
                                            Forum
                                        </span>
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link
                                        href="/koleksi"
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                            <Film className="h-5 w-5" />
                                        </div>
                                        <span className="text-base font-medium group-hover:text-primary transition-colors">
                                            Koleksi
                                        </span>
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <Link
                                        href="/events"
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                            <span className="text-lg">🎉</span>
                                        </div>
                                        <span className="text-base font-medium group-hover:text-primary transition-colors">
                                            Events
                                        </span>
                                    </Link>
                                </motion.div>

                                {user && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.28 }}
                                        className="pt-2"
                                    >
                                        <Link
                                            href="/films/upload"
                                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-200 group border border-purple-500/20"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                                                <Upload className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <span className="text-base font-medium text-purple-400">
                                                Upload Film
                                            </span>
                                        </Link>
                                    </motion.div>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="pt-2"
                                >
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-200 group border border-primary/20"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            setSearchOpen(true);
                                        }}
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <Search className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className="text-base font-medium text-primary">
                                            Search Films
                                        </span>
                                    </button>
                                </motion.div>
                            </nav>

                            {/* User Section */}
                            {!loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="border-t border-border p-6 mt-4"
                                >
                                    {user ? (
                                        <div className="space-y-2">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-200 border border-primary/20"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                {getUserAvatar() ? (
                                                    <img
                                                        src={getUserAvatar()!}
                                                        alt={
                                                            getUserDisplayName() ||
                                                            "User"
                                                        }
                                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gradient-premium flex items-center justify-center text-white text-sm font-medium ring-2 ring-primary/20">
                                                        {getUserDisplayName()
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">
                                                        {getUserDisplayName()}
                                                    </p>
                                                    <p className="text-xs text-primary/70">
                                                        View Profile →
                                                    </p>
                                                </div>
                                            </Link>

                                            <Link
                                                href="/notifications"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-all duration-200 group"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                                    <span className="text-lg">
                                                        🔔
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                    Notifications
                                                </span>
                                            </Link>

                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-all duration-200 group"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                                    <span className="text-lg">
                                                        ⚙️
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                    Settings
                                                </span>
                                            </Link>

                                            <div className="pt-2">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all duration-200"
                                                    onClick={() => {
                                                        setMobileMenuOpen(
                                                            false,
                                                        );
                                                        handleLogout();
                                                    }}
                                                >
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    Logout
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Link
                                                href="/login"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className="block"
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-11 text-base"
                                                >
                                                    <User className="h-5 w-5 mr-2" />
                                                    Masuk
                                                </Button>
                                            </Link>
                                            <Link
                                                href="/signup"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className="block"
                                            >
                                                <Button
                                                    variant="premium"
                                                    className="w-full h-11 text-base"
                                                >
                                                    ✨ Daftar Sekarang
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
        </>
    );
};
