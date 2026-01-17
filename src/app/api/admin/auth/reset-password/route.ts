/**
 * Admin Reset Password API Route
 * POST /api/admin/auth/reset-password
 * Proxies to external backend API
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const apiUrl = `${API_BASE_URL}/api/admin/auth/reset-password`;
        console.log("[Admin Reset Password Proxy] Forwarding request to:", apiUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

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

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            return NextResponse.json(
                { success: false, error: "Backend returned non-JSON response", debug: text.substring(0, 200) },
                { status: 500 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error("[Admin Reset Password Proxy] Error:", error);
        if (error.name === "AbortError") {
            return NextResponse.json({ success: false, error: "Backend request timeout" }, { status: 504 });
        }
        return NextResponse.json({ success: false, error: "Authentication proxy error", debug: error.message }, { status: 500 });
    }
}
