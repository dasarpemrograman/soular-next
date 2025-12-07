"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Video, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEvents } from "@/hooks/useEvents";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export const CommunityEvents = () => {
    const { data, isLoading, error } = useEvents({
        status: "upcoming",
        limit: 3,
    });

    const events = data?.events || [];

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

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            Failed to load events. Please try again later.
                        </p>
                    </div>
                )}

                {/* Events List */}
                {!isLoading && !error && events.length > 0 && (
                    <div className="space-y-6">
                        {events.map((event, index) => {
                            const eventDate = new Date(event.event_date);
                            const formattedDate = format(
                                eventDate,
                                "dd MMM yyyy",
                                { locale: localeId },
                            );
                            const formattedTime = format(eventDate, "HH:mm", {
                                locale: localeId,
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
                                    <Link href={`/events/${event.id}`}>
                                        <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                            <div className="grid md:grid-cols-[300px_1fr] gap-6">
                                                <div className="relative aspect-video md:aspect-auto overflow-hidden">
                                                    {event.image_url ? (
                                                        <img
                                                            src={
                                                                event.image_url
                                                            }
                                                            alt={event.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-premium">
                                                            <Calendar className="h-16 w-16 text-white/50" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-foreground capitalize">
                                                        {event.organizer ||
                                                            "Event"}
                                                    </div>
                                                </div>

                                                <div className="p-6 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                                            {event.title}
                                                        </h3>
                                                        <p className="text-muted-foreground mb-4 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>
                                                                    {
                                                                        formattedDate
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Video className="h-4 w-4" />
                                                                <span>
                                                                    {
                                                                        formattedTime
                                                                    }{" "}
                                                                    WIB
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>
                                                                    {
                                                                        event.location
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="premium"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                window.location.href = `/events/${event.id}`;
                                                            }}
                                                        >
                                                            Lihat Detail
                                                        </Button>
                                                        {event.is_registered && (
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-sm text-primary font-medium">
                                                                ✓ Terdaftar
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && events.length === 0 && (
                    <div className="text-center py-20">
                        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            No Upcoming Events
                        </h3>
                        <p className="text-muted-foreground">
                            Check back later for new community events.
                        </p>
                    </div>
                )}

                {/* View All Button */}
                {!isLoading && !error && events.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex justify-center mt-12"
                    >
                        <Link href="/events">
                            <Button variant="outline" size="lg">
                                Lihat Semua Acara
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
};
