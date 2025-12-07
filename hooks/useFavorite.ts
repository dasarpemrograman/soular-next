"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function useFavoriteStatus(filmId: string | null) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["favorite", filmId, user?.id],
        queryFn: async () => {
            if (!filmId || !user) {
                return { favorited: false };
            }

            const response = await fetch(`/api/films/${filmId}/favorite`);
            if (!response.ok) {
                return { favorited: false };
            }
            return response.json();
        },
        enabled: !!filmId && !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useFavorite(filmId: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    const addFavorite = useMutation({
        mutationFn: async () => {
            if (!user) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(`/api/films/${filmId}/favorite`, {
                method: "POST",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to add favorite");
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate favorite status query
            queryClient.invalidateQueries({
                queryKey: ["favorite", filmId, user?.id],
            });
            // Invalidate films queries to update any favorite indicators
            queryClient.invalidateQueries({ queryKey: ["films"] });
        },
    });

    const removeFavorite = useMutation({
        mutationFn: async () => {
            if (!user) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(`/api/films/${filmId}/favorite`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to remove favorite");
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate favorite status query
            queryClient.invalidateQueries({
                queryKey: ["favorite", filmId, user?.id],
            });
            // Invalidate films queries to update any favorite indicators
            queryClient.invalidateQueries({ queryKey: ["films"] });
        },
    });

    const toggleFavorite = async (isFavorited: boolean) => {
        if (!user) {
            // Redirect to login
            router.push(`/login?redirect=/film/${filmId}`);
            return;
        }

        if (isFavorited) {
            await removeFavorite.mutateAsync();
        } else {
            await addFavorite.mutateAsync();
        }
    };

    return {
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isLoading: addFavorite.isPending || removeFavorite.isPending,
    };
}
