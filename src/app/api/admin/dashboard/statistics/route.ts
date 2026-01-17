import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export const dynamic = "force-dynamic";

// GET /api/admin/dashboard/statistics
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get("period") || "30d";

        const apiUrl = `${API_BASE_URL}/api/admin/dashboard/statistics?period=${period}`;
        console.log("[Stats Proxy] Fetching from:", apiUrl);
        console.log("[Stats Proxy] Auth Header:", authHeader ? `${authHeader.substring(0, 20)}...` : "NONE");

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Authorization: authHeader || "",
                "Content-Type": "application/json",
            },
        });

        console.log("[Stats Proxy] Backend Status:", response.status);

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Dashboard statistics fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while fetching dashboard statistics" },
            { status: 500 }
        );
    }
}
