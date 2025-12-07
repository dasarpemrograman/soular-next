"use client";

import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Film, Play, Clock, Filter, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, Suspense } from "react";
import { useFilms } from "@/hooks/useFilms";
import { useSearchParams } from "next/navigation";

const categories = [
    { label: "Semua", value: "all" },
    { label: "Drama", value: "drama" },
    { label: "Romance", value: "romance" },
    { label: "Action", value: "action" },
    { label: "Comedy", value: "comedy" },
    { label: "Documentary", value: "documentary" },
];

function KoleksiContent() {
    const searchParams = useSearchParams();
    const searchFromUrl = searchParams.get("search") || "";

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [limit, setLimit] = useState(12);
    const [searchQuery, setSearchQuery] = useState(searchFromUrl);

    useEffect(() => {
        setSearchQuery(searchFromUrl);
    }, [searchFromUrl]);

    const { data, isLoading, error } = useFilms({
        category: selectedCategory,
        search: searchQuery || undefined,
        limit,
        offset: 0,
    });

    const films = data?.films || [];
    const pagination = data?.pagination;

    const handleLoadMore = () => {
        setLimit((prev) => prev + 12);
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Film className="h-6 w-6 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Koleksi Film
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4">
                            Jelajahi Karya Terbaik
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Kurasi spesial dari film-film independen Indonesia
                            yang telah dipilih dengan cermat oleh tim ahli kami.
                        </p>
                    </motion.div>

                    {/* Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Filter className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                    Filter berdasarkan kategori
                                </span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 max-w-md ml-4">
                                <Input
                                    placeholder="Search films..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="flex-1"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category) => (
                                <Button
                                    key={category.value}
                                    variant={
                                        selectedCategory === category.value
                                            ? "premium"
                                            : "outline"
                                    }
                                    onClick={() => {
                                        setSelectedCategory(category.value);
                                        setLimit(12);
                                    }}
                                    className="transition-all duration-300"
                                >
                                    {category.label}
                                </Button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                                <span>
                                    Failed to load films. Please try again.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Loading Skeleton */}
                    {isLoading && films.length === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <Card key={index} className="overflow-hidden">
                                    <div className="relative aspect-[2/3] bg-muted animate-pulse" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-5 bg-muted animate-pulse rounded" />
                                        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                                        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Films Grid */}
                    {!isLoading && films.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {films.map((film, index) => (
                                <motion.div
                                    key={film.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                                            {film.thumbnail_url ? (
                                                <img
                                                    src={film.thumbnail_url}
                                                    alt={film.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-premium">
                                                    <Film className="h-16 w-16 text-white/50" />
                                                </div>
                                            )}

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <Button
                                                    variant="premium"
                                                    size="icon"
                                                    className="h-14 w-14"
                                                >
                                                    <Play className="h-6 w-6" />
                                                </Button>
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-premium rounded-full text-xs font-semibold text-primary-foreground backdrop-blur-sm capitalize">
                                                {film.category}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                {film.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                {film.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {film.duration_minutes && (
                                                    <>
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {
                                                                film.duration_minutes
                                                            }{" "}
                                                            min
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && films.length === 0 && !error && (
                        <div className="text-center py-20">
                            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                No Films Found
                            </h3>
                            <p className="text-muted-foreground">
                                {searchQuery
                                    ? `No films match "${searchQuery}". Try a different search term.`
                                    : "Try selecting a different category or check back later."}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Load More */}
                    {!isLoading && films.length > 0 && pagination?.hasMore && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex justify-center mt-12"
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleLoadMore}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Muat Lebih Banyak Film"
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {/* Results Count */}
                    {!isLoading && films.length > 0 && pagination && (
                        <div className="text-center mt-6 text-sm text-muted-foreground">
                            Showing {films.length} of {pagination.total} films
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function Koleksi() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background">
                    <main className="pt-24 pb-20">
                        <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    </main>
                    <Footer />
                </div>
            }
        >
            <KoleksiContent />
        </Suspense>
    );
}
