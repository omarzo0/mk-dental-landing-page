import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// GET /api/admin/products - Get all products with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Access denied. No token provided." },
        { status: 401 }
      );
    }

    // Forward all query parameters
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_BASE_URL}/api/admin/products${searchParams ? `?${searchParams}` : ""}`;

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
    console.error("Admin get products error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
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

    const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
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
    console.error("Admin create product error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while creating product" },
      { status: 500 }
    );
  }
}
