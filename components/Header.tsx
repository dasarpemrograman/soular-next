import { Film, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Film className="h-7 w-7 text-primary group-hover:text-primary/80 transition-colors" />
                    <span className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                        Soular
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Beranda
                    </Link>
                    <Link
                        href="/forum"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Forum
                    </Link>
                    <Link
                        href="/koleksi"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Koleksi
                    </Link>
                    <Link
                        href="/acara"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Acara
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden md:flex"
                    >
                        <User className="h-4 w-4" />
                        Masuk
                    </Button>
                    <Button
                        variant="premium"
                        size="sm"
                        className="hidden md:flex"
                    >
                        Premium
                    </Button>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
};
