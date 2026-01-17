import { type NextRequest, NextResponse } from "next/server";

const UPLOAD_API_URL = process.env.UPLOAD_API_URL || "http://localhost:9000/api/upload";

/**
 * POST /api/upload
 * Proxy for backend image uploads. Supports both single and bulk uploads.
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "Access denied. No token provided." },
                { status: 401 }
            );
        }

        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json(
                { success: false, message: "Invalid content type. Expected multipart/form-data" },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        const incomingFields = Array.from(formData.keys());
        console.log(`[Upload Proxy] Incoming fields: ${incomingFields.join(", ")}`);

        // Detect if we should use bulk based on field names or multiple values
        const hasImages = formData.has("images");
        const hasImage = formData.has("image");
        const hasFiles = formData.has("files");

        // If we have "images" or "files", or multiple "image" values, it's bulk
        const isBulk = hasImages || hasFiles || (hasImage && formData.getAll("image").length > 1);
        const backendUrl = isBulk ? `${UPLOAD_API_URL}/bulk` : UPLOAD_API_URL;

        console.log(`[Upload Proxy] Forwarding to ${backendUrl}, isBulk: ${isBulk}`);

        // Rebuild FormData for backend
        const forwardFormData = new FormData();
        for (const [key, value] of formData.entries()) {
            forwardFormData.append(key, value);
        }

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: authHeader,
            },
            body: forwardFormData,
        });

        const data: any = await response.json();
        console.log(`[Upload Proxy] Backend response status: ${response.status}`);
        console.log(`[Upload Proxy] Backend response body:`, JSON.stringify(data, null, 2));

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error("[Upload Proxy] Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error during image upload" },
            { status: 500 }
        );
    }
}
