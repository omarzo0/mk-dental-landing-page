/**
 * User Profile API Route
 * GET /api/auth/me - Get current user
 * PATCH /api/auth/me - Update profile
 * Proxies to external backend API
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    console.log("Get profile attempt to:", `${API_BASE_URL}/api/auth/me`);

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await response.json();

    console.log("Get profile response status:", response.status);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    console.log("Update profile attempt to:", `${API_BASE_URL}/api/auth/me`);

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log("Update profile response status:", response.status);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
