"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Film, Play, Star, Clock, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = ["Semua", "Dokumenter", "Drama", "Eksperimental", "Musikal", "Thriller"];

const films = [
    {
        id: 1,
        title: "Kisah Kota Yang Terlupakan",
        director: "Rina Kartika",
        year: 2024,
        duration: "95 min",
        category: "Dokumenter",
        rating: 4.8,
        thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop",
        isPremium: true,
    },
    {
        id: 2,
        title: "Melodi Nusantara",
        director: "Ahmad Fadli",
        year: 2024,
        duration: "108 min",
        category: "Musikal",
        rating: 4.6,
        thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=900&fit=crop",
        isPremium: true,
    },
    {
        id: 3,
        title: "Jejak Rimba",
        director: "Maya Sari",
        year: 2023,
        duration: "92 min",
        category: "Drama",
        rating: 4.7,
        thumbnail: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600&h=900&fit=crop",
        isPremium: false,
    },
    {
        id: 4,
        title: "Suara Dari Timur",
        director: "Budi Santoso",
        year: 2024,
        duration: "115 min",
        category: "Drama",
        rating: 4.9,
        thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop",
        isPremium: true,
    },
    {
        id: 5,
        title: "Bayangan Masa Lalu",
        director: "Dian Sastro",
        year: 2023,
        duration: "98 min",
        category: "Thriller",
        rating: 4.5,
        thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop",
        isPremium: false,
    },
    {
        id: 6,
        title: "Cahaya Di Ufuk Timur",
        director: "Joko Anwar",
        year: 2024,
        duration: "103 min",
        category: "Drama",
        rating: 4.8,
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=900&fit=crop",
        isPremium: true,
    },
    {
        id: 7,
        title: "Resonansi",
        director: "Kamila Andini",
        year: 2023,
        duration: "87 min",
        category: "Eksperimental",
        rating: 4.4,
        thumbnail: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600&h=900&fit=crop",
        isPremium: false,
    },
    {
        id: 8,
        title: "Warisan Leluhur",
        director: "Garin Nugroho",
        year: 2024,
        duration: "120 min",
        category: "Dokumenter",
        rating: 4.9,
        thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&h=900&fit=crop",
        isPremium: true,
    },
];

export default function Koleksi() {
    const [selectedCategory, setSelectedCategory] = useState("Semua");

    const filteredFilms = selectedCategory === "Semua"
        ? films
        : films.filter(film => film.category === selectedCategory);

    return (
        <div className="min-h-screen bg-background">
            <Header />
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
                            <span className="text-sm font-medium text-primary">Koleksi Film</span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4">Jelajahi Karya Terbaik</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Kurasi spesial dari film-film independen Indonesia yang telah dipilih
                            dengan cermat oleh tim ahli kami.
                        </p>
                    </motion.div>

                    {/* Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Filter berdasarkan kategori</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "premium" : "outline"}
                                    onClick={() => setSelectedCategory(category)}
                                    className="transition-all duration-300"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Films Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredFilms.map((film, index) => (
                            <motion.div
                                key={film.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={film.thumbnail}
                                            alt={film.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />

                                        {/* Premium Badge */}
                                        {film.isPremium && (
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-premium rounded-full text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                                                4K Premium
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

                                        {/* Rating */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                                            <Star className="h-3 w-3 text-primary fill-primary" />
                                            <span className="text-xs font-semibold">{film.rating}</span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                            {film.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">{film.director}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{film.year}</span>
                                            <span>•</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{film.duration}</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Load More */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex justify-center mt-12"
                    >
                        <Button variant="outline" size="lg">
                            Muat Lebih Banyak Film
                        </Button>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
