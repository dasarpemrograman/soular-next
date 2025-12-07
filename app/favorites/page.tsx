"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Film as FilmIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ============================================
// TYPES
// ============================================
interface Film {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    duration: number;
    favorited_at: string;
}

// ============================================
// API FUNCTION
// ============================================
async function fetchUserFavorites(): Promise<Film[]> {
    const response = await fetch("/api/favorites");

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch favorites");
    }

    return response.json();
}

// ============================================
// COMPONENTS
// ============================================

function FilmCard({ film }: { film: Film }) {
    return (
        <Link href={`/film/${film.id}`}>
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                        src={film.thumbnail || "/placeholder-film.jpg"}
                        alt={film.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Favorite badge */}
                    <div className="absolute top-3 right-3 bg-red-500 rounded-full p-2">
                        <Heart className="h-4 w-4 text-white fill-white" />
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {film.duration} min
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {film.title}
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {film.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {film.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Added {new Date(film.favorited_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                Start building your collection by adding films to your favorites.
                Click the heart icon on any film to save it here.
            </p>
            <Link href="/koleksi">
                <Button variant="premium">
                    <FilmIcon className="mr-2 h-4 w-4" />
                    Browse Films
                </Button>
            </Link>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <div className="aspect-video bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                        <div className="h-6 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const {
        data: favorites,
        isLoading,
        error,
    } = useQuery<Film[], Error>({
        queryKey: ["favorites"],
        queryFn: fetchUserFavorites,
        enabled: !!user, // Only fetch if user is authenticated
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            if (error.message === "Unauthorized") {
                return false;
            }
            return failureCount < 3;
        },
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/favorites");
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/profile">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Profile
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center">
                            <Heart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">My Favorites</h1>
                            <p className="text-muted-foreground">
                                {isLoading
                                    ? "Loading your collection..."
                                    : `${favorites?.length || 0} film${(favorites?.length || 0) !== 1 ? "s" : ""} saved`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="p-8 border-red-500/20 bg-red-500/5">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                <FilmIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">
                                Failed to Load Favorites
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {error.message}
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                Try Again
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Loading State */}
                {isLoading && !error && <LoadingSkeleton />}

                {/* Empty State */}
                {!isLoading && !error && favorites?.length === 0 && (
                    <EmptyState />
                )}

                {/* Favorites Grid */}
                {!isLoading && !error && favorites && favorites.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((film) => (
                            <FilmCard key={film.id} film={film} />
                        ))}
                    </div>
                )}

                {/* Stats Card */}
                {!isLoading && favorites && favorites.length > 0 && (
                    <Card className="mt-8 p-6">
                        <h3 className="font-semibold mb-4">Your Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {favorites.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Total Favorites
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {new Set(favorites.map((f) => f.category))
                                        .size}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Categories
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {Math.round(
                                        favorites.reduce(
                                            (acc, f) => acc + f.duration,
                                            0,
                                        ) / 60,
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Hours of Content
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {favorites.length > 0
                                        ? new Date(
                                              Math.max(
                                                  ...favorites.map((f) =>
                                                      new Date(
                                                          f.favorited_at,
                                                      ).getTime(),
                                                  ),
                                              ),
                                          ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                          })
                                        : "-"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Last Added
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
