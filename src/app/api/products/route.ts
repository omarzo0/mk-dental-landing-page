import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get('limit');

  // Replace with your backend API URL
  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
  let backendUrl = `${API_BASE_URL}/api/products`;

  // Forward all search parameters if provided
  if (searchParams.toString()) {
    const backendParams = new URLSearchParams(searchParams);

    // If filtering by subcategory, fetch all products to filter properly on server side
    if (searchParams.get('subcategory')) {
      backendParams.set('limit', '100');
    }

    backendUrl += `?${backendParams.toString()}`;
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









    // Explicitly filter by subcategory if requested
    const subcategory = searchParams.get('subcategory');
    const isDebug = searchParams.get('debug') === 'true';
    let debugInfo: any = {};

    if (subcategory && data.success && data.data) {
      console.log(`Filtering by subcategory param: "${subcategory}"`);

      // Debug: Scan ALL products for any subcategory to verify field existence/structure
      if (isDebug) {
        let products = Array.isArray(data.data) ? data.data : (data.data.products || []);

        // 1. Find ANY product with a subcategory
        const productWithSub = products.find((p: any) => p.subcategory);
        if (productWithSub) {
          debugInfo.foundSubcategoryValue = productWithSub.subcategory;
          debugInfo.foundSubcategoryType = typeof productWithSub.subcategory;
          debugInfo.foundSubcategoryName = productWithSub.name;
        } else {
          debugInfo.message = "No products found with truthy 'subcategory' field in this batch";
          // 2. If no subcategory found, dump keys of first product to check field names
          if (products.length > 0) {
            debugInfo.firstProductKeys = Object.keys(products[0]);
            debugInfo.firstProductCategory = products[0].category; // Check if it's nested in category
          }
        }
      }

      const filterFn = (p: any, index: number) => {
        const pSub = typeof p.subcategory === 'string' ? p.subcategory : p.subcategory?.name;

        if (isDebug && index === 0) {
          debugInfo.firstProductSubcategoryRaw = p.subcategory;
          debugInfo.firstProductSubcategoryResolved = pSub;
          debugInfo.targetSubcategory = subcategory;
        }
        return pSub && pSub.toLowerCase().trim() === subcategory.toLowerCase().trim();
      };

      if (Array.isArray(data.data)) {
        if (isDebug && data.data.length > 0) {
          debugInfo.sampleRaw = data.data[0].subcategory;
        }
        data.data = data.data.filter((p: any, i: number) => filterFn(p, i));
      } else if (Array.isArray(data.data.products)) {
        if (isDebug && data.data.products.length > 0) {
          debugInfo.sampleRaw = data.data.products[0].subcategory;
        }
        data.data.products = data.data.products.filter((p: any, i: number) => filterFn(p, i));
      }
      console.log(`Filtered count: ${Array.isArray(data.data) ? data.data.length : data.data.products?.length}`);
    }

    if (isDebug) {
      return NextResponse.json({ ...data, debug: debugInfo });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch products." }, { status: 500 });
  }
}
