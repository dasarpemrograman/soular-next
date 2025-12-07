"use client";

import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreateDiscussion } from "@/hooks/useForum";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
    { value: "general", label: "Diskusi Umum" },
    { value: "filmmaking", label: "Pembuatan Film" },
    { value: "technical", label: "Teknis" },
    { value: "showcase", label: "Showcase" },
    { value: "feedback", label: "Feedback" },
    { value: "events", label: "Event" },
    { value: "other", label: "Lainnya" },
];

export default function NewDiscussion() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const createDiscussion = useCreateDiscussion();

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = "Judul diskusi harus diisi";
        } else if (title.length < 10) {
            newErrors.title = "Judul minimal 10 karakter";
        }

        if (!content.trim()) {
            newErrors.content = "Konten diskusi harus diisi";
        } else if (content.length < 20) {
            newErrors.content = "Konten minimal 20 karakter";
        }

        if (!category) {
            newErrors.category = "Kategori harus dipilih";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const tagArray = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

        createDiscussion.mutate({
            title: title.trim(),
            content: content.trim(),
            category,
            tags: tagArray.length > 0 ? tagArray : undefined,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <Link href="/forum">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Forum
                            </Button>
                        </Link>

                        <h1 className="text-4xl font-bold mb-4">
                            Buat Diskusi Baru
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Mulai diskusi baru dengan komunitas Soular
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Judul Diskusi *
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Masukkan judul diskusi yang menarik..."
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        className={
                                            errors.title
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">
                                            {errors.title}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {title.length}/200 karakter
                                    </p>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori *</Label>
                                    <Select
                                        value={category}
                                        onValueChange={setCategory}
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.category
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih kategori diskusi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem
                                                    key={cat.value}
                                                    value={cat.value}
                                                >
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-destructive">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <Label htmlFor="content">
                                        Konten Diskusi *
                                    </Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Tuliskan detail diskusi Anda di sini..."
                                        value={content}
                                        onChange={(e) =>
                                            setContent(e.target.value)
                                        }
                                        rows={10}
                                        className={
                                            errors.content
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-destructive">
                                            {errors.content}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {content.length} karakter
                                    </p>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tag (opsional)</Label>
                                    <Input
                                        id="tags"
                                        type="text"
                                        placeholder="Pisahkan dengan koma, contoh: horror, thriller, indonesia"
                                        value={tags}
                                        onChange={(e) =>
                                            setTags(e.target.value)
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Tag membantu orang menemukan diskusi
                                        Anda
                                    </p>
                                </div>

                                {/* Error Message */}
                                {createDiscussion.error && (
                                    <Card className="p-4 bg-destructive/10 border-destructive/20">
                                        <p className="text-sm text-destructive">
                                            {createDiscussion.error.message}
                                        </p>
                                    </Card>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={createDiscussion.isPending}
                                        className="flex-1"
                                    >
                                        {createDiscussion.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Membuat...
                                            </>
                                        ) : (
                                            "Buat Diskusi"
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={createDiscussion.isPending}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Guidelines */}
                        <Card className="mt-6 p-6 bg-muted/50">
                            <h3 className="font-semibold mb-3">
                                Pedoman Diskusi
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    • Gunakan judul yang jelas dan deskriptif
                                </li>
                                <li>
                                    • Hormati pendapat dan pandangan orang lain
                                </li>
                                <li>
                                    • Tetap relevan dengan topik film dan sinema
                                </li>
                                <li>
                                    • Hindari spam, bahasa kasar, atau konten
                                    yang tidak pantas
                                </li>
                                <li>• Gunakan kategori dan tag yang sesuai</li>
                            </ul>
                        </Card>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
