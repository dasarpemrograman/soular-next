"use client";

import { Crown, Lock } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PremiumBadgeProps {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "outline" | "minimal";
    className?: string;
}

export function PremiumBadge({
    size = "md",
    variant = "default",
    className = "",
}: PremiumBadgeProps) {
    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    const variants = {
        default:
            "bg-gradient-premium text-white font-semibold shadow-lg shadow-primary/20",
        outline:
            "border-2 border-primary text-primary bg-primary/5 font-semibold",
        minimal: "bg-primary/10 text-primary font-medium",
    };

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${variants[variant]} ${className}`}
        >
            <Crown className={iconSizes[size]} />
            <span>Premium</span>
        </div>
    );
}

interface PremiumGateProps {
    isPremium: boolean;
    children: ReactNode;
    fallback?: ReactNode;
    featureName?: string;
    showUpgrade?: boolean;
    onUpgrade?: () => void;
    blurContent?: boolean;
}

export function PremiumGate({
    isPremium,
    children,
    fallback,
    featureName = "konten premium",
    showUpgrade = true,
    onUpgrade,
    blurContent = false,
}: PremiumGateProps) {
    if (isPremium) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    // Default locked state
    return (
        <div className="relative">
            {/* Blurred content preview */}
            {blurContent && (
                <div className="pointer-events-none select-none blur-md opacity-50">
                    {children}
                </div>
            )}

            {/* Lock overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${blurContent ? "absolute inset-0" : ""} flex items-center justify-center p-8`}
            >
                <Card className="max-w-md w-full bg-card/95 backdrop-blur-sm border-primary/50 shadow-xl">
                    <div className="p-8 text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                            }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-premium"
                        >
                            <Lock className="h-8 w-8 text-white" />
                        </motion.div>

                        <div>
                            <h3 className="text-2xl font-bold mb-2">
                                Konten Premium
                            </h3>
                            <p className="text-muted-foreground">
                                {featureName} hanya tersedia untuk member
                                Premium
                            </p>
                        </div>

                        {showUpgrade && (
                            <div className="space-y-3">
                                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="flex items-baseline justify-center gap-2 mb-1">
                                        <span className="text-3xl font-bold">
                                            Rp 49.000
                                        </span>
                                        <span className="text-muted-foreground text-sm">
                                            /bulan
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Akses penuh ke semua konten premium
                                    </p>
                                </div>

                                <Button
                                    variant="premium"
                                    size="lg"
                                    className="w-full"
                                    onClick={onUpgrade}
                                >
                                    <Crown className="mr-2 h-5 w-5" />
                                    Upgrade ke Premium
                                </Button>

                                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                    <span>✓ Tanpa iklan</span>
                                    <span>✓ 4K streaming</span>
                                    <span>✓ Download offline</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

interface ContentLockProps {
    isPremium: boolean;
    children: ReactNode;
    type?: "blur" | "hide" | "overlay";
    className?: string;
}

export function ContentLock({
    isPremium,
    children,
    type = "overlay",
    className = "",
}: ContentLockProps) {
    if (isPremium) {
        return <>{children}</>;
    }

    switch (type) {
        case "blur":
            return (
                <div className={`relative ${className}`}>
                    <div className="blur-sm select-none pointer-events-none">
                        {children}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-primary/50 shadow-lg">
                            <Lock className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                                Premium Only
                            </span>
                        </div>
                    </div>
                </div>
            );

        case "hide":
            return (
                <div
                    className={`flex items-center justify-center p-8 bg-muted/30 rounded-lg ${className}`}
                >
                    <div className="text-center space-y-2">
                        <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                            Premium content locked
                        </p>
                    </div>
                </div>
            );

        case "overlay":
        default:
            return (
                <div className={`relative ${className}`}>
                    {children}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-premium">
                                <Crown className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-medium">
                                Upgrade to Premium
                            </p>
                        </div>
                    </div>
                </div>
            );
    }
}

// Export all components
export { PremiumGate as default };
