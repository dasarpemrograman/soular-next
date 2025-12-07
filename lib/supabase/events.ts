/**
 * Events Helper Functions
 *
 * Helper functions for working with events and event registrations in Supabase.
 * These functions handle common operations like fetching events, registering users,
 * and checking registration status.
 */

import { createClient } from "@/lib/supabase/client";

export type EventType =
    | "workshop"
    | "screening"
    | "discussion"
    | "networking"
    | "other";
export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type RegistrationStatus =
    | "registered"
    | "attended"
    | "cancelled"
    | "waitlist";

export interface Event {
    id: string;
    title: string;
    description: string | null;
    event_type: EventType;
    date: string;
    end_date: string | null;
    location: string | null;
    is_online: boolean;
    online_link: string | null;
    max_participants: number | null;
    image_url: string | null;
    host_id: string | null;
    status: EventStatus;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface EventRegistration {
    id: string;
    event_id: string;
    user_id: string;
    status: RegistrationStatus;
    registered_at: string;
    notes: string | null;
}

export interface EventWithParticipantCount extends Event {
    participant_count?: number;
    is_full?: boolean;
    is_user_registered?: boolean;
}

/**
 * Fetch all events with optional filtering
 */
export async function getEvents(options?: {
    status?: EventStatus;
    eventType?: EventType;
    limit?: number;
    includeParticipantCount?: boolean;
}): Promise<{ data: Event[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        let query = supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true });

        if (options?.status) {
            query = query.eq("status", options.status);
        }

        if (options?.eventType) {
            query = query.eq("event_type", options.eventType);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Fetch upcoming events
 */
export async function getUpcomingEvents(
    limit = 10,
): Promise<{ data: Event[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("status", "upcoming")
            .gte("date", new Date().toISOString())
            .order("date", { ascending: true })
            .limit(limit);

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Fetch a single event by ID
 */
export async function getEventById(
    id: string,
): Promise<{ data: Event | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get participant count for an event
 */
export async function getEventParticipantCount(
    eventId: string,
): Promise<{ count: number; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc(
            "get_event_participant_count",
            {
                event_uuid: eventId,
            },
        );

        if (error) throw error;

        return { count: data || 0, error: null };
    } catch (error) {
        return { count: 0, error: error as Error };
    }
}

/**
 * Check if an event is full
 */
export async function isEventFull(
    eventId: string,
): Promise<{ isFull: boolean; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("is_event_full", {
            event_uuid: eventId,
        });

        if (error) throw error;

        return { isFull: data || false, error: null };
    } catch (error) {
        return { isFull: false, error: error as Error };
    }
}

/**
 * Check if a user is registered for an event
 */
export async function isUserRegistered(
    eventId: string,
    userId: string,
): Promise<{ isRegistered: boolean; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("is_user_registered", {
            event_uuid: eventId,
            user_uuid: userId,
        });

        if (error) throw error;

        return { isRegistered: data || false, error: null };
    } catch (error) {
        return { isRegistered: false, error: error as Error };
    }
}

/**
 * Register a user for an event
 */
export async function registerForEvent(
    eventId: string,
    userId: string,
    notes?: string,
): Promise<{ data: EventRegistration | null; error: Error | null }> {
    try {
        const supabase = createClient();

        // First check if event is full
        const { isFull } = await isEventFull(eventId);

        const { data, error } = await supabase
            .from("event_registrations")
            .insert({
                event_id: eventId,
                user_id: userId,
                status: isFull ? "waitlist" : "registered",
                notes: notes || null,
            })
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Cancel a user's registration for an event
 */
export async function cancelRegistration(
    eventId: string,
    userId: string,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("event_registrations")
            .delete()
            .eq("event_id", eventId)
            .eq("user_id", userId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Update registration status
 */
export async function updateRegistrationStatus(
    eventId: string,
    userId: string,
    status: RegistrationStatus,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("event_registrations")
            .update({ status })
            .eq("event_id", eventId)
            .eq("user_id", userId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Get all registrations for an event (for event hosts)
 */
export async function getEventRegistrations(
    eventId: string,
): Promise<{ data: EventRegistration[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("event_registrations")
            .select("*")
            .eq("event_id", eventId)
            .order("registered_at", { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get all events a user is registered for
 */
export async function getUserRegistrations(
    userId: string,
): Promise<{ data: EventRegistration[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("event_registrations")
            .select("*")
            .eq("user_id", userId)
            .order("registered_at", { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Create a new event (requires authentication)
 */
export async function createEvent(
    event: Omit<Event, "id" | "created_at" | "updated_at">,
): Promise<{ data: Event | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .insert(event)
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Update an event (only by host)
 */
export async function updateEvent(
    eventId: string,
    updates: Partial<Event>,
): Promise<{ data: Event | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .update(updates)
            .eq("id", eventId)
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Delete an event (only by host)
 */
export async function deleteEvent(
    eventId: string,
): Promise<{ error: Error | null }> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Search events by title or description
 */
export async function searchEvents(
    query: string,
): Promise<{ data: Event[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order("date", { ascending: true });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get events by tag
 */
export async function getEventsByTag(
    tag: string,
): Promise<{ data: Event[] | null; error: Error | null }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .contains("tags", [tag])
            .order("date", { ascending: true });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}
