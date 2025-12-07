// ============================================
// HOUR 34: Notification Bell Component
// ============================================
// Displays notification bell with unread count and dropdown preview

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useNotifications,
    useUnreadCount,
    useNotificationActions,
    Notification,
} from "@/hooks/useNotifications";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    BellOff,
    MessageCircle,
    Heart,
    Pin,
    Lock,
    AlertCircle,
    Calendar,
    Trash2,
    Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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

export function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const { data: unreadCount } = useUnreadCount();
    const { data: notificationsData, isLoading } = useNotifications(
        5,
        0,
        false,
    );
    const { markAsRead } = useNotificationActions();

    const notifications = notificationsData?.notifications || [];
    const unread = unreadCount?.count || 0;

    const getNotificationIcon = (type: string) => {
        const Icon =
            NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || Bell;
        const colorClass =
            NOTIFICATION_COLORS[type as keyof typeof NOTIFICATION_COLORS] ||
            "text-muted-foreground";
        return <Icon className={`h-4 w-4 ${colorClass}`} />;
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
        setOpen(false);
    };

    const handleViewAll = () => {
        router.push("/notifications");
        setOpen(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {unread > 9 ? "9+" : unread}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 max-h-[500px] overflow-y-auto"
            >
                <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        {unread > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {unread} new
                            </Badge>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Loading...
                        </p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <BellOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No notifications
                        </p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`p-3 cursor-pointer ${
                                    !notification.is_read ? "bg-primary/5" : ""
                                }`}
                                onClick={() =>
                                    handleNotificationClick(notification)
                                }
                            >
                                <div className="flex items-start gap-3 w-full">
                                    {/* Icon */}
                                    <div
                                        className={`p-2 rounded-full flex-shrink-0 ${
                                            !notification.is_read
                                                ? "bg-primary/10"
                                                : "bg-muted"
                                        }`}
                                    >
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p
                                                className={`text-sm font-medium line-clamp-1 ${
                                                    !notification.is_read
                                                        ? "text-foreground"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                            {notification.message}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(
                                                new Date(
                                                    notification.created_at,
                                                ),
                                                {
                                                    addSuffix: true,
                                                    locale: idLocale,
                                                },
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            className="p-3 text-center justify-center cursor-pointer text-primary font-medium"
                            onClick={handleViewAll}
                        >
                            View All Notifications
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
