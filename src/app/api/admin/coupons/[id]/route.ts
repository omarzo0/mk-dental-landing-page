import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// GET /api/admin/coupons/:id - Get a single coupon
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${id}`, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin get coupon error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while fetching coupon" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/coupons/:id - Update a coupon
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body: unknown = await request.json();

        const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${id}`, {
            method: "PUT",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin update coupon error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while updating coupon" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/coupons/:id - Delete a coupon
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin delete coupon error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while deleting coupon" },
            { status: 500 }
        );
    }
}
