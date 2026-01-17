import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get('limit');

  // Replace with your backend API URL
  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
  let backendUrl = `${API_BASE_URL}/api/products`;

  // Forward all search parameters if provided
  if (searchParams.toString()) {
    backendUrl += `?${searchParams.toString()}`;
  }

  try {
    const res = await fetch(backendUrl, { cache: "no-store" });
    const data: any = await res.json();

    // Explicitly filter by productType if requested, as the backend might not respect it
    const productType = searchParams.get('productType');
    if (productType && data.success && data.data) {
      if (Array.isArray(data.data)) {
        data.data = data.data.filter((p: any) => p.productType === productType);
      } else if (Array.isArray(data.data.products)) {
        data.data.products = data.data.products.filter((p: any) => p.productType === productType);
      } else if (Array.isArray(data.data.packages)) {
        data.data.packages = data.data.packages.filter((p: any) => p.productType === productType);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch products." }, { status: 500 });
  }
}
