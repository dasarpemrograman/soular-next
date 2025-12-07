"use client";

import { useState } from "react";
import { useFilmComments } from "@/hooks/useFilmComments";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MessageSquare,
    ThumbsUp,
    Star,
    Edit2,
    Trash2,
    Send,
    X,
    Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FilmCommentsProps {
    filmId: string;
}

export function FilmComments({ filmId }: FilmCommentsProps) {
    const { user } = useAuth();
    const {
        comments,
        total,
        averageRating,
        isLoading,
        addComment,
        updateComment,
        deleteComment,
        toggleLike,
    } = useFilmComments(filmId);

    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editComment, setEditComment] = useState("");
    const [editRating, setEditRating] = useState<number | null>(null);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        setIsSubmitting(true);
        try {
            await addComment(newComment, newRating || undefined);
            setNewComment("");
            setNewRating(null);
            toast.success("Comment added successfully!");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to add comment",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        try {
            await updateComment(
                commentId,
                editComment,
                editRating || undefined,
            );
            setEditingId(null);
            setEditComment("");
            setEditRating(null);
            toast.success("Comment updated successfully!");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update comment",
            );
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            await deleteComment(commentId);
            toast.success("Comment deleted successfully!");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete comment",
            );
        }
    };

    const handleToggleLike = async (commentId: string) => {
        try {
            await toggleLike(commentId);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to toggle like",
            );
        }
    };

    const startEdit = (
        commentId: string,
        comment: string,
        rating: number | null,
    ) => {
        setEditingId(commentId);
        setEditComment(comment);
        setEditRating(rating);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditComment("");
        setEditRating(null);
    };

    const renderStars = (
        rating: number | null,
        onSelect?: (rating: number) => void,
        size: "sm" | "lg" = "sm",
    ) => {
        const starSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onSelect?.(star)}
                        disabled={!onSelect}
                        className={`transition-all ${
                            rating && star <= rating
                                ? "text-amber-400"
                                : "text-gray-600"
                        } ${
                            onSelect
                                ? "hover:text-amber-300 hover:scale-110 cursor-pointer"
                                : ""
                        }`}
                    >
                        <Star
                            className={starSize}
                            fill={
                                rating && star <= rating
                                    ? "currentColor"
                                    : "none"
                            }
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <CardContent className="p-8">
                    <div className="space-y-6 animate-pulse">
                        <div className="h-8 bg-gray-700 rounded-lg w-1/3"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-gray-700 rounded-xl"
                                ></div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-gray-800 shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"></div>

            <CardHeader className="relative pb-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                            <MessageSquare className="w-8 h-8 text-blue-400" />
                            Reviews & Comments
                        </CardTitle>
                        <p className="text-base flex items-center gap-2 text-gray-400">
                            <span className="font-semibold text-gray-300">
                                {total} {total === 1 ? "review" : "reviews"}
                            </span>
                        </p>
                    </div>

                    {averageRating > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-2xl px-6 py-4 border border-amber-700/50 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-amber-400" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-amber-400">
                                            {averageRating.toFixed(1)}
                                        </span>
                                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Average Rating
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="relative p-8 space-y-8">
                {/* Comment form */}
                {user ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl backdrop-blur-sm"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="w-12 h-12 border-2 border-blue-500/50 ring-2 ring-blue-500/20">
                                    <AvatarImage
                                        src={user.user_metadata?.avatar_url}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-white text-lg">
                                        Share your thoughts
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Let others know what you think
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <label className="text-sm font-semibold text-gray-300">
                                        Your Rating:
                                    </label>
                                    {renderStars(newRating, setNewRating, "lg")}
                                    {newRating && (
                                        <Badge className="ml-2 bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30">
                                            {newRating} stars
                                        </Badge>
                                    )}
                                </div>

                                <Textarea
                                    placeholder="Write your review here... What did you think about this film?"
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    rows={4}
                                    className="resize-none bg-gray-900/50 border-gray-700 focus:border-blue-500/50 rounded-xl text-base text-white placeholder:text-gray-500"
                                />

                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-xs text-gray-500">
                                        {newComment.length} characters
                                    </p>
                                    <div className="flex gap-2">
                                        {(newComment || newRating) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setNewComment("");
                                                    setNewRating(null);
                                                }}
                                                className="hover:bg-red-500/20 hover:text-red-400 text-gray-400"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleSubmitComment}
                                            disabled={
                                                isSubmitting ||
                                                !newComment.trim()
                                            }
                                            size="sm"
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/50 transition-all"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {isSubmitting
                                                ? "Posting..."
                                                : "Post Review"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-700"
                    >
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-lg font-semibold text-gray-300 mb-2">
                            Join the conversation
                        </p>
                        <p className="text-gray-400 mb-4">
                            Please{" "}
                            <a
                                href="/login"
                                className="text-blue-400 font-semibold hover:underline"
                            >
                                sign in
                            </a>{" "}
                            to leave a review
                        </p>
                    </motion.div>
                )}

                {/* Comments list */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {comments.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-16"
                            >
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 inline-block border border-gray-700/50">
                                    <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                                    <p className="text-xl font-semibold text-gray-300 mb-2">
                                        No reviews yet
                                    </p>
                                    <p className="text-gray-500">
                                        Be the first to share your thoughts!
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            comments.map((comment, index) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-lg hover:shadow-xl hover:border-gray-600/50 transition-all duration-300 backdrop-blur-sm"
                                >
                                    {/* Comment header */}
                                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 border-2 border-gray-700 ring-2 ring-gray-700/50">
                                                <AvatarImage
                                                    src={
                                                        comment.user_avatar ||
                                                        undefined
                                                    }
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                                                    {comment.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-white text-lg">
                                                    {comment.username}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            comment.created_at,
                                                        ),
                                                        { addSuffix: true },
                                                    )}
                                                    {comment.updated_at !==
                                                        comment.created_at && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-1 text-xs py-0 px-1.5 border-gray-600 text-gray-400"
                                                        >
                                                            edited
                                                        </Badge>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        {comment.rating && (
                                            <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-xl px-4 py-2 border border-amber-700/50">
                                                <div className="flex items-center gap-2">
                                                    {renderStars(
                                                        comment.rating,
                                                    )}
                                                    <span className="text-sm font-bold text-amber-400">
                                                        {comment.rating}.0
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comment body */}
                                    {editingId === comment.id ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-4 bg-gray-900/50 rounded-xl p-4 border border-gray-700"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-300">
                                                    Update Rating:
                                                </label>
                                                {renderStars(
                                                    editRating,
                                                    setEditRating,
                                                    "lg",
                                                )}
                                            </div>
                                            <Textarea
                                                value={editComment}
                                                onChange={(e) =>
                                                    setEditComment(
                                                        e.target.value,
                                                    )
                                                }
                                                rows={3}
                                                className="resize-none bg-gray-900 border-gray-700 text-white"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={cancelEdit}
                                                    className="hover:bg-gray-800 text-gray-400"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleUpdateComment(
                                                            comment.id,
                                                        )
                                                    }
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                                                >
                                                    <Send className="w-4 h-4 mr-1" />
                                                    Save
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                                            {comment.comment}
                                        </p>
                                    )}

                                    {/* Comment actions */}
                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700/50">
                                        <button
                                            onClick={() =>
                                                handleToggleLike(comment.id)
                                            }
                                            disabled={!user}
                                            className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                                                comment.is_liked
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : "bg-gray-700/50 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 border border-gray-600"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <ThumbsUp
                                                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                                                    comment.is_liked
                                                        ? "fill-current"
                                                        : ""
                                                }`}
                                            />
                                            <span className="text-sm font-bold">
                                                {comment.like_count}
                                            </span>
                                            <span className="text-xs hidden sm:inline">
                                                {comment.like_count === 1
                                                    ? "Like"
                                                    : "Likes"}
                                            </span>
                                        </button>

                                        {user &&
                                            user.id === comment.user_id && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            startEdit(
                                                                comment.id,
                                                                comment.comment,
                                                                comment.rating,
                                                            )
                                                        }
                                                        className="hover:bg-blue-500/20 hover:text-blue-400 text-gray-400"
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteComment(
                                                                comment.id,
                                                            )
                                                        }
                                                        className="hover:bg-red-500/20 hover:text-red-400 text-gray-400"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
