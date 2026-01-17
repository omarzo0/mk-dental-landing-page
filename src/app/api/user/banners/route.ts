import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

/**
 * GET /api/user/banners
 * Fetches active banners from the backend.
 * If ?position=hero is provided, returns an array of banners for that position only.
 * Otherwise, returns an object grouped by position (hero, secondary, promotional).
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const position = searchParams.get("position");

        let backendUrl = `${API_BASE_URL}/api/user/banners`;
        if (position) {
            backendUrl += `?position=${encodeURIComponent(position)}`;
        }

        console.log("[User Banners] Fetching from:", backendUrl);

        const response = await fetch(backendUrl, {
            cache: "no-store",
        });

        const data = await response.json() as { success?: boolean; message?: string; data?: unknown };

        console.log("[User Banners] Backend response status:", response.status);

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to fetch banners",
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[User Banners] Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error fetching banners" },
            { status: 500 }
        );
    }
}
