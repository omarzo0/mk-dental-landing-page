import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";

    // Base static routes with SEO-optimized settings
    const routes = [
        { path: "", priority: 1.0, changeFrequency: "daily" as const },
        { path: "/products", priority: 0.9, changeFrequency: "daily" as const },
        { path: "/packages", priority: 0.9, changeFrequency: "daily" as const },
        { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    ].map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));

    try {
        // Fetch categories for sitemap
        const categoriesRes = await fetch(`${baseUrl}/api/user/categories`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        const categoriesData = await categoriesRes.json() as any;
        const categoryEntries = (categoriesData.data || []).map((c: any) => ({
            url: `${baseUrl}/products?category=${encodeURIComponent(c.name)}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

        // Fetch products for sitemap
        const productsRes = await fetch(`${baseUrl}/api/user/products?limit=1000`, {
            next: { revalidate: 3600 }
        });
        const productsData = await productsRes.json() as any;
        const productEntries = (productsData.data?.products || []).map((p: any) => ({
            url: `${baseUrl}/products/${p._id || p.id}`,
            lastModified: new Date(p.updatedAt || new Date()),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));

        // Fetch packages for sitemap
        const packagesRes = await fetch(`${baseUrl}/api/products?productType=package&limit=100`, {
            next: { revalidate: 3600 }
        });
        const packagesData = await packagesRes.json() as any;
        const packageEntries = (packagesData.data?.products || packagesData.data?.packages || []).map((p: any) => ({
            url: `${baseUrl}/packages/${p._id || p.id}`,
            lastModified: new Date(p.updatedAt || new Date()),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));

        return [...routes, ...categoryEntries, ...productEntries, ...packageEntries];
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return routes;
    }
}

