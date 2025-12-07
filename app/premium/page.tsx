"use client";

import { motion } from "framer-motion";
import { Check, Crown, Star, Zap, Film, Users, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const pricingPlans = [
    {
        name: "Free",
        price: "Rp 0",
        period: "selamanya",
        description: "Sempurna untuk memulai perjalanan sinema Anda",
        features: [
            "Akses ke film gratis pilihan",
            "Forum komunitas",
            "Acara komunitas terbatas",
            "Kualitas streaming standar (720p)",
            "Iklan pada beberapa konten",
        ],
        notIncluded: [
            "Akses ke semua film premium",
            "Download offline",
            "Kualitas 4K",
            "Tanpa iklan",
            "Early access ke konten baru",
        ],
        color: "from-gray-500/20 to-slate-500/20",
        buttonText: "Paket Saat Ini",
        buttonVariant: "outline" as const,
        popular: false,
    },
    {
        name: "Premium",
        price: "Rp 49.000",
        period: "per bulan",
        description: "Untuk pecinta film sejati yang ingin lebih",
        features: [
            "Akses PENUH ke semua film",
            "Tanpa iklan sama sekali",
            "Streaming kualitas 4K Ultra HD",
            "Download untuk nonton offline",
            "Early access ke film baru",
            "Akses ke semua acara komunitas",
            "Priority customer support",
            "Badge premium di profil",
        ],
        notIncluded: [],
        color: "from-amber-500/20 to-orange-500/20",
        buttonText: "Mulai Premium",
        buttonVariant: "premium" as const,
        popular: true,
        savings: "Hemat Rp 100.000 vs beli film satuan!",
    },
    {
        name: "Annual",
        price: "Rp 490.000",
        period: "per tahun",
        description: "Hemat 2 bulan dengan berlangganan tahunan",
        features: [
            "Semua fitur Premium",
            "Hemat Rp 98.000 per tahun",
            "Merchandise eksklusif",
            "Meet & greet dengan filmmaker",
            "Voting untuk konten selanjutnya",
            "Behind-the-scenes exclusive",
            "Private screening events",
            "Lifetime archive access",
        ],
        notIncluded: [],
        color: "from-violet-500/20 to-purple-500/20",
        buttonText: "Berlangganan Tahunan",
        buttonVariant: "default" as const,
        popular: false,
        badge: "Best Value",
    },
];

const premiumBenefits = [
    {
        icon: Film,
        title: "Koleksi Film Tanpa Batas",
        description: "Akses ke 500+ film independen Indonesia berkualitas tinggi",
    },
    {
        icon: Crown,
        title: "Pengalaman Tanpa Iklan",
        description: "Nikmati film tanpa gangguan iklan apapun",
    },
    {
        icon: Download,
        title: "Download & Tonton Offline",
        description: "Download film favorit untuk ditonton kapan saja, bahkan tanpa internet",
    },
    {
        icon: Zap,
        title: "Kualitas Streaming 4K",
        description: "Streaming dalam kualitas ultra HD untuk pengalaman sinematik terbaik",
    },
    {
        icon: Users,
        title: "Komunitas Eksklusif",
        description: "Bergabung dengan komunitas premium dan akses acara khusus",
    },
    {
        icon: Star,
        title: "Early Access",
        description: "Tonton film baru sebelum diluncurkan untuk publik",
    },
];

export default function PremiumPage() {
    const { user } = useAuth();
    const router = useRouter();
    const isPremium = false; // TODO: Check actual premium status from user profile

    const handleSubscribe = (plan: string) => {
        if (!user) {
            router.push("/login?redirect=/premium");
            return;
        }
        // TODO: Implement payment integration
        alert(`Coming soon! Premium subscription will be available soon.\n\nSelected plan: ${plan}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-20">
                {/* Hero Section */}
                <section className="py-20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-background">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-premium rounded-full text-primary-foreground mb-6">
                                <Crown className="h-4 w-4" />
                                <span className="text-sm font-medium">Upgrade ke Premium</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6">
                                Rasakan Pengalaman
                                <span className="block bg-gradient-premium bg-clip-text text-transparent">
                                    Sinema Tanpa Batas
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                Akses penuh ke seluruh koleksi film independen Indonesia,
                                tanpa iklan, dengan kualitas terbaik. Dukung sineas lokal
                                sambil menikmati karya mereka.
                            </p>
                            {isPremium && (
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg text-primary font-medium">
                                    <Check className="h-5 w-5" />
                                    <span>Anda sudah Premium member!</span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl font-bold mb-4">
                                Kenapa Pilih Premium?
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Lebih dari sekedar streaming, ini adalah investasi untuk
                                industri film Indonesia
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {premiumBenefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <motion.div
                                        key={benefit.title}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Card className="p-6 h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
                                            <div className="p-3 rounded-lg bg-gradient-premium w-fit mb-4">
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {benefit.description}
                                            </p>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl font-bold mb-4">
                                Pilih Paket yang Tepat
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {pricingPlans.map((plan, index) => (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative"
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-premium rounded-full text-xs font-semibold text-white">
                                            Most Popular
                                        </div>
                                    )}
                                    {plan.badge && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-semibold text-primary-foreground">
                                            {plan.badge}
                                        </div>
                                    )}
                                    <Card
                                        className={`p-8 h-full flex flex-col bg-gradient-to-br ${plan.color} backdrop-blur-sm border-border ${
                                            plan.popular
                                                ? "border-primary/50 shadow-lg shadow-primary/20"
                                                : "hover:border-primary/30"
                                        } transition-all duration-300`}
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold mb-2">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-4xl font-bold">
                                                    {plan.price}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    /{plan.period}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {plan.description}
                                            </p>
                                            {plan.savings && (
                                                <p className="text-sm text-primary font-medium mt-2">
                                                    💰 {plan.savings}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex-1 mb-6">
                                            <div className="space-y-3">
                                                {plan.features.map((feature) => (
                                                    <div
                                                        key={feature}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                        <span className="text-sm">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ))}
                                                {plan.notIncluded.map((feature) => (
                                                    <div
                                                        key={feature}
                                                        className="flex items-start gap-3 opacity-40"
                                                    >
                                                        <div className="h-5 w-5 shrink-0 mt-0.5 flex items-center justify-center">
                                                            <div className="h-0.5 w-3 bg-muted-foreground" />
                                                        </div>
                                                        <span className="text-sm line-through">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            variant={plan.buttonVariant}
                                            size="lg"
                                            className="w-full"
                                            onClick={() => handleSubscribe(plan.name)}
                                            disabled={plan.name === "Free" && !isPremium}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Money Back Guarantee */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-center mt-12"
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-sm border border-border rounded-lg">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="text-sm">
                                    <strong>Garansi 7 hari</strong> - Tidak puas? Kami
                                    kembalikan uang Anda 100%
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                        </motion.div>

                        <div className="space-y-6">
                            {[
                                {
                                    q: "Apakah saya bisa membatalkan kapan saja?",
                                    a: "Ya, Anda bisa membatalkan langganan premium kapan saja tanpa penalti. Akses premium akan tetap aktif hingga akhir periode pembayaran.",
                                },
                                {
                                    q: "Berapa banyak film yang tersedia?",
                                    a: "Kami memiliki 500+ film independen Indonesia berkualitas tinggi, dengan penambahan konten baru setiap minggu.",
                                },
                                {
                                    q: "Apakah bisa download untuk nonton offline?",
                                    a: "Ya! Member premium bisa download film untuk ditonton offline di aplikasi mobile kami (coming soon).",
                                },
                                {
                                    q: "Bagaimana cara pembayarannya?",
                                    a: "Kami menerima berbagai metode pembayaran termasuk kartu kredit/debit, e-wallet, dan transfer bank melalui payment gateway yang aman.",
                                },
                            ].map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className="p-6 bg-card/50 backdrop-blur-sm">
                                        <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                                        <p className="text-muted-foreground">{faq.a}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-3xl mx-auto"
                        >
                            <Crown className="h-16 w-16 text-primary mx-auto mb-6" />
                            <h2 className="text-4xl font-bold mb-4">
                                Siap Merasakan Premium?
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Bergabunglah dengan ribuan pecinta film yang sudah
                                menikmati pengalaman premium kami
                            </p>
                            <Button
                                variant="premium"
                                size="lg"
                                className="text-lg px-8 py-6"
                                onClick={() => handleSubscribe("Premium")}
                            >
                                Mulai Premium Sekarang
                            </Button>
                            <p className="text-sm text-muted-foreground mt-4">
                                Garansi 7 hari uang kembali • Batalkan kapan saja
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
