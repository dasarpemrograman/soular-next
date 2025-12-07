"use client";

import { useParams, useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Play, Clock, Loader2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/hooks/useCollections";
import Link from "next/link";

export default function CollectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { data: collection, isLoading, error } = useCollection(slug);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !collection) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                            <Film className="h-16 w-16 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-bold mb-2">
                                Collection Not Found
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                The collection you&apos;re looking for
                                doesn&apos;t exist or has been removed.
                            </p>
                            <Button onClick={() => router.push("/")}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const films = collection.films || [];

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8"
                    >
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </motion.div>

                    {/* Collection Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <div
                            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${collection.color || "from-violet-500/20 to-purple-500/20"} p-12 backdrop-blur-sm border border-border`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Film className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-medium text-primary">
                                        Collection
                                    </span>
                                </div>
                                <h1 className="text-5xl font-bold mb-4">
                                    {collection.title}
                                </h1>
                                <p className="text-xl text-muted-foreground max-w-3xl mb-6">
                                    {collection.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Film className="h-4 w-4" />
                                        <span>
                                            {collection.film_count}{" "}
                                            {collection.film_count === 1
                                                ? "film"
                                                : "films"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-premium" />
                        </div>
                    </motion.div>

                    {/* Films Section */}
                    {films.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center py-20"
                        >
                            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                No Films in This Collection
                            </h3>
                            <p className="text-muted-foreground">
                                This collection doesn&apos;t have any films yet.
                                Check back later!
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mb-8"
                            >
                                <h2 className="text-3xl font-bold">
                                    Films in This Collection
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {films.map((film, index) => (
                                    <motion.div
                                        key={film.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.3 + index * 0.05,
                                        }}
                                    >
                                        <Link href={`/film/${film.slug}`}>
                                            <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
                                                <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                                                    {film.thumbnail ? (
                                                        <img
                                                            src={film.thumbnail}
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

                                                    {/* Premium Badge */}
                                                    {film.is_premium && (
                                                        <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-premium rounded-full text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                                                            Premium
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4">
                                                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                        {film.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {film.director} •{" "}
                                                        {film.year}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        {film.duration && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    {
                                                                        film.duration
                                                                    }{" "}
                                                                    min
                                                                </span>
                                                            </div>
                                                        )}
                                                        {film.rating > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                                <span>
                                                                    {film.rating.toFixed(
                                                                        1,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
