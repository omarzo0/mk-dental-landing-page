import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

type RouteParams = { params: Promise<{ productId: string }> };

// PUT /api/admin/products/:productId/inventory - Update product inventory
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Access denied. No token provided." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${productId}/inventory`,
      {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Admin update inventory error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while updating inventory" },
      { status: 500 }
    );
  }
}
