import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

interface GuestOrderRequest {
    customerInfo?: {
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        gender?: string;
        dateOfBirth?: string;
    };
    items?: { productId: string; quantity: number }[];
    shippingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    paymentMethod?: string;
    status?: string;
    notes?: string;
    couponCode?: string;
}

/**
 * POST /api/user/orders/guest
 * Creates a guest order and returns order + payment information.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as GuestOrderRequest;

        console.log("[Guest Order] Received request:", JSON.stringify(body, null, 2));

        // Validate required fields
        if (!body.customerInfo?.email) {
            return NextResponse.json(
                { success: false, message: "Customer email is required" },
                { status: 400 }
            );
        }

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { success: false, message: "At least one item is required" },
                { status: 400 }
            );
        }

        if (!body.shippingAddress) {
            return NextResponse.json(
                { success: false, message: "Shipping address is required" },
                { status: 400 }
            );
        }

        const backendUrl = `${API_BASE_URL}/api/user/orders/guest`;
        console.log("[Guest Order] Forwarding to:", backendUrl);

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

        console.log("[Guest Order] Backend response:", response.status, JSON.stringify(data, null, 2));

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to create order",
                    errors: data.errors
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("[Guest Order] Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error during order creation" },
            { status: 500 }
        );
    }
}

