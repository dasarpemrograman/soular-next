import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const curatedFilms = [
  {
    id: 1,
    title: "Melodi Nusantara",
    curator: "Rina Kartika",
    category: "Musikal",
    thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=900&fit=crop",
    duration: "108 min",
  },
  {
    id: 2,
    title: "Jejak Rimba",
    curator: "Ahmad Fadli",
    category: "Petualangan",
    thumbnail: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600&h=900&fit=crop",
    duration: "92 min",
  },
  {
    id: 3,
    title: "Suara Dari Timur",
    curator: "Maya Sari",
    category: "Drama",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop",
    duration: "115 min",
  },
  {
    id: 4,
    title: "Bayangan Masa Lalu",
    curator: "Budi Santoso",
    category: "Thriller",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop",
    duration: "98 min",
  },
];

export const CuratedSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Kurasi Spesial</span>
          </div>
          <h2 className="text-4xl font-bold mb-3">Pilihan Tim Soular</h2>
          <p className="text-muted-foreground max-w-2xl">
            Film-film terbaik yang dipilih khusus oleh kurator ahli kami, 
            menghadirkan cerita yang menginspirasi dan memukau.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {curatedFilms.map((film, index) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img 
                    src={film.thumbnail} 
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Button 
                    variant="premium" 
                    size="icon"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary mb-1">Dipilih oleh {film.curator}</p>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {film.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{film.category}</span>
                    <span>•</span>
                    <span>{film.duration}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Button variant="outline" size="lg">
            Lihat Semua Pilihan
          </Button>
        </div>
      </div>
    </section>
  );
};
