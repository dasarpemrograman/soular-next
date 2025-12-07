"use client";

import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
    Shield,
    Pin,
    Lock,
    Trash2,
    User,
    Calendar,
    TrendingUp,
    Activity,
    AlertCircle,
    Users,
    Settings,
    BarChart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    useCurrentUserRole,
    useModerationStats,
    useModerationLogs,
} from "@/hooks/useAdmin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const ActionTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "pin":
        case "unpin":
            return <Pin className="h-4 w-4" />;
        case "lock":
        case "unlock":
            return <Lock className="h-4 w-4" />;
        case "delete_discussion":
        case "delete_post":
            return <Trash2 className="h-4 w-4" />;
        case "ban_user":
        case "unban_user":
            return <AlertCircle className="h-4 w-4" />;
        default:
            return <Activity className="h-4 w-4" />;
    }
};

const ActionTypeLabel = ({ type }: { type: string }) => {
    const labels: Record<string, string> = {
        pin: "Pasang",
        unpin: "Lepas Pasangan",
        lock: "Kunci",
        unlock: "Buka Kunci",
        delete_discussion: "Hapus Diskusi",
        delete_post: "Hapus Balasan",
        ban_user: "Ban Pengguna",
        unban_user: "Buka Ban",
    };
    return <span>{labels[type] || type}</span>;
};

export default function AdminDashboard() {
    const { data: userRole, isLoading: roleLoading } = useCurrentUserRole();
    const { data: stats, isLoading: statsLoading } = useModerationStats();
    const { data: logs, isLoading: logsLoading } = useModerationLogs(20);

    // Check if user is moderator or admin
    if (!roleLoading && !userRole?.is_moderator) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Card className="p-12 text-center bg-destructive/10 border-destructive/20">
                            <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
                            <h2 className="text-2xl font-bold mb-4 text-destructive">
                                Akses Ditolak
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Anda tidak memiliki izin untuk mengakses halaman
                                admin. Halaman ini hanya untuk moderator dan
                                admin.
                            </p>
                            <Link href="/forum">
                                <Button>Kembali ke Forum</Button>
                            </Link>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (roleLoading || statsLoading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Memuat dashboard...
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-10 w-10 text-primary" />
                                <div>
                                    <h1 className="text-4xl font-bold">
                                        Dashboard Admin
                                    </h1>
                                    <p className="text-muted-foreground">
                                        {userRole?.is_admin
                                            ? "Administrator"
                                            : "Moderator"}{" "}
                                        - Kelola konten dan pengguna
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <Link href="/admin/users">
                                <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-8 w-8 text-primary" />
                                        <div>
                                            <h3 className="font-semibold">
                                                Kelola Pengguna
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Ban, unban, dan ubah role
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/forum">
                                <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-8 w-8 text-primary" />
                                        <div>
                                            <h3 className="font-semibold">
                                                Forum
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Moderasi diskusi dan post
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/admin/logs">
                                <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <BarChart className="h-8 w-8 text-primary" />
                                        <div>
                                            <h3 className="font-semibold">
                                                Log Lengkap
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Lihat semua aktivitas moderasi
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Pin className="h-8 w-8 text-yellow-500" />
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Aksi Pin/Unpin
                            </h3>
                            <p className="text-3xl font-bold">
                                {stats?.total_pin_actions || 0}
                            </p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Lock className="h-8 w-8 text-red-500" />
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Aksi Lock/Unlock
                            </h3>
                            <p className="text-3xl font-bold">
                                {stats?.total_lock_actions || 0}
                            </p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Trash2 className="h-8 w-8 text-destructive" />
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Total Penghapusan
                            </h3>
                            <p className="text-3xl font-bold">
                                {(stats?.total_discussion_deletions || 0) +
                                    (stats?.total_post_deletions || 0)}
                            </p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <User className="h-8 w-8 text-blue-500" />
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Moderator Aktif
                            </h3>
                            <p className="text-3xl font-bold">
                                {stats?.active_moderators || 0}
                            </p>
                        </Card>
                    </motion.div>

                    {/* Recent Activity Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                    >
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Aktivitas 24 Jam Terakhir
                            </h3>
                            <p className="text-4xl font-bold text-primary">
                                {stats?.actions_last_24h || 0}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Aksi moderasi dalam sehari terakhir
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Aktivitas 7 Hari Terakhir
                            </h3>
                            <p className="text-4xl font-bold text-primary">
                                {stats?.actions_last_7d || 0}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Aksi moderasi dalam seminggu terakhir
                            </p>
                        </Card>
                    </motion.div>

                    {/* Recent Actions Log */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Activity className="h-6 w-6 text-primary" />
                                    Log Aktivitas Terbaru
                                </h2>
                                <Link href="/admin/logs">
                                    <Button variant="outline" size="sm">
                                        Lihat Semua
                                    </Button>
                                </Link>
                            </div>

                            {logsLoading && (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        Memuat log aktivitas...
                                    </p>
                                </div>
                            )}

                            {!logsLoading && (!logs || logs.length === 0) && (
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        Belum ada aktivitas moderasi
                                    </p>
                                </div>
                            )}

                            {!logsLoading && logs && logs.length > 0 && (
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="p-2 rounded-full bg-background">
                                                <ActionTypeIcon
                                                    type={log.action_type}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">
                                                        <ActionTypeLabel
                                                            type={
                                                                log.action_type
                                                            }
                                                        />
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        •
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {log.target_type}
                                                    </span>
                                                </div>
                                                {log.reason && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Alasan: {log.reason}
                                                    </p>
                                                )}
                                                {log.metadata?.title &&
                                                typeof log.metadata.title ===
                                                    "string" ? (
                                                    <p className="text-sm">
                                                        {log.metadata.title}
                                                    </p>
                                                ) : null}
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            log.created_at,
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                            locale: idLocale,
                                                        },
                                                    )}
                                                    {log.profiles && (
                                                        <>
                                                            {" "}
                                                            oleh{" "}
                                                            {log.profiles.name}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-8"
                    >
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Aksi Cepat
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link href="/forum">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Kelola Forum
                                    </Button>
                                </Link>
                                {userRole?.is_admin && (
                                    <>
                                        <Link href="/admin/users">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                Kelola Pengguna
                                            </Button>
                                        </Link>
                                        <Link href="/admin/settings">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                            >
                                                <Activity className="h-4 w-4 mr-2" />
                                                Pengaturan
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
