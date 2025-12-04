import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const poppins = Poppins({
    weight: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin"],
    variable: "--font-poppins",
});

export const metadata: Metadata = {
    title: "Soular - Platform Kurasi Film Indonesia",
    description:
        "Platform kurasi film independen Indonesia yang menghadirkan karya sinematik terbaik dari seluruh nusantara. Temukan film-film berkualitas yang dipilih oleh kurator ahli.",
    authors: [{ name: "Soular" }],
    openGraph: {
        title: "Soular - Platform Kurasi Film Indonesia",
        description:
            "Platform kurasi film independen Indonesia yang menghadirkan karya sinematik terbaik dari seluruh nusantara.",
        type: "website",
        images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
    },
    twitter: {
        card: "summary_large_image",
        site: "@Soular",
        images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body className={`${poppins.variable} font-sans antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
