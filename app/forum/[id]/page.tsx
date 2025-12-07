"use client";

import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MessageSquare,
    Heart,
    User,
    Calendar,
    Edit,
    Trash2,
    Send,
    Loader2,
    Lock,
    Pin,
    Check,
    X,
    Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    useDiscussion,
    usePosts,
    useCreatePost,
    useDeleteDiscussion,
    useDeletePost,
    useUpdatePost,
    useDiscussionLike,
} from "@/hooks/useForum";
import { useCurrentUserRole, useDiscussionModeration } from "@/hooks/useAdmin";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DiscussionDetail() {
    const params = useParams();
    const router = useRouter();
    const discussionId = params.id as string;

    const [replyContent, setReplyContent] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePostId, setDeletePostId] = useState<string | null>(null);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const {
        data: discussion,
        isLoading: discussionLoading,
        error: discussionError,
    } = useDiscussion(discussionId);

    const {
        data: posts,
        isLoading: postsLoading,
        error: postsError,
    } = usePosts(discussionId);

    const createPost = useCreatePost(discussionId);
    const deleteDiscussion = useDeleteDiscussion();
    const deletePost = useDeletePost();
    const updatePost = useUpdatePost();
    const { isLiked, isToggling, toggle } = useDiscussionLike(discussionId);

    // Admin/Moderator hooks
    const { data: userRole } = useCurrentUserRole();
    const { togglePin, toggleLock, isPinning, isLocking } =
        useDiscussionModeration(discussionId);

    const isModerator = userRole?.is_moderator || userRole?.is_admin || false;

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!replyContent.trim()) {
            return;
        }

        createPost.mutate(
            { content: replyContent.trim() },
            {
                onSuccess: () => {
                    setReplyContent("");
                },
            },
        );
    };

    const handleDeleteDiscussion = () => {
        deleteDiscussion.mutate(discussionId);
    };

    const handleDeletePost = () => {
        if (deletePostId) {
            deletePost.mutate(
                { postId: deletePostId, discussionId },
                {
                    onSuccess: () => {
                        setDeletePostId(null);
                        setDeleteDialogOpen(false);
                    },
                },
            );
        }
    };

    const openDeletePostDialog = (postId: string) => {
        setDeletePostId(postId);
        setDeleteDialogOpen(true);
    };

    const startEditingPost = (postId: string, content: string) => {
        setEditingPostId(postId);
        setEditContent(content);
    };

    const cancelEditingPost = () => {
        setEditingPostId(null);
        setEditContent("");
    };

    const handleUpdatePost = (postId: string) => {
        if (!editContent.trim()) {
            return;
        }

        updatePost.mutate(
            { postId, data: { content: editContent.trim() } },
            {
                onSuccess: () => {
                    setEditingPostId(null);
                    setEditContent("");
                },
            },
        );
    };

    if (discussionLoading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">
                                Memuat diskusi...
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (discussionError || !discussion) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Card className="p-12 text-center bg-destructive/10 border-destructive/20">
                            <h2 className="text-2xl font-bold mb-4 text-destructive">
                                Diskusi Tidak Ditemukan
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                {discussionError?.message ||
                                    "Diskusi yang Anda cari tidak ditemukan"}
                            </p>
                            <Link href="/forum">
                                <Button>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Forum
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Back Button */}
                    <Link href="/forum">
                        <Button variant="ghost" className="mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Forum
                        </Button>
                    </Link>

                    {/* Discussion Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="p-8 mb-6">
                            {/* Category and Status Badges */}
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                                    {discussion.category}
                                </span>
                                {discussion.is_pinned && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                        <Pin className="h-3 w-3" />
                                        Dipasang
                                    </span>
                                )}
                                {discussion.is_locked && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <Lock className="h-3 w-3" />
                                        Terkunci
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold mb-6">
                                {discussion.title}
                            </h1>

                            {/* Author Info */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                                <div className="p-3 rounded-full bg-muted">
                                    {discussion.profiles.avatar ? (
                                        <img
                                            src={discussion.profiles.avatar}
                                            alt={discussion.profiles.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-10 w-10 text-primary" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">
                                        {discussion.profiles.name}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDistanceToNow(
                                                new Date(discussion.created_at),
                                                {
                                                    addSuffix: true,
                                                    locale: idLocale,
                                                },
                                            )}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {discussion.view_count} dilihat
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {discussion.is_author && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    router.push(
                                                        `/forum/${discussionId}/edit`,
                                                    )
                                                }
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleDeleteDiscussion}
                                                disabled={
                                                    deleteDiscussion.isPending
                                                }
                                            >
                                                {deleteDiscussion.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </>
                                    )}
                                    {isModerator && (
                                        <>
                                            <Button
                                                variant={
                                                    discussion.is_pinned
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                onClick={togglePin}
                                                disabled={isPinning}
                                                title={
                                                    discussion.is_pinned
                                                        ? "Unpin discussion"
                                                        : "Pin discussion"
                                                }
                                            >
                                                {isPinning ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Pin className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant={
                                                    discussion.is_locked
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                onClick={toggleLock}
                                                disabled={isLocking}
                                                title={
                                                    discussion.is_locked
                                                        ? "Unlock discussion"
                                                        : "Lock discussion"
                                                }
                                            >
                                                {isLocking ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Lock className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                                <p className="whitespace-pre-wrap">
                                    {discussion.content}
                                </p>
                            </div>

                            {/* Tags */}
                            {discussion.tags && discussion.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {discussion.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={isLiked ? "default" : "outline"}
                                    size="sm"
                                    onClick={toggle}
                                    disabled={isToggling}
                                    className="flex items-center gap-2"
                                >
                                    <Heart
                                        className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                                    />
                                    <span>{isLiked ? "Disukai" : "Suka"}</span>
                                </Button>
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MessageSquare className="h-4 w-4" />
                                    {discussion.reply_count} balasan
                                </span>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Replies Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-bold mb-6">
                            Balasan ({discussion.reply_count})
                        </h2>

                        {/* Reply Form */}
                        {!discussion.is_locked && (
                            <Card className="p-6 mb-6">
                                <form onSubmit={handleReplySubmit}>
                                    <Textarea
                                        placeholder="Tulis balasan Anda..."
                                        value={replyContent}
                                        onChange={(e) =>
                                            setReplyContent(e.target.value)
                                        }
                                        rows={4}
                                        className="mb-4"
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">
                                            {replyContent.length} karakter
                                        </p>
                                        <Button
                                            type="submit"
                                            disabled={
                                                !replyContent.trim() ||
                                                createPost.isPending
                                            }
                                        >
                                            {createPost.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Kirim Balasan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {discussion.is_locked && (
                            <Card className="p-6 mb-6 bg-muted/50 border-muted">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Lock className="h-5 w-5" />
                                    <p>
                                        Diskusi ini telah dikunci. Balasan baru
                                        tidak dapat ditambahkan.
                                    </p>
                                </div>
                            </Card>
                        )}

                        {/* Posts List */}
                        {postsLoading && (
                            <div className="text-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                                <p className="text-muted-foreground">
                                    Memuat balasan...
                                </p>
                            </div>
                        )}

                        {postsError && (
                            <Card className="p-6 bg-destructive/10 border-destructive/20">
                                <p className="text-destructive">
                                    Gagal memuat balasan: {postsError.message}
                                </p>
                            </Card>
                        )}

                        {posts && posts.length === 0 && !postsLoading && (
                            <Card className="p-12 text-center">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Belum ada balasan. Jadilah yang pertama!
                                </p>
                            </Card>
                        )}

                        {/* Posts */}
                        <div className="space-y-4">
                            {posts?.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <Card className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-full bg-muted">
                                                {post.profiles.avatar ? (
                                                    <img
                                                        src={
                                                            post.profiles.avatar
                                                        }
                                                        alt={post.profiles.name}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-8 w-8 text-primary" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-semibold">
                                                            {post.profiles.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    post.created_at,
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                    locale: idLocale,
                                                                },
                                                            )}
                                                            {post.updated_at !==
                                                                post.created_at &&
                                                                " (diedit)"}
                                                        </p>
                                                    </div>
                                                    {post.is_author && (
                                                        <div className="flex gap-2">
                                                            {editingPostId ===
                                                            post.id ? (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleUpdatePost(
                                                                                post.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            updatePost.isPending
                                                                        }
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={
                                                                            cancelEditingPost
                                                                        }
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            startEditingPost(
                                                                                post.id,
                                                                                post.content,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            openDeletePostDialog(
                                                                                post.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {editingPostId === post.id ? (
                                                    <div className="mt-3">
                                                        <Textarea
                                                            value={editContent}
                                                            onChange={(e) =>
                                                                setEditContent(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            rows={4}
                                                            className="mb-2"
                                                        />
                                                        <p className="text-sm text-muted-foreground">
                                                            {editContent.length}{" "}
                                                            karakter
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="prose dark:prose-invert">
                                                        <p className="whitespace-pre-wrap">
                                                            {post.content}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Delete Post Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Balasan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Balasan Anda
                            akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setDeletePostId(null)}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePost}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletePost.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Footer />
        </div>
    );
}
