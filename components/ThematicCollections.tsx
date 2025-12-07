import { motion } from "framer-motion";
import { Film, Compass, Heart, Zap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCollections } from "@/hooks/useCollections";
import Link from "next/link";

// Icon mapping for dynamic icon names
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Film,
    Compass,
    Heart,
    Zap,
};

export const ThematicCollections = () => {
    const { data, isLoading, error } = useCollections(1, 4);
    const collections = data?.collections || [];

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-4xl font-bold mb-3">Koleksi Tematik</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Temukan film berdasarkan tema unik yang dikurasi khusus
                        untuk Anda
                    </p>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            Failed to load collections. Please try again later.
                        </p>
                    </div>
                )}

                {/* Collections Grid */}
                {!isLoading && !error && collections.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {collections.map((collection, index) => {
                            const Icon =
                                iconMap[collection.icon || "Film"] || Film;
                            return (
                                <motion.div
                                    key={collection.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Link
                                        href={`/collections/${collection.slug}`}
                                    >
                                        <Card
                                            className={`group relative overflow-hidden bg-gradient-to-br ${collection.color || "from-violet-500/20 to-purple-500/20"} backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 cursor-pointer`}
                                        >
                                            <div className="p-8">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                                                        <Icon className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {collection.film_count}{" "}
                                                        film
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                    {collection.title}
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {collection.description}
                                                </p>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-premium transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && collections.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            No collections available at the moment.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};
