"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Film, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Film {
    id: string;
    title: string;
    description: string;
    category: string;
    youtube_url: string;
    thumbnail: string | null;
    duration: number | null;
    created_at: string;
}

interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export default function TestFilmsAPIPage() {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
    });

    // Filter states
    const [category, setCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);

    // Single film test
    const [filmId, setFilmId] = useState("");
    const [singleFilm, setSingleFilm] = useState<Film | null>(null);
    const [singleLoading, setSingleLoading] = useState(false);
    const [singleError, setSingleError] = useState<string | null>(null);

    const fetchFilms = async (offset = 0) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
            });

            if (category !== "all") {
                params.append("category", category);
            }

            if (search) {
                params.append("search", search);
            }

            const response = await fetch(`/api/films?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch films");
            }

            setFilms(data.films);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleFilm = async () => {
        if (!filmId) {
            setSingleError("Please enter a film ID");
            return;
        }

        setSingleLoading(true);
        setSingleError(null);
        setSingleFilm(null);

        try {
            const response = await fetch(`/api/films/${filmId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch film");
            }

            setSingleFilm(data.film);
        } catch (err) {
            setSingleError(
                err instanceof Error ? err.message : "Unknown error",
            );
        } finally {
            setSingleLoading(false);
        }
    };

    useEffect(() => {
        fetchFilms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNextPage = () => {
        const newOffset = pagination.offset + pagination.limit;
        fetchFilms(newOffset);
    };

    const handlePrevPage = () => {
        const newOffset = Math.max(0, pagination.offset - pagination.limit);
        fetchFilms(newOffset);
    };

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-6xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold">Films API Test</h1>
                    <p className="text-muted-foreground">
                        Test the films API endpoints with filtering and
                        pagination
                    </p>
                </div>

                {/* List Films Section */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">GET /api/films</h2>

                    {/* Filters */}
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-background"
                            >
                                <option value="all">All Categories</option>
                                <option value="drama">Drama</option>
                                <option value="romance">Romance</option>
                                <option value="action">Action</option>
                                <option value="comedy">Comedy</option>
                                <option value="documentary">Documentary</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search title or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="limit">Results per page</Label>
                            <Input
                                id="limit"
                                type="number"
                                min="1"
                                max="50"
                                value={limit}
                                onChange={(e) =>
                                    setLimit(parseInt(e.target.value) || 10)
                                }
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => fetchFilms(0)}
                        disabled={loading}
                        className="mb-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Search Films
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {films.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {pagination.offset + 1} to{" "}
                                    {Math.min(
                                        pagination.offset + pagination.limit,
                                        pagination.total,
                                    )}{" "}
                                    of {pagination.total} results
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {films.map((film) => (
                                    <Card key={film.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-12 w-12 rounded-lg bg-gradient-premium flex items-center justify-center flex-shrink-0">
                                                <Film className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">
                                                    {film.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {film.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                        {film.category}
                                                    </span>
                                                    {film.duration && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {film.duration} min
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 font-mono">
                                                    ID: {film.id}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <Button
                                    onClick={handlePrevPage}
                                    disabled={
                                        pagination.offset === 0 || loading
                                    }
                                    variant="outline"
                                    size="sm"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasMore || loading}
                                    variant="outline"
                                    size="sm"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No films found
                        </div>
                    )}
                </Card>

                {/* Single Film Section */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        GET /api/films/[id]
                    </h2>

                    <div className="flex gap-3 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter film ID..."
                                value={filmId}
                                onChange={(e) => setFilmId(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={fetchSingleFilm}
                            disabled={singleLoading}
                        >
                            {singleLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Fetch Film"
                            )}
                        </Button>
                    </div>

                    {singleError && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {singleError}
                            </p>
                        </div>
                    )}

                    {singleFilm && (
                        <Card className="p-6 bg-muted">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-lg bg-gradient-premium flex items-center justify-center flex-shrink-0">
                                    <Film className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2">
                                        {singleFilm.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {singleFilm.description}
                                    </p>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                ID:
                                            </span>
                                            <span className="font-mono">
                                                {singleFilm.id}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Category:
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                {singleFilm.category}
                                            </span>
                                        </div>
                                        {singleFilm.duration && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Duration:
                                                </span>
                                                <span>
                                                    {singleFilm.duration}{" "}
                                                    minutes
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                YouTube URL:
                                            </span>
                                            <a
                                                href={singleFilm.youtube_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline truncate max-w-xs"
                                            >
                                                {singleFilm.youtube_url}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </Card>

                {/* API Info */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-semibold mb-2">
                                GET /api/films
                            </h3>
                            <p className="text-muted-foreground mb-2">
                                Query Parameters:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                                <li>
                                    <code>category</code> - Filter by category
                                </li>
                                <li>
                                    <code>search</code> - Search in title and
                                    description
                                </li>
                                <li>
                                    <code>limit</code> - Results per page
                                    (default: 10)
                                </li>
                                <li>
                                    <code>offset</code> - Pagination offset
                                    (default: 0)
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">
                                GET /api/films/[id]
                            </h3>
                            <p className="text-muted-foreground">
                                Returns a single film by ID
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
