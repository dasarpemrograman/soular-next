"use client";

interface YouTubePlayerProps {
    url: string;
    title?: string;
    autoplay?: boolean;
    controls?: boolean;
    className?: string;
}

export const YouTubePlayer = ({
    url,
    title = "YouTube video player",
    autoplay = false,
    controls = true,
    className = "",
}: YouTubePlayerProps) => {
    // Extract video ID from various YouTube URL formats
    const getVideoId = (url: string): string | null => {
        try {
            // Handle youtu.be short links
            if (url.includes("youtu.be/")) {
                const match = url.match(/youtu\.be\/([^?&]+)/);
                return match ? match[1] : null;
            }

            // Handle youtube.com links
            if (url.includes("youtube.com")) {
                const urlObj = new URL(url);
                return urlObj.searchParams.get("v");
            }

            // Handle embed links
            if (url.includes("youtube.com/embed/")) {
                const match = url.match(/embed\/([^?&]+)/);
                return match ? match[1] : null;
            }

            return null;
        } catch (error) {
            console.error("Error parsing YouTube URL:", error);
            return null;
        }
    };

    const videoId = getVideoId(url);

    if (!videoId) {
        return (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Invalid YouTube URL</p>
            </div>
        );
    }

    // Build embed URL with parameters
    const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
        autoplay: autoplay ? "1" : "0",
        controls: controls ? "1" : "0",
        modestbranding: "1",
        rel: "0",
    }).toString()}`;

    return (
        <div className={`relative aspect-video overflow-hidden rounded-lg ${className}`}>
            <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
            />
        </div>
    );
};
