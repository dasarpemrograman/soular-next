"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useNotifications,
    useNotificationActions,
    useUnreadCount,
    Notification,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Trash2,
    MessageCircle,
    Heart,
    Pin,
    Lock,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const NOTIFICATION_ICONS = {
    reply: MessageCircle,
    mention: MessageCircle,
    like: Heart,
    discussion_pinned: Pin,
    discussion_locked: Lock,
    post_deleted: Trash2,
    user_banned: AlertCircle,
    role_changed: AlertCircle,
    event_reminder: Calendar,
    event_cancelled: Calendar,
};

const NOTIFICATION_COLORS = {
    reply: "text-blue-500",
    mention: "text-purple-500",
    like: "text-red-500",
    discussion_pinned: "text-yellow-500",
    discussion_locked: "text-orange-500",
    post_deleted: "text-gray-500",
    user_banned: "text-red-700",
    role_changed: "text-green-500",
    event_reminder: "text-blue-600",
    event_cancelled: "text-red-600",
};

export default function NotificationsPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [page, setPage] = useState(0);
    const limit = 20;

    const { data: notificationsData, isLoading } = useNotifications(
        limit,
        page * limit,
        filter === "unread",
    );
    const { data: unreadCount } = useUnreadCount();
    const { markAsRead, markAllAsRead, deleteNotification, isMarkingAll } =
        useNotificationActions();

    const notifications = notificationsData?.notifications || [];
    const total = notificationsData?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const getNotificationIcon = (type: string) => {
        const Icon =
            NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || Bell;
        const colorClass =
            NOTIFICATION_COLORS[type as keyof typeof NOTIFICATION_COLORS] ||
            "text-muted-foreground";
        return <Icon className={`h-5 w-5 ${colorClass}`} />;
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Bell className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold">
                                    Notifications
                                </h1>
                                <p className="text-muted-foreground">
                                    Stay updated with your activity
                                </p>
                            </div>
                        </div>
                        {unreadCount && unreadCount.count > 0 && (
                            <Badge
                                variant="destructive"
                                className="text-lg px-3 py-1"
                            >
                                {unreadCount.count}
                            </Badge>
                        )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <Select
                            value={filter}
                            onValueChange={(value: "all" | "unread") => {
                                setFilter(value);
                                setPage(0);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Notifications
                                </SelectItem>
                                <SelectItem value="unread">
                                    Unread Only
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {unreadCount && unreadCount.count > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAll}
                                className="w-full sm:w-auto"
                            >
                                {isMarkingAll ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Marking...
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                        Mark All as Read
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">
                            Loading notifications...
                        </p>
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="p-12 text-center">
                        <BellOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">
                            No Notifications
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {filter === "unread"
                                ? "You're all caught up! No unread notifications."
                                : "You don't have any notifications yet."}
                        </p>
                        <Link href="/forum">
                            <Button>Explore Forum</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {notifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <Card
                                        className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                                            !notification.is_read
                                                ? "bg-primary/5 border-primary/20"
                                                : "hover:bg-muted/50"
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification,
                                            )
                                        }
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div
                                                className={`p-2 rounded-full ${
                                                    !notification.is_read
                                                        ? "bg-primary/10"
                                                        : "bg-muted"
                                                }`}
                                            >
                                                {getNotificationIcon(
                                                    notification.type,
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3
                                                        className={`font-semibold ${
                                                            !notification.is_read
                                                                ? "text-foreground"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.is_read && (
                                                        <div className="flex-shrink-0">
                                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                notification.created_at,
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                                locale: idLocale,
                                                            },
                                                        )}
                                                    </span>
                                                    {notification.actor && (
                                                        <>
                                                            <span>•</span>
                                                            <div className="flex items-center gap-1">
                                                                {notification
                                                                    .actor
                                                                    .avatar ? (
                                                                    <img
                                                                        src={
                                                                            notification
                                                                                .actor
                                                                                .avatar
                                                                        }
                                                                        alt={
                                                                            notification
                                                                                .actor
                                                                                .username
                                                                        }
                                                                        className="h-4 w-4 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="h-4 w-4 rounded-full bg-primary/10" />
                                                                )}
                                                                <span>
                                                                    {
                                                                        notification
                                                                            .actor
                                                                            .username
                                                                    }
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 flex-shrink-0">
                                                {!notification.is_read && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(
                                                                notification.id,
                                                            );
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(
                                                            notification.id,
                                                        );
                                                    }}
                                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-between mt-8">
                        <p className="text-sm text-muted-foreground">
                            Showing {page * limit + 1} to{" "}
                            {Math.min((page + 1) * limit, total)} of {total}{" "}
                            notifications
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                <span className="text-sm">
                                    Page {page + 1} of {totalPages}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
