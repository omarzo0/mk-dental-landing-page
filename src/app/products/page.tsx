"use client";

import {
  ChevronDown,
  Filter,
  GitCompare,
  Grid3X3,
  LayoutList,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "~/lib/hooks/use-cart";
import { useCompare } from "~/lib/hooks/use-compare";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { ProductCard } from "~/ui/components/product-card";
import { QuickViewModal } from "~/ui/components/quick-view-modal";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Checkbox } from "~/ui/primitives/checkbox";
import { Badge } from "~/ui/primitives/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/primitives/sheet";
import { Separator } from "~/ui/primitives/separator";
import { Slider } from "~/ui/primitives/slider";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Category = string;
type SortOption = "featured" | "newest" | "price-low" | "price-high" | "rating" | "name";

interface Product {
  category: string;
  id: string;
  image: string;
  inStock: boolean;
  name: string;
  originalPrice?: number;
  price: number;
  rating: number;
  brand?: string;
  reviews?: number;
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
    brand: "MK Dental",
    reviews: 124,
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
    brand: "ProDent",
    reviews: 89,
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
    brand: "DentaTech",
    reviews: 56,
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
    brand: "MK Dental",
    reviews: 78,
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
    brand: "ProDent",
    reviews: 203,
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
    brand: "DentaTech",
    reviews: 67,
  },
  {
    category: "Disposables",
    id: "7",
    image:
      "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Disposable Prophy Angles (500pc)",
    price: 89.99,
    rating: 4.5,
    brand: "MK Dental",
    reviews: 312,
  },
  {
    category: "Disposables",
    id: "8",
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Sterilization Pouches (200pc)",
    price: 24.99,
    rating: 4.7,
    brand: "MK Dental",
    reviews: 445,
  },
  {
    category: "Orthodontic",
    id: "9",
    image:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Orthodontic Bracket Kit",
    originalPrice: 399.99,
    price: 349.99,
    rating: 4.8,
    brand: "OrthoMax",
    reviews: 156,
  },
  {
    category: "Restorative Tools",
    id: "10",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "Dental Composite Kit",
    originalPrice: 179.99,
    price: 159.99,
    rating: 4.6,
    brand: "DentaTech",
    reviews: 98,
  },
  {
    category: "Equipment",
    id: "11",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=60",
    inStock: true,
    name: "LED Curing Light",
    originalPrice: 299.99,
    price: 249.99,
    rating: 4.9,
    brand: "ProDent",
    reviews: 234,
  },
  {
    category: "Equipment",
    id: "12",
    image:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60",
    inStock: false,
    name: "Dental X-Ray Sensor",
    originalPrice: 1499.99,
    price: 1299.99,
    rating: 4.8,
    brand: "ProDent",
    reviews: 67,
  },
];

const brands = ["MK Dental", "ProDent", "DentaTech", "OrthoMax"];
const priceRanges = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $250", min: 100, max: 250 },
  { label: "$250 - $500", min: 250, max: 500 },
  { label: "Over $500", min: 500, max: Infinity },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "Name: A to Z" },
];

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

export default function ProductsPage() {
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { addProduct: addToCompare, isInCompare, itemCount: compareCount } = useCompare();

  /* ----------------------- Categories (derived) ------------------------- */
  const categories: Category[] = React.useMemo(() => {
    const dynamic = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["All", ...dynamic];
  }, []);

  /* ----------------------------- State ---------------------------------- */
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("featured");
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [onSaleOnly, setOnSaleOnly] = React.useState(false);
  const [minRating, setMinRating] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

  /* --------------------- Active filters count --------------------------- */
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (minRating > 0) count++;
    return count;
  }, [selectedCategory, selectedBrands, priceRange, inStockOnly, onSaleOnly, minRating]);

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
          p.category.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
      result = result.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    // Filter by price range
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by stock
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Filter by sale
    if (onSaleOnly) {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result = [...result].reverse();
        break;
      default:
        break;
    }
    
    return result;
  }, [selectedCategory, searchQuery, sortBy, selectedBrands, priceRange, inStockOnly, onSaleOnly, minRating]);

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
          1,
        );
        toast.success(`${product.name} added to cart`);
      }
    },
    [addItem],
  );

  const handleAddToWishlist = React.useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        toast.success(`${product.name} removed from wishlist`);
      } else {
        addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          originalPrice: product.originalPrice,
        });
        toast.success(`${product.name} added to wishlist`);
      }
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist]);

  const handleAddToCompare = React.useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCompare({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating,
        inStock: product.inStock,
        originalPrice: product.originalPrice,
      });
    }
  }, [addToCompare]);

  const handleQuickView = React.useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setQuickViewProduct(product);
    }
  }, []);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedBrands([]);
    setPriceRange([0, 2000]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMinRating(0);
    setSearchQuery("");
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  /* ----------------------------- Filter Sidebar Content ----------------- */
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                category === selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h3 className="font-medium mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={2000}
            step={10}
          />
          <div className="flex items-center justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-medium mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
                minRating === rating
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
            >
              {"★".repeat(rating)}{"☆".repeat(5 - rating)}
              <span className="ml-1">& up</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <h3 className="font-medium mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={onSaleOnly}
              onCheckedChange={(checked) => setOnSaleOnly(checked as boolean)}
            />
            <Label htmlFor="on-sale" className="text-sm cursor-pointer">
              On Sale
            </Label>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  /* ----------------------------- Render --------------------------------- */
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 sm:py-10">
        <div className="container px-4 sm:px-6">
          {/* Heading */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dental Instruments</h1>
              <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                Browse our professional dental tools and equipment for your practice.
              </p>
            </div>
            <div className="flex gap-2">
              {compareCount > 0 && (
                <Link href="/compare">
                  <Button variant="outline" className="gap-2">
                    <GitCompare className="h-4 w-4" />
                    Compare ({compareCount})
                  </Button>
                </Link>
              )}
              <Link href="/packages">
                <Button variant="outline" className="gap-2 whitespace-nowrap">
                  <Package className="h-4 w-4" />
                  View Packages
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and filters bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter trigger */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Sort
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? "bg-muted" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View mode toggle */}
              <div className="hidden sm:flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {activeFiltersCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== "All" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedBrands.map((brand) => (
                <Badge key={brand} variant="secondary" className="gap-1">
                  {brand}
                  <button onClick={() => toggleBrand(brand)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                <Badge variant="secondary" className="gap-1">
                  ${priceRange[0]} - ${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 2000])}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {inStockOnly && (
                <Badge variant="secondary" className="gap-1">
                  In Stock
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {onSaleOnly && (
                <Badge variant="secondary" className="gap-1">
                  On Sale
                  <button onClick={() => setOnSaleOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(0)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-8">
                <h2 className="font-semibold mb-4">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products Area */}
            <div className="flex-1">
              {/* Product count */}
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
                {searchQuery && ` for "${searchQuery}"`}
              </div>

              {/* Product grid */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    onQuickView={handleQuickView}
                    onAddToCompare={handleAddToCompare}
                    isInWishlist={isInWishlist(product.id)}
                    isInCompare={isInCompare(product.id)}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Empty state */}
              {filteredProducts.length === 0 && (
                <div className="mt-8 text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No products found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <nav
                  aria-label="Pagination"
                  className="mt-8 flex items-center justify-center gap-1 sm:mt-12 sm:gap-2"
                >
                  <Button disabled variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button aria-current="page" variant="default" size="sm">
                    1
                  </Button>
                  <Button disabled variant="outline" size="sm">
                    Next
                  </Button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onOpenChange={(open) => !open && setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
