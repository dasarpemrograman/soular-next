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
import { useDiscussion, useUpdateDiscussion } from "@/hooks/useForum";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const CATEGORIES = [
    "Analisis Film",
    "Behind The Scenes",
    "Diskusi Umum",
    "Rekomendasi",
    "Komunitas",
    "Teknis",
];

interface Discussion {
    id: string;
    title: string;
    content: string;
    category: string;
    tags?: string[];
    is_author?: boolean;
}

function EditDiscussionForm({
    discussion,
    discussionId,
}: {
    discussion: Discussion;
    discussionId: string;
}) {
    const router = useRouter();
    const updateDiscussion = useUpdateDiscussion(discussionId);

    const [title, setTitle] = useState(discussion.title);
    const [content, setContent] = useState(discussion.content);
    const [category, setCategory] = useState(discussion.category);
    const [tags, setTags] = useState(discussion.tags?.join(", ") || "");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0);

        updateDiscussion.mutate(
            {
                title: title.trim(),
                content: content.trim(),
                category,
                tags: tagArray.length > 0 ? tagArray : undefined,
            },
            {
                onSuccess: () => {
                    router.push(`/forum/${discussionId}`);
                },
            },
        );
    };

    if (!discussion.is_author) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Card className="p-12 text-center bg-destructive/10 border-destructive/20">
                            <h2 className="text-2xl font-bold mb-4 text-destructive">
                                Akses Ditolak
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Anda tidak memiliki izin untuk mengedit diskusi
                                ini
                            </p>
                            <Link href={`/forum/${discussionId}`}>
                                <Button>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Diskusi
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

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
                        <Link href={`/forum/${discussionId}`}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Diskusi
                            </Button>
                        </Link>

                        <h1 className="text-4xl font-bold mb-4">
                            Edit Diskusi
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Perbarui diskusi Anda
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
                                                    key={cat}
                                                    value={cat}
                                                >
                                                    {cat}
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
                                {updateDiscussion.error && (
                                    <Card className="p-4 bg-destructive/10 border-destructive/20">
                                        <p className="text-sm text-destructive">
                                            {updateDiscussion.error.message}
                                        </p>
                                    </Card>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={updateDiscussion.isPending}
                                        className="flex-1"
                                    >
                                        {updateDiscussion.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            "Simpan Perubahan"
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.push(
                                                `/forum/${discussionId}`,
                                            )
                                        }
                                        disabled={updateDiscussion.isPending}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function EditDiscussion() {
    const params = useParams();
    const discussionId = params.id as string;

    const {
        data: discussion,
        isLoading: discussionLoading,
        error: discussionError,
    } = useDiscussion(discussionId);

    if (discussionLoading || !discussion) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">
                                Memuat diskusi...
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (discussionError) {
        return (
            <div className="min-h-screen bg-background">
                <main className="pt-24 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Card className="p-12 text-center bg-destructive/10 border-destructive/20">
                            <h2 className="text-2xl font-bold mb-4 text-destructive">
                                Diskusi Tidak Ditemukan
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                {discussionError?.message ||
                                    "Diskusi yang Anda cari tidak ditemukan"}
                            </p>
                            <Link href="/forum">
                                <Button>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Forum
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <EditDiscussionForm
            key={discussion.id}
            discussion={discussion}
            discussionId={discussionId}
        />
    );
}
