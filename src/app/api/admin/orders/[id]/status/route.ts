import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// PUT /api/admin/orders/[id]/status
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

        const body = await request.json();
        const { id } = await params;

        const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/status`, {
            method: "PUT",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin update order status error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while updating order status" },
            { status: 500 }
        );
    }
}

// Also support PATCH for backwards compatibility
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return PUT(request, { params });
}
