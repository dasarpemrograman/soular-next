"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { MessageSquare, Heart, User, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const discussions = [
    {
        id: 1,
        title: "Analisis Simbolisme dalam 'Kisah Kota Yang Terlupakan'",
        author: "Rina Kartika",
        date: "2 jam lalu",
        replies: 23,
        likes: 45,
        category: "Analisis Film",
    },
    {
        id: 2,
        title: "Tips Mendukung Filmmaker Lokal Favorit Anda",
        author: "Ahmad Fadli",
        date: "5 jam lalu",
        replies: 18,
        likes: 67,
        category: "Komunitas",
    },
    {
        id: 3,
        title: "Diskusi: Perkembangan Sinema Dokumenter Indonesia",
        author: "Maya Sari",
        date: "1 hari lalu",
        replies: 56,
        likes: 123,
        category: "Diskusi Umum",
    },
    {
        id: 4,
        title: "Behind The Scenes: Proses Pembuatan Film Indie",
        author: "Budi Santoso",
        date: "2 hari lalu",
        replies: 34,
        likes: 89,
        category: "Behind The Scenes",
    },
];

export default function Forum() {
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

                    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                        <div className="space-y-6">
                            {discussions.map((discussion, index) => (
                                <motion.div
                                    key={discussion.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Card className="group p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-full bg-muted">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                        {discussion.category}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                                    {discussion.title}
                                                </h3>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {discussion.author}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {discussion.date}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-6 mt-4 text-sm">
                                                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span>
                                                            {discussion.replies}{" "}
                                                            balasan
                                                        </span>
                                                    </button>
                                                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                                        <Heart className="h-4 w-4" />
                                                        <span>
                                                            {discussion.likes}{" "}
                                                            suka
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
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
                                <Button variant="hero" className="w-full">
                                    Buat Thread
                                </Button>
                            </Card>

                            <Card className="p-6 bg-card border-border">
                                <h3 className="font-bold mb-4">
                                    Kategori Populer
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        "Analisis Film",
                                        "Behind The Scenes",
                                        "Diskusi Umum",
                                        "Rekomendasi",
                                        "Komunitas",
                                    ].map((category) => (
                                        <button
                                            key={category}
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
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
