"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Loader2,
    Video,
    Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { eventsAPI } from "@/lib/api/client";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const eventTypes = [
    { id: "all", name: "Semua" },
    { id: "screening", name: "Pemutaran Film" },
    { id: "workshop", name: "Workshop" },
    { id: "discussion", name: "Diskusi" },
    { id: "festival", name: "Festival" },
];

export default function Acara() {
    const [selectedType, setSelectedType] = useState("all");
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ["events", selectedType, page],
        queryFn: () =>
            eventsAPI.getAll({
                page,
                limit: 9,
                type: selectedType !== "all" ? selectedType : undefined,
                upcoming: true,
            }),
    });

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setPage(1);
    };

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
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-6 w-6 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Acara Komunitas
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4">
                            Acara Mendatang
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Bergabunglah dengan komunitas pecinta film Indonesia
                            dalam berbagai acara menarik dan edukatif
                        </p>
                    </motion.div>

                    {/* Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {eventTypes.map((type) => (
                                <Button
                                    key={type.id}
                                    variant={
                                        selectedType === type.id
                                            ? "premium"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handleTypeChange(type.id)}
                                    className="flex-shrink-0"
                                >
                                    {type.name}
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
                            Menampilkan {data.events?.length || 0} dari{" "}
                            {data.pagination?.total || 0} acara mendatang
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
                                    Gagal memuat acara. Silakan coba lagi nanti.
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

                    {/* Events Grid */}
                    {!isLoading && !error && data?.events && (
                        <>
                            {data.events.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.events.map((event, index) => {
                                        const eventDate = new Date(
                                            event.start_date,
                                        );
                                        const formattedDate = format(
                                            eventDate,
                                            "d MMM yyyy",
                                            { locale: idLocale },
                                        );
                                        const formattedTime = format(
                                            eventDate,
                                            "HH:mm",
                                            { locale: idLocale },
                                        );
                                        const endTime = event.end_date
                                            ? format(
                                                  new Date(event.end_date),
                                                  "HH:mm",
                                                  { locale: idLocale },
                                              )
                                            : null;

                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: index * 0.05,
                                                }}
                                            >
                                                <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
                                                    <div className="relative aspect-video overflow-hidden">
                                                        <img
                                                            src={
                                                                event.image_url ||
                                                                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop"
                                                            }
                                                            alt={event.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute top-3 left-3 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-foreground">
                                                            {getEventTypeLabel(
                                                                event.event_type,
                                                            )}
                                                        </div>
                                                        {!event.is_free &&
                                                            event.price && (
                                                                <div className="absolute top-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                                                                    Rp{" "}
                                                                    {event.price.toLocaleString(
                                                                        "id-ID",
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>

                                                    <div className="p-5 flex-1 flex flex-col">
                                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                            {event.title}
                                                        </h3>

                                                        {event.description && (
                                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                                                {
                                                                    event.description
                                                                }
                                                            </p>
                                                        )}

                                                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-primary" />
                                                                <span>
                                                                    {
                                                                        formattedDate
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-primary" />
                                                                <span>
                                                                    {
                                                                        formattedTime
                                                                    }
                                                                    {endTime &&
                                                                        ` - ${endTime}`}{" "}
                                                                    WIB
                                                                </span>
                                                            </div>
                                                            {event.location && (
                                                                <div className="flex items-center gap-2">
                                                                    {getLocationIcon(
                                                                        event.location_type,
                                                                    )}
                                                                    <span className="line-clamp-1">
                                                                        {
                                                                            event.location
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {event.capacity && (
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4 text-primary" />
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

                                                        <Link
                                                            href={`/acara/${event.slug}`}
                                                            className="w-full"
                                                        >
                                                            <Button
                                                                variant="premium"
                                                                className="w-full"
                                                                disabled={
                                                                    !!(
                                                                        event.capacity &&
                                                                        event.attendee_count >=
                                                                            event.capacity
                                                                    )
                                                                }
                                                            >
                                                                {event.capacity &&
                                                                event.attendee_count >=
                                                                    event.capacity
                                                                    ? "Penuh"
                                                                    : "Daftar Sekarang"}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                                    <p className="text-muted-foreground mb-2">
                                        Belum ada acara mendatang
                                    </p>
                                    {selectedType !== "all" && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setSelectedType("all")
                                            }
                                        >
                                            Lihat Semua Acara
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
