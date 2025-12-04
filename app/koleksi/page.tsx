"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, Filter, Loader2, Film as FilmIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { filmsAPI } from "@/lib/api/client";
import { useState } from "react";
import Link from "next/link";

const categories = [
    { id: "all", name: "Semua" },
    { id: "Documentary", name: "Dokumenter" },
    { id: "Drama", name: "Drama" },
    { id: "Cultural", name: "Budaya" },
    { id: "Historical", name: "Sejarah" },
    { id: "Music", name: "Musik" },
    { id: "Art", name: "Seni" },
    { id: "Food", name: "Kuliner" },
];

export default function Koleksi() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ["films", selectedCategory, searchQuery, page],
        queryFn: () =>
            filmsAPI.getAll({
                page,
                limit: 12,
                genre:
                    selectedCategory !== "all" ? selectedCategory : undefined,
                search: searchQuery || undefined,
            }),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on search
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setPage(1); // Reset to first page on category change
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <h1 className="text-5xl font-bold mb-4">
                            Koleksi Film
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Jelajahi koleksi lengkap film-film independen
                            Indonesia pilihan kurator kami
                        </p>
                    </motion.div>

                    {/* Search and Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <form
                                onSubmit={handleSearch}
                                className="flex-1 flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari film berdasarkan judul, sutradara, atau deskripsi..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <Button type="submit" variant="premium">
                                    Cari
                                </Button>
                            </form>
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={
                                        selectedCategory === category.id
                                            ? "premium"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        handleCategoryChange(category.id)
                                    }
                                    className="flex-shrink-0"
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Results Info */}
                    {data && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 text-sm text-muted-foreground"
                        >
                            Menampilkan {data.films?.length || 0} dari{" "}
                            {data.pagination?.total || 0} film
                            {searchQuery && ` untuk "${searchQuery}"`}
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-20">
                            <div className="text-muted-foreground">
                                <p className="mb-4">
                                    Gagal memuat film. Silakan coba lagi nanti.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    Muat Ulang
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Films Grid */}
                    {!isLoading && !error && data?.films && (
                        <>
                            {data.films.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {data.films.map((film, index) => (
                                        <motion.div
                                            key={film.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.05,
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
                                                        {film.is_premium && (
                                                            <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-premium rounded-full text-xs font-medium text-primary-foreground">
                                                                Premium
                                                            </div>
                                                        )}
                                                        {film.rating > 0 && (
                                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                                                                ⭐{" "}
                                                                {film.rating.toFixed(
                                                                    1,
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                            {film.title}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            {film.director ||
                                                                "Sutradara"}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                            <span>
                                                                {film.year ||
                                                                    "N/A"}
                                                            </span>
                                                            {film.duration && (
                                                                <span>
                                                                    {
                                                                        film.duration
                                                                    }{" "}
                                                                    min
                                                                </span>
                                                            )}
                                                        </div>
                                                        {film.genre &&
                                                            film.genre.length >
                                                                0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {film.genre
                                                                        .slice(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                genre,
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        genre
                                                                                    }
                                                                                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                                                                                >
                                                                                    {
                                                                                        genre
                                                                                    }
                                                                                </span>
                                                                            ),
                                                                        )}
                                                                </div>
                                                            )}
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <FilmIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                                    <p className="text-muted-foreground mb-2">
                                        Tidak ada film yang ditemukan
                                    </p>
                                    {(searchQuery ||
                                        selectedCategory !== "all") && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedCategory("all");
                                            }}
                                        >
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            {data.pagination &&
                                data.pagination.totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-12">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                        >
                                            Sebelumnya
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        data.pagination
                                                            .totalPages,
                                                    ),
                                                },
                                                (_, i) => {
                                                    const pageNum = i + 1;
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={
                                                                page === pageNum
                                                                    ? "premium"
                                                                    : "outline"
                                                            }
                                                            size="sm"
                                                            onClick={() =>
                                                                setPage(pageNum)
                                                            }
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                },
                                            )}
                                            {data.pagination.totalPages > 5 && (
                                                <>
                                                    <span className="text-muted-foreground">
                                                        ...
                                                    </span>
                                                    <Button
                                                        variant={
                                                            page ===
                                                            data.pagination
                                                                .totalPages
                                                                ? "premium"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            setPage(
                                                                data.pagination
                                                                    .totalPages,
                                                            )
                                                        }
                                                    >
                                                        {
                                                            data.pagination
                                                                .totalPages
                                                        }
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            disabled={
                                                page ===
                                                data.pagination.totalPages
                                            }
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(
                                                        data.pagination
                                                            .totalPages,
                                                        p + 1,
                                                    ),
                                                )
                                            }
                                        >
                                            Selanjutnya
                                        </Button>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
