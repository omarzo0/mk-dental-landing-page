import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// PATCH /api/admin/coupons/:id/toggle - Toggle coupon status
export async function PATCH(
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

        const response = await fetch(
            `${API_BASE_URL}/api/admin/coupons/${id}/toggle-status`,
            {
                method: "PATCH",
                headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json",
                },
            }
        );

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin toggle coupon error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while toggling coupon status" },
            { status: 500 }
        );
    }
}
