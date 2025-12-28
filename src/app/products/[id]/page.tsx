"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "~/lib/hooks/use-cart";
import { useRecentlyViewed } from "~/lib/hooks/use-recently-viewed";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { ProductCard } from "~/ui/components/product-card";
import {
  AddToCartSection,
  ProductDetailsTabs,
  ProductImage,
  ProductInfo,
} from "~/ui/components/product-details";
import { ProductReviews } from "~/ui/components/product-reviews";
import { Button } from "~/ui/primitives/button";
import { Separator } from "~/ui/primitives/separator";

/* -------------------------------------------------------------------------- */
/*                               Type declarations                            */
/* -------------------------------------------------------------------------- */

interface Product {
  category: string;
  description: string;
  features: string[];
  id: string;
  image: string;
  inStock: boolean;
  name: string;
  originalPrice?: number;
  packageContents: string[];
  price: number;
  rating: number;
  specs: Record<string, string>;
}

/* -------------------------------------------------------------------------- */
/*                         Helpers (shared, memo-safe)                        */
/* -------------------------------------------------------------------------- */

/** `feature -> feature` ➜ `feature-feature` (for React keys) */
const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

/* -------------------------------------------------------------------------- */
/*                        Static product data (demo only)                     */
/* -------------------------------------------------------------------------- */

const products: Product[] = [
  {
    category: "Diagnostic Instruments",
    description:
      "Premium quality dental mirror set designed for optimal visibility during examinations. Features anti-fog coating, ergonomic handle design, and autoclave-safe construction for superior infection control.",
    features: [
      "Anti-fog reflective surface",
      "Autoclave safe up to 134°C",
      "Ergonomic handle design",
      "Lightweight stainless steel",
      "Multiple mirror sizes included",
      "Non-slip grip texture",
    ],
    id: "1",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Professional Dental Mirror Set",
    originalPrice: 89.99,
    packageContents: [
      "2x Dental mirrors (#4 size)",
      "2x Dental mirrors (#5 size)",
      "4x Mirror handles",
      "1x Premium storage case",
      "1x Cleaning cloth",
      "1x User manual",
    ],
    price: 69.99,
    rating: 4.8,
    specs: {
      brand: "DentalPro",
      material: "Surgical Stainless Steel",
      mirrorSizes: "#4, #5 (Front Surface)",
      sterilization: "Autoclave Safe (134°C)",
      warranty: "Lifetime",
      weight: "28g per mirror",
    },
  },
  {
    category: "Surgical Instruments",
    description:
      "Complete dental extraction forceps kit for various tooth extractions. Precision-crafted from German stainless steel with ergonomic handles for optimal grip and control during procedures.",
    features: [
      "German surgical stainless steel",
      "Includes 8 forceps for different teeth",
      "Anatomically designed beaks",
      "Non-slip ergonomic handles",
      "Autoclave safe",
      "Includes premium storage case",
    ],
    id: "2",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Dental Extraction Forceps Kit",
    originalPrice: 299.99,
    packageContents: [
      "8x Extraction forceps (various types)",
      "1x Premium aluminum storage case",
      "1x Instrument identification chart",
      "1x Maintenance guide",
      "1x Certificate of authenticity",
    ],
    price: 249.99,
    rating: 4.9,
    specs: {
      brand: "DentalPro Premium",
      included: "8 Forceps + Case",
      material: "German Stainless Steel",
      sterilization: "Autoclave Safe",
      types: "Upper/Lower Anterior, Premolar, Molar",
      warranty: "5 years",
    },
  },
  {
    category: "Diagnostic Instruments",
    description:
      "Double-ended dental explorer set for detecting cavities, calculus, and other dental issues. Features sharp, precise tips and comfortable grip for accurate examinations.",
    features: [
      "Double-ended design",
      "Sharp diagnostic tips",
      "Comfortable grip handle",
      "Autoclave safe",
      "Set of 6 explorers",
      "Various tip configurations",
    ],
    id: "3",
    image:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60",
    inStock: false,
    name: "Dental Explorer Set (Double-Ended)",
    originalPrice: 79.99,
    packageContents: [
      "6x Double-ended explorers",
      "1x Sterilization cassette",
      "1x Tip identification guide",
      "1x User manual",
    ],
    price: 59.99,
    rating: 4.7,
    specs: {
      brand: "DentalPro",
      included: "6 Double-Ended Explorers",
      material: "Surgical Stainless Steel",
      sterilization: "Autoclave Safe",
      tipTypes: "#23, #6, Shepherd Hook, Pigtail",
      warranty: "3 years",
    },
  },
  {
    category: "Restorative Tools",
    description:
      "Complete composite filling instrument set for precise placement and contouring of composite restorations. Includes various shapes for anterior and posterior restorations.",
    features: [
      "Non-stick titanium nitride coating",
      "Complete set for all restorations",
      "Ergonomic silicone handles",
      "Color-coded for easy identification",
      "Autoclave safe",
      "Premium quality construction",
    ],
    id: "4",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Composite Filling Instrument Set",
    originalPrice: 159.99,
    packageContents: [
      "12x Composite instruments",
      "1x Silicone instrument holder",
      "1x Color-coded identification chart",
      "1x Premium carrying case",
      "1x Cleaning brush set",
    ],
    price: 129.99,
    rating: 4.6,
    specs: {
      brand: "DentalPro Restorative",
      coating: "Titanium Nitride",
      handles: "Silicone Ergonomic",
      included: "12 Instruments + Case",
      material: "Stainless Steel",
      warranty: "Lifetime",
    },
  },
  {
    category: "Hygiene Equipment",
    description:
      "Professional ultrasonic scaler unit for efficient removal of calculus and plaque. Features multiple power settings, LED handpiece, and automatic frequency tuning.",
    features: [
      "Automatic frequency tuning",
      "LED illuminated handpiece",
      "Multiple power settings",
      "Water flow control",
      "Includes 5 scaler tips",
      "Foot pedal control",
    ],
    id: "5",
    image:
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Ultrasonic Scaler Unit",
    originalPrice: 599.99,
    packageContents: [
      "1x Ultrasonic scaler main unit",
      "1x LED handpiece",
      "5x Scaler tips (G1, G2, G4, P1, E1)",
      "1x Foot pedal",
      "1x Water bottle assembly",
      "1x Power adapter",
      "1x User manual",
      "1x Warranty card",
    ],
    price: 499.99,
    rating: 4.9,
    specs: {
      brand: "DentalPro Equipment",
      frequency: "25-32 kHz (Auto-tuning)",
      handpiece: "LED Illuminated",
      powerSettings: "5 Levels",
      tipsIncluded: "G1, G2, G4, P1, E1",
      warranty: "2 years",
      waterConnection: "Standard Dental Unit",
    },
  },
  {
    category: "Surgical Instruments",
    description:
      "Premium periodontal curette set for subgingival scaling and root planing. Features Gracey and universal curettes with sharp cutting edges and comfortable handles.",
    features: [
      "Gracey and Universal curettes",
      "Sharp cutting edges",
      "Ergonomic hollow handles",
      "Color-coded for easy ID",
      "Autoclave safe",
      "Complete 14-piece set",
    ],
    id: "6",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Periodontal Curette Set",
    originalPrice: 189.99,
    packageContents: [
      "14x Periodontal curettes",
      "1x Sterilization cassette",
      "1x Instrument identification chart",
      "1x Sharpening stone",
      "1x User manual",
    ],
    price: 149.99,
    rating: 4.8,
    specs: {
      brand: "DentalPro Perio",
      handleType: "Hollow Ergonomic",
      included: "14 Curettes + Cassette",
      material: "Surgical Stainless Steel",
      types: "Gracey 1-14, Universal",
      warranty: "Lifetime",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function ProductDetailPage() {
  /* ----------------------------- Routing --------------------------------- */
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  /* ----------------------------- Cart hook ------------------------------- */
  const { addItem } = useCart();

  /* ----------------------------- Wishlist hook --------------------------- */
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  /* ----------------------------- Recently viewed hook -------------------- */
  const { addProduct: addToRecentlyViewed, products: recentlyViewedProducts } = useRecentlyViewed();

  /* ----------------------------- Local state ----------------------------- */
  const [isAdding, setIsAdding] = React.useState(false);

  /* ------------------------ Derive product object ------------------------ */
  const product = React.useMemo(() => products.find((p) => p.id === id), [id]);

  /* ----------------------- Track recently viewed ------------------------- */
  React.useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
  }, [product, addToRecentlyViewed]);

  /* ----------------------- Related products ------------------------------ */
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  /* ----------------------- Recently viewed (exclude current) ------------- */
  const displayRecentlyViewed = React.useMemo(() => {
    return recentlyViewedProducts
      .filter((p) => p.id !== id)
      .slice(0, 4);
  }, [recentlyViewedProducts, id]);

  /* ----------------------- Derived/computed values ----------------------- */
  const discountPercentage = React.useMemo(() => {
    if (!product?.originalPrice) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100,
    );
  }, [product]);

  /* ------------------------------ Handlers ------------------------------- */
  const handleAddToCart = React.useCallback(
    async (quantity: number) => {
      if (!product) return;

      setIsAdding(true);
      addItem(
        {
          category: product.category,
          id: product.id,
          image: product.image,
          name: product.name,
          price: product.price,
        },
        quantity,
      );
      toast.success(`${product.name} added to cart`);
      await new Promise((r) => setTimeout(r, 400)); // fake latency
      setIsAdding(false);
    },
    [addItem, product],
  );

  const handleAddToWishlist = React.useCallback(() => {
    if (!product) return;
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      inStock: product.inStock,
      originalPrice: product.originalPrice,
    });
    toast.success(isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist");
  }, [product, addToWishlist, isInWishlist]);

  const handleRelatedAddToCart = React.useCallback((productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
    }, 1);
    toast.success(`${p.name} added to cart`);
  }, [addItem]);

  const handleRelatedAddToWishlist = React.useCallback((productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    addToWishlist({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      inStock: p.inStock,
      originalPrice: p.originalPrice,
    });
    toast.success(isInWishlist(p.id) ? "Removed from wishlist" : "Added to wishlist");
  }, [addToWishlist, isInWishlist]);

  /* -------------------------- Conditional UI ---------------------------- */
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-10">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl font-bold">Product Not Found</h1>
            <p className="mt-4 text-muted-foreground">
              The product you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button className="mt-6" onClick={() => router.push("/products")}>
              Back to Products
            </Button>
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------ Markup --------------------------------- */
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 sm:py-10">
        <div className="container px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/products"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Product image */}
            <ProductImage
              alt={product.name}
              discountPercentage={discountPercentage}
              inStock={product.inStock}
              src={product.image}
            />

            {/* Product info & add to cart */}
            <div className="flex flex-col gap-6">
              <ProductInfo
                category={product.category}
                description={product.description}
                inStock={product.inStock}
                name={product.name}
                originalPrice={product.originalPrice}
                price={product.price}
                rating={product.rating}
              />

              <AddToCartSection
                disabled={!product.inStock}
                isAdding={isAdding}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>

          <Separator className="my-8 sm:my-12" />

          {/* Features, Specs & Package Contents */}
          <ProductDetailsTabs
            features={product.features}
            packageContents={product.packageContents}
            specs={product.specs}
          />

          <Separator className="my-8 sm:my-12" />

          {/* Product Reviews */}
          <section className="mt-8">
            <ProductReviews productId={product.id} productName={product.name} />
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <>
              <Separator className="my-8 sm:my-12" />
              <section>
                <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={{
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        originalPrice: p.originalPrice,
                        image: p.image,
                        category: p.category,
                        rating: p.rating,
                        inStock: p.inStock,
                      }}
                      onAddToCart={handleRelatedAddToCart}
                      onAddToWishlist={handleRelatedAddToWishlist}
                      isInWishlist={isInWishlist(p.id)}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Recently Viewed */}
          {displayRecentlyViewed.length > 0 && (
            <>
              <Separator className="my-8 sm:my-12" />
              <section>
                <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayRecentlyViewed.map((p) => {
                    const fullProduct = products.find((prod) => prod.id === p.id);
                    return (
                      <ProductCard
                        key={p.id}
                        product={{
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          image: p.image,
                          category: p.category,
                          inStock: fullProduct?.inStock ?? true,
                          rating: fullProduct?.rating,
                          originalPrice: fullProduct?.originalPrice,
                        }}
                        onAddToCart={handleRelatedAddToCart}
                        onAddToWishlist={handleRelatedAddToWishlist}
                        isInWishlist={isInWishlist(p.id)}
                      />
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
