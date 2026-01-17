import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    // Try backend API first
    const response = await fetch(`${API_BASE_URL}/api/user/categories`, {
      cache: "no-store"
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      console.error("Backend categories endpoint failed with status:", response.status);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch categories from backend"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch categories"
    }, { status: 500 });
  }
}
