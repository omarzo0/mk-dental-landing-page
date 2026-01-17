import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";

    // Base routes
    const routes = [
        "",
        "/products",
        "/packages",
        "/about",
        "/contact",
        "/privacy",
        "/terms",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    try {
        // Fetch products for sitemap
        const productsRes = await fetch(`${baseUrl}/api/user/products?limit=1000`);
        const productsData = await productsRes.json();
        const productEntries = (productsData.data?.products || []).map((p: any) => ({
            url: `${baseUrl}/products/${p._id || p.id}`,
            lastModified: new Date(p.updatedAt || new Date()),
            changeFrequency: "daily" as const,
            priority: 0.7,
        }));

        // Fetch packages for sitemap
        const packagesRes = await fetch(`${baseUrl}/api/products?productType=package&limit=100`);
        const packagesData = await packagesRes.json();
        const packageEntries = (packagesData.data?.products || packagesData.data?.packages || []).map((p: any) => ({
            url: `${baseUrl}/packages/${p._id || p.id}`,
            lastModified: new Date(p.updatedAt || new Date()),
            changeFrequency: "daily" as const,
            priority: 0.7,
        }));

        return [...routes, ...productEntries, ...packageEntries];
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return routes;
    }
}
