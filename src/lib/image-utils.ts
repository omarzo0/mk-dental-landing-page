/**
 * Centralized utility for resolving image URLs from the backend.
 * Handles absolute URLs, relative paths, and local development hostname mapping.
 */

const BACKEND_URL = "http://localhost:9000"; // Based on previous implementation patterns
const PLACEHOLDER_IMAGE = "/placeholder.svg";

export function resolveImageUrl(url: any): string {
    if (!url) return PLACEHOLDER_IMAGE;

    let urlString = "";
    if (typeof url === "string") {
        urlString = url;
    } else if (typeof url === "object" && url !== null) {
        urlString = url.url || url.secure_url || url.imageUrl || url.image || url.path || "";
    }

    if (!urlString) return PLACEHOLDER_IMAGE;

    // Handle data URLs directly
    if (urlString.startsWith("data:")) return urlString;
    if (urlString === "/placeholder.svg") return urlString;

    let resolved = urlString;

    // 1. Determine if it's already an absolute URL
    const isAbsolute = urlString.startsWith("http://") || urlString.startsWith("https://") || urlString.startsWith("//");

    if (isAbsolute) {
        // If it's an absolute URL to our local backend, convert it to a relative path so it's proxied
        if (urlString.includes("localhost:9000") || urlString.includes("127.0.0.1:9000")) {
            resolved = urlString
                .replace("http://localhost:9000", "")
                .replace("http://127.0.0.1:9000", "");
        }
    } else {
        // It's a relative path. Use a relative path that will be proxied by Next.js rewrites.
        const cleanPath = urlString.replace(/^\/+/, "");
        resolved = `/${cleanPath}`;
    }

    // 2. Handle 127.0.0.1 vs localhost for local development compatibility (for any remaining absolute URLs)
    if (resolved.includes("127.0.0.1")) {
        resolved = resolved.replace("127.0.0.1", "localhost");
    }

    return resolved;
}

/**
 * Determines if an image URL should be unoptimized for Next.js Image component.
 * Typically used for local development URLs or external APIs that don't support optimization.
 */
export function isUnoptimizedImage(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.includes("localhost") || url.includes("127.0.0.1") || url.startsWith("http");
}
