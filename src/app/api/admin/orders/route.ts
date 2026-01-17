import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// GET /api/admin/orders - Get all orders with filters and pagination
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        // Forward all query parameters
        const searchParams = request.nextUrl.searchParams.toString();
        const url = `${API_BASE_URL}/api/admin/orders${searchParams ? `?${searchParams}` : ""}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin get orders error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while fetching orders" },
            { status: 500 }
        );
    }
}
