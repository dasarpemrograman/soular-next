"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Lock,
    Sparkles,
    Check,
    X,
    Crown,
    Zap,
    Star,
    Shield,
    Download,
    Film,
    TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface PremiumPaywallProps {
    isOpen: boolean;
    onClose: () => void;
    requiredPlan?: "basic" | "premium" | "pro";
    contentType?: string;
    contentTitle?: string;
}

const PLANS = [
    {
        name: "basic",
        displayName: "Basic",
        price: 9.99,
        priceYearly: 99.99,
        icon: Film,
        color: "from-blue-500 to-cyan-500",
        features: [
            "HD quality streaming",
            "Ad-free viewing",
            "5 offline downloads",
            "Priority streaming",
            "Community access",
        ],
        popular: false,
    },
    {
        name: "premium",
        displayName: "Premium",
        price: 19.99,
        priceYearly: 199.99,
        icon: Crown,
        color: "from-purple-500 to-pink-500",
        features: [
            "4K Ultra HD quality",
            "20 offline downloads",
            "Early access to new films",
            "Exclusive content",
            "Priority support",
            "All Basic features",
        ],
        popular: true,
    },
    {
        name: "pro",
        displayName: "Pro",
        price: 49.99,
        priceYearly: 499.99,
        icon: Zap,
        color: "from-amber-500 to-orange-500",
        features: [
            "Unlimited downloads",
            "Director commentaries",
            "Behind-the-scenes content",
            "Industry networking",
            "Advanced analytics",
            "All Premium features",
        ],
        popular: false,
    },
];

export function PremiumPaywall({
    isOpen,
    onClose,
    requiredPlan = "basic",
    contentType = "content",
    contentTitle,
}: PremiumPaywallProps) {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string>(requiredPlan);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubscribe = async (planName: string) => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/subscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan_name: planName,
                    billing_cycle: billingCycle,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to subscribe");
            }

            toast.success("🎉 Welcome to Premium!", {
                description: "Your subscription is now active!",
            });

            onClose();
            router.refresh();
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Failed to subscribe", {
                description: "Please try again or contact support.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const getYearlySavings = (price: number, priceYearly: number) => {
        const monthlyCost = price * 12;
        const savings = monthlyCost - priceYearly;
        const percentage = Math.round((savings / monthlyCost) * 100);
        return { savings, percentage };
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 text-white">
                {/* Header */}
                <DialogHeader className="relative pb-6 border-b border-gray-700/50">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-3"
                    >
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50"></div>
                                <Lock className="w-16 h-16 text-purple-400 relative" />
                            </div>
                        </div>
                        <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            Unlock Premium Access
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 text-lg">
                            {contentTitle ? (
                                <>
                                    <span className="font-semibold text-white">
                                        "{contentTitle}"
                                    </span>{" "}
                                    requires a premium subscription
                                </>
                            ) : (
                                "Choose a plan to access exclusive content and features"
                            )}
                        </DialogDescription>
                    </motion.div>
                </DialogHeader>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center my-8"
                >
                    <div className="bg-gray-800/50 rounded-full p-1 flex gap-1 border border-gray-700">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-6 py-2 rounded-full font-semibold transition-all ${
                                billingCycle === "monthly"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle("yearly")}
                            className={`px-6 py-2 rounded-full font-semibold transition-all relative ${
                                billingCycle === "yearly"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Yearly
                            <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Save 17%
                            </Badge>
                        </button>
                    </div>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan, index) => {
                        const Icon = plan.icon;
                        const savings = getYearlySavings(plan.price, plan.priceYearly);
                        const displayPrice =
                            billingCycle === "monthly" ? plan.price : plan.priceYearly;

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 1) }}
                                className="relative"
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none px-4 py-1 text-sm font-bold shadow-lg">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            MOST POPULAR
                                        </Badge>
                                    </div>
                                )}

                                <Card
                                    className={`relative overflow-hidden border-2 transition-all duration-300 ${
                                        plan.popular
                                            ? "border-purple-500/50 shadow-2xl shadow-purple-500/20 scale-105"
                                            : "border-gray-700 hover:border-gray-600"
                                    } bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm ${
                                        selectedPlan === plan.name
                                            ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedPlan(plan.name)}
                                >
                                    {/* Gradient overlay */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-5`}
                                    ></div>

                                    <div className="relative p-6 space-y-6">
                                        {/* Plan header */}
                                        <div className="text-center space-y-3">
                                            <div className="flex justify-center">
                                                <div
                                                    className={`p-3 rounded-2xl bg-gradient-to-br ${plan.color} shadow-lg`}
                                                >
                                                    <Icon className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">
                                                {plan.displayName}
                                            </h3>
                                            <div className="space-y-1">
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-4xl font-bold text-white">
                                                        ${displayPrice}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">
                                                        /{billingCycle === "monthly" ? "mo" : "yr"}
                                                    </span>
                                                </div>
                                                {billingCycle === "yearly" && (
                                                    <p className="text-xs text-green-400">
                                                        Save ${savings.savings.toFixed(2)}/year
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        delay: 0.05 * i + 0.2 * (index + 1),
                                                    }}
                                                    className="flex items-start gap-3"
                                                >
                                                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-300 text-sm">
                                                        {feature}
                                                    </span>
                                                </motion.li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <Button
                                            onClick={() => handleSubscribe(plan.name)}
                                            disabled={isProcessing}
                                            className={`w-full py-6 font-bold text-lg bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-none shadow-lg transition-all duration-300 ${
                                                selectedPlan === plan.name
                                                    ? "shadow-xl scale-105"
                                                    : ""
                                            }`}
                                        >
                                            {isProcessing && selectedPlan === plan.name ? (
                                                <span className="flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: "linear",
                                                        }}
                                                    >
                                                        <Sparkles className="w-5 h-5" />
                                                    </motion.div>
                                                    Processing...
                                                </span>
                                            ) : (
                                                <>
                                                    Get {plan.displayName}
                                                    <Sparkles className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Benefits Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 pt-8 border-t border-gray-700/50"
                >
                    <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Why Go Premium?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Ad-Free",
                                description: "Enjoy uninterrupted viewing",
                            },
                            {
                                icon: Download,
                                title: "Offline Access",
                                description: "Watch anytime, anywhere",
                            },
                            {
                                icon: Star,
                                title: "Exclusive Content",
                                description: "Early access to new releases",
                            },
                            {
                                icon: TrendingUp,
                                title: "Premium Support",
                                description: "Priority customer service",
                            },
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="text-center space-y-3"
                            >
                                <div className="flex justify-center">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-700">
                                        <benefit.icon className="w-8 h-8 text-purple-400" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-white">{benefit.title}</h4>
                                <p className="text-sm text-gray-400">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center mt-8 pt-6 border-t border-gray-700/50"
                >
                    <p className="text-sm text-gray-400">
                        All plans include a 7-day money-back guarantee. Cancel anytime.
                    </p>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
