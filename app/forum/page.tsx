"use client";

import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
    MessageSquare,
    Heart,
    User,
    Calendar,
    Plus,
    Search,
    Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDiscussions } from "@/hooks/useForum";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const CATEGORIES = [
    "Analisis Film",
    "Behind The Scenes",
    "Diskusi Umum",
    "Rekomendasi",
    "Komunitas",
    "Teknis",
];

export default function Forum() {
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<"latest" | "popular" | "most_replies">(
        "latest",
    );

    const { data, isLoading, error } = useDiscussions({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        sort,
        limit: 20,
    });

    const discussions = data?.discussions || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="min-h-screen bg-background">
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

                    {/* Search and Filters */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari diskusi..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </form>
                        <div className="flex gap-2">
                            <Button
                                variant={
                                    sort === "latest" ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setSort("latest")}
                            >
                                Terbaru
                            </Button>
                            <Button
                                variant={
                                    sort === "popular" ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setSort("popular")}
                            >
                                Populer
                            </Button>
                            <Button
                                variant={
                                    sort === "most_replies"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setSort("most_replies")}
                            >
                                Terbanyak Balasan
                            </Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                        <div className="space-y-6">
                            {isLoading && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        Memuat diskusi...
                                    </p>
                                </div>
                            )}

                            {error && (
                                <Card className="p-6 bg-destructive/10 border-destructive/20">
                                    <p className="text-destructive">
                                        Gagal memuat diskusi: {error.message}
                                    </p>
                                </Card>
                            )}

                            {!isLoading &&
                                !error &&
                                discussions.length === 0 && (
                                    <Card className="p-12 text-center">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            Belum ada diskusi
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            Jadilah yang pertama memulai
                                            diskusi!
                                        </p>
                                        <Link href="/forum/new">
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Buat Diskusi
                                            </Button>
                                        </Link>
                                    </Card>
                                )}

                            {discussions.map((discussion, index) => (
                                <motion.div
                                    key={discussion.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <Link href={`/forum/${discussion.id}`}>
                                        <Card className="group p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-full bg-muted">
                                                    {discussion.profiles
                                                        .avatar ? (
                                                        <img
                                                            src={
                                                                discussion
                                                                    .profiles
                                                                    .avatar
                                                            }
                                                            alt={
                                                                discussion
                                                                    .profiles
                                                                    .name
                                                            }
                                                            className="h-6 w-6 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="h-6 w-6 text-primary" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                            {
                                                                discussion.category
                                                            }
                                                        </span>
                                                        {discussion.is_pinned && (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                                                                Dipasang
                                                            </span>
                                                        )}
                                                        {discussion.is_locked && (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                                                                Terkunci
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                                        {discussion.title}
                                                    </h3>

                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                        {discussion.content}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            {
                                                                discussion
                                                                    .profiles
                                                                    .name
                                                            }
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    discussion.created_at,
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                    locale: idLocale,
                                                                },
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-4 text-sm">
                                                        <span className="flex items-center gap-2 text-muted-foreground">
                                                            <MessageSquare className="h-4 w-4" />
                                                            <span>
                                                                {
                                                                    discussion.reply_count
                                                                }{" "}
                                                                balasan
                                                            </span>
                                                        </span>
                                                        <span className="flex items-center gap-2 text-muted-foreground">
                                                            <Heart className="h-4 w-4" />
                                                            <span>
                                                                {
                                                                    discussion.view_count
                                                                }{" "}
                                                                dilihat
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}

                            {data && data.hasMore && (
                                <div className="text-center pt-6">
                                    <Button variant="outline">
                                        Muat Lebih Banyak
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <Card className="p-6 bg-gradient-premium">
                                <h3 className="font-bold mb-2 text-primary-foreground">
                                    Mulai Diskusi Baru
                                </h3>
                                <p className="text-sm text-primary-foreground/80 mb-4">
                                    Punya topik menarik untuk dibahas? Mulai
                                    thread diskusi baru!
                                </p>
                                <Link href="/forum/new">
                                    <Button variant="hero" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Thread
                                    </Button>
                                </Link>
                            </Card>

                            <Card className="p-6 bg-card border-border">
                                <h3 className="font-bold mb-4">
                                    Kategori Populer
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory("")}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                            selectedCategory === ""
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        Semua Kategori
                                    </button>
                                    {CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() =>
                                                setSelectedCategory(category)
                                            }
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                                selectedCategory === category
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted"
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
