import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Replace with your backend API URL
  const { searchParams } = new URL(request.url);
  const backendUrl = process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api/products` : "http://localhost:5000/api/products";

  const backendParams = new URLSearchParams(searchParams);

  // If filtering by subcategory, fetch all products to filter properly on server side
  if (searchParams.get('subcategory')) {
    backendParams.set('limit', '100');
  }

  const apiUrl = `${backendUrl}?${backendParams.toString()}`;
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









    // Explicitly filter by subcategory if requested
    const subcategory = searchParams.get('subcategory');
    if (subcategory && data.success && data.data) {
      console.log(`[User API] Filtering by subcategory param: "${subcategory}"`);
      const filterFn = (p: any) => {
        const pSub = typeof p.subcategory === 'string' ? p.subcategory : p.subcategory?.name;
        // console.log(`[User API] Product ID: ${p.id || p._id}, Subcategory raw:`, p.subcategory, "Resolved:", pSub);
        return pSub && pSub.toLowerCase().trim() === subcategory.toLowerCase().trim();
      };

      if (Array.isArray(data.data)) {
        if (data.data.length > 0) console.log("[User API] Sample product subcategory:", data.data[0].subcategory);
        data.data = data.data.filter(filterFn);
      } else if (Array.isArray(data.data.products)) {
        if (data.data.products.length > 0) console.log("[User API] Sample product subcategory:", data.data.products[0].subcategory);
        data.data.products = data.data.products.filter(filterFn);
      }
      console.log(`[User API] Filtered count: ${Array.isArray(data.data) ? data.data.length : data.data.products?.length}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products." }, { status: 500 });
  }
}
