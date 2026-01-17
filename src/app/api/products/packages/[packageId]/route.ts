import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// Static fallback packages data
const staticPackages = [
  {
    _id: "65a1b2c3d4e5f6789012350",
    name: "Starter Dental Kit",
    description: "Complete starter kit for new dental practices",
    price: 1299.99,
    originalPrice: 1599.99,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&auto=format&fit=crop&q=60",
    isActive: true,
    items: [
      {
        _id: "65a1b2c3d4e5f6789012345",
        name: "Professional Dental Mirror Set",
        quantity: 2,
        price: 69.99
      },
      {
        _id: "65a1b2c3d4e5f6789012346",
        name: "Dental Extraction Forceps Kit",
        quantity: 1,
        price: 249.99
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: "65a1b2c3d4e5f6789012351",
    name: "Professional Surgical Bundle",
    description: "Advanced surgical instruments package",
    price: 2499.99,
    originalPrice: 2999.99,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=60",
    isActive: true,
    items: [
      {
        _id: "65a1b2c3d4e5f6789012346",
        name: "Dental Extraction Forceps Kit",
        quantity: 2,
        price: 249.99
      },
      {
        _id: "65a1b2c3d4e5f6789012347",
        name: "Periodontal Curette Set",
        quantity: 1,
        price: 149.99
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  }
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ packageId: string }> }
) {
  const { packageId } = await context.params;

  try {
    // Try backend API first - fetching from generic products endpoint since packages are stored as products
    const response = await fetch(`${API_BASE_URL}/api/products/${packageId}`, {
      cache: "no-store"
    });

    if (response.ok) {
      const data: any = await response.json();

      // Harden: ensure it's actually a package
      const pkg = data.product || data.data;
      if (pkg && pkg.productType !== "package") {
        return NextResponse.json({ success: false, error: "Product is not a package" }, { status: 404 });
      }

      return NextResponse.json(data, { status: response.status });
    } else {
      // If backend fails, return static data
      console.warn("Backend single package endpoint failed, using static data");
      const packageData = staticPackages.find(pkg => pkg._id === packageId);

      if (packageData) {
        return NextResponse.json({
          success: true,
          data: packageData
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Package not found"
        }, { status: 404 });
      }
    }
  } catch (error) {
    console.error("Get single package error:", error);
    // Fallback to static data on error
    const packageData = staticPackages.find(pkg => pkg._id === packageId);

    if (packageData) {
      return NextResponse.json({
        success: true,
        data: packageData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Package not found"
      }, { status: 404 });
    }
  }
}
