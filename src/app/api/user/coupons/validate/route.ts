import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

/**
 * POST /api/user/coupons/validate
 * Validates a coupon code and returns discount information.
 * Accessible to both guests and logged-in users.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as {
            code: string;
            email: string;
            items: any[];
            totalPrice: number
        };
        const { code, email, items, totalPrice } = body;

        if (!code) {
            return NextResponse.json(
                { success: false, message: "Coupon code is required" },
                { status: 400 }
            );
        }

        // Try to validate with backend
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/coupons/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json() as any;

                // Normalize the backend response for the frontend
                if (data.success && data.data?.coupon) {
                    const normalizedData = {
                        success: true,
                        data: {
                            code: data.data.coupon.code,
                            discount: data.data.coupon.discountValue,
                            type: data.data.coupon.discountType === 'percentage' ? 'percentage' : 'fixed',
                            freeShipping: data.data.discount?.freeShipping || false,
                            message: data.message || "Coupon applied successfully"
                        }
                    };
                    return NextResponse.json(normalizedData);
                }

                return NextResponse.json(data);
            }

            const errorData = await response.json().catch(() => ({ message: "Failed to validate coupon" })) as any;
            return NextResponse.json(
                { success: false, message: errorData.message || "Invalid coupon code" },
                { status: response.status }
            );
        } catch (e) {
            console.error("Backend coupon validation API error:", e);
            return NextResponse.json(
                { success: false, message: "Backend coupon service currently unavailable" },
                { status: 503 }
            );
        }

    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json(
            { success: false, message: "Server error during coupon validation" },
            { status: 500 }
        );
    }
}
