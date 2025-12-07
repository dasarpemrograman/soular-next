"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumPaywall } from "@/components/PremiumPaywall";
import {
    Crown,
    Check,
    Sparkles,
    Calendar,
    CreditCard,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SubscriptionData {
    subscription: {
        plan_name: string;
        plan_display_name: string;
        status: string;
        billing_cycle: string;
        current_period_end: string;
        cancel_at_period_end: boolean;
        features: string[];
        is_trial: boolean;
    } | null;
    profile: {
        subscription_plan: string;
        subscription_status: string;
        subscription_ends_at: string | null;
    };
}

export default function SubscriptionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [subscriptionData, setSubscriptionData] =
        useState<SubscriptionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaywall, setShowPaywall] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        fetchSubscription();
    }, [user]);

    const fetchSubscription = async () => {
        try {
            const response = await fetch("/api/subscription");
            if (response.ok) {
                const data = await response.json();
                setSubscriptionData(data);
            }
        } catch (error) {
            console.error("Error fetching subscription:", error);
            toast.error("Failed to load subscription data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (
            !confirm(
                "Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.",
            )
        ) {
            return;
        }

        setIsCancelling(true);
        try {
            const response = await fetch("/api/subscription", {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Subscription cancelled successfully");
                fetchSubscription();
            } else {
                throw new Error("Failed to cancel subscription");
            }
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            toast.error("Failed to cancel subscription");
        } finally {
            setIsCancelling(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (!user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const currentPlan = subscriptionData?.profile.subscription_plan || "free";
    const hasActiveSubscription = currentPlan !== "free";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                        Your Subscription
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Manage your plan and billing preferences
                    </p>
                </motion.div>

                {/* Current Subscription Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10"></div>

                        <CardHeader className="relative">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600">
                                        <Crown className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-3xl text-white capitalize">
                                            {currentPlan} Plan
                                        </CardTitle>
                                        <p className="text-gray-400 mt-1">
                                            {hasActiveSubscription
                                                ? "Premium member"
                                                : "Free tier"}
                                        </p>
                                    </div>
                                </div>

                                {hasActiveSubscription && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                                        <Check className="w-4 h-4 mr-2" />
                                        Active
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="relative space-y-6">
                            {hasActiveSubscription &&
                            subscriptionData?.subscription ? (
                                <>
                                    {/* Subscription Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="w-5 h-5" />
                                                <span className="text-sm">
                                                    Billing Cycle
                                                </span>
                                            </div>
                                            <p className="text-white font-semibold capitalize pl-7">
                                                {
                                                    subscriptionData
                                                        .subscription
                                                        .billing_cycle
                                                }
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <CreditCard className="w-5 h-5" />
                                                <span className="text-sm">
                                                    Next Billing Date
                                                </span>
                                            </div>
                                            <p className="text-white font-semibold pl-7">
                                                {formatDate(
                                                    subscriptionData
                                                        .subscription
                                                        .current_period_end,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cancel Warning */}
                                    {subscriptionData.subscription
                                        .cancel_at_period_end && (
                                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-amber-400 font-semibold">
                                                    Subscription Cancelled
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    You&apos;ll retain access
                                                    until{" "}
                                                    {formatDate(
                                                        subscriptionData
                                                            .subscription
                                                            .current_period_end,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Features */}
                                    {subscriptionData.subscription.features && (
                                        <div className="space-y-3">
                                            <h3 className="text-white font-semibold">
                                                Your Benefits
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {subscriptionData.subscription.features.map(
                                                    (feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                            <span className="text-gray-300 text-sm">
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                                        <Button
                                            onClick={() => setShowPaywall(true)}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Change Plan
                                        </Button>

                                        {!subscriptionData.subscription
                                            .cancel_at_period_end && (
                                            <Button
                                                onClick={
                                                    handleCancelSubscription
                                                }
                                                disabled={isCancelling}
                                                variant="outline"
                                                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                {isCancelling
                                                    ? "Cancelling..."
                                                    : "Cancel Subscription"}
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-6">
                                        You&apos;re currently on the free plan.
                                        Upgrade to unlock premium features!
                                    </p>
                                    <Button
                                        onClick={() => setShowPaywall(true)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg"
                                    >
                                        <Crown className="w-5 h-5 mr-2" />
                                        Upgrade to Premium
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Free Plan Features */}
                {!hasActiveSubscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    Free Plan Includes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "Browse films",
                                        "Create favorites",
                                        "Community forums",
                                        "Standard quality",
                                    ].map((feature, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2"
                                        >
                                            <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Paywall Modal */}
            <PremiumPaywall
                isOpen={showPaywall}
                onClose={() => {
                    setShowPaywall(false);
                    fetchSubscription();
                }}
            />
        </div>
    );
}
