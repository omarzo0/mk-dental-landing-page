import { NextRequest, NextResponse } from "next/server";

// Static fallback data
const staticProducts = [
  {
    id: "1",
    name: "Professional Dental Mirror Set",
    description: "Premium quality dental mirror set designed for optimal visibility during examinations. Features anti-fog coating, ergonomic handle design, and autoclave-safe construction for superior infection control.",
    price: 69.99,
    originalPrice: 89.99,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&auto=format&fit=crop&q=60",
    category: "Diagnostic Instruments",
    brand: "MK Dental",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    features: [
      "Anti-fog reflective surface",
      "Autoclave safe up to 134°C",
      "Ergonomic handle design",
      "Lightweight stainless steel",
      "Multiple mirror sizes included",
      "Non-slip grip texture",
    ],
    specs: {
      brand: "MK Dental",
      material: "Surgical Stainless Steel",
      mirrorSizes: "#4, #5 (Front Surface)",
      sterilization: "Autoclave Safe (134°C)",
      warranty: "Lifetime",
      weight: "28g per mirror",
    },
    packageContents: [
      "2x Dental mirrors (#4 size)",
      "2x Dental mirrors (#5 size)",
      "4x Mirror handles",
      "1x Premium storage case",
      "1x Cleaning cloth",
      "1x User manual",
    ],
  },
  {
    id: "2",
    name: "Dental Extraction Forceps Kit",
    description: "Complete dental extraction forceps kit for various tooth extractions. Precision-crafted from German stainless steel with ergonomic handles for optimal grip and control during procedures.",
    price: 249.99,
    originalPrice: 299.99,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60",
    category: "Surgical Instruments",
    brand: "ProDent",
    rating: 4.9,
    reviews: 89,
    inStock: true,
    features: [
      "German surgical stainless steel",
      "Includes 8 forceps for different teeth",
      "Anatomically designed beaks",
      "Non-slip ergonomic handles",
      "Autoclave safe",
      "Includes premium storage case",
    ],
    specs: {
      brand: "ProDent",
      included: "8 Forceps + Case",
      material: "German Stainless Steel",
      sterilization: "Autoclave Safe",
      types: "Upper/Lower Anterior, Premolar, Molar",
      warranty: "5 years",
    },
    packageContents: [
      "8x Extraction forceps (various types)",
      "1x Premium aluminum storage case",
      "1x Instrument identification chart",
      "1x Maintenance guide",
      "1x Certificate of authenticity",
    ],
  },
];

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Validate MongoDB ObjectId format (24-character hex string)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return NextResponse.json({
      success: false,
      error: "Invalid product ID format. Must be a valid MongoDB ObjectId (24-character hex string)."
    }, { status: 400 });
  }

  // Try backend API first with the correct URL pattern
  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
  const backendUrl = `${API_BASE_URL}/api/products/${id}`;
  let product = null;

  try {
    let res = await fetch(backendUrl, { cache: "no-store" });
    const data: any = await res.json();

    // If backend returns a single product
    if (data.success && (data.product || data.data)) {
      product = data.product || data.data;
    } else if (data.success && Array.isArray(data.data?.products)) {
      // Fallback: filter from products array
      product = data.data.products.find((p: any) => p._id === id || p.id === id);
    }

    if (product) {
      return NextResponse.json({ success: true, product });
    }
  } catch (error) {
    console.error("Backend API error:", error);
  }

  // Fallback to static data (only for demo purposes)
  const staticProduct = staticProducts.find(p => p.id === id);

  if (staticProduct) {
    return NextResponse.json({ success: true, product: staticProduct });
  }

  return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
}
