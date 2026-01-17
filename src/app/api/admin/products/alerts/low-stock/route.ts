import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// GET /api/admin/products/alerts/low-stock - Get low stock alerts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Access denied. No token provided." },
        { status: 401 }
      );
    }

    // Forward all query parameters (threshold, category, page, limit)
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_BASE_URL}/api/admin/products/alerts/low-stock${searchParams ? `?${searchParams}` : ""}`;

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
    console.error("Admin get low stock alerts error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching low stock alerts" },
      { status: 500 }
    );
  }
}
