/**
 * Admin Login API Route
 * POST /api/admin/auth/login
 * Proxies to external backend API
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();

    const apiUrl = `${API_BASE_URL}/api/admin/auth/login`;
    console.log("[Admin Login Proxy] API_BASE_URL:", API_BASE_URL);
    console.log("[Admin Login Proxy] Forwarding request to:", apiUrl);
    console.log("[Admin Login Proxy] Request body:", JSON.stringify({ ...body, password: "****" }));

    // Call external backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[Admin Login Proxy] Backend status:", response.status);
    console.log("[Admin Login Proxy] Backend content-type:", response.headers.get("content-type"));

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[Admin Login Proxy] Non-JSON response:", text);
      return NextResponse.json(
        {
          success: false,
          error: "Backend returned non-JSON response",
          debug: text.substring(0, 200) // First 200 chars for debugging
        },
        { status: 500 }
      );
    }

    // Get response text first to handle empty responses
    const responseText = await response.text();
    console.log("[Admin Login Proxy] Raw response:", responseText);

    if (!responseText) {
      console.error("[Admin Login Proxy] Empty response from backend");
      return NextResponse.json(
        { success: false, error: "Empty response from backend" },
        { status: 500 }
      );
    }

    // Parse JSON
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Admin Login Proxy] JSON parse error:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON response from backend",
          debug: responseText.substring(0, 200)
        },
        { status: 500 }
      );
    }

    console.log("[Admin Login Proxy] Parsed data:", JSON.stringify(data));

    // If login is successful, set the token as an HTTP-only cookie for security
    if (data.success && data.data?.token) {
      const responseObj = NextResponse.json(data, { status: response.status });

      // Set HTTP-only cookie for the token (more secure than localStorage)
      responseObj.cookies.set("admin_token", data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 12, // 12 hours
        path: "/",
      });

      console.log("[Admin Login Proxy] Login successful, cookie set");
      return responseObj;
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("[Admin Login Proxy] Error details:", {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });

    // Handle timeout
    if (error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Backend request timeout" },
        { status: 504 }
      );
    }

    // Handle network errors
    if (error.cause?.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot connect to backend server",
          debug: `Connection refused to ${API_BASE_URL}`
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Authentication proxy error",
        debug: error.message
      },
      { status: 500 }
    );
  }
}