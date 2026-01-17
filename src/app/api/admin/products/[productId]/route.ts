import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

type RouteParams = { params: Promise<{ productId: string }> };

// GET /api/admin/products/:productId - Get product by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Access denied. No token provided." },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Admin get product error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching product" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/:productId - Update product
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

    const body = await request.json() as any;

    // Calculate discountedPrice if discount is provided and active
    if (body.price && body.discount?.isActive) {
      const price = parseFloat(body.price);
      const discountValue = parseFloat(body.discount.value);
      if (body.discount.type === "percentage") {
        body.discountedPrice = price - (price * discountValue / 100);
      } else if (body.discount.type === "fixed") {
        body.discountedPrice = price - discountValue;
      }
    } else if (body.price) {
      body.discountedPrice = parseFloat(body.price);
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
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
    console.error("Admin update product error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while updating product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:productId - Delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Access denied. No token provided." },
        { status: 401 }
      );
    }

    // Forward query params (e.g., permanent=true)
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_BASE_URL}/api/admin/products/${productId}${searchParams ? `?${searchParams}` : ""}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while deleting product" },
      { status: 500 }
    );
  }
}
