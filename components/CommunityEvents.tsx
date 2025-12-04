"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Video, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { eventsAPI } from "@/lib/api/client";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const CommunityEvents = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["events", "upcoming"],
        queryFn: () => eventsAPI.getAll({ limit: 3, upcoming: true }),
    });

    if (error) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center text-muted-foreground">
                        <p>Gagal memuat acara. Silakan coba lagi nanti.</p>
                    </div>
                </div>
            </section>
        );
    }

    const getEventTypeLabel = (type: string | null) => {
        const types: Record<string, string> = {
            screening: "Pemutaran Film",
            workshop: "Workshop",
            discussion: "Diskusi",
            festival: "Festival",
            other: "Acara Lainnya",
        };
        return types[type || "other"] || "Acara";
    };

    const getLocationIcon = (locationType: string | null) => {
        if (locationType === "online") return <Video className="h-4 w-4" />;
        return <MapPin className="h-4 w-4" />;
    };

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
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Acara Mendatang
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold mb-3">
                        Bergabung dengan Komunitas
                    </h2>
                    <p className="text-muted-foreground max-w-2xl">
                        Ikuti sesi interaktif dengan filmmaker dan sesama
                        pecinta film
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : data?.events && data.events.length > 0 ? (
                    <div className="space-y-6">
                        {data.events.map((event, index) => {
                            const eventDate = new Date(event.start_date);
                            const formattedDate = format(
                                eventDate,
                                "d MMM yyyy",
                                { locale: idLocale },
                            );
                            const formattedTime = format(eventDate, "HH:mm", {
                                locale: idLocale,
                            });

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
                                        <div className="grid md:grid-cols-[300px_1fr] gap-6">
                                            <div className="relative aspect-video md:aspect-auto overflow-hidden">
                                                <img
                                                    src={
                                                        event.image_url ||
                                                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop"
                                                    }
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-foreground">
                                                    {getEventTypeLabel(
                                                        event.event_type,
                                                    )}
                                                </div>
                                                {!event.is_free &&
                                                    event.price && (
                                                        <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                                                            Rp{" "}
                                                            {event.price.toLocaleString(
                                                                "id-ID",
                                                            )}
                                                        </div>
                                                    )}
                                            </div>

                                            <div className="p-6 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    {event.description && (
                                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                {formattedDate}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Video className="h-4 w-4" />
                                                            <span>
                                                                {formattedTime}{" "}
                                                                WIB
                                                            </span>
                                                        </div>
                                                        {event.location && (
                                                            <div className="flex items-center gap-2">
                                                                {getLocationIcon(
                                                                    event.location_type,
                                                                )}
                                                                <span>
                                                                    {
                                                                        event.location
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {event.capacity && (
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4" />
                                                                <span>
                                                                    {
                                                                        event.attendee_count
                                                                    }{" "}
                                                                    /{" "}
                                                                    {
                                                                        event.capacity
                                                                    }{" "}
                                                                    peserta
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/acara/${event.slug}`}
                                                    >
                                                        <Button variant="premium">
                                                            Daftar Sekarang
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        href={`/acara/${event.slug}`}
                                                    >
                                                        <Button variant="outline">
                                                            Pelajari Lebih
                                                            Lanjut
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada acara mendatang. Nantikan segera!</p>
                    </div>
                )}

                {data?.events && data.events.length > 0 && (
                    <div className="flex justify-center mt-10">
                        <Link href="/acara">
                            <Button variant="outline" size="lg">
                                Lihat Semua Acara
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};
