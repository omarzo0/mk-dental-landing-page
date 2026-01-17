import { NextResponse } from "next/server";

export async function GET() {
    const backendUrl = process.env.API_BASE_URL
        ? `${process.env.API_BASE_URL}/api/products/packages`
        : "http://localhost:5000/api/products/packages";

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
        console.error("Error fetching packages:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch packages" },
            { status: 500 }
        );
    }
}
