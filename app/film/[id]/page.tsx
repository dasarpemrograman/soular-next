"use client";

import { use } from "react";
import { useFilm, useFilms } from "@/hooks/useFilms";
import { useFavorite, useFavoriteStatus } from "@/hooks/useFavorite";
import { Footer } from "@/components/Footer";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    Loader2,
    Film as FilmIcon,
    Clock,
    Calendar,
    ArrowLeft,
    Share2,
    Heart,
    Play,
} from "lucide-react";
import Link from "next/link";

export default function FilmDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data, isLoading, error } = useFilm(id);
    const film = data?.film;

    // Favorite functionality
    const { data: favoriteData } = useFavoriteStatus(id);
    const isFavorited = favoriteData?.favorited || false;
    const { toggleFavorite, isLoading: favoriteLoading } = useFavorite(id);

    // Fetch related films (same category, exclude current)
    const { data: relatedData, isLoading: relatedLoading } = useFilms({
        category: film?.category,
        limit: 4,
    });
    const relatedFilms = relatedData?.films?.filter((f) => f.id !== id) || [];

    const handleFavoriteClick = () => {
        toggleFavorite(isFavorited);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading film...</p>
                </div>
            </div>
        );
    }

    if (error || !film) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <FilmIcon className="h-20 w-20 text-muted-foreground mx-auto" />
                    <h1 className="text-2xl font-bold">Film Not Found</h1>
                    <p className="text-muted-foreground">
                        The film you&apos;re looking for doesn&apos;t exist or
                        has been removed.
                    </p>
                    <Link href="/koleksi">
                        <Button variant="premium">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Collection
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-20 pb-20">
                {/* Back Button */}
                <div className="container mx-auto px-4 mb-6">
                    <Link href="/koleksi">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Collection
                        </Button>
                    </Link>
                </div>

                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Video Player */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <YouTubePlayer
                                    url={film.youtube_url}
                                    title={film.title}
                                    controls={true}
                                    className="shadow-2xl"
                                />
                            </motion.div>

                            {/* Film Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="space-y-6"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary capitalize font-medium">
                                                    {film.category}
                                                </span>
                                            </div>
                                            <h1 className="text-4xl font-bold mb-2">
                                                {film.title}
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                                        {film.duration && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {film.duration} minutes
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {formatDate(film.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant={
                                                isFavorited
                                                    ? "premium"
                                                    : "outline"
                                            }
                                            size="lg"
                                            onClick={handleFavoriteClick}
                                            disabled={favoriteLoading}
                                        >
                                            {favoriteLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Heart
                                                    className={`mr-2 h-4 w-4 ${
                                                        isFavorited
                                                            ? "fill-current"
                                                            : ""
                                                    }`}
                                                />
                                            )}
                                            {isFavorited
                                                ? "Favorited"
                                                : "Add to Favorites"}
                                        </Button>
                                        <Button variant="outline" size="lg">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share
                                        </Button>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h2 className="text-2xl font-bold mb-4">
                                        Synopsis
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {film.description}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="space-y-6 lg:sticky lg:top-24"
                            >
                                {/* Film Details Card */}
                                <Card className="p-6">
                                    <h3 className="text-xl font-bold mb-4">
                                        Film Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Category
                                            </p>
                                            <p className="font-medium capitalize">
                                                {film.category}
                                            </p>
                                        </div>
                                        {film.duration && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Duration
                                                </p>
                                                <p className="font-medium">
                                                    {film.duration} minutes
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Added
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(film.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Film ID
                                            </p>
                                            <p className="font-mono text-xs break-all">
                                                {film.id}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Thumbnail Card */}
                                {film.thumbnail && (
                                    <Card className="overflow-hidden">
                                        <img
                                            src={film.thumbnail}
                                            alt={film.title}
                                            className="w-full aspect-[2/3] object-cover"
                                        />
                                    </Card>
                                )}

                                {/* Call to Action */}
                                <Card className="p-6 bg-gradient-premium text-white">
                                    <h3 className="text-xl font-bold mb-2">
                                        Enjoy More Films
                                    </h3>
                                    <p className="text-sm mb-4 text-white/80">
                                        Explore our curated collection of
                                        independent Indonesian cinema
                                    </p>
                                    <Link href="/koleksi">
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                        >
                                            Browse Collection
                                        </Button>
                                    </Link>
                                </Card>
                            </motion.div>
                        </div>
                    </div>

                    {/* Related Films Section */}
                    {!relatedLoading && relatedFilms.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-16"
                        >
                            <h2 className="text-3xl font-bold mb-8">
                                More{" "}
                                {film.category.charAt(0).toUpperCase() +
                                    film.category.slice(1)}{" "}
                                Films
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedFilms
                                    .slice(0, 4)
                                    .map((relatedFilm, index) => (
                                        <motion.div
                                            key={relatedFilm.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.1,
                                            }}
                                        >
                                            <Link
                                                href={`/film/${relatedFilm.id}`}
                                            >
                                                <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                                    <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                                                        {relatedFilm.thumbnail ? (
                                                            <img
                                                                src={
                                                                    relatedFilm.thumbnail
                                                                }
                                                                alt={
                                                                    relatedFilm.title
                                                                }
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-premium">
                                                                <FilmIcon className="h-16 w-16 text-white/50" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                            <Button
                                                                variant="premium"
                                                                size="icon"
                                                                className="h-14 w-14"
                                                            >
                                                                <Play className="h-6 w-6" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                            {relatedFilm.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {
                                                                relatedFilm.description
                                                            }
                                                        </p>
                                                        {relatedFilm.duration && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    {
                                                                        relatedFilm.duration
                                                                    }{" "}
                                                                    min
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
