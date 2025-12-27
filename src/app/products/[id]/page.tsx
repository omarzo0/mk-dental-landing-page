"use client";

import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "~/lib/hooks/use-cart";
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

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-EG", {
  currency: "EGP",
  style: "currency",
});

/** `feature -> feature` ➜ `feature-feature` (for React keys) */
const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

/** Build an integer array `[0,…,length-1]` once */
const range = (length: number) => Array.from({ length }, (_, i) => i);

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

  /* ----------------------------- Local state ----------------------------- */
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  /* ------------------------ Derive product object ------------------------ */
  const product = React.useMemo(() => products.find((p) => p.id === id), [id]);

  /* ----------------------- Derived/computed values ----------------------- */
  const discountPercentage = React.useMemo(() => {
    if (!product?.originalPrice) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100,
    );
  }, [product]);

  /* ------------------------------ Handlers ------------------------------- */
  const handleQuantityChange = React.useCallback((newQty: number) => {
    setQuantity((prev) => (newQty >= 1 ? newQty : prev));
  }, []);

  const handleAddToCart = React.useCallback(async () => {
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
    setQuantity(1);
    toast.success(`${product.name} added to cart`);
    await new Promise((r) => setTimeout(r, 400)); // fake latency
    setIsAdding(false);
  }, [addItem, product, quantity]);

  /* -------------------------- Conditional UI ---------------------------- */
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-10">
          <div
            className={`
              container px-4
              md:px-6
            `}
          >
            <h1 className="text-3xl font-bold">Product Not Found</h1>
            <p className="mt-4">
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
      <main className="flex-1 py-10">
        <div
          className={`
            container px-4
            md:px-6
          `}
        >
          {/* Back link */}
          <Button
            aria-label="Back to products"
            className="mb-6"
            onClick={() => router.push("/products")}
            variant="ghost"
          >
            ← Back to Products
          </Button>

          {/* Main grid */}
          <div
            className={`
              grid grid-cols-1 gap-8
              md:grid-cols-2
            `}
          >
            {/* ------------------------ Product image ------------------------ */}
            <div
              className={`
                relative aspect-square overflow-hidden rounded-lg bg-muted
              `}
            >
              <Image
                alt={product.name}
                className="object-cover"
                fill
                priority
                src={product.image}
              />
              {discountPercentage > 0 && (
                <div
                  className={`
                    absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1
                    text-xs font-bold text-white
                  `}
                >
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* ---------------------- Product info -------------------------- */}
            <div className="flex flex-col">
              {/* Title & rating */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>

                <div className="mt-2 flex items-center gap-2">
                  {/* Stars */}
                  <div
                    aria-label={`Rating ${product.rating} out of 5`}
                    className="flex items-center"
                  >
                    {range(5).map((i) => (
                      <Star
                        className={`
                          h-5 w-5
                          ${
                            i < Math.floor(product.rating)
                              ? "fill-primary text-primary"
                              : i < product.rating
                                ? "fill-primary/50 text-primary"
                                : "text-muted-foreground"
                          }
                        `}
                        key={`star-${i}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>
              </div>

              {/* Category & prices */}
              <div className="mb-4 sm:mb-6">
                <p className="text-base font-medium text-muted-foreground sm:text-lg">
                  {product.category}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold sm:text-3xl">
                    {CURRENCY_FORMATTER.format(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through sm:text-xl">
                      {CURRENCY_FORMATTER.format(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm text-muted-foreground sm:mb-6 sm:text-base">
                {product.description}
              </p>

              {/* Stock */}
              <div aria-atomic="true" aria-live="polite" className="mb-4 sm:mb-6">
                {product.inStock ? (
                  <p className="text-sm font-medium text-green-600">In Stock</p>
                ) : (
                  <p className="text-sm font-medium text-red-500">
                    Out of Stock
                  </p>
                )}
              </div>

              {/* Quantity selector & Add to cart */}
              <div
                className={`
                  mb-4 flex flex-col gap-3
                  sm:mb-6 sm:flex-row sm:items-center sm:gap-4
                `}
              >
                {/* Quantity */}
                <div className="flex items-center">
                  <Button
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    size="icon"
                    variant="outline"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="w-12 text-center select-none">
                    {quantity}
                  </span>

                  <Button
                    aria-label="Increase quantity"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to cart */}
                <Button
                  className="flex-1"
                  disabled={!product.inStock || isAdding}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAdding ? "Adding…" : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* ---------------------- Features & Specs ------------------------ */}
          <div
            className={`
              grid grid-cols-1 gap-6
              sm:gap-8
              md:grid-cols-2
            `}
          >
            {/* Features */}
            <section>
              <h2 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li
                    className="flex items-start text-sm sm:text-base"
                    key={`feature-${product.id}-${slugify(feature)}`}
                  >
                    <span className="mt-1.5 mr-2 h-1.5 w-1.5 rounded-full bg-primary sm:mt-2 sm:h-2 sm:w-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Specifications */}
            <section>
              <h2 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">Specifications</h2>
              <div className="space-y-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    className="flex justify-between gap-4 border-b pb-2 text-xs sm:text-sm"
                    key={key}
                  >
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-right text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <Separator className="my-8" />

          {/* ---------------------- Package Contents ------------------------ */}
          <section>
            <h2 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">Package Contents</h2>
            <div className="rounded-lg border bg-muted/30 p-4 sm:p-6">
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.packageContents.map((item) => (
                  <li
                    className="flex items-center text-sm sm:text-base"
                    key={`package-${product.id}-${slugify(item)}`}
                  >
                    <span className="mr-2 text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
