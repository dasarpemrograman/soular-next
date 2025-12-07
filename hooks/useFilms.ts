"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Film {
    id: string;
    title: string;
    description: string;
    category: string;
    youtube_url: string;
    thumbnail_url: string | null;
    duration_minutes: number | null;
    created_at: string;
}

interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

interface FilmsResponse {
    films: Film[];
    pagination: PaginationInfo;
}

interface UseFilmsParams {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export function useFilms(params?: UseFilmsParams) {
    return useQuery<FilmsResponse>({
        queryKey: ["films", params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();

            if (params?.category && params.category !== "all") {
                queryParams.append("category", params.category);
            }
            if (params?.search) {
                queryParams.append("search", params.search);
            }
            if (params?.limit) {
                queryParams.append("limit", params.limit.toString());
            }
            if (params?.offset !== undefined) {
                queryParams.append("offset", params.offset.toString());
            }

            const url = `/api/films${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch films");
            }

            return response.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useFilm(id: string | null) {
    return useQuery<{ film: Film }>({
        queryKey: ["film", id],
        queryFn: async () => {
            if (!id) throw new Error("Film ID is required");

            const response = await fetch(`/api/films/${id}`);

            if (!response.ok) {
                throw new Error("Failed to fetch film");
            }

            return response.json();
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useInvalidateFilms() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["films"] });
    };
}
