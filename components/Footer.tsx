import { Film, Mail, Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="bg-muted/30 border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Film className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                                Soular
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4">
                            Platform kurasi film Indonesia yang menghadirkan
                            karya sinematik terbaik dari seluruh nusantara.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="p-2 rounded-lg bg-card hover:bg-primary/10 transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg bg-card hover:bg-primary/10 transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg bg-card hover:bg-primary/10 transition-colors"
                            >
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Jelajahi</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/koleksi"
                                    className="hover:text-primary transition-colors"
                                >
                                    Koleksi Film
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/forum"
                                    className="hover:text-primary transition-colors"
                                >
                                    Forum Diskusi
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/acara"
                                    className="hover:text-primary transition-colors"
                                >
                                    Acara Komunitas
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Untuk Filmmaker</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Submit Film
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Dashboard Analytics
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Panduan Kurasi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Partnership
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Dukungan</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Pusat Bantuan
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Syarat & Ketentuan
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Kebijakan Privasi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:hello@soular.id"
                                    className="hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    hello@soular.id
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    <p>
                        © 2025 Soular. Platform kurasi film independen
                        Indonesia.
                    </p>
                </div>
            </div>
        </footer>
    );
};
