"use client";

import { use } from "react";
import { useEvent, useEventRegistration } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Calendar,
    MapPin,
    Users,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Clock,
    User,
    Share2,
    CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
    is_registered?: boolean;
}

// ============================================
// COMPONENTS
// ============================================

function RegistrationButton({ eventId }: { eventId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const { isRegistered, isRegistering, isUnregistering, toggle, error } =
        useEventRegistration(eventId);

    const handleClick = () => {
        if (!user) {
            router.push(`/login?redirect=/events/${eventId}`);
            return;
        }
        toggle();
    };

    const isLoading = isRegistering || isUnregistering;

    return (
        <div className="space-y-2">
            <Button
                onClick={handleClick}
                disabled={isLoading}
                size="lg"
                variant={isRegistered ? "outline" : "premium"}
                className="w-full sm:w-auto"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {isRegistering ? "Registering..." : "Unregistering..."}
                    </>
                ) : isRegistered ? (
                    <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Registered
                    </>
                ) : (
                    <>Register for Event</>
                )}
            </Button>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
    );
}

function ShareButton({ event }: { event: Event }) {
    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `Join me at ${event.title}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <Button onClick={handleShare} variant="outline" size="lg">
            <Share2 className="mr-2 h-5 w-5" />
            Share
        </Button>
    );
}

function AddToCalendarButton({ event }: { event: Event }) {
    const handleAddToCalendar = () => {
        const eventDate = new Date(event.date);
        const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, "");
        };

        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(eventDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

        window.open(calendarUrl, "_blank");
    };

    return (
        <Button onClick={handleAddToCalendar} variant="outline" size="lg">
            <CalendarPlus className="mr-2 h-5 w-5" />
            Add to Calendar
        </Button>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: event, isLoading, error } = useEvent(id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <Card className="p-8 max-w-md w-full border-red-500/20 bg-red-500/5">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">
                            Event Not Found
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {error?.message ||
                                "The event you're looking for doesn't exist."}
                        </p>
                        <Link href="/events">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Events
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    const eventDate = new Date(event.date);
    const isUpcoming = eventDate > new Date();
    const isPast = eventDate < new Date();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full">
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <Calendar className="h-32 w-32 text-primary/40" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-6 left-6">
                    <Link href="/events">
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Events
                        </Button>
                    </Link>
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                    <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                            isUpcoming
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white"
                        }`}
                    >
                        {isUpcoming ? "Upcoming Event" : "Past Event"}
                    </span>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container mx-auto max-w-6xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                            {event.title}
                        </h1>
                        {event.is_registered && (
                            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-100 px-4 py-2 rounded-full">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    You&apos;re registered for this event
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                About This Event
                            </h2>
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        </Card>

                        {/* Organizer Info */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                Event Type
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center text-white font-bold text-lg">
                                    {event.event_type.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold capitalize">
                                        {event.event_type}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Event Category
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Event Details Card */}
                        <Card className="p-6 space-y-4 sticky top-20">
                            <h3 className="font-bold text-lg mb-4">
                                Event Details
                            </h3>

                            {/* Date & Time */}
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Date & Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {eventDate.toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {eventDate.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.location}
                                    </p>
                                </div>
                            </div>

                            {/* Participants */}
                            {event.max_participants && (
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            Participants
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Maximum {event.max_participants}{" "}
                                            attendees
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Organizer */}
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Organized by</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.organizer}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                {/* Registration Button */}
                                {isUpcoming && (
                                    <RegistrationButton eventId={event.id} />
                                )}

                                {isPast && (
                                    <div className="bg-muted p-4 rounded-lg text-center">
                                        <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm font-medium text-muted-foreground">
                                            This event has ended
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2">
                                    <ShareButton event={event} />
                                    {isUpcoming && (
                                        <AddToCalendarButton event={event} />
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* My Events Link */}
                        <Card className="p-6 bg-primary/5 border-primary/20">
                            <h3 className="font-semibold mb-2">My Events</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                View all your registered events
                            </p>
                            <Link href="/my-events">
                                <Button variant="outline" className="w-full">
                                    View My Events
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
