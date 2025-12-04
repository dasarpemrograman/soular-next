import { motion } from "framer-motion";
import { Calendar, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const events = [
  {
    id: 1,
    title: "Live Q&A dengan Garin Nugroho",
    date: "28 Nov 2025",
    time: "19:00 WIB",
    type: "Live Q&A",
    attendees: 245,
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
  },
  {
    id: 2,
    title: "Nonton Bareng: Dokumenter Lokal",
    date: "30 Nov 2025",
    time: "20:00 WIB",
    type: "Watch Party",
    attendees: 189,
    thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
  },
  {
    id: 3,
    title: "Workshop: Sinematografi untuk Pemula",
    date: "2 Des 2025",
    time: "15:00 WIB",
    type: "Workshop",
    attendees: 156,
    thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=500&fit=crop",
  },
];

export const CommunityEvents = () => {
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
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Acara Mendatang</span>
          </div>
          <h2 className="text-4xl font-bold mb-3">Bergabung dengan Komunitas</h2>
          <p className="text-muted-foreground max-w-2xl">
            Ikuti sesi interaktif dengan filmmaker dan sesama pecinta film
          </p>
        </motion.div>

        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
                <div className="grid md:grid-cols-[300px_1fr] gap-6">
                  <div className="relative aspect-video md:aspect-auto overflow-hidden">
                    <img 
                      src={event.thumbnail} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-foreground">
                      {event.type}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees} peserta</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="premium">
                        Daftar Sekarang
                      </Button>
                      <Button variant="outline">
                        Pelajari Lebih Lanjut
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
