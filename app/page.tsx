"use client";

import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CuratedSection } from "@/components/CuratedSection";
import { ThematicCollections } from "@/components/ThematicCollections";
import { CommunityEvents } from "@/components/CommunityEvents";
import { Footer } from "@/components/Footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-16">
                <HeroSection />
                <CuratedSection />
                <ThematicCollections />
                <CommunityEvents />
            </main>
            <Footer />
        </div>
    );
}
