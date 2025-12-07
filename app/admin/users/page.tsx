"use client";

import { useState } from "react";
import {
    useUsers,
    useBanUser,
    useUnbanUser,
    useUpdateUserRole,
    useCurrentUserRole,
    UserProfile,
} from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Search,
    Shield,
    ShieldAlert,
    User,
    Ban,
    Unlock,
    ChevronLeft,
    ChevronRight,
    UserCog,
} from "lucide-react";

const ROLES = [
    { value: "", label: "All Roles" },
    { value: "user", label: "User" },
    { value: "moderator", label: "Moderator" },
    { value: "admin", label: "Admin" },
];

const BAN_STATUS = [
    { value: "", label: "All Users" },
    { value: "false", label: "Active Users" },
    { value: "true", label: "Banned Users" },
];

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [bannedFilter, setBannedFilter] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    // Modals state
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [unbanModalOpen, setUnbanModalOpen] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [banReason, setBanReason] = useState("");
    const [banDuration, setBanDuration] = useState("");
    const [newRole, setNewRole] = useState<"user" | "moderator" | "admin">(
        "user",
    );

    // Hooks
    const { data: currentUser } = useCurrentUserRole();
    const {
        data: usersData,
        isLoading,
        refetch,
    } = useUsers(search, roleFilter, bannedFilter, limit, page * limit);
    const banUser = useBanUser();
    const unbanUser = useUnbanUser();
    const updateRole = useUpdateUserRole();

    // Check if user is admin
    const isAdmin = currentUser?.is_admin || false;

    // Handlers
    const handleBanClick = (user: UserProfile) => {
        setSelectedUser(user);
        setBanReason("");
        setBanDuration("");
        setBanModalOpen(true);
    };

    const handleUnbanClick = (user: UserProfile) => {
        setSelectedUser(user);
        setUnbanModalOpen(true);
    };

    const handleRoleClick = (user: UserProfile) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setRoleModalOpen(true);
    };

    const handleBanSubmit = async () => {
        if (!selectedUser || !banReason.trim()) return;

        const duration = banDuration ? parseInt(banDuration, 10) : undefined;

        banUser.mutate(
            {
                userId: selectedUser.id,
                reason: banReason,
                duration_days: duration,
            },
            {
                onSuccess: () => {
                    setBanModalOpen(false);
                    setSelectedUser(null);
                    setBanReason("");
                    setBanDuration("");
                    refetch();
                },
            },
        );
    };

    const handleUnbanSubmit = async () => {
        if (!selectedUser) return;

        unbanUser.mutate(selectedUser.id, {
            onSuccess: () => {
                setUnbanModalOpen(false);
                setSelectedUser(null);
                refetch();
            },
        });
    };

    const handleRoleSubmit = async () => {
        if (!selectedUser) return;

        updateRole.mutate(
            { userId: selectedUser.id, role: newRole },
            {
                onSuccess: () => {
                    setRoleModalOpen(false);
                    setSelectedUser(null);
                    refetch();
                },
            },
        );
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin":
                return <ShieldAlert className="h-4 w-4" />;
            case "moderator":
                return <Shield className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const getRoleBadgeVariant = (
        role: string,
    ): "default" | "secondary" | "destructive" => {
        switch (role) {
            case "admin":
                return "destructive";
            case "moderator":
                return "default";
            default:
                return "secondary";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const totalPages = usersData ? Math.ceil(usersData.total / limit) : 0;

    if (!currentUser) {
        return (
            <div className="container mx-auto py-8">
                <p className="text-center text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!currentUser.is_moderator && !currentUser.is_admin) {
        return (
            <div className="container mx-auto py-8">
                <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
                    <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">
                        You need moderator or admin privileges to access this
                        page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-muted-foreground">
                    Manage users, roles, and permissions across the platform.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by username or email..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={roleFilter}
                    onValueChange={(value) => {
                        setRoleFilter(value);
                        setPage(0);
                    }}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                                {role.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={bannedFilter}
                    onValueChange={(value) => {
                        setBannedFilter(value);
                        setPage(0);
                    }}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        {BAN_STATUS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8"
                                >
                                    <p className="text-muted-foreground">
                                        Loading users...
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : usersData && usersData.users.length > 0 ? (
                            usersData.users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.username}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {user.username}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {user.id.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm">{user.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={getRoleBadgeVariant(
                                                user.role,
                                            )}
                                            className="gap-1"
                                        >
                                            {getRoleIcon(user.role)}
                                            {user.role.charAt(0).toUpperCase() +
                                                user.role.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_banned ? (
                                            <div className="space-y-1">
                                                <Badge variant="destructive">
                                                    Banned
                                                </Badge>
                                                {user.ban_expires_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Until{" "}
                                                        {formatDate(
                                                            user.ban_expires_at,
                                                        )}
                                                    </p>
                                                )}
                                                {user.ban_reason && (
                                                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                        {user.ban_reason}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge variant="secondary">
                                                Active
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleRoleClick(user)
                                                    }
                                                >
                                                    <UserCog className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {user.is_banned ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleUnbanClick(user)
                                                    }
                                                >
                                                    <Unlock className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleBanClick(user)
                                                    }
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8"
                                >
                                    <p className="text-muted-foreground">
                                        No users found.
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {usersData && usersData.total > limit && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {page * limit + 1} to{" "}
                        {Math.min((page + 1) * limit, usersData.total)} of{" "}
                        {usersData.total} users
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

            {/* Ban User Dialog */}
            <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                        <DialogDescription>
                            Ban {selectedUser?.username} from the platform. This
                            will prevent them from posting or interacting with
                            content.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ban-reason">Reason *</Label>
                            <Textarea
                                id="ban-reason"
                                placeholder="Enter the reason for banning this user..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ban-duration">
                                Duration (days)
                            </Label>
                            <Input
                                id="ban-duration"
                                type="number"
                                placeholder="Leave empty for permanent ban"
                                value={banDuration}
                                onChange={(e) => setBanDuration(e.target.value)}
                                min="1"
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty for a permanent ban. Enter a number
                                for a temporary ban.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBanModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBanSubmit}
                            disabled={!banReason.trim() || banUser.isPending}
                        >
                            {banUser.isPending ? "Banning..." : "Ban User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unban User Dialog */}
            <Dialog open={unbanModalOpen} onOpenChange={setUnbanModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unban User</DialogTitle>
                        <DialogDescription>
                            Remove the ban from {selectedUser?.username}. They
                            will regain full access to the platform.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser?.ban_reason && (
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm font-medium mb-1">
                                Original ban reason:
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {selectedUser.ban_reason}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setUnbanModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUnbanSubmit}
                            disabled={unbanUser.isPending}
                        >
                            {unbanUser.isPending
                                ? "Unbanning..."
                                : "Unban User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedUser?.username}. This
                            will change their permissions and access level.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-role">New Role</Label>
                            <Select
                                value={newRole}
                                onValueChange={(
                                    value: "user" | "moderator" | "admin",
                                ) => setNewRole(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="moderator">
                                        Moderator
                                    </SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <p className="text-sm font-medium">
                                Role Permissions:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {newRole === "user" && (
                                    <>
                                        <li>• Create and edit own posts</li>
                                        <li>• Comment on discussions</li>
                                        <li>• Like and favorite content</li>
                                    </>
                                )}
                                {newRole === "moderator" && (
                                    <>
                                        <li>• All user permissions</li>
                                        <li>• Pin and lock discussions</li>
                                        <li>• Delete posts and comments</li>
                                        <li>• Ban users</li>
                                    </>
                                )}
                                {newRole === "admin" && (
                                    <>
                                        <li>• All moderator permissions</li>
                                        <li>• Manage user roles</li>
                                        <li>• Access admin dashboard</li>
                                        <li>• Full platform control</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRoleModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRoleSubmit}
                            disabled={
                                updateRole.isPending ||
                                newRole === selectedUser?.role
                            }
                        >
                            {updateRole.isPending
                                ? "Updating..."
                                : "Update Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
