import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

/**
 * GET /api/user/coupons
 * Proxies the request to fetch all active public coupons from the backend.
 */
export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/coupons`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch coupons" },
            { status: response.status }
        );

    } catch (error) {
        console.error("Fetch coupons error:", error);
        return NextResponse.json(
            { success: false, message: "Server error during fetch coupons" },
            { status: 500 }
        );
    }
}
