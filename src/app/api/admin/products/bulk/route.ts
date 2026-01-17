import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// POST /api/admin/products/bulk - Bulk operations on products
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

    const response = await fetch(`${API_BASE_URL}/api/admin/products/bulk`, {
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
    console.error("Admin bulk operation error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while performing bulk operation" },
      { status: 500 }
    );
  }
}
