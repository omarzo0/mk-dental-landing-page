"use client";

import { ArrowLeft, Check, Package, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { useCart } from "~/lib/hooks/use-cart";
import { resolveImageUrl } from "~/lib/image-utils";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { PackageSkeleton } from "~/ui/components/home-skeletons";


interface PackageItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  productId?: any;
}

interface Package {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  isActive?: boolean;
  status?: string;
  items: PackageItem[];
  packageItems?: PackageItem[];
  createdAt: string;
  updatedAt: string;
  badge?: string;
  savings?: number;
  itemCount?: number;
  packageDetails?: {
    totalItemsCount: number;
    originalTotalPrice: number;
    savings: number;
    savingsPercentage: number;
  };
}

export default function PackagesPage() {
  const { addItem, openCart } = useCart();
  const [addingToCart, setAddingToCart] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [packages, setPackages] = React.useState<Package[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch packages from API
  React.useEffect(() => {
    fetch("/api/products?productType=package&limit=100")
      .then((res) => res.json())
      .then((data: any) => {
        const rawPackages = data.success && Array.isArray(data.data)
          ? data.data
          : data.success && data.data?.products
            ? data.data.products
            : data.success && data.data?.packages
              ? data.data.packages
              : [];
        // Transform API data to match interface
        const transformedPackages = rawPackages
          .filter((pkg: any) => pkg.productType === "package")
          .map((pkg: any) => ({
            ...pkg,
            id: pkg._id,
            image: (() => {
              const firstImage = pkg.images?.[0] || pkg.image;
              if (!firstImage) return undefined;
              return typeof firstImage === "string" ? firstImage : (firstImage.url || undefined);
            })(),
            items: pkg.packageItems || pkg.items || [],
            badge: pkg.packageDetails?.savingsPercentage ? `${pkg.packageDetails.savingsPercentage}% OFF` : undefined,
            savings: pkg.packageDetails?.savingsPercentage || 0,
            itemCount: pkg.packageDetails?.totalItemsCount || pkg.packageItems?.length || 0,
            originalPrice: pkg.packageDetails?.originalTotalPrice
          }));
        setPackages(transformedPackages);
      })
      .catch((error) => {
        console.error("Packages API error:", error);
        setPackages([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter packages by search
  const filteredPackages = React.useMemo(() => {
    if (!searchQuery.trim()) return packages;

    const query = searchQuery.toLowerCase();
    return packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query) ||
        pkg.items.some((item) => item.name.toLowerCase().includes(query))
    );
  }, [packages, searchQuery]);

  const handleAddToCart = (pkg: Package) => {
    setAddingToCart(pkg._id);
    setTimeout(() => {
      addItem(
        {
          id: pkg._id,
          name: pkg.name,
          price: pkg.price,
          image: resolveImageUrl(pkg.image) || "/placeholder.svg",
          category: "Package",
        },
        1,
      );
      openCart();
      setAddingToCart(null);
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 sm:py-10">
        <div className="container px-4 sm:px-6">
          {/* Back button and Heading */}
          <div className="mb-8">
            <Link
              href="/products"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Special Packages
                </h1>
                <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                  Save more with our curated bundles for dental professionals
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Package count */}
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredPackages.length} of {packages.length} packages
            {searchQuery && ` for "${searchQuery}"`}
          </div>

          {/* Packages grid */}
          <div
            className={`
              mx-auto grid max-w-6xl grid-cols-1 gap-6
              lg:grid-cols-2
              xl:grid-cols-3
            `}
          >
            {loading ? (
              <PackageSkeleton />
            ) : (
              filteredPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`
                    relative flex h-full flex-col overflow-hidden rounded-2xl
                    border bg-card py-0 shadow-sm transition-all duration-300
                    hover:shadow-lg
                  `}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <Badge
                      className={`
                        absolute top-3 right-3 z-20 bg-primary text-primary-foreground
                      `}
                    >
                      {pkg.badge}
                    </Badge>
                  )}

                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <div
                      className={`
                        absolute inset-0 z-10 bg-gradient-to-t
                        from-background via-background/20 to-transparent
                      `}
                    />
                    <Image
                      alt={pkg.name}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={resolveImageUrl(pkg.image) || "/placeholder.svg"}
                      unoptimized
                    />
                  </div>

                  {/* Content */}
                  <CardHeader className="relative z-20 -mt-8 pb-3">
                    <CardTitle className="text-xl sm:text-2xl">{pkg.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4">
                    {/* Items included */}
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-semibold text-foreground">
                        What's Included ({pkg.itemCount || pkg.items?.length || 0} items):
                      </h4>
                      <ul className="space-y-1.5">
                        {pkg.items?.map((item) => (
                          <li
                            key={item._id}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                            <span>{item.quantity}x {item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price */}
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-foreground sm:text-3xl">
                            {pkg.price.toFixed(2)} EGP
                          </div>
                          {pkg.originalPrice && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground line-through">
                                {pkg.originalPrice.toFixed(2)} EGP
                              </span>
                              {pkg.savings && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  Save {pkg.savings}%
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {pkg.originalPrice && pkg.savings && (
                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              {pkg.savings}% OFF
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-4">
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={() => handleAddToCart(pkg)}
                      disabled={addingToCart === pkg.id}
                    >
                      {addingToCart === pkg.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      Add Package to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {/* Empty state */}
          {filteredPackages.length === 0 && (
            <div className="mt-8 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No packages found{searchQuery && ` for "${searchQuery}"`}.
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              ) : (
                <Link href="/products">
                  <Button variant="outline" className="mt-4">
                    Browse Individual Products
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
