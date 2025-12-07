"use client";

import { useProfile, useUpdateProfile, useAvatar } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    User,
    Mail,
    Calendar,
    Shield,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Camera,
    Trash2,
    Edit2,
    Save,
    X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
    const { user, loading: authLoading, updatePassword } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const avatar = useAvatar();

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile?.name || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for password update
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // State for avatar preview
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            window.location.href = "/login?redirect=/profile";
        }
    }, [user, authLoading]);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);

        const { error } = await updatePassword(newPassword);

        if (error) {
            setPasswordError(error.message);
        } else {
            setPasswordSuccess(true);
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordSuccess(false), 5000);
        }

        setPasswordLoading(false);
    };

    const handleAvatarSelect = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        try {
            await avatar.uploadAsync(file);
            setAvatarPreview(null);
        } catch (error) {
            console.error("Upload failed:", error);
            setAvatarPreview(null);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to upload avatar",
            );
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm("Are you sure you want to remove your avatar?")) return;

        try {
            await avatar.removeAsync();
            setAvatarPreview(null);
        } catch (error) {
            console.error("Remove failed:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to remove avatar",
            );
        }
    };

    const handleSaveProfile = async () => {
        try {
            await updateProfile.mutateAsync({
                name: name.trim(),
                bio: bio.trim(),
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Update failed:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile",
            );
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setName(profile?.name || "");
        setBio(profile?.bio || "");
    };

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const currentAvatar = avatarPreview || profile.avatar;

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-4xl space-y-6">
                {/* Header with Avatar */}
                <Card className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-premium flex items-center justify-center text-white text-4xl font-bold">
                                {currentAvatar ? (
                                    <Image
                                        src={currentAvatar}
                                        alt={profile.name}
                                        width={128}
                                        height={128}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Avatar Upload Overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={avatar.isUploading}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                    title="Upload avatar"
                                >
                                    {avatar.isUploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
                                    ) : (
                                        <Camera className="h-5 w-5 text-gray-700" />
                                    )}
                                </button>
                                {currentAvatar && (
                                    <button
                                        onClick={handleRemoveAvatar}
                                        disabled={avatar.isRemoving}
                                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                        title="Remove avatar"
                                    >
                                        {avatar.isRemoving ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                        ) : (
                                            <Trash2 className="h-5 w-5 text-white" />
                                        )}
                                    </button>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 space-y-4">
                            {!isEditing ? (
                                <>
                                    <div>
                                        <h1 className="text-3xl font-bold">
                                            {profile.name}
                                        </h1>
                                        <p className="text-muted-foreground">
                                            {profile.email}
                                        </p>
                                        {profile.is_premium && (
                                            <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gradient-premium text-white text-sm font-medium rounded-full">
                                                <Shield className="h-3 w-3" />
                                                Premium Member
                                            </div>
                                        )}
                                    </div>
                                    {profile.bio && (
                                        <p className="text-sm text-muted-foreground">
                                            {profile.bio}
                                        </p>
                                    )}
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Display Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={bio}
                                                onChange={(e) =>
                                                    setBio(e.target.value)
                                                }
                                                placeholder="Tell us about yourself..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={updateProfile.isPending}
                                            size="sm"
                                        >
                                            {updateProfile.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleCancelEdit}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Account Information */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    User ID
                                </p>
                                <p className="text-sm font-mono break-all">
                                    {profile.id}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Email Address
                                </p>
                                <p className="text-sm">{profile.email}</p>
                                {user.email_confirmed_at && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <span className="text-xs text-green-600 dark:text-green-400">
                                            Verified
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Member Since
                                </p>
                                <p className="text-sm">
                                    {formatDate(profile.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Update Password */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Update Password</h2>

                    {passwordError && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {passwordError}
                            </p>
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Password updated successfully!
                            </p>
                        </div>
                    )}

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={passwordLoading}
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Must be at least 6 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirm New Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                disabled={passwordLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={passwordLoading}
                            variant="premium"
                        >
                            {passwordLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Back to Home
                            </Button>
                        </Link>
                        <Link href="/favorites">
                            <Button variant="outline" className="w-full">
                                My Favorites
                            </Button>
                        </Link>
                        <Link href="/settings">
                            <Button variant="outline" className="w-full">
                                Settings
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
