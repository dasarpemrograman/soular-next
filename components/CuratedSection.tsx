"use client";

import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { filmsAPI } from "@/lib/api/client";
import Link from "next/link";

export const CuratedSection = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["films", "curated"],
        queryFn: () => filmsAPI.getAll({ limit: 4, featured: false }),
    });

    if (error) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center text-muted-foreground">
                        <p>Gagal memuat film. Silakan coba lagi nanti.</p>
                    </div>
                </div>
            </section>
        );
    }

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

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {data?.films?.map((film, index) => (
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
                                    <Link href={`/film/${film.slug}`}>
                                        <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                            <div className="relative aspect-[2/3] overflow-hidden">
                                                <img
                                                    src={
                                                        film.poster_url ||
                                                        film.thumbnail_url ||
                                                        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop"
                                                    }
                                                    alt={film.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
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
                                                <p className="text-xs text-primary mb-1">
                                                    Dipilih oleh{" "}
                                                    {film.curator?.full_name ||
                                                        film.curator
                                                            ?.username ||
                                                        "Tim Soular"}
                                                </p>
                                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                    {film.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {film.genre &&
                                                        film.genre.length >
                                                            0 && (
                                                            <>
                                                                <span>
                                                                    {
                                                                        film
                                                                            .genre[0]
                                                                    }
                                                                </span>
                                                                <span>•</span>
                                                            </>
                                                        )}
                                                    <span>
                                                        {film.duration
                                                            ? `${film.duration} min`
                                                            : film.year}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {data?.films && data.films.length > 0 && (
                            <div className="flex justify-center mt-10">
                                <Link href="/koleksi">
                                    <Button variant="outline" size="lg">
                                        Lihat Semua Pilihan
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};
