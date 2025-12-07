"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Settings as SettingsIcon,
    Bell,
    Shield,
    Palette,
    Loader2,
    Save,
    CheckCircle2,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { data: settings, isLoading: settingsLoading } = useSettings();
    const updateSettings = useUpdateSettings();

    // Default settings to prevent undefined errors
    const defaultSettings = {
        email_notifications: true,
        email_on_reply: true,
        email_on_mention: true,
        email_on_like: false,
        email_on_event: true,
        email_on_moderation: true,
        push_notifications: true,
        push_on_reply: true,
        push_on_mention: true,
        push_on_like: false,
        push_on_event: true,
        push_on_moderation: true,
        show_email: false,
        show_activity: true,
        allow_mentions: true,
        allow_direct_messages: true,
        theme: "system" as const,
        language: "id" as const,
        posts_per_page: 20,
        email_digest: "never" as const,
        digest_day: 0,
    };

    const [localSettings, setLocalSettings] = useState(
        settings || defaultSettings,
    );
    const [hasChanges, setHasChanges] = useState(false);

    // Update local settings when fetched settings change
    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/settings");
        }
    }, [user, authLoading, router]);

    const handleSettingChange = (key: string, value: any) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            [key]: value,
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (!localSettings) return;

        // Safely extract metadata fields if they exist
        const settingsCopy: any = { ...localSettings };
        delete settingsCopy.id;
        delete settingsCopy.user_id;
        delete settingsCopy.created_at;
        delete settingsCopy.updated_at;

        updateSettings.mutate(settingsCopy, {
            onSuccess: () => {
                setHasChanges(false);
            },
        });
    };

    const handleReset = () => {
        setLocalSettings(settings || defaultSettings);
        setHasChanges(false);
    };

    if (authLoading || settingsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!user || !localSettings) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-premium flex items-center justify-center">
                            <SettingsIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Settings</h1>
                            <p className="text-muted-foreground">
                                Manage your account preferences
                            </p>
                        </div>
                    </div>

                    {hasChanges && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={updateSettings.isPending}
                            >
                                Reset
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={updateSettings.isPending}
                            >
                                {updateSettings.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : updateSettings.isSuccess ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Settings Tabs */}
                <Tabs defaultValue="notifications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="notifications">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="privacy">
                            <Shield className="h-4 w-4 mr-2" />
                            Privacy
                        </TabsTrigger>
                        <TabsTrigger value="appearance">
                            <Palette className="h-4 w-4 mr-2" />
                            Appearance
                        </TabsTrigger>
                    </TabsList>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Email Notifications
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="email-notifications">
                                            Enable Email Notifications
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Switch
                                        id="email-notifications"
                                        checked={
                                            localSettings.email_notifications
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "email_notifications",
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                <div className="border-t pt-4 space-y-4 opacity-70">
                                    {!localSettings.email_notifications && (
                                        <p className="text-sm text-muted-foreground italic">
                                            Enable email notifications to
                                            configure specific types
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-on-reply">
                                                Replies
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                When someone replies to your
                                                post
                                            </p>
                                        </div>
                                        <Switch
                                            id="email-on-reply"
                                            checked={
                                                localSettings.email_on_reply
                                            }
                                            disabled={
                                                !localSettings.email_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "email_on_reply",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-on-mention">
                                                Mentions
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                When someone mentions you
                                            </p>
                                        </div>
                                        <Switch
                                            id="email-on-mention"
                                            checked={
                                                localSettings.email_on_mention
                                            }
                                            disabled={
                                                !localSettings.email_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "email_on_mention",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-on-like">
                                                Likes
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                When someone likes your content
                                            </p>
                                        </div>
                                        <Switch
                                            id="email-on-like"
                                            checked={
                                                localSettings.email_on_like
                                            }
                                            disabled={
                                                !localSettings.email_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "email_on_like",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-on-event">
                                                Events
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Event reminders and updates
                                            </p>
                                        </div>
                                        <Switch
                                            id="email-on-event"
                                            checked={
                                                localSettings.email_on_event
                                            }
                                            disabled={
                                                !localSettings.email_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "email_on_event",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-on-moderation">
                                                Moderation
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Moderation actions on your
                                                content
                                            </p>
                                        </div>
                                        <Switch
                                            id="email-on-moderation"
                                            checked={
                                                localSettings.email_on_moderation
                                            }
                                            disabled={
                                                !localSettings.email_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "email_on_moderation",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Push Notifications
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="push-notifications">
                                            Enable Push Notifications
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive in-app notifications
                                        </p>
                                    </div>
                                    <Switch
                                        id="push-notifications"
                                        checked={
                                            localSettings.push_notifications
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "push_notifications",
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                <div className="border-t pt-4 space-y-4 opacity-70">
                                    {!localSettings.push_notifications && (
                                        <p className="text-sm text-muted-foreground italic">
                                            Enable push notifications to
                                            configure specific types
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-on-reply">
                                                Replies
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                When someone replies to your
                                                post
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-on-reply"
                                            checked={
                                                localSettings.push_on_reply
                                            }
                                            disabled={
                                                !localSettings.push_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "push_on_reply",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-on-mention">
                                                Mentions
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                When someone mentions you
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-on-mention"
                                            checked={
                                                localSettings.push_on_mention
                                            }
                                            disabled={
                                                !localSettings.push_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "push_on_mention",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-on-like">
                                                Likes
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                When someone likes your content
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-on-like"
                                            checked={
                                                localSettings?.push_on_like ||
                                                false
                                            }
                                            disabled={
                                                !localSettings?.push_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "push_on_like",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-on-event">
                                                Events
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Event reminders and updates
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-on-event"
                                            checked={
                                                localSettings.push_on_event
                                            }
                                            disabled={
                                                !localSettings.push_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "push_on_event",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-on-moderation">
                                                Moderation
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Moderation actions on your
                                                content
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-on-moderation"
                                            checked={
                                                localSettings.push_on_moderation
                                            }
                                            disabled={
                                                !localSettings.push_notifications
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "push_on_moderation",
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Email Digest
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-digest">
                                        Digest Frequency
                                    </Label>
                                    <Select
                                        value={
                                            localSettings?.email_digest ||
                                            "never"
                                        }
                                        onValueChange={(value) =>
                                            handleSettingChange(
                                                "email_digest",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="email-digest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="never">
                                                Never
                                            </SelectItem>
                                            <SelectItem value="daily">
                                                Daily
                                            </SelectItem>
                                            <SelectItem value="weekly">
                                                Weekly
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Receive a summary of activity
                                    </p>
                                </div>

                                {localSettings.email_digest === "weekly" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="digest-day">
                                            Digest Day
                                        </Label>
                                        <Select
                                            value={(
                                                localSettings?.digest_day || 0
                                            ).toString()}
                                            onValueChange={(value) =>
                                                handleSettingChange(
                                                    "digest_day",
                                                    parseInt(value, 10),
                                                )
                                            }
                                        >
                                            <SelectTrigger id="digest-day">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Sunday
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Monday
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Tuesday
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    Wednesday
                                                </SelectItem>
                                                <SelectItem value="4">
                                                    Thursday
                                                </SelectItem>
                                                <SelectItem value="5">
                                                    Friday
                                                </SelectItem>
                                                <SelectItem value="6">
                                                    Saturday
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Profile Privacy
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-email">
                                            Show Email on Profile
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Make your email visible to others
                                        </p>
                                    </div>
                                    <Switch
                                        id="show-email"
                                        checked={
                                            localSettings?.show_email || false
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "show_email",
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-activity">
                                            Show Activity
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Let others see your activity
                                        </p>
                                    </div>
                                    <Switch
                                        id="show-activity"
                                        checked={
                                            localSettings?.show_activity || true
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "show_activity",
                                                checked,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Interaction Settings
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allow-mentions">
                                            Allow Mentions
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Let others mention you in posts
                                        </p>
                                    </div>
                                    <Switch
                                        id="allow-mentions"
                                        checked={
                                            localSettings?.allow_mentions ||
                                            true
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "allow_mentions",
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allow-dms">
                                            Allow Direct Messages
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Let others send you direct messages
                                        </p>
                                    </div>
                                    <Switch
                                        id="allow-dms"
                                        checked={
                                            localSettings.allow_direct_messages
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "allow_direct_messages",
                                                checked,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Theme</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Color Theme</Label>
                                    <Select
                                        value={localSettings?.theme || "system"}
                                        onValueChange={(value) =>
                                            handleSettingChange("theme", value)
                                        }
                                    >
                                        <SelectTrigger id="theme">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">
                                                Light
                                            </SelectItem>
                                            <SelectItem value="dark">
                                                Dark
                                            </SelectItem>
                                            <SelectItem value="system">
                                                System
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Choose your preferred color theme
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Language & Region
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select
                                        value={localSettings?.language || "id"}
                                        onValueChange={(value) =>
                                            handleSettingChange(
                                                "language",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="language">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="id">
                                                Bahasa Indonesia
                                            </SelectItem>
                                            <SelectItem value="en">
                                                English
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Select your preferred language
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Display Settings
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="posts-per-page">
                                        Posts Per Page
                                    </Label>
                                    <Select
                                        value={(
                                            localSettings?.posts_per_page || 20
                                        ).toString()}
                                        onValueChange={(value) =>
                                            handleSettingChange(
                                                "posts_per_page",
                                                parseInt(value, 10),
                                            )
                                        }
                                    >
                                        <SelectTrigger id="posts-per-page">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">
                                                10 posts
                                            </SelectItem>
                                            <SelectItem value="20">
                                                20 posts
                                            </SelectItem>
                                            <SelectItem value="50">
                                                50 posts
                                            </SelectItem>
                                            <SelectItem value="100">
                                                100 posts
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Number of posts to display per page
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
