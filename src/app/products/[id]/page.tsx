import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Heart, Star, Check, Package, Truck, Shield } from "lucide-react";
import { resolveImageUrl } from "~/lib/image-utils";
import { Button } from "~/ui/primitives/button";
import { Badge } from "~/ui/primitives/badge";
import { Separator } from "~/ui/primitives/separator";
import { AddToCartButton } from "~/ui/components/add-to-cart-button";
import { WishlistButton } from "~/ui/components/wishlist-button";
import { JsonLd } from "~/ui/components/json-ld";

// Types
interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    isActive: boolean;
    discountedPrice?: number;
  };
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  quantity?: number;
  features?: string[];
  specs?: Record<string, any>;
  packageContents?: string[];
}

// API function
async function getProduct(productId: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/user/products/${productId}`, {
      cache: "no-store",
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status} - ${res.statusText}`);
      return null;
    }

    const data: any = await res.json();

    if (data.success && (data.product || data.data)) {
      const p = data.product || data.data;
      // Map images array to single image if needed
      if (!p.image && p.images && p.images.length > 0) {
        p.image = p.images[0];
      }
      return p;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// Fallback static data (same as products page)
const staticProducts: Product[] = [
  {
    id: "1",
    name: "Professional Dental Mirror Set",
    description: "Premium quality dental mirror set designed for optimal visibility during examinations. Features anti-fog coating, ergonomic handle design, and autoclave-safe construction for superior infection control.",
    price: 69.99,
    originalPrice: 89.99,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&auto=format&fit=crop&q=60",
    category: "Diagnostic Instruments",
    brand: "MK Dental",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    features: [
      "Anti-fog reflective surface",
      "Autoclave safe up to 134°C",
      "Ergonomic handle design",
      "Lightweight stainless steel",
      "Multiple mirror sizes included",
      "Non-slip grip texture",
    ],
    specs: {
      brand: "MK Dental",
      material: "Surgical Stainless Steel",
      mirrorSizes: "#4, #5 (Front Surface)",
      sterilization: "Autoclave Safe (134°C)",
      warranty: "Lifetime",
      weight: "28g per mirror",
    },
    packageContents: [
      "2x Dental mirrors (#4 size)",
      "2x Dental mirrors (#5 size)",
      "4x Mirror handles",
      "1x Premium storage case",
      "1x Cleaning cloth",
      "1x User manual",
    ],
  },
  {
    id: "2",
    name: "Dental Extraction Forceps Kit",
    description: "Complete dental extraction forceps kit for various tooth extractions. Precision-crafted from German stainless steel with ergonomic handles for optimal grip and control during procedures.",
    price: 249.99,
    originalPrice: 299.99,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60",
    category: "Surgical Instruments",
    brand: "ProDent",
    rating: 4.9,
    reviews: 89,
    inStock: true,
    features: [
      "German surgical stainless steel",
      "Includes 8 forceps for different teeth",
      "Anatomically designed beaks",
      "Non-slip ergonomic handles",
      "Autoclave safe",
      "Includes premium storage case",
    ],
    specs: {
      brand: "ProDent",
      included: "8 Forceps + Case",
      material: "German Stainless Steel",
      sterilization: "Autoclave Safe",
      types: "Upper/Lower Anterior, Premolar, Molar",
      warranty: "5 years",
    },
    packageContents: [
      "8x Extraction forceps (various types)",
      "1x Premium aluminum storage case",
      "1x Instrument identification chart",
      "1x Maintenance guide",
      "1x Certificate of authenticity",
    ],
  },
];

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try API first, fallback to static data
  let product = await getProduct(id);

  if (!product) {
    // Fallback to static data
    product = staticProducts.find(p => p.id === id) || null;
  }

  if (!product) {
    notFound();
  }

  const isOutOfStock = typeof product.quantity === "number" ? product.quantity === 0 : product.inStock === false;
  const inStock = !isOutOfStock;

  const hasDiscount = !!(product.discount?.isActive && product.discount?.discountedPrice && product.discount.discountedPrice < product.price);
  const displayPrice = hasDiscount ? product.discount!.discountedPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : product.originalPrice;

  const discountValue = hasDiscount
    ? (product.discount!.type === "percentage"
      ? product.discount!.value
      : Math.round(((product.price - product.discount!.discountedPrice!) / product.price) * 100))
    : 0;

  const resolvedImage = resolveImageUrl(product.image);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": resolvedImage,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "MK Dental"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/products/${product.id}`,
      "priceCurrency": "EGP",
      "price": displayPrice,
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "MK Dental"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews || 0
    } : undefined
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
        "name": "Products",
        "item": `${baseUrl}/products`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `${baseUrl}/products/${product.id}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={resolvedImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized
              />
              {discountValue > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  -{discountValue}%
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-lg text-muted-foreground mt-1">Brand: {product.brand}</p>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating!)
                        ? "fill-yellow-400 text-yellow-400"
                        : "stroke-muted-foreground text-muted-foreground"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} {product.reviews && `(${product.reviews} reviews)`}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold">
                {displayPrice ? `${displayPrice.toFixed(2)} EGP` : "Price not available"}
              </span>
              {originalPrice && originalPrice > (displayPrice || 0) && (
                <span className="text-lg text-muted-foreground line-through">
                  {originalPrice.toFixed(2)} EGP
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <AddToCartButton
                  item={{
                    id: product.id,
                    name: product.name,
                    price: displayPrice,
                    image: resolvedImage,
                    category: product.category,
                  }}
                  disabled={!inStock}
                  className="flex-1"
                  text={inStock ? "Add to Cart" : "Out of Stock"}
                />
                <WishlistButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: displayPrice,
                    image: resolvedImage,
                    category: product.category,
                    originalPrice: originalPrice,
                  }}
                  className="px-6"
                />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">2 Year Warranty</p>
                </div>
                <div className="text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Fast Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-16">
          <Separator className="mb-8" />

          <div className="grid md:grid-cols-2 gap-8">
            {/* Specifications */}
            {product.specs && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <div className="space-y-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Package Contents */}
            {product.packageContents && product.packageContents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Package Contents</h2>
                <ul className="space-y-2">
                  {product.packageContents.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for doesn't exist.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";
  const resolvedImage = resolveImageUrl(product.image);

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: resolvedImage ? [resolvedImage] : [],
      url: `${baseUrl}/products/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: resolvedImage ? [resolvedImage] : [],
    },
    alternates: {
      canonical: `/products/${id}`,
    },
  };
}

