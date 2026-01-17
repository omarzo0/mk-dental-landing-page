import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // Try to fetch a single product, fallback to filtering from products array
  let backendUrl = process.env.API_BASE_URL
    ? `${process.env.API_BASE_URL}/api/products/${id}`
    : `http://localhost:5000/api/products/${id}`;
  let product = null;
  try {
    let res = await fetch(backendUrl, { cache: "no-store" });

    let data: any = await res.json();
    // If backend returns a single product
    if (data.success) {
      if (data.data?.product) {
        product = data.data.product;
      } else if (data.product) {
        product = data.product;
      } else if (data.data && !Array.isArray(data.data)) {
        product = data.data;
      } else if (Array.isArray(data.data?.products)) {
        // Fallback: filter from products array
        product = data.data.products.find((p: any) => p._id === id || p.id === id);
      }
    }
    if (product) {
      return NextResponse.json({ success: true, product });
    } else {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch product." }, { status: 500 });
  }
}
