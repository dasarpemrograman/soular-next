"use client";

import { motion } from "framer-motion";
import { Sparkles, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFilms } from "@/hooks/useFilms";
import Link from "next/link";

export const CuratedSection = () => {
    const { data, isLoading } = useFilms({ limit: 4 });
    const films = data?.films || [];

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Kurasi Spesial
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold mb-3">
                        Pilihan Tim Soular
                    </h2>
                    <p className="text-muted-foreground max-w-2xl">
                        Film-film terbaik yang dipilih khusus oleh kurator ahli
                        kami, menghadirkan cerita yang menginspirasi dan
                        memukau.
                    </p>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index} className="overflow-hidden">
                                <div className="relative aspect-[2/3] bg-muted animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                                    <div className="h-5 bg-muted animate-pulse rounded" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
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
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                            >
                                <Link href={`/film/${film.id}`}>
                                    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
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
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Button
                                                variant="premium"
                                                size="icon"
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            >
                                                <Sparkles className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-xs text-primary mb-1 capitalize">
                                                {film.category}
                                            </p>
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                {film.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {film.duration && (
                                                    <>
                                                        <span>
                                                            {film.duration} min
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && films.length === 0 && (
                    <div className="text-center py-12">
                        <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            No curated films available at the moment.
                        </p>
                    </div>
                )}

                <div className="flex justify-center mt-10">
                    <Link href="/koleksi">
                        <Button variant="outline" size="lg">
                            Lihat Semua Pilihan
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
