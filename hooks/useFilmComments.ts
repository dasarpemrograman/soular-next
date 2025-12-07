"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FilmComment {
    id: string;
    film_id: string;
    user_id: string;
    username: string;
    user_avatar: string | null;
    comment: string;
    rating: number | null;
    like_count: number;
    created_at: string;
    updated_at: string;
    is_liked: boolean;
}

export interface CommentsData {
    comments: FilmComment[];
    total: number;
    average_rating: number;
    limit: number;
    offset: number;
}

export function useFilmComments(filmId: string) {
    const [comments, setComments] = useState<FilmComment[]>([]);
    const [total, setTotal] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchComments = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/films/${filmId}/comments`);

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const data: CommentsData = await response.json();
            setComments(data.comments);
            setTotal(data.total);
            setAverageRating(data.average_rating);
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load comments",
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (filmId) {
            fetchComments();
        }
    }, [filmId]);

    const addComment = async (comment: string, rating?: number) => {
        if (!user) {
            throw new Error("You must be logged in to comment");
        }

        try {
            const response = await fetch(`/api/films/${filmId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ comment, rating }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add comment");
            }

            const data = await response.json();

            // Add new comment to the top of the list
            setComments([data.comment, ...comments]);
            setTotal(total + 1);

            // Recalculate average rating if rating was provided
            if (rating) {
                const newAvg =
                    (averageRating * (total - 1) + rating) / total || rating;
                setAverageRating(Math.round(newAvg * 10) / 10);
            }

            return data.comment;
        } catch (err) {
            console.error("Error adding comment:", err);
            throw err;
        }
    };

    const updateComment = async (
        commentId: string,
        comment: string,
        rating?: number,
    ) => {
        if (!user) {
            throw new Error("You must be logged in to update comments");
        }

        try {
            const response = await fetch(
                `/api/films/${filmId}/comments/${commentId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ comment, rating }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update comment");
            }

            const data = await response.json();

            // Update comment in the list
            setComments(
                comments.map((c) =>
                    c.id === commentId ? { ...c, ...data.comment } : c,
                ),
            );

            return data.comment;
        } catch (err) {
            console.error("Error updating comment:", err);
            throw err;
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!user) {
            throw new Error("You must be logged in to delete comments");
        }

        try {
            const response = await fetch(
                `/api/films/${filmId}/comments/${commentId}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete comment");
            }

            // Remove comment from the list
            setComments(comments.filter((c) => c.id !== commentId));
            setTotal(total - 1);
        } catch (err) {
            console.error("Error deleting comment:", err);
            throw err;
        }
    };

    const toggleLike = async (commentId: string) => {
        if (!user) {
            throw new Error("You must be logged in to like comments");
        }

        const comment = comments.find((c) => c.id === commentId);
        if (!comment) return;

        const isLiked = comment.is_liked;

        // Optimistic update
        setComments(
            comments.map((c) =>
                c.id === commentId
                    ? {
                          ...c,
                          is_liked: !isLiked,
                          like_count: c.like_count + (isLiked ? -1 : 1),
                      }
                    : c,
            ),
        );

        try {
            const response = await fetch(
                `/api/films/${filmId}/comments/${commentId}/like`,
                {
                    method: isLiked ? "DELETE" : "POST",
                },
            );

            if (!response.ok) {
                // Revert optimistic update
                setComments(
                    comments.map((c) =>
                        c.id === commentId
                            ? {
                                  ...c,
                                  is_liked: isLiked,
                                  like_count: c.like_count + (isLiked ? 1 : -1),
                              }
                            : c,
                    ),
                );
                throw new Error("Failed to toggle like");
            }
        } catch (err) {
            console.error("Error toggling like:", err);
            throw err;
        }
    };

    return {
        comments,
        total,
        averageRating,
        isLoading,
        error,
        addComment,
        updateComment,
        deleteComment,
        toggleLike,
        refetch: fetchComments,
    };
}
