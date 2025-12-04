import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const HeroSection = () => {
    return (
        <section className="relative h-[90vh] flex items-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src="/assets/hero-bg.jpg"
                    alt="Featured Film"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-primary">
                            Pilihan Kurator Hari Ini
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Kisah Kota
                        <br />
                        <span className="bg-gradient-premium bg-clip-text text-transparent">
                            Yang Terlupakan
                        </span>
                    </h1>

                    <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                        Sebuah dokumenter mendalam tentang transformasi Bandung
                        dari masa kolonial hingga era digital, melalui mata para
                        seniman lokal.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Button variant="premium" size="lg" className="gap-2">
                            <Play className="h-5 w-5" />
                            Tonton Sekarang
                        </Button>
                        <Button variant="hero" size="lg">
                            Selengkapnya
                        </Button>
                    </div>

                    <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                        <span>2024</span>
                        <span>•</span>
                        <span>95 menit</span>
                        <span>•</span>
                        <span>Dokumenter</span>
                        <span>•</span>
                        <span className="text-primary">4K Premium</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
