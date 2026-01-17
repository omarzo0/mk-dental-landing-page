import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// PUT /api/admin/shipping-fees/:id - Update a shipping fee
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

        const response = await fetch(`${API_BASE_URL}/api/admin/shipping-fees/${id}`, {
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
        console.error("Admin update shipping fee error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while updating shipping fee" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/shipping-fees/:id - Delete a shipping fee
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

        const response = await fetch(`${API_BASE_URL}/api/admin/shipping-fees/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Admin delete shipping fee error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while deleting shipping fee" },
            { status: 500 }
        );
    }
}
