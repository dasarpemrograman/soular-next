import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  color: string | null;
  film_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithFilms extends Collection {
  films: Film[];
}

export interface Film {
  id: string;
  title: string;
  slug: string;
  description: string;
  director: string;
  year: number;
  duration: number;
  category: string;
  thumbnail: string;
  poster_url: string | null;
  is_premium: boolean;
  rating: number;
  view_count: number;
  display_order?: number;
  created_at: string;
}

export interface CollectionsResponse {
  collections: Collection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hook to fetch all collections
export function useCollections(page = 1, limit = 10) {
  return useQuery<CollectionsResponse>({
    queryKey: ["collections", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/collections?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch collections");
      }
      return res.json();
    },
  });
}

// Hook to fetch a single collection with its films
export function useCollection(idOrSlug: string) {
  return useQuery<CollectionWithFilms>({
    queryKey: ["collections", idOrSlug],
    queryFn: async () => {
      const res = await fetch(`/api/collections/${idOrSlug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch collection");
      }
      return res.json();
    },
    enabled: !!idOrSlug,
  });
}

// Hook to create a new collection (admin only)
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      slug?: string;
      description: string;
      icon?: string;
      color?: string;
      is_published?: boolean;
    }) => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create collection");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate collections list
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

// Hook to update a collection (admin only)
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        slug?: string;
        description?: string;
        icon?: string;
        color?: string;
        is_published?: boolean;
      };
    }) => {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update collection");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate collections list and specific collection
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections", variables.id] });
    },
  });
}

// Hook to delete a collection (admin only)
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete collection");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate collections list
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

// Hook to add a film to a collection (admin only)
export function useAddFilmToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      filmId,
      displayOrder,
    }: {
      collectionId: string;
      filmId: string;
      displayOrder?: number;
    }) => {
      const res = await fetch(`/api/collections/${collectionId}/films`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          film_id: filmId,
          display_order: displayOrder,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add film to collection");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific collection to refetch films
      queryClient.invalidateQueries({ queryKey: ["collections", variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

// Hook to remove a film from a collection (admin only)
export function useRemoveFilmFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      filmId,
    }: {
      collectionId: string;
      filmId: string;
    }) => {
      const res = await fetch(
        `/api/collections/${collectionId}/films?film_id=${filmId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove film from collection");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific collection to refetch films
      queryClient.invalidateQueries({ queryKey: ["collections", variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
