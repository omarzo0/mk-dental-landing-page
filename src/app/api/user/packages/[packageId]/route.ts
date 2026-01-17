import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ packageId: string }> }
) {
    const { packageId } = await params;

    const backendUrl = process.env.API_BASE_URL
        ? `${process.env.API_BASE_URL}/api/products/packages/${packageId}`
        : `http://localhost:5000/api/products/packages/${packageId}`;

    try {
        const res = await fetch(backendUrl, {
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`Backend responded with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching package:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch package" },
            { status: 500 }
        );
    }
}
