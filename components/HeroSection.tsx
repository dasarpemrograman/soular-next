"use client";

import { Play, Star, Loader2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useFilms } from "@/hooks/useFilms";
import Link from "next/link";

export const HeroSection = () => {
    const { data, isLoading } = useFilms({ limit: 1 });
    const featuredFilm = data?.films?.[0];

    if (isLoading) {
        return (
            <section className="relative h-[90vh] flex items-center overflow-hidden bg-muted">
                <div className="container mx-auto px-4 relative z-10 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </section>
        );
    }

    if (!featuredFilm) {
        return (
            <section className="relative h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background to-muted">
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl text-center mx-auto"
                    >
                        <Film className="h-20 w-20 text-primary mx-auto mb-6" />
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Discover
                            <br />
                            <span className="bg-gradient-premium bg-clip-text text-transparent">
                                Amazing Films
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Your curated collection of independent Indonesian
                            cinema
                        </p>
                        <Link href="/koleksi">
                            <Button variant="premium" size="lg">
                                Browse Collection
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative h-[90vh] flex items-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                {featuredFilm.thumbnail ? (
                    <img
                        src={featuredFilm.thumbnail}
                        alt={featuredFilm.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-primary">
                            Featured Film
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        {featuredFilm.title.split(" ").slice(0, 2).join(" ")}
                        <br />
                        <span className="bg-gradient-premium bg-clip-text text-transparent">
                            {featuredFilm.title.split(" ").slice(2).join(" ") ||
                                ""}
                        </span>
                    </h1>

                    <p className="text-lg text-muted-foreground mb-8 max-w-xl line-clamp-3">
                        {featuredFilm.description}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href={`/film/${featuredFilm.id}`}>
                            <Button
                                variant="premium"
                                size="lg"
                                className="gap-2"
                            >
                                <Play className="h-5 w-5" />
                                Tonton Sekarang
                            </Button>
                        </Link>
                        <Link href={`/film/${featuredFilm.id}`}>
                            <Button variant="hero" size="lg">
                                Selengkapnya
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                        {featuredFilm.duration && (
                            <>
                                <span>{featuredFilm.duration} menit</span>
                                <span>•</span>
                            </>
                        )}
                        <span className="capitalize">
                            {featuredFilm.category}
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
