import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// POST /api/admin/orders/[id]/refund
export async function POST(
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

        const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/refund`, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin refund order error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while processing refund" },
            { status: 500 }
        );
    }
}
