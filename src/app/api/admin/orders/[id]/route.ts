import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// DELETE /api/admin/orders/:id - Delete an order
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
        console.log(`[Proxy] DELETE Request for Order ID: '${id}'`);
        const targetUrl = `${API_BASE_URL}/api/admin/orders/${id}`;
        console.log(`[Proxy] Forwarding to: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: "DELETE",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin delete order error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while deleting order" },
            { status: 500 }
        );
    }
}
