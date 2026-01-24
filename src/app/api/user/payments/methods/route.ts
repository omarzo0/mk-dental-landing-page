import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

/**
 * GET /api/user/payments/methods
 * Proxies request to the backend with orderAmount query parameter.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderAmount = searchParams.get("orderAmount");

        const targetUrl = new URL(`${API_BASE_URL}/api/user/payments/methods`);
        if (orderAmount) {
            targetUrl.searchParams.append("orderAmount", orderAmount);
        }

        const response = await fetch(targetUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            return NextResponse.json(
                { success: false, message: errorData.message || "Failed to fetch payment methods from backend" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Proxy payment methods error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error while proxying payment methods" },
            { status: 500 }
        );
    }
}
