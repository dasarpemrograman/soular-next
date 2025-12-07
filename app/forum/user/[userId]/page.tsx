"use client";

import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MessageSquare,
    User,
    Calendar,
    Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserActivity } from "@/hooks/useForum";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function UserForumActivity() {
    const params = useParams();
    const userId = params.userId as string;
    const [activeTab, setActiveTab] = useState<"discussions" | "posts">(
        "discussions"
    );

    const {
        data: activity,
        isLoading,
        error,
    } = useUserActivity(userId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">
                                Memuat aktivitas pengguna...
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Card className="p-12 text-center bg-destructive/10 border-destructive/20">
                            <h2 className="text-2xl font-bold mb-4 text-destructive">
                                Pengguna Tidak Ditemukan
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                {error?.message ||
                                    "Pengguna yang Anda cari tidak ditemukan"}
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

                    {/* User Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <Card className="p-8">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="p-4 rounded-full bg-muted">
                                    {activity.profile.avatar ? (
                                        <img
                                            src={activity.profile.avatar}
                                            alt={activity.profile.name}
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-20 w-20 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        {activity.profile.name}
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Aktivitas Forum
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4 bg-muted/50">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-primary">
                                            {activity.stats.total_discussions}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Diskusi Dibuat
                                        </p>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-muted/50">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-primary">
                                            {activity.stats.total_posts}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Balasan Dikirim
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <Button
                            variant={
                                activeTab === "discussions" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("discussions")}
                        >
                            Diskusi ({activity.discussions.length})
                        </Button>
                        <Button
                            variant={activeTab === "posts" ? "default" : "outline"}
                            onClick={() => setActiveTab("posts")}
                        >
                            Balasan ({activity.posts.length})
                        </Button>
                    </div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-4"
                    >
                        {activeTab === "discussions" && (
                            <>
                                {activity.discussions.length === 0 ? (
                                    <Card className="p-12 text-center">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            Belum ada diskusi yang dibuat
                                        </p>
                                    </Card>
                                ) : (
                                    activity.discussions.map((discussion, index) => (
                                        <motion.div
                                            key={discussion.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.05,
                                            }}
                                        >
                                            <Link href={`/forum/${discussion.id}`}>
                                                <Card className="group p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                                                            {discussion.category}
                                                        </span>
                                                        {discussion.is_pinned && (
                                                            <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                                                                Dipasang
                                                            </span>
                                                        )}
                                                        {discussion.is_locked && (
                                                            <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                                                                Terkunci
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                                        {discussion.title}
                                                    </h3>

                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                        {discussion.content}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    discussion.created_at
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                    locale: idLocale,
                                                                }
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="h-4 w-4" />
                                                            {discussion.reply_count}{" "}
                                                            balasan
                                                        </span>
                                                        <span>
                                                            {discussion.view_count}{" "}
                                                            dilihat
                                                        </span>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))
                                )}
                            </>
                        )}

                        {activeTab === "posts" && (
                            <>
                                {activity.posts.length === 0 ? (
                                    <Card className="p-12 text-center">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            Belum ada balasan yang dikirim
                                        </p>
                                    </Card>
                                ) : (
                                    activity.posts.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.05,
                                            }}
                                        >
                                            <Link
                                                href={`/forum/${post.discussion_id}`}
                                            >
                                                <Card className="group p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                                    <div className="mb-3">
                                                        <p className="text-sm text-primary font-medium mb-1">
                                                            Balasan di:{" "}
                                                            {post.forum_discussions
                                                                ?.title ||
                                                                "Diskusi"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    post.created_at
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                    locale: idLocale,
                                                                }
                                                            )}
                                                            {post.updated_at !==
                                                                post.created_at &&
                                                                " (diedit)"}
                                                        </p>
                                                    </div>

                                                    <div className="prose dark:prose-invert max-w-none">
                                                        <p className="whitespace-pre-wrap line-clamp-3">
                                                            {post.content}
                                                        </p>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
