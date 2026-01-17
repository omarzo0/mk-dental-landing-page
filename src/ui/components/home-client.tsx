"use client";

import { ArrowRight, Clock, Package, ShoppingBag, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { useCart } from "~/lib/hooks/use-cart";
import { resolveImageUrl } from "~/lib/image-utils";
import { HeroBadge } from "~/ui/components/hero-badge";
import { ProductCard } from "~/ui/components/product-card";
import { TestimonialsSection } from "~/ui/components/testimonials/testimonials-with-marquee";
import { Button } from "~/ui/primitives/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/ui/primitives/card";

const featuresWhyChooseUs = [
    {
        description:
            "Free shipping on all orders to suez. Fast and reliable delivery for dental professionals nationwide.",
        icon: <Truck className="h-6 w-6 text-primary" />,
        title: "Free Shipping",
    },
    {
        description:
            "All instruments are sterilization-ready and meet FDA standards. Autoclave safe up to 134°C.",
        icon: <ShoppingBag className="h-6 w-6 text-primary" />,
        title: "Medical Grade Quality",
    },
    {
        description:
            "Expert dental professionals available to help with product selection and technical questions.",
        icon: <Clock className="h-6 w-6 text-primary" />,
        title: "Expert Support",
    },
    {
        description:
            "Lifetime warranty on all hand instruments. We stand behind the quality of our products.",
        icon: <Star className="h-6 w-6 text-primary" />,
        title: "Lifetime Warranty",
    },
];

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60";

export function HomeClient() {
    const [categories, setCategories] = React.useState<any[]>([]);
    const [catLoading, setCatLoading] = React.useState(true);
    const [products, setProducts] = React.useState<any[]>([]);
    const [prodLoading, setProdLoading] = React.useState(true);
    const [packages, setPackages] = React.useState<any[]>([]);
    const [pkgLoading, setPkgLoading] = React.useState(true);
    const [heroBanners, setHeroBanners] = React.useState<any[]>([]);
    const [bannersLoading, setBannersLoading] = React.useState(true);
    const { addItem, openCart } = useCart();

    const handleAddToCart = (productId: string) => {
        const product = products.find((p) => (p.id || p._id) === productId);
        if (product) {
            const productImage = resolveImageUrl(product.images?.[0] || product.image);
            const displayPrice = (product.discount?.isActive && product.discount?.discountedPrice && product.discount.discountedPrice < product.price)
                ? product.discount.discountedPrice
                : product.price;

            addItem(
                {
                    id: product.id || product._id,
                    name: product.name,
                    price: displayPrice,
                    image: productImage,
                    category: typeof product.category === 'string' ? product.category : product.category?.name || "Uncategorized",
                },
                1
            );
            openCart();
            toast.success(`${product.name} added to cart`);
        }
    };

    React.useEffect(() => {
        fetch("/api/user/categories")
            .then((res) => res.json())
            .then((data: any) => {
                if (data.success && Array.isArray(data.data)) {
                    setCategories(data.data);
                } else if (data.success && data.data?.categories) {
                    setCategories(data.data.categories);
                } else {
                    setCategories([]);
                }
            })
            .catch(() => setCategories([]))
            .finally(() => setCatLoading(false));
    }, []);

    React.useEffect(() => {
        fetch("/api/user/products?productType=single")
            .then((res) => res.json())
            .then((data: any) => {
                if (data.success && Array.isArray(data.data)) {
                    setProducts(data.data);
                } else if (data.success && data.data?.products) {
                    setProducts(data.data.products);
                } else {
                    setProducts([]);
                }
            })
            .catch(() => setProducts([]))
            .finally(() => setProdLoading(false));
    }, []);

    React.useEffect(() => {
        fetch("/api/products?productType=package&limit=10")
            .then((res) => res.json())
            .then((data: any) => {
                const rawPackages = data.success && Array.isArray(data.data)
                    ? data.data
                    : data.success && data.data?.products
                        ? data.data.products
                        : data.success && data.data?.packages
                            ? data.data.packages
                            : [];
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
                    }));
                setPackages(transformedPackages);
            })
            .catch(() => setPackages([]))
            .finally(() => setPkgLoading(false));
    }, []);

    React.useEffect(() => {
        fetch("/api/user/banners?position=hero")
            .then((res) => res.json())
            .then((data: any) => {
                if (data.success && Array.isArray(data.data)) {
                    setHeroBanners(data.data);
                } else {
                    setHeroBanners([]);
                }
            })
            .catch(() => setHeroBanners([]))
            .finally(() => setBannersLoading(false));
    }, []);

    return (
        <main
            className={`
        flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50
        via-muted/25 to-background
      `}
        >
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 md:py-32">
                <div className="bg-grid-black/[0.02] absolute inset-0 bg-[length:20px_20px]" />
                <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-4">
                                <HeroBadge />
                                <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1]">
                                    Professional{" "}
                                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                        Dental Tools & Equipment
                                    </span>
                                </h1>
                                <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                                    Premium quality dental instruments for professionals.
                                    Trusted by dentists worldwide with fast delivery and expert support.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link href="/products" className="w-full sm:w-auto">
                                    <Button className="h-12 w-full gap-1.5 px-8 transition-colors duration-200 sm:w-auto" size="lg">
                                        Browse Instruments <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/products" className="w-full sm:w-auto">
                                    <Button className="h-12 w-full px-8 transition-colors duration-200 sm:w-auto" size="lg" variant="outline">
                                        View Catalog
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-5 w-5 text-primary/70" />
                                    <span>24/7 Customer Support</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative mx-auto hidden aspect-square w-full max-w-md overflow-hidden rounded-xl border shadow-lg lg:block">
                            <div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
                            <Image
                                alt="Professional dental instruments"
                                className="object-cover"
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60"
                            />
                        </div>
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </section>

            {/* Promotional Banners */}
            {!bannersLoading && heroBanners.length > 0 && (
                <section className="py-6 md:py-10">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {heroBanners.slice(0, 3).map((banner, index) => (
                                <Link
                                    key={banner._id || banner.id}
                                    href={banner.link || "/products"}
                                    className="group relative aspect-[16/9] overflow-hidden rounded-xl border bg-card shadow transition-all duration-300 hover:shadow-lg"
                                >
                                    <Image
                                        alt={banner.title || "Promotion"}
                                        className="object-cover"
                                        fill
                                        priority={index === 0}
                                        sizes="100vw"
                                        src={resolveImageUrl(banner.image)}
                                        unoptimized
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">Shop by Category</h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
                        <p className="mt-4 max-w-2xl text-center text-muted-foreground">Find the perfect device for your needs from our curated collections</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                        {catLoading ? (
                            <div className="col-span-4 flex justify-center items-center py-12">
                                <span className="text-muted-foreground">Loading categories...</span>
                            </div>
                        ) : (
                            categories.filter(c => c.showInHomepage !== false).map((category) => (
                                <Link
                                    aria-label={`Browse ${category.name} products`}
                                    className="group relative flex flex-col space-y-4 overflow-hidden rounded-2xl border bg-card shadow transition-all duration-300 hover:shadow-lg"
                                    href={`/products?category=${encodeURIComponent(category.name || "")}`}
                                    key={category._id || category.name}
                                >
                                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
                                            {category.icon || "🦷"}
                                        </div>
                                        <h3 className="mb-1 text-lg font-medium group-hover:text-primary transition-colors">{category.name}</h3>
                                        <p className="text-sm text-muted-foreground">{category.statistics?.productCount || category.productCount || 0} products</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-muted/50 py-12 md:py-16">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">Featured Products</h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
                        <p className="mt-4 max-w-2xl text-center text-muted-foreground">Check out our latest and most popular tech items</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {prodLoading ? (
                            <div className="col-span-4 flex justify-center items-center py-12">
                                <span className="text-muted-foreground">Loading products...</span>
                            </div>
                        ) : (
                            products.slice(0, 8).map((product) => (
                                <ProductCard
                                    key={product.id || product._id}
                                    product={{
                                        ...product,
                                        id: product.id || product._id,
                                        image: product.images?.[0] || product.image || PLACEHOLDER_IMAGE,
                                        category: typeof product.category === 'string' ? product.category : product.category?.name || "Dental",
                                        rating: product.ratings?.average || product.rating || 0,
                                        reviews: product.ratings?.count || product.reviews || 0,
                                        inStock: product.inventory?.quantity > 0 || product.inStock !== false,
                                    }}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        )}
                    </div>
                    <div className="mt-10 flex justify-center">
                        <Link href="/products">
                            <Button className="group h-12 px-8" size="lg" variant="outline">
                                View All Products
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Special Packages */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">Special Packages</h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
                        <p className="mt-4 max-w-2xl text-center text-muted-foreground">Save more with our curated bundles - perfect for clinics and dental professionals</p>
                    </div>
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pkgLoading ? (
                            <div className="col-span-3 flex justify-center items-center py-12">
                                <span className="text-muted-foreground">Loading packages...</span>
                            </div>
                        ) : (
                            packages.map((pkg) => (
                                <Link href={`/packages/${pkg.id || pkg._id}`} key={pkg.id || pkg._id} className="group">
                                    <Card className="relative h-full overflow-hidden rounded-2xl border bg-card py-0 shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        {pkg.badge && (
                                            <div className="absolute top-3 right-3 z-20 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                                {pkg.badge}
                                            </div>
                                        )}
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                            <Image
                                                alt={pkg.name}
                                                className="object-cover transition duration-300 group-hover:scale-105"
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                src={resolveImageUrl(pkg.image)}
                                                unoptimized
                                            />
                                        </div>
                                        <CardHeader className="relative z-20 -mt-8 pb-2">
                                            <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            <div className="mb-3 flex flex-wrap gap-1">
                                                {pkg.packageItems?.slice(0, 3).map((item: any) => (
                                                    <span key={item._id || item.name} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.name}</span>
                                                ))}
                                                {pkg.packageItems?.length > 3 && (
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{pkg.packageItems.length - 3} more</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold text-foreground">{Number(pkg.price).toFixed(2)} EGP</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {pkg.originalPrice && (
                                                            <span className="text-sm text-muted-foreground line-through">{Number(pkg.originalPrice).toFixed(2)} EGP</span>
                                                        )}
                                                        {pkg.savings && (
                                                            <span className="text-sm font-medium text-green-600">Save {pkg.savings} EGP</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm text-muted-foreground">{pkg.packageItems?.length || 0} items</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                    <div className="mt-10 flex justify-center">
                        <Link href="/packages">
                            <Button className="group h-12 px-8" size="lg" variant="outline">
                                View All Packages
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-12 md:py-16" id="features">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">Why Choose Us</h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
                        <p className="mt-4 max-w-2xl text-center text-muted-foreground md:text-lg">We offer the best shopping experience with premium features</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {featuresWhyChooseUs.map((feature) => (
                            <Card className="rounded-2xl border-none bg-background shadow transition-all duration-300 hover:shadow-lg" key={feature.title}>
                                <CardHeader className="pb-2">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        {feature.icon}
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <TestimonialsSection />

            {/* CTA Section */}
            <section className="py-12 md:py-24">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground shadow-2xl sm:px-12 md:py-20">
                        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-black/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col items-center space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Ready to Upgrade Your Clinic?</h2>
                                <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80 md:text-xl">Join thousands of dental professionals who trust MK for their instruments and equipment needs.</p>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Link href="/products" className="w-full sm:w-auto">
                                    <Button className="h-12 w-full bg-white px-8 text-primary hover:bg-white/90 sm:w-auto" size="lg">Shop All Products</Button>
                                </Link>
                                <Link href="/contact" className="w-full sm:w-auto">
                                    <Button className="h-12 w-full border-white/20 bg-white/10 px-8 text-white hover:bg-white/20 sm:w-auto" size="lg" variant="outline">Contact Us</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
