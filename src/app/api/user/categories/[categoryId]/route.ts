import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// Static fallback categories data
const staticCategories = [
  {
    _id: "65a1b2c3d4e5f6789012345",
    name: "Diagnostic Instruments",
    slug: "diagnostic-instruments",
    isActive: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: "65a1b2c3d4e5f6789012346", 
    name: "Surgical Instruments",
    slug: "surgical-instruments",
    isActive: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: "65a1b2c3d4e5f6789012347",
    name: "Restorative Tools", 
    slug: "restorative-tools",
    isActive: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: "65a1b2c3d4e5f6789012348",
    name: "Hygiene Equipment",
    slug: "hygiene-equipment", 
    isActive: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: "65a1b2c3d4e5f6789012349",
    name: "Orthodontic",
    slug: "orthodontic",
    isActive: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: "65a1b2c3d4e5f678901234a",
    name: "Disposables",
    slug: "disposables",
    isActive: true,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  }
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await context.params;
  
  try {
    // Try backend API first
    const response = await fetch(`${API_BASE_URL}/api/user/categories/${categoryId}`, { 
      cache: "no-store" 
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      // If backend fails, return static data
      console.warn("Backend single category endpoint failed, using static data");
      const category = staticCategories.find(cat => cat._id === categoryId || cat.slug === categoryId);
      
      if (category) {
        return NextResponse.json({
          success: true,
          data: category
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Category not found"
        }, { status: 404 });
      }
    }
  } catch (error) {
    console.error("Get single category error:", error);
    // Fallback to static data on error
    const category = staticCategories.find(cat => cat._id === categoryId || cat.slug === categoryId);
    
    if (category) {
      return NextResponse.json({
        success: true,
        data: category
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Category not found"
      }, { status: 404 });
    }
  }
}
