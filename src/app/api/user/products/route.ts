import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Replace with your backend API URL
  const { searchParams } = new URL(request.url);
  const backendUrl = process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api/products` : "http://localhost:5000/api/products";

  const apiUrl = `${backendUrl}?${searchParams.toString()}`;
  console.log("Fetching products from:", apiUrl);

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    console.log("Backend response status:", res.status);

    const data: any = await res.json();

    // Explicitly filter by productType if requested
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
    console.error("Products API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products." }, { status: 500 });
  }
}
