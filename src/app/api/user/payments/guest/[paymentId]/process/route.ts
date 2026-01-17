import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

/**
 * POST /api/user/payments/guest/[paymentId]/process
 * Processes a guest payment (e.g., confirms COD order).
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    try {
        const { paymentId } = await params;

        console.log("[Guest Payment] Processing payment:", paymentId);

        if (!paymentId) {
            return NextResponse.json(
                { success: false, message: "Payment ID is required" },
                { status: 400 }
            );
        }

        // Get optional body data (for future payment methods that need extra data)
        let body: Record<string, unknown> = {};
        try {
            body = await request.json() as Record<string, unknown>;
        } catch {
            // No body is fine for COD
        }

        const backendUrl = `${API_BASE_URL}/api/user/payments/guest/${paymentId}/process`;
        console.log("[Guest Payment] Forwarding to:", backendUrl);

        // Forward request to backend
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json() as {
            success: boolean;
            message?: string;
            errors?: unknown;
            data?: unknown
        };

        console.log("[Guest Payment] Backend response:", response.status, JSON.stringify(data, null, 2));

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to process payment",
                    errors: data.errors
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("[Guest Payment] Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error during payment processing" },
            { status: 500 }
        );
    }
}

