import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/account/", "/api/", "/checkout/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
