"use client";

import { Package, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useCart } from "~/lib/hooks/use-cart";
import { ProductCard } from "~/ui/components/product-card";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Category = string;

interface Product {
  category: string;
  id: string;
  image: string;
  inStock: boolean;
  name: string;
  originalPrice?: number;
  price: number;
  rating: number;
}

/* -------------------------------------------------------------------------- */
/*                            Helpers / utilities                             */
/* -------------------------------------------------------------------------- */

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

/* -------------------------------------------------------------------------- */
/*                               Mock data                                    */
/* -------------------------------------------------------------------------- */

const products: Product[] = [
  {
    category: "Diagnostic Instruments",
    id: "1",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Professional Dental Mirror Set",
    originalPrice: 89.99,
    price: 69.99,
    rating: 4.8,
  },
  {
    category: "Surgical Instruments",
    id: "2",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Dental Extraction Forceps Kit",
    originalPrice: 299.99,
    price: 249.99,
    rating: 4.9,
  },
  {
    category: "Diagnostic Instruments",
    id: "3",
    image:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60",
    inStock: false,
    name: "Dental Explorer Set (Double-Ended)",
    originalPrice: 79.99,
    price: 59.99,
    rating: 4.7,
  },
  {
    category: "Restorative Tools",
    id: "4",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Composite Filling Instrument Set",
    originalPrice: 159.99,
    price: 129.99,
    rating: 4.6,
  },
  {
    category: "Hygiene Equipment",
    id: "5",
    image:
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Ultrasonic Scaler Unit",
    originalPrice: 599.99,
    price: 499.99,
    rating: 4.9,
  },
  {
    category: "Surgical Instruments",
    id: "6",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Periodontal Curette Set",
    originalPrice: 189.99,
    price: 149.99,
    rating: 4.8,
  },
];

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

export default function ProductsPage() {
  const { addItem } = useCart();

  /* ----------------------- Categories (derived) ------------------------- */
  const categories: Category[] = React.useMemo(() => {
    const dynamic = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["All", ...dynamic];
  }, []);

  /* ----------------------------- State ---------------------------------- */
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category>("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  /* --------------------- Filtered products (memo) ----------------------- */
  const filteredProducts = React.useMemo(() => {
    let result = products;
    
    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [selectedCategory, searchQuery]);

  /* --------------------------- Handlers --------------------------------- */
  const handleAddToCart = React.useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        addItem(
          {
            category: product.category,
            id: product.id,
            image: product.image,
            name: product.name,
            price: product.price,
          },
          1, // (quantity) always adds 1 item to the cart
        );
      }
    },
    [addItem],
  );

  const handleAddToWishlist = React.useCallback((productId: string) => {
    // TODO: integrate with Wishlist feature
    console.log(`Added ${productId} to wishlist`);
  }, []);

  /* ----------------------------- Render --------------------------------- */
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 sm:py-10">
        <div
          className={`
            container px-4
            sm:px-6
          `}
        >
          {/* Heading */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dental Instruments</h1>
              <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                Browse our professional dental tools and equipment for your practice.
              </p>
            </div>
            <Link href="/packages">
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <Package className="h-4 w-4" />
                View Packages
              </Button>
            </Link>
          </div>

          {/* Search bar */}
          <div className="mb-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category pills */}
          <div className="mb-4 -mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 sm:overflow-visible">
            <div className="flex gap-2 pb-2 sm:flex-wrap sm:pb-0">
              {categories.map((category) => (
                <Button
                  aria-pressed={category === selectedCategory}
                  className="rounded-full whitespace-nowrap flex-shrink-0"
                  key={slugify(category)}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  title={`Filter by ${category}`}
                  variant={
                    category === selectedCategory ? "default" : "outline"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Product count */}
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </div>

          {/* Product grid */}
          <div
            className={`
              mx-auto grid max-w-4xl grid-cols-1 gap-4
              sm:grid-cols-2 sm:gap-5
              lg:grid-cols-3 lg:gap-6
            `}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                product={product}
              />
            ))}
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="mt-8 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No products found{searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          <nav
            aria-label="Pagination"
            className="mt-8 flex items-center justify-center gap-1 sm:mt-12 sm:gap-2"
          >
            <Button disabled variant="outline" size="sm" className="sm:size-default">
              Previous
            </Button>
            <Button aria-current="page" variant="default" size="sm" className="sm:size-default">
              1
            </Button>
            <Button disabled variant="outline" size="sm" className="sm:size-default">
              Next
            </Button>
          </nav>
        </div>
      </main>
    </div>
  );
}
