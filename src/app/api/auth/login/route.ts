/**
 * User Login API Route
 * POST /api/auth/login
 * Proxies to external backend API
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const targetUrl = `${API_BASE_URL}/api/auth/login`;
    console.log("[User Login Proxy] Forwarding to:", targetUrl);

    // Call external backend API
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("[User Login Proxy] Backend status:", response.status);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[User Login Proxy] Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: "Internal server error", debug: error.message },
      { status: 500 }
    );
  }
}
