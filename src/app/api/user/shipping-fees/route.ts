import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

/**
 * GET /api/user/shipping-fees
 * Returns a list of states/governorates and their respective shipping fees.
 */
export async function GET(request: NextRequest) {
    try {
        // We attempt to fetch from the backend if available, 
        // otherwise we fallback to a default list of Egyptian governorates.
        const url = `${API_BASE_URL}/api/user/shipping-fees`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                // Add a timeout or handle failure gracefully
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data);
            }
        } catch (e) {
            console.warn("Backend shipping fees API not reachable, using fallback data.");
        }

        // Fallback data for typical Egyptian regions
        const fallbackFees = [
            { id: "1", name: "Cairo", fee: 50 },
            { id: "2", name: "Giza", fee: 50 },
            { id: "3", name: "Alexandria", fee: 65 },
            { id: "4", name: "Qalyubia", fee: 60 },
            { id: "5", name: "Sharqia", fee: 70 },
            { id: "6", name: "Dakahlia", fee: 70 },
            { id: "7", name: "Beheira", fee: 70 },
            { id: "8", name: "Monufia", fee: 65 },
            { id: "9", name: "Gharbia", fee: 65 },
            { id: "10", name: "Kafr El Sheikh", fee: 75 },
            { id: "11", name: "Fayoum", fee: 80 },
            { id: "12", name: "Beni Suef", fee: 80 },
            { id: "13", name: "Minya", fee: 90 },
            { id: "14", name: "Assiut", fee: 95 },
            { id: "15", name: "Sohag", fee: 100 },
            { id: "16", name: "Qena", fee: 110 },
            { id: "17", name: "Luxor", fee: 120 },
            { id: "18", name: "Aswan", fee: 130 },
            { id: "19", name: "Red Sea", fee: 100 },
            { id: "20", name: "New Valley", fee: 150 },
            { id: "21", name: "Matrouh", fee: 120 },
            { id: "22", name: "North Sinai", fee: 130 },
            { id: "23", name: "South Sinai", fee: 130 },
            { id: "24", name: "Port Said", fee: 75 },
            { id: "25", name: "Ismailia", fee: 75 },
            { id: "26", name: "Suez", fee: 75 },
            { id: "27", name: "Damietta", fee: 75 },
        ];

        return NextResponse.json({
            success: true,
            data: fallbackFees
        });

    } catch (error) {
        console.error("User get shipping fees error:", error);
        return NextResponse.json(
            { success: false, message: "Server error while fetching shipping fees" },
            { status: 500 }
        );
    }
}
