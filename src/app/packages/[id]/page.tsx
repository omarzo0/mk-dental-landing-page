import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Check, Package as PackageIcon, Truck, Shield } from "lucide-react";
import { resolveImageUrl } from "~/lib/image-utils";
import { Button } from "~/ui/primitives/button";
import { Badge } from "~/ui/primitives/badge";
import { Separator } from "~/ui/primitives/separator";
import { AddToCartButton } from "~/ui/components/add-to-cart-button";
import { JsonLd } from "~/ui/components/json-ld";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/ui/primitives/card";

// Types
interface PackageItem {
    _id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    productId?: {
        _id: string;
        name: string;
        price: number;
        images?: string[];
    };
}

interface PackageData {
    _id: string;
    name: string;
    description: string;
    price: number;
    images?: string[];
    category: string;
    productType: string;
    packageItems: PackageItem[];
    status?: string;
    packageDetails?: {
        totalItemsCount: number;
        originalTotalPrice: number;
        savings: number;
        savingsPercentage: number;
    };
    inventory?: {
        quantity: number;
        lowStockAlert: number;
        trackQuantity: boolean;
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
    };
}

// API function
async function getPackage(packageId: string): Promise<PackageData | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/products/packages/${packageId}`, {
            cache: "no-store",
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            console.error(`API Error: ${res.status} - ${res.statusText}`);
            return null;
        }

        const data: any = await res.json();

        if (data.success && data.data) {
            return data.data;
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch package:", error);
        return null;
    }
}

export default async function PackageDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const pkg = await getPackage(id);
    if (!pkg || pkg.productType !== "package") {
        notFound();
    }

    const isOutOfStock = pkg.inventory?.quantity === 0;
    const inStock = !isOutOfStock;
    const discount = pkg.packageDetails?.savingsPercentage || 0;
    const originalPrice = pkg.packageDetails?.originalTotalPrice;
    const savings = pkg.packageDetails?.savings;
    const mainImage = resolveImageUrl(pkg.images?.[0]) || "/placeholder.svg";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";

    const packageJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": pkg.name,
        "description": pkg.description,
        "image": mainImage,
        "brand": {
            "@type": "Brand",
            "name": "MK Dental"
        },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/packages/${pkg._id}`,
            "priceCurrency": "EGP",
            "price": pkg.price,
            "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "MK Dental"
            }
        }
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Packages",
                "item": `${baseUrl}/packages`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": pkg.name,
                "item": `${baseUrl}/packages/${pkg._id}`
            }
        ]
    };

    return (
        <div className="min-h-screen bg-background">
            <JsonLd data={packageJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        href="/packages"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Packages
                    </Link>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Package Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                            <Image
                                src={mainImage}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                            {discount > 0 && (
                                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                                    -{discount}% OFF
                                </Badge>
                            )}
                            {!inStock && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                    <Badge variant="destructive" className="text-lg px-4 py-2">
                                        Out of Stock
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Package Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <Badge variant="outline" className="mb-2">
                                <PackageIcon className="h-3 w-3 mr-1" />
                                {pkg.category}
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                {pkg.name}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline space-x-3">
                            <span className="text-3xl font-bold">
                                {pkg.price.toFixed(2)} EGP
                            </span>
                            {originalPrice && originalPrice > pkg.price && (
                                <span className="text-lg text-muted-foreground line-through">
                                    {originalPrice.toFixed(2)} EGP
                                </span>
                            )}
                            {savings && savings > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Save {savings.toFixed(2)} EGP
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {pkg.description}
                            </p>
                        </div>

                        {/* Package Contents */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">
                                What's Included ({pkg.packageDetails?.totalItemsCount || pkg.packageItems.length} items)
                            </h3>
                            <div className="space-y-2">
                                {pkg.packageItems.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between py-2 border-b">
                                        <div className="flex items-center gap-3">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm">
                                                {item.quantity}x {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {item.price.toFixed(2)} EGP each
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <AddToCartButton
                                    item={{
                                        id: pkg._id,
                                        name: pkg.name,
                                        price: pkg.price,
                                        image: mainImage,
                                        category: "Package",
                                    }}
                                    disabled={!inStock}
                                    className="flex-1"
                                    text={inStock ? "Add Package to Cart" : "Out of Stock"}
                                />
                            </div>

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="text-center">
                                    <PackageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Bundle Savings</p>
                                </div>
                                <div className="text-center">
                                    <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Quality Guaranteed</p>
                                </div>
                                <div className="text-center">
                                    <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Fast Delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Detail Cards */}
                <div className="mt-16">
                    <Separator className="mb-8" />
                    <h2 className="text-2xl font-bold mb-6">Items in This Package</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pkg.packageItems.map((item) => (
                            <Card key={item._id}>
                                <CardHeader className="pb-3">
                                    <div className="relative aspect-video overflow-hidden rounded-md bg-muted mb-3">
                                        <Image
                                            src={resolveImageUrl(item.image || item.productId?.images?.[0]) || "/placeholder.svg"}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <CardDescription>Quantity: {item.quantity}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{item.price.toFixed(2)} EGP</span>
                                        {item.productId?._id && (
                                            <Link href={`/products/${item.productId._id}`}>
                                                <Button variant="outline" size="sm">View Product</Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pkg = await getPackage(id);

    if (!pkg || pkg.productType !== "package") {
        return {
            title: "Package Not Found",
            description: "The package you're looking for doesn't exist.",
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";
    const mainImage = resolveImageUrl(pkg.images?.[0]);

    return {
        title: pkg.seo?.metaTitle || pkg.name,
        description: pkg.seo?.metaDescription || pkg.description.substring(0, 160),
        openGraph: {
            title: pkg.name,
            description: pkg.description,
            images: mainImage ? [mainImage] : [],
            url: `${baseUrl}/packages/${id}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: pkg.name,
            description: pkg.description,
            images: mainImage ? [mainImage] : [],
        },
        alternates: {
            canonical: `/packages/${id}`,
        },
    };
}
