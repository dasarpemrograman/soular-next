import { motion } from "framer-motion";
import { Film, Compass, Heart, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const collections = [
  {
    id: 1,
    title: "Dokumenter Kota Bandung",
    description: "Jelajahi sejarah dan transformasi Kota Kembang",
    icon: Compass,
    filmCount: 12,
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: 2,
    title: "Sinema dengan Sentuhan Ajaib",
    description: "Realisme magis dalam karya sineas Indonesia",
    icon: Zap,
    filmCount: 8,
    color: "from-teal-500/20 to-cyan-500/20",
  },
  {
    id: 3,
    title: "Kisah Lokal, Resonansi Global",
    description: "Cerita dari Indonesia untuk dunia",
    icon: Heart,
    filmCount: 15,
    color: "from-rose-500/20 to-pink-500/20",
  },
  {
    id: 4,
    title: "Avant-Garde Indonesia",
    description: "Eksperimen berani sineas kontemporer",
    icon: Film,
    filmCount: 10,
    color: "from-violet-500/20 to-purple-500/20",
  },
];

export const ThematicCollections = () => {
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
            Temukan film berdasarkan tema unik yang dikurasi khusus untuk Anda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((collection, index) => {
            const Icon = collection.icon;
            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`group relative overflow-hidden bg-gradient-to-br ${collection.color} backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 cursor-pointer`}>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {collection.filmCount} film
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
