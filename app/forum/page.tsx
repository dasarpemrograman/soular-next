"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
    MessageSquare,
    Heart,
    User,
    Calendar,
    Loader2,
    Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { forumAPI } from "@/lib/api/client";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const categories = [
    { id: "all", name: "Semua" },
    { id: "general", name: "Diskusi Umum" },
    { id: "film-discussion", name: "Analisis Film" },
    { id: "technical", name: "Teknis" },
    { id: "events", name: "Acara" },
    { id: "feedback", name: "Feedback" },
];

export default function Forum() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ["forum", selectedCategory, page],
        queryFn: () =>
            forumAPI.getThreads({
                page,
                limit: 10,
                category:
                    selectedCategory !== "all" ? selectedCategory : undefined,
            }),
    });

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setPage(1);
    };

    const getCategoryLabel = (category: string | null) => {
        const cat = categories.find((c) => c.id === category);
        return cat?.name || "Umum";
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <h1 className="text-5xl font-bold mb-4">
                            Forum & Diskusi
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Tempat diskusi yang serius dan terstruktur tentang
                            film, jauh lebih dalam dari kolom komentar biasa.
                        </p>
                    </motion.div>

                    {/* Category Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-8"
                    >
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

                    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                        {/* Threads List */}
                        <div className="space-y-6">
                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="text-center py-20">
                                    <p className="text-muted-foreground mb-4">
                                        Gagal memuat diskusi. Silakan coba lagi
                                        nanti.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.reload()}
                                    >
                                        Muat Ulang
                                    </Button>
                                </div>
                            )}

                            {/* Threads */}
                            {!isLoading && !error && data?.threads && (
                                <>
                                    {data.threads.length > 0 ? (
                                        <>
                                            {data.threads.map(
                                                (thread, index) => {
                                                    const timeAgo =
                                                        formatDistanceToNow(
                                                            new Date(
                                                                thread.last_activity_at ||
                                                                    thread.created_at,
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                                locale: idLocale,
                                                            },
                                                        );

                                                    return (
                                                        <motion.div
                                                            key={thread.id}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.5,
                                                                delay:
                                                                    index *
                                                                    0.05,
                                                            }}
                                                        >
                                                            <Link
                                                                href={`/forum/${thread.slug}`}
                                                            >
                                                                <Card className="group p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                                                    <div className="flex items-start gap-4">
                                                                        <div className="p-3 rounded-full bg-muted flex-shrink-0">
                                                                            <User className="h-6 w-6 text-primary" />
                                                                        </div>

                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                                                    {getCategoryLabel(
                                                                                        thread.category,
                                                                                    )}
                                                                                </span>
                                                                                {thread.is_pinned && (
                                                                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                                                                                        📌
                                                                                        Disematkan
                                                                                    </span>
                                                                                )}
                                                                                {thread.is_locked && (
                                                                                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                                                                                        🔒
                                                                                        Terkunci
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                                                {
                                                                                    thread.title
                                                                                }
                                                                            </h3>

                                                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                                                {
                                                                                    thread.content
                                                                                }
                                                                            </p>

                                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                                                                <span className="flex items-center gap-1">
                                                                                    <User className="h-4 w-4" />
                                                                                    {thread
                                                                                        .author
                                                                                        ?.full_name ||
                                                                                        thread
                                                                                            .author
                                                                                            ?.username ||
                                                                                        "Anonim"}
                                                                                </span>
                                                                                <span className="flex items-center gap-1">
                                                                                    <Calendar className="h-4 w-4" />
                                                                                    {
                                                                                        timeAgo
                                                                                    }
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex items-center gap-6 mt-4 text-sm">
                                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                                    <MessageSquare className="h-4 w-4" />
                                                                                    <span>
                                                                                        {
                                                                                            thread.reply_count
                                                                                        }{" "}
                                                                                        balasan
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                                    <Heart className="h-4 w-4" />
                                                                                    <span>
                                                                                        {
                                                                                            thread.view_count
                                                                                        }{" "}
                                                                                        views
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            </Link>
                                                        </motion.div>
                                                    );
                                                },
                                            )}

                                            {/* Pagination */}
                                            {data.pagination &&
                                                data.pagination.totalPages >
                                                    1 && (
                                                    <div className="flex justify-center items-center gap-2 mt-8">
                                                        <Button
                                                            variant="outline"
                                                            disabled={
                                                                page === 1
                                                            }
                                                            onClick={() =>
                                                                setPage((p) =>
                                                                    Math.max(
                                                                        1,
                                                                        p - 1,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            Sebelumnya
                                                        </Button>
                                                        <span className="text-sm text-muted-foreground">
                                                            Halaman {page} dari{" "}
                                                            {
                                                                data.pagination
                                                                    .totalPages
                                                            }
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            disabled={
                                                                page ===
                                                                data.pagination
                                                                    .totalPages
                                                            }
                                                            onClick={() =>
                                                                setPage((p) =>
                                                                    Math.min(
                                                                        data
                                                                            .pagination
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
                                    ) : (
                                        <div className="text-center py-20">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                                            <p className="text-muted-foreground mb-2">
                                                Belum ada diskusi
                                            </p>
                                            {selectedCategory !== "all" && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setSelectedCategory(
                                                            "all",
                                                        )
                                                    }
                                                >
                                                    Lihat Semua Kategori
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="p-6 bg-gradient-premium">
                                <h3 className="font-bold mb-2 text-primary-foreground">
                                    Mulai Diskusi Baru
                                </h3>
                                <p className="text-sm text-primary-foreground/80 mb-4">
                                    Punya topik menarik untuk dibahas? Mulai
                                    thread diskusi baru!
                                </p>
                                <Link href="/forum/buat">
                                    <Button variant="hero" className="w-full">
                                        Buat Thread
                                    </Button>
                                </Link>
                            </Card>

                            <Card className="p-6 bg-card border-border">
                                <h3 className="font-bold mb-4">
                                    Kategori Populer
                                </h3>
                                <div className="space-y-2">
                                    {categories
                                        .filter((c) => c.id !== "all")
                                        .map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() =>
                                                    handleCategoryChange(
                                                        category.id,
                                                    )
                                                }
                                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm ${
                                                    selectedCategory ===
                                                    category.id
                                                        ? "bg-muted font-medium"
                                                        : ""
                                                }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                </div>
                            </Card>

                            {data?.pagination && (
                                <Card className="p-6 bg-card border-border">
                                    <h3 className="font-bold mb-2">
                                        Statistik Forum
                                    </h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Total Diskusi:</span>
                                            <span className="font-medium text-foreground">
                                                {data.pagination.total}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
