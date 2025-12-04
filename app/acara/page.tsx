"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const eventTypes = ["Semua", "Live Q&A", "Watch Party", "Workshop", "Screening"];

const events = [
    {
        id: 1,
        title: "Live Q&A dengan Garin Nugroho",
        description: "Diskusi mendalam tentang proses kreatif dan perjalanan karir beliau dalam industri film Indonesia",
        date: "28 Nov 2025",
        time: "19:00 - 21:00 WIB",
        type: "Live Q&A",
        attendees: 245,
        maxAttendees: 500,
        location: "Online",
        host: "Garin Nugroho",
        thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
        isFeatured: true,
    },
    {
        id: 2,
        title: "Nonton Bareng: Dokumenter Lokal",
        description: "Sesi nonton bersama film dokumenter pilihan kurator dengan diskusi interaktif setelahnya",
        date: "30 Nov 2025",
        time: "20:00 - 22:30 WIB",
        type: "Watch Party",
        attendees: 189,
        maxAttendees: 300,
        location: "Online",
        host: "Tim Soular",
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
        isFeatured: true,
    },
    {
        id: 3,
        title: "Workshop: Sinematografi untuk Pemula",
        description: "Belajar dasar-dasar sinematografi dari praktisi profesional dengan sesi hands-on",
        date: "2 Des 2025",
        time: "15:00 - 18:00 WIB",
        type: "Workshop",
        attendees: 156,
        maxAttendees: 200,
        location: "Online",
        host: "Rina Kartika",
        thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=500&fit=crop",
        isFeatured: false,
    },
    {
        id: 4,
        title: "Premiere Screening: Jejak Rimba",
        description: "Pemutaran perdana film dokumenter 'Jejak Rimba' dengan kehadiran sutradara dan kru",
        date: "5 Des 2025",
        time: "19:30 - 22:00 WIB",
        type: "Screening",
        attendees: 278,
        maxAttendees: 400,
        location: "Kineforum Jakarta",
        host: "Maya Sari",
        thumbnail: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&h=500&fit=crop",
        isFeatured: true,
    },
    {
        id: 5,
        title: "Workshop: Storytelling dalam Dokumenter",
        description: "Teknik bercerita efektif dalam film dokumenter bersama filmmaker berpengalaman",
        date: "8 Des 2025",
        time: "14:00 - 17:00 WIB",
        type: "Workshop",
        attendees: 134,
        maxAttendees: 150,
        location: "Online",
        host: "Ahmad Fadli",
        thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop",
        isFeatured: false,
    },
    {
        id: 6,
        title: "Live Q&A dengan Kamila Andini",
        description: "Ngobrol santai tentang film eksperimental dan realisme magis dalam sinema Indonesia",
        date: "10 Des 2025",
        time: "20:00 - 21:30 WIB",
        type: "Live Q&A",
        attendees: 312,
        maxAttendees: 500,
        location: "Online",
        host: "Kamila Andini",
        thumbnail: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=500&fit=crop",
        isFeatured: false,
    },
];

export default function Acara() {
    const [selectedType, setSelectedType] = useState("Semua");

    const filteredEvents = selectedType === "Semua"
        ? events
        : events.filter(event => event.type === selectedType);

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
                            <Calendar className="h-6 w-6 text-primary" />
                            <span className="text-sm font-medium text-primary">Acara Mendatang</span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4">Bergabung dengan Komunitas</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Ikuti berbagai acara interaktif, workshop, dan sesi eksklusif
                            bersama filmmaker dan sesama pecinta film.
                        </p>
                    </motion.div>

                    {/* Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-10"
                    >
                        <div className="flex flex-wrap gap-3">
                            {eventTypes.map((type) => (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? "premium" : "outline"}
                                    onClick={() => setSelectedType(type)}
                                    className="transition-all duration-300"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Featured Events */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Acara Unggulan</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredEvents.filter(event => event.isFeatured).map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={event.thumbnail}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary/90 backdrop-blur-sm rounded-full text-sm font-semibold text-primary-foreground flex items-center gap-2">
                                                <Star className="h-4 w-4 fill-primary-foreground" />
                                                {event.type}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                {event.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {event.description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <span>{event.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users className="h-4 w-4 text-primary" />
                                                    <span>{event.attendees}/{event.maxAttendees}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button variant="premium" className="flex-1">
                                                    Daftar Sekarang
                                                </Button>
                                                <Button variant="outline">
                                                    Detail
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* All Events */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Semua Acara</h2>
                        <div className="space-y-4">
                            {filteredEvents.filter(event => !event.isFeatured).map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                >
                                    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                        <div className="grid md:grid-cols-[250px_1fr] gap-6">
                                            <div className="relative aspect-video md:aspect-auto overflow-hidden">
                                                <img
                                                    src={event.thumbnail}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 left-3 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium">
                                                    {event.type}
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{event.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{event.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{event.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4" />
                                                            <span>{event.attendees} peserta</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 mt-4">
                                                    <Button variant="premium" size="sm">
                                                        Daftar
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        Pelajari Lebih Lanjut
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
