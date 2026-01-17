import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// GET /api/admin/shipping-fees - Get all shipping fees
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams.toString();
        const url = `${API_BASE_URL}/api/admin/shipping-fees${searchParams ? `?${searchParams}` : ""}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin get shipping fees error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while fetching shipping fees" },
            { status: 500 }
        );
    }
}

// POST /api/admin/shipping-fees - Create a new shipping fee
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const body: unknown = await request.json();

        const response = await fetch(`${API_BASE_URL}/api/admin/shipping-fees`, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin create shipping fee error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while creating shipping fee" },
            { status: 500 }
        );
    }
}
