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
import { Metadata } from "next"; // Kept import for type if needed, though unused
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";
import { resolveImageUrl } from "~/lib/image-utils";
import { JsonLd } from "~/ui/components/json-ld";

// Metadata export removed to avoid "metadata in client component" error
// export const metadata: Metadata = {
//   title: "Professional Dental Instruments",
//   description: "Browse our extensive catalog of high-quality dental tools, mirrors, forceps, and surgical instruments.",
// };

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
import { ProductSkeleton, SidebarCategorySkeleton } from "~/ui/components/home-skeletons";


/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type SortOption = "featured" | "newest" | "price-low" | "price-high" | "rating" | "name";

interface CategoryData {
  name: string;
  subcategories?: (string | { name: string })[];
  showInMenu?: boolean;
  productCount?: number;
  icon?: string;
}

interface Product {
  category: string; // Keep as string or handle mixed type if needed, but robustly it's usually normalized to name or ID
  subcategory?: string;
  id: string;
  image: string;
  inStock: boolean;
  name: string;
  originalPrice?: number;
  price: number;
  discountedPrice?: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    isActive: boolean;
    discountedPrice?: number;
  };
  rating: number;
  brand?: string;
  reviews?: number;
  specifications?: {
    size?: number[];
  };
}

interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

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

function ProductsContent() {
  const { addItem, openCart } = useCart();
  const { addProduct: addToCompare, isInCompare, products: compareProducts } = useCompare();

  /* ----------------------- State ------------------------- */
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);

  const [apiCategories, setApiCategories] = React.useState<CategoryData[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);

  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string | null>(null);

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

  const [pagination, setPagination] = React.useState<PaginationMetadata | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);

  /* ----------------------- Data Fetching ------------------------- */

  // Fetch products
  React.useEffect(() => {
    setProductsLoading(true);
    const params = new URLSearchParams();
    params.set("productType", "single");
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }
    if (selectedSubcategory) {
      params.set("subcategory", selectedSubcategory);
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    // Note: brand, price range, stock, and rating might not be fully supported by user API yet 
    // but they are supported by the admin API. Assuming backend parity for these.
    if (selectedBrands.length > 0) {
      params.set("brand", selectedBrands.join(","));
    }
    if (inStockOnly) {
      params.set("minStock", "1");
    }
    if (onSaleOnly) {
      params.set("onSale", "true");
    }

    fetch(`/api/user/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && data.data) {
          const productList = data.data.products || (Array.isArray(data.data) ? data.data : []);
          setProducts(mapProducts(productList));
          if (data.data.pagination) {
            setPagination(data.data.pagination);
          }
        } else {
          setProducts([]);
          setPagination(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
        setPagination(null);
      })
      .finally(() => setProductsLoading(false));
  }, [currentPage, pageSize, selectedCategory, selectedSubcategory, searchQuery, selectedBrands, inStockOnly, onSaleOnly]);

  // Helper to map API product to local interface
  const mapProducts = (list: any[]): Product[] => {
    return list.map((p: any) => ({
      id: p._id || p.id,
      name: p.name,
      price: p.price,
      discount: p.discount,
      originalPrice: p.originalPrice || p.compareAtPrice,
      image: resolveImageUrl(p.images?.[0] || p.image),
      category: p.category?.name || p.category || "Uncategorized",
      subcategory: typeof p.subcategory === 'object' ? p.subcategory?.name : p.subcategory,
      brand: p.brand,
      rating: p.ratings?.average || p.rating || 0,
      reviews: p.ratings?.count || p.reviews || 0,
      inStock: (p.inventory?.quantity > 0 || p.inStock !== false) && p.status !== 'inactive',
      specifications: p.specifications,
    }));
  };

  // Fetch categories
  React.useEffect(() => {
    fetch("/api/user/categories")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && Array.isArray(data.data)) {
          setApiCategories(data.data);
        } else if (data.success && data.data?.categories) {
          setApiCategories(data.data.categories);
        } else {
          setApiCategories([]);
        }
      })
      .catch(() => setApiCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  /* ----------------------- Derived State ------------------------- */

  const displayCategories = React.useMemo(() => {
    return apiCategories.filter(c => c.showInMenu !== false);
  }, [apiCategories]);

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  React.useEffect(() => {
    if (initialCategory) {
      const decoded = decodeURIComponent(initialCategory);
      const match = displayCategories.find(c => c.name.toLowerCase() === decoded.toLowerCase());
      if (match) {
        setSelectedCategory(match.name);
      }
    }
  }, [initialCategory, displayCategories]);

  /* --------------------- Active filters count --------------------------- */
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedSubcategory) count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (minRating > 0) count++;
    return count;
  }, [selectedCategory, selectedSubcategory, selectedBrands, priceRange, inStockOnly, onSaleOnly, minRating]);

  /* --------------------- Filtered products (memo) ----------------------- */
  const filteredProducts = React.useMemo(() => {
    // Since we moved filtering to backend for category, search, subcategory, brand, stock, and sale
    // We only need to handle client-side sorting and rating/price filters if they are not yet fully supported by backend.

    let result = [...products];

    // Client-side Price range filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Client-side Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Client-side Sort
    switch (sortBy) {
      case "price-low":
        result = result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        // Assuming backend handles order mostly, but we can reverse if needed or just let it be
        break;
      default:
        break;
    }

    return result;
  }, [products, sortBy, priceRange, minRating]);

  /* --------------------------- Handlers --------------------------------- */
  const handleAddToCart = React.useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const displayPrice = (product.discount?.isActive && product.discount?.discountedPrice && product.discount.discountedPrice < product.price)
          ? product.discount.discountedPrice
          : product.price;

        addItem(
          {
            category: product.category,
            id: product.id,
            image: product.image,
            name: product.name,
            price: displayPrice,
          },
          1,
        );
        openCart();
        toast.success(`${product.name} added to cart`);
      }
    },
    [addItem, openCart, products],
  );



  const handleAddToCompare = React.useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const displayPrice = (product.discount?.isActive && product.discount?.discountedPrice && product.discount.discountedPrice < product.price)
        ? product.discount.discountedPrice
        : product.price;
      const originalPrice = (product.discount?.isActive && product.discount?.discountedPrice && product.discount.discountedPrice < product.price)
        ? product.price
        : product.originalPrice;

      addToCompare({
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: product.image,
        category: product.category,
        rating: product.rating,
        inStock: product.inStock,
        originalPrice: originalPrice,
      });
    }
  }, [addToCompare, products]);

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
    setCurrentPage(1);
  };

  /* ----------------------------- Filter Sidebar Content ----------------- */
  const FilterContent = () => (
    <div className="space-y-6 bg-muted p-4 rounded-lg">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">Categories 🦷 / 🔧</h3>
        <div className="space-y-2">
          <button
            className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${selectedCategory === "All"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
              }`}
            onClick={() => {
              setSelectedCategory("All");
              setSelectedSubcategory(null);
              setCurrentPage(1);
            }}
          >
            All Categories
          </button>

          {categoriesLoading ? (
            <SidebarCategorySkeleton />
          ) : (
            displayCategories.map((category) => (
              <div key={category.name}>
                <button
                  className={`flex items-center w-full px-2 py-1.5 rounded text-sm transition-colors ${selectedCategory === category.name
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                    }`}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSelectedSubcategory(null);
                    setCurrentPage(1);
                  }}
                >
                  <span className="mr-2 text-lg">{category.icon || "🦷"}</span>
                  {category.name}
                </button>

                {/* Render Subcategories if category matches */}
                {/* Alternatively, always show expand logic, but simpler to show when parent selected or always if small list. 
                      Let's show when parent selected OR allow user to see structure. 
                      Given standard e-com patterns: show subcategories indented. 
                  */}
                {(selectedCategory === category.name || category.subcategories?.some(s => {
                  const sName = typeof s === 'string' ? s : s.name;
                  return sName === selectedSubcategory;
                })) && category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-4 mt-1 border-l-2 pl-2 space-y-1">
                      {category.subcategories.map(sub => {
                        const subName = typeof sub === 'string' ? sub : sub.name;
                        return (
                          <button
                            key={subName}
                            className={`block w-full text-left px-2 py-1 rounded text-xs transition-colors ${selectedSubcategory === subName
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(category.name);
                              setSelectedSubcategory(subName);
                              setCurrentPage(1);
                            }}
                          >
                            {subName}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            ))
          )}
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
            <span>{priceRange[0]} EGP</span>
            <span>{priceRange[1]} EGP</span>
          </div>
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";
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
      }
    ]
  };

  /* ----------------------------- Render --------------------------------- */
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={breadcrumbJsonLd} />
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
              {compareProducts.length > 0 && (
                <Link href="/compare">
                  <Button variant="outline" className="gap-2">
                    <GitCompare className="h-4 w-4" />
                    Compare ({compareProducts.length})
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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
                  {priceRange[0]} - {priceRange[1]} EGP
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
                Showing {filteredProducts.length} of {pagination?.totalProducts || products.length} products
                {searchQuery && ` for "${searchQuery}"`}
              </div>

              {/* Product grid */}
              {productsLoading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 sm:gap-5"
                      : "space-y-6"
                  }
                >
                  <ProductSkeleton />
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 sm:gap-5"
                      : "space-y-6"
                  }
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                      onAddToCompare={handleAddToCompare}
                      isInCompare={isInCompare(product.id)}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!productsLoading && filteredProducts.length === 0 && (
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
              {pagination && pagination.totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-6 flex items-center justify-center gap-1 sm:mt-8 sm:gap-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev || productsLoading}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center px-2 text-sm font-medium text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!pagination.hasNext || productsLoading}
                  >
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
          product={{
            id: quickViewProduct.id,
            name: quickViewProduct.name,
            price: quickViewProduct.price,
            image: quickViewProduct.image,
            category: quickViewProduct.category,
            inStock: quickViewProduct.inStock,
            rating: quickViewProduct.rating,
            reviewCount: quickViewProduct.reviews,
            originalPrice: quickViewProduct.originalPrice,
            discount: quickViewProduct.discount,
            description: "Product description..."
          }}
          open={!!quickViewProduct}
          onOpenChange={(open) => !open && setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12 text-center text-muted-foreground">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
