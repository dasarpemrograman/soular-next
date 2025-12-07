"use client";

import { useState, Suspense } from "react";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    MapPin,
    Users,
    Search,
    Loader2,
    CalendarDays,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// ============================================
// TYPES
// ============================================
interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    end_date: string | null;
    location: string;
    is_online: boolean;
    online_link: string | null;
    event_type: string;
    max_participants: number | null;
    image_url: string | null;
    host_id: string | null;
    status: string;
    tags: string[];
    created_at: string;
}

// ============================================
// COMPONENTS
// ============================================

function EventCard({ event }: { event: Event }) {
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate > new Date();

    return (
        <Link href={`/events/${event.id}`}>
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                {/* Event Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {event.image_url ? (
                        <Image
                            src={event.image_url}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <CalendarDays className="h-16 w-16 text-primary/40" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isUpcoming
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-500 text-white"
                            }`}
                        >
                            {isUpcoming ? "Upcoming" : "Past"}
                        </span>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 shadow-lg">
                        <div className="text-center">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">
                                {eventDate.toLocaleDateString("en-US", {
                                    month: "short",
                                })}
                            </div>
                            <div className="text-2xl font-bold text-primary">
                                {eventDate.getDate()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                    <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                    </p>

                    <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {eventDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">
                                {event.location}
                            </span>
                        </div>

                        {event.max_participants && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span>
                                    Max {event.max_participants} participants
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                            By {event.organizer}
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Card>
        </Link>
    );
}

function EventsContent() {
    const searchParams = useSearchParams();
    const initialStatus =
        (searchParams.get("status") as "upcoming" | "past" | "all") ||
        "upcoming";
    const initialSearch = searchParams.get("search") || "";

    const [status, setStatus] = useState<"upcoming" | "past" | "all">(
        initialStatus,
    );
    const [search, setSearch] = useState(initialSearch);
    const [searchInput, setSearchInput] = useState(initialSearch);
    const [offset, setOffset] = useState(0);
    const limit = 12;

    const { data, isLoading, error } = useEvents({
        status,
        search,
        limit,
        offset,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setOffset(0);
    };

    const handleStatusChange = (newStatus: "upcoming" | "past" | "all") => {
        setStatus(newStatus);
        setOffset(0);
    };

    const handleLoadMore = () => {
        setOffset((prev) => prev + limit);
    };

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center">
                            <CalendarDays className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Events</h1>
                            <p className="text-muted-foreground">
                                Discover and join spiritual events and workshops
                            </p>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Status Tabs */}
                        <div className="flex gap-2 bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => handleStatusChange("upcoming")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === "upcoming"
                                        ? "bg-background shadow-sm"
                                        : "hover:bg-background/50"
                                }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => handleStatusChange("past")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === "past"
                                        ? "bg-background shadow-sm"
                                        : "hover:bg-background/50"
                                }`}
                            >
                                Past
                            </button>
                            <button
                                onClick={() => handleStatusChange("all")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === "all"
                                        ? "bg-background shadow-sm"
                                        : "hover:bg-background/50"
                                }`}
                            >
                                All
                            </button>
                        </div>

                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            className="flex gap-2 w-full sm:w-auto"
                        >
                            <Input
                                type="text"
                                placeholder="Search events..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full sm:w-64"
                            />
                            <Button type="submit" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Results Count */}
                {data && !isLoading && (
                    <div className="mb-4 text-sm text-muted-foreground">
                        {data.total > 0 ? (
                            <>
                                Showing {Math.min(offset + 1, data.total)}-
                                {Math.min(offset + limit, data.total)} of{" "}
                                {data.total} events
                            </>
                        ) : (
                            "No events found"
                        )}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <Card className="p-8 border-red-500/20 bg-red-500/5">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                <CalendarDays className="h-8 w-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">
                                Failed to Load Events
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {error.message}
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                Try Again
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Loading State */}
                {isLoading && offset === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="aspect-[16/9] bg-muted animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="h-4 bg-muted animate-pulse rounded" />
                                    <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                                    <div className="space-y-2 pt-2">
                                        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                                        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && data && data.events.length === 0 && (
                    <Card className="p-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <CalendarDays className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                No Events Found
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                {search
                                    ? `No events match your search "${search}". Try different keywords.`
                                    : status === "upcoming"
                                      ? "There are no upcoming events at the moment. Check back soon!"
                                      : "No past events found."}
                            </p>
                            {search && (
                                <Button
                                    onClick={() => {
                                        setSearch("");
                                        setSearchInput("");
                                        setOffset(0);
                                    }}
                                    variant="outline"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    </Card>
                )}

                {/* Events Grid */}
                {!isLoading && data && data.events.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>

                        {/* Load More */}
                        {data.hasMore && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={handleLoadMore}
                                    variant="outline"
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>Load More Events</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Quick Links */}
                <Card className="mt-12 p-6 bg-primary/5 border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-1">
                                Registered for Events?
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                View and manage your event registrations
                            </p>
                        </div>
                        <Link href="/my-events">
                            <Button variant="premium">
                                My Events
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function EventsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">
                            Loading events...
                        </p>
                    </div>
                </div>
            }
        >
            <EventsContent />
        </Suspense>
    );
}
