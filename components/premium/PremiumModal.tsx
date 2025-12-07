"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature?: string;
    title?: string;
    description?: string;
}

const premiumFeatures = [
    "Akses penuh ke 500+ film premium",
    "Streaming kualitas 4K Ultra HD",
    "Download untuk nonton offline",
    "Tanpa iklan sama sekali",
    "Early access ke film baru",
    "Akses semua acara komunitas",
    "Badge premium di profil",
    "Priority customer support",
];

export function PremiumModal({
    isOpen,
    onClose,
    feature,
    title,
    description,
}: PremiumModalProps) {
    const router = useRouter();
    const { user } = useAuth();

    const handleUpgrade = () => {
        onClose();
        if (!user) {
            router.push("/login?redirect=/premium");
        } else {
            router.push("/premium");
        }
    };

    const modalTitle = title || "Upgrade ke Premium";
    const modalDescription =
        description ||
        (feature
            ? `Fitur "${feature}" hanya tersedia untuk member Premium`
            : "Dapatkan akses penuh ke semua fitur premium kami");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-premium">
                            <Crown className="h-5 w-5 text-white" />
                        </div>
                        {modalTitle}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Description */}
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            {modalDescription}
                        </p>
                        {feature && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-sm">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                    Buka dengan Premium
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Premium Features */}
                    <div className="space-y-3 py-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                            Yang Anda Dapatkan:
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {premiumFeatures.map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="p-1 rounded-full bg-primary/10 shrink-0">
                                        <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="text-sm">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg p-6 text-center border border-primary/20">
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-4xl font-bold">
                                Rp 49.000
                            </span>
                            <span className="text-muted-foreground">
                                /bulan
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            atau Rp 490.000/tahun (hemat 2 bulan!)
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <Button
                            variant="premium"
                            size="lg"
                            className="w-full"
                            onClick={handleUpgrade}
                        >
                            <Crown className="mr-2 h-5 w-5" />
                            Upgrade ke Premium
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={onClose}
                        >
                            Nanti Saja
                        </Button>
                    </div>

                    {/* Trust Badge */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            ✓ Garansi 7 hari uang kembali
                            <br />✓ Batalkan kapan saja
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Hook to manage premium modal state
export function usePremiumModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [feature, setFeature] = useState<string | undefined>();

    const open = (featureName?: string) => {
        setFeature(featureName);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setFeature(undefined);
    };

    return {
        isOpen,
        feature,
        open,
        close,
        PremiumModal: () => (
            <PremiumModal isOpen={isOpen} onClose={close} feature={feature} />
        ),
    };
}
