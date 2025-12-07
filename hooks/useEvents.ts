// ============================================
// HOUR 25: Events Hooks
// ============================================
// React Query hooks for events management

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// ============================================
// TYPES
// ============================================
export interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    organizer: string;
    max_participants: number | null;
    image_url: string | null;
    created_at: string;
    is_registered?: boolean;
}

export interface RegisteredEvent {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    organizer: string;
    max_participants: number | null;
    image_url: string | null;
    created_at: string;
    registration_status: string;
    registered_at: string;
    registration_id: string;
}

export interface EventsParams {
    status?: "upcoming" | "past" | "all";
    limit?: number;
    offset?: number;
    search?: string;
}

export interface EventsResponse {
    events: Event[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export interface RegistrationResponse {
    message: string;
    registration?: {
        id: string;
        event_id: string;
        user_id: string;
        status: string;
        registered_at: string;
    };
}

export interface RegistrationStatus {
    is_registered: boolean;
    registration: {
        id: string;
        status: string;
        registered_at: string;
    } | null;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchEvents(params: EventsParams = {}): Promise<EventsResponse> {
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.set("status", params.status);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());
    if (params.search) searchParams.set("search", params.search);

    const response = await fetch(`/api/events?${searchParams.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch events");
    }

    return response.json();
}

async function fetchEvent(id: string): Promise<Event> {
    const response = await fetch(`/api/events/${id}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Event not found");
        }
        throw new Error("Failed to fetch event");
    }

    return response.json();
}

async function registerForEvent(
    eventId: string,
): Promise<RegistrationResponse> {
    const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register for event");
    }

    return response.json();
}

async function unregisterFromEvent(
    eventId: string,
): Promise<{ message: string }> {
    const response = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unregister from event");
    }

    return response.json();
}

async function checkRegistrationStatus(
    eventId: string,
): Promise<RegistrationStatus> {
    const response = await fetch(`/api/events/${eventId}/register`);

    if (!response.ok) {
        throw new Error("Failed to check registration status");
    }

    return response.json();
}

async function fetchMyEvents(): Promise<RegisteredEvent[]> {
    const response = await fetch("/api/my-events");

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch registered events");
    }

    return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch events list
 */
export function useEvents(params: EventsParams = {}) {
    return useQuery<EventsResponse, Error>({
        queryKey: ["events", params],
        queryFn: () => fetchEvents(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(id: string) {
    return useQuery<Event, Error>({
        queryKey: ["event", id],
        queryFn: () => fetchEvent(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to check registration status for an event
 */
export function useRegistrationStatus(eventId: string) {
    return useQuery<RegistrationStatus, Error>({
        queryKey: ["event-registration", eventId],
        queryFn: () => checkRegistrationStatus(eventId),
        enabled: !!eventId,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Hook to fetch user's registered events
 */
export function useMyEvents() {
    return useQuery<RegisteredEvent[], Error>({
        queryKey: ["my-events"],
        queryFn: fetchMyEvents,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            // Don't retry if unauthorized
            if (error.message === "Unauthorized") {
                return false;
            }
            return failureCount < 3;
        },
    });
}

/**
 * Hook to register for an event
 */
export function useRegisterEvent() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<RegistrationResponse, Error, string>({
        mutationFn: registerForEvent,
        onSuccess: (_, eventId) => {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            queryClient.invalidateQueries({
                queryKey: ["event-registration", eventId],
            });
            queryClient.invalidateQueries({ queryKey: ["my-events"] });
        },
        onError: (error) => {
            // If unauthorized, redirect to login
            if (error.message === "Unauthorized") {
                router.push("/login?redirect=/events");
            }
        },
    });
}

/**
 * Hook to unregister from an event
 */
export function useUnregisterEvent() {
    const queryClient = useQueryClient();

    return useMutation<{ message: string }, Error, string>({
        mutationFn: unregisterFromEvent,
        onSuccess: (_, eventId) => {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            queryClient.invalidateQueries({
                queryKey: ["event-registration", eventId],
            });
            queryClient.invalidateQueries({ queryKey: ["my-events"] });
        },
    });
}

/**
 * Combined hook for event registration operations
 */
export function useEventRegistration(eventId: string) {
    const status = useRegistrationStatus(eventId);
    const register = useRegisterEvent();
    const unregister = useUnregisterEvent();

    const toggle = () => {
        if (status.data?.is_registered) {
            unregister.mutate(eventId);
        } else {
            register.mutate(eventId);
        }
    };

    return {
        isRegistered: status.data?.is_registered || false,
        registration: status.data?.registration || null,
        isLoading: status.isLoading,
        isRegistering: register.isPending,
        isUnregistering: unregister.isPending,
        toggle,
        register: () => register.mutate(eventId),
        unregister: () => unregister.mutate(eventId),
        error: register.error || unregister.error,
    };
}
