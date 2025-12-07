"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Film, Upload, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
    "Dokumenter",
    "Drama",
    "Eksperimental",
    "Musikal",
    "Thriller",
    "Horor",
    "Komedi",
    "Petualangan",
];

export default function UploadFilmPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        director: "",
        year: new Date().getFullYear(),
        duration: 0,
        category: "",
        youtube_url: "",
        thumbnail: "",
        is_premium: false,
        is_published: true,
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "year" || name === "duration"
                    ? parseInt(value) || 0
                    : value,
        }));

        // Auto-generate slug from title
        if (name === "title") {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleCategoryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, category: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.director || !formData.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!formData.youtube_url) {
            toast.error("YouTube URL is required");
            return;
        }

        if (formData.duration <= 0) {
            toast.error("Duration must be greater than 0");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/films", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to upload film");
            }

            const data = await response.json();
            toast.success("Film uploaded successfully!", {
                description: `"${formData.title}" has been added to the platform.`,
            });

            // Redirect to the newly created film page
            router.push(`/film/${data.film.slug}`);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to upload film",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!user && !loading) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            Upload Film
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Share your documentary with the Soular community
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Film className="w-5 h-5" />
                                Film Details
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Fill in the information about your film
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="title"
                                        className="text-white"
                                    >
                                        Title{" "}
                                        <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter film title"
                                        className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                                        required
                                    />
                                </div>

                                {/* Slug (auto-generated, read-only) */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="slug"
                                        className="text-white"
                                    >
                                        URL Slug (auto-generated)
                                    </Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        readOnly
                                        className="bg-gray-900/30 border-gray-600 text-gray-400"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="description"
                                        className="text-white"
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe your film..."
                                        rows={5}
                                        className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                                    />
                                </div>

                                {/* Director & Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="director"
                                            className="text-white"
                                        >
                                            Director{" "}
                                            <span className="text-red-400">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="director"
                                            name="director"
                                            value={formData.director}
                                            onChange={handleInputChange}
                                            placeholder="Director name"
                                            className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="category"
                                            className="text-white"
                                        >
                                            Category{" "}
                                            <span className="text-red-400">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={handleCategoryChange}
                                        >
                                            <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700">
                                                {CATEGORIES.map((cat) => (
                                                    <SelectItem
                                                        key={cat}
                                                        value={cat}
                                                        className="text-white hover:bg-gray-700"
                                                    >
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Year & Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="year"
                                            className="text-white"
                                        >
                                            Year{" "}
                                            <span className="text-red-400">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="year"
                                            name="year"
                                            type="number"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            className="bg-gray-900/50 border-gray-600 text-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="duration"
                                            className="text-white"
                                        >
                                            Duration (minutes){" "}
                                            <span className="text-red-400">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            type="number"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            min="1"
                                            placeholder="e.g. 90"
                                            className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* YouTube URL */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="youtube_url"
                                        className="text-white"
                                    >
                                        YouTube URL{" "}
                                        <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="youtube_url"
                                        name="youtube_url"
                                        type="url"
                                        value={formData.youtube_url}
                                        onChange={handleInputChange}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Paste the full YouTube video URL
                                    </p>
                                </div>

                                {/* Thumbnail URL */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="thumbnail"
                                        className="text-white"
                                    >
                                        Thumbnail URL
                                    </Label>
                                    <Input
                                        id="thumbnail"
                                        name="thumbnail"
                                        type="url"
                                        value={formData.thumbnail}
                                        onChange={handleInputChange}
                                        placeholder="https://images.unsplash.com/..."
                                        className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Optional: URL to film poster/thumbnail
                                        image
                                    </p>
                                </div>

                                {/* Checkboxes */}
                                <div className="space-y-4 pt-4 border-t border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_premium"
                                            checked={formData.is_premium}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    "is_premium",
                                                    checked as boolean,
                                                )
                                            }
                                            className="border-gray-600"
                                        />
                                        <Label
                                            htmlFor="is_premium"
                                            className="text-white cursor-pointer"
                                        >
                                            Mark as Premium Content
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_published"
                                            checked={formData.is_published}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    "is_published",
                                                    checked as boolean,
                                                )
                                            }
                                            className="border-gray-600"
                                        />
                                        <Label
                                            htmlFor="is_published"
                                            className="text-white cursor-pointer"
                                        >
                                            Publish immediately
                                        </Label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex-1"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Film
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={isSubmitting}
                                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
