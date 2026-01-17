import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// PUT /api/admin/categories/:id - Update a category
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const { id } = params;
        const body: unknown = await request.json();

        const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
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
        console.error("Admin update category error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while updating category" },
            { status: 500 }
        );
    }
}
