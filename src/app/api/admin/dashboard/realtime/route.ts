import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export const dynamic = "force-dynamic";

// GET /api/admin/dashboard/realtime
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const apiUrl = `${API_BASE_URL}/api/admin/dashboard/realtime`;
        console.log("[Realtime Proxy] Fetching from:", apiUrl);
        console.log("[Realtime Proxy] Auth Header:", authHeader ? `${authHeader.substring(0, 20)}...` : "NONE");

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Authorization: authHeader || "",
                "Content-Type": "application/json",
            },
        });

        console.log("[Realtime Proxy] Backend Status:", response.status);

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Dashboard realtime fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while fetching realtime data" },
            { status: 500 }
        );
    }
}
