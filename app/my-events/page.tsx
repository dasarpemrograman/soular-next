"use client";

import { useState, useEffect } from "react";
import {
    useMyEvents,
    useUnregisterEvent,
    RegisteredEvent,
} from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Calendar,
    MapPin,
    Users,
    Loader2,
    ArrowLeft,
    CalendarDays,
    Trash2,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ============================================
// COMPONENTS
// ============================================

function EventCard({ event }: { event: RegisteredEvent }) {
    const unregister = useUnregisterEvent();
    const [showConfirm, setShowConfirm] = useState(false);

    const eventDate = new Date(event.date);
    const isUpcoming = eventDate > new Date();

    const handleUnregister = async () => {
        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }

        try {
            await unregister.mutateAsync(event.id);
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to unregister:", error);
            alert("Failed to unregister from event. Please try again.");
        }
    };

    return (
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
            <div className="flex flex-col sm:flex-row gap-4 p-5">
                {/* Event Image */}
                <Link href={`/events/${event.id}`} className="flex-shrink-0">
                    <div className="relative w-full sm:w-48 aspect-video sm:aspect-square overflow-hidden rounded-lg bg-muted">
                        {event.image_url ? (
                            <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <CalendarDays className="h-12 w-12 text-primary/40" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isUpcoming
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-500 text-white"
                                }`}
                            >
                                {isUpcoming ? "Upcoming" : "Past"}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Event Details */}
                <div className="flex-1 space-y-3">
                    <Link href={`/events/${event.id}`}>
                        <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                            {event.title}
                        </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {eventDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                                {" at "}
                                {eventDate.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">
                                {event.location}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <Link href={`/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>

                        {isUpcoming && !showConfirm && (
                            <Button
                                onClick={handleUnregister}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                disabled={unregister.isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Unregister
                            </Button>
                        )}

                        {showConfirm && (
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleUnregister}
                                    variant="destructive"
                                    size="sm"
                                    disabled={unregister.isPending}
                                >
                                    {unregister.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Unregistering...
                                        </>
                                    ) : (
                                        "Confirm"
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setShowConfirm(false)}
                                    variant="outline"
                                    size="sm"
                                    disabled={unregister.isPending}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Registration Info */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                        Registered on{" "}
                        {new Date(event.registered_at).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            },
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function EmptyState({ type }: { type: "upcoming" | "past" }) {
    return (
        <Card className="p-12">
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <CalendarDays className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                    No {type === "upcoming" ? "Upcoming" : "Past"} Events
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    {type === "upcoming"
                        ? "You haven't registered for any upcoming events yet. Explore our events and join one that interests you!"
                        : "You don't have any past event registrations."}
                </p>
                <Link href="/events">
                    <Button variant="premium">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Browse Events
                    </Button>
                </Link>
            </div>
        </Card>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-muted animate-pulse rounded-lg" />
                        <div className="flex-1 space-y-3">
                            <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                            <div className="space-y-2 pt-2">
                                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function MyEventsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

    const { data: events, isLoading, error } = useMyEvents();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/my-events");
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Filter events by upcoming/past
    const now = new Date();
    const upcomingEvents =
        events?.filter((event) => new Date(event.date) > now) || [];
    const pastEvents =
        events?.filter((event) => new Date(event.date) <= now) || [];

    const displayEvents =
        activeTab === "upcoming" ? upcomingEvents : pastEvents;

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/events">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Events
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center">
                            <CalendarDays className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">My Events</h1>
                            <p className="text-muted-foreground">
                                {isLoading
                                    ? "Loading your registrations..."
                                    : `${events?.length || 0} event${(events?.length || 0) !== 1 ? "s" : ""} registered`}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-muted p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab("upcoming")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === "upcoming"
                                    ? "bg-background shadow-sm"
                                    : "hover:bg-background/50"
                            }`}
                        >
                            Upcoming ({upcomingEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("past")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === "past"
                                    ? "bg-background shadow-sm"
                                    : "hover:bg-background/50"
                            }`}
                        >
                            Past ({pastEvents.length})
                        </button>
                    </div>
                </div>

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
                {isLoading && !error && <LoadingSkeleton />}

                {/* Empty State */}
                {!isLoading && !error && displayEvents.length === 0 && (
                    <EmptyState type={activeTab} />
                )}

                {/* Events List */}
                {!isLoading && !error && displayEvents.length > 0 && (
                    <div className="space-y-4">
                        {displayEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

                {/* Stats Card */}
                {!isLoading && events && events.length > 0 && (
                    <Card className="mt-8 p-6">
                        <h3 className="font-semibold mb-4">Your Event Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {events.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Total Registered
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {upcomingEvents.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Upcoming
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {pastEvents.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Attended
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">
                                    {upcomingEvents.length > 0
                                        ? new Date(
                                              Math.min(
                                                  ...upcomingEvents.map((e) =>
                                                      new Date(
                                                          e.date,
                                                      ).getTime(),
                                                  ),
                                              ),
                                          ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                          })
                                        : "-"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Next Event
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
