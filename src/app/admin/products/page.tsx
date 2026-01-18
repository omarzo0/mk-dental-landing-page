"use client";

import {
  Download,
  Edit,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { resolveImageUrl } from "~/lib/image-utils";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Checkbox } from "~/ui/primitives/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import { Input } from "~/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/ui/primitives/tabs";
import { CategoryManager } from "./category-manager";
import { PackageManager } from "./package-manager";
import { EditProductDialog } from "./edit-product-dialog";
import { ProductStatsSkeleton, ProductTableSkeleton } from "~/ui/components/admin/product-skeletons";

// Product type from API
interface Product {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  category: string;
  subcategory?: string;
  price: number;
  comparePrice?: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    isActive: boolean;
    discountedPrice?: number;
  };
  cost?: number;
  inventory?: {
    quantity: number;
    lowStockAlert?: number;
    trackInventory?: boolean;
  };
  images?: Array<string | {
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  status: "active" | "inactive" | "draft";
  featured?: boolean;
  productType?: "single" | "package";
  sales?: {
    totalSold?: number;
    totalRevenue?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Statistics {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalValue?: number;
  averagePrice?: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    products: Product[];
    pagination: Pagination;
    statistics?: Statistics;
    categories?: Array<{ _id: string; count: number }>;
  };
}

// Status filter options
const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Draft", value: "draft" },
];

// Stock filter options  
const stockOptions = [
  { label: "All Stock", value: "all" },
  { label: "In Stock", value: "inStock" },
  { label: "Out of Stock", value: "outOfStock" },
  { label: "Low Stock", value: "lowStock" },
];

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [statistics, setStatistics] = React.useState<Statistics | null>(null);
  const [categories, setCategories] = React.useState<Array<{ _id: string; count: number }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [stockFilter, setStockFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products from API
  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");
      if (!token) {
        return;
      }

      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "20");
      params.set("productType", "single");

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (stockFilter === "outOfStock") {
        params.set("maxStock", "0");
      } else if (stockFilter === "lowStock") {
        params.set("maxStock", "10");
        params.set("minStock", "1");
      } else if (stockFilter === "inStock") {
        params.set("minStock", "1");
      }

      const response = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as ApiResponse;

      if (data.success && data.data) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
        if (data.data.statistics) {
          setStatistics(data.data.statistics);
        }
        if (data.data.categories) {
          setCategories(data.data.categories);
        }
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, categoryFilter, statusFilter, stockFilter]);

  // Fetch products on mount and when filters change
  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");
      const response = await fetch(`/api/admin/products/${productToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as { success: boolean; message?: string };

      if (data.success) {
        toast.success("Product deleted successfully");
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete",
          productIds: selectedProducts,
          data: { permanent: false },
        }),
      });

      const data = (await response.json()) as { success: boolean; message?: string };

      if (data.success) {
        toast.success(`${selectedProducts.length} products deleted successfully`);
        setSelectedProducts([]);
        setBulkDeleteDialogOpen(false);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete products");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete products");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get primary image URL for a product
  const getProductImage = (product: Product): { url: string; alt: string } => {
    let url = "/placeholder.svg";
    let alt = "No product image";

    if (product.images && product.images.length > 0) {
      // Try to find primary image (if it's an object array)
      const primaryImage = (product.images as any[]).find(
        (img) => typeof img === 'object' && img !== null && img.isPrimary && img.url
      );

      if (primaryImage) {
        url = primaryImage.url;
        alt = primaryImage.alt || product.name;
      } else {
        // Fallback to first image
        const firstImage = product.images[0];
        if (typeof firstImage === 'string') {
          url = firstImage;
          alt = product.name;
        } else if (typeof firstImage === 'object' && firstImage !== null && firstImage.url) {
          url = firstImage.url;
          alt = firstImage.alt || product.name;
        }
      }
    }

    return { url: resolveImageUrl(url), alt };
  };

  // Get stock status
  const getStockStatus = (product: Product) => {
    const quantity = product.inventory?.quantity ?? 0;
    const lowStockAlert = product.inventory?.lowStockAlert ?? 10;

    if (quantity === 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    }
    if (quantity <= lowStockAlert) {
      return { label: "Low Stock", variant: "secondary" as const };
    }
    return { label: "In Stock", variant: "default" as const };
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ["ID", "Name", "SKU", "Category", "Price", "Compare Price", "Stock", "Status"];
    const csvContent = [
      headers.join(","),
      ...products.map((p) =>
        [
          p._id,
          `"${p.name}"`,
          p.sku || "",
          p.category,
          p.price,
          p.comparePrice || "",
          p.inventory?.quantity ?? 0,
          p.status,
        ].join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Products exported successfully");
  };

  const handleImport = () => {
    // Mock import - in real app, would process uploaded file
    toast.success("Products imported successfully");
    setImportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground">
                Manage your product catalog
                {statistics && ` (${statistics.totalProducts} products)`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={products.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          {loading && !statistics ? (
            <ProductStatsSkeleton />
          ) : statistics ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Products</CardDescription>
                  <CardTitle className="text-2xl">{statistics.totalProducts}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Products</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{statistics.activeProducts}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Out of Stock</CardDescription>
                  <CardTitle className="text-2xl text-red-600">{statistics.outOfStockProducts}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Low Stock</CardDescription>
                  <CardTitle className="text-2xl text-yellow-600">{statistics.lowStockProducts}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          ) : null}

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">
                  {selectedProducts.length} product(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProducts([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters & Search */}
          <Card>
            <CardHeader>
              <CardTitle>Product List</CardTitle>
              <CardDescription>
                {pagination ? `${pagination.totalProducts} products found` : "Loading..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="relative flex-1 w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                  <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat._id} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={(val) => { setStockFilter(val); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            products.length > 0 &&
                            selectedProducts.length === products.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <ProductTableSkeleton />
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => {
                        const stockStatus = getStockStatus(product);
                        return (
                          <TableRow key={product._id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.includes(product._id)}
                                onCheckedChange={(checked) =>
                                  handleSelectProduct(product._id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                                <Image
                                  src={getProductImage(product).url}
                                  alt={getProductImage(product).alt}
                                  width={48}
                                  height={48}
                                  className="object-cover w-12 h-12"
                                  unoptimized={true}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    // Prevent infinite loop if placeholder also fails
                                    if (target.src.includes("/placeholder.svg")) return;
                                    target.src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.sku ? `SKU: ${product.sku}` : `ID: ${product._id.slice(-8)}`}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 items-start">
                                <Badge variant="secondary">{product.category}</Badge>
                                {product.subcategory && (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">{product.subcategory}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                {product.discount?.isActive && product.discount?.discountedPrice ? (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-green-600">
                                        {product.discount.discountedPrice.toFixed(2)} EGP
                                      </p>
                                      <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-green-100 text-green-700 border-green-200">
                                        -{product.discount.type === 'percentage' ? `${product.discount.value}%` : `${product.discount.value} EGP`}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-through">
                                      {product.price.toFixed(2)} EGP
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium">{product.price.toFixed(2)} EGP</p>
                                    {product.comparePrice && (
                                      <p className="text-xs text-muted-foreground line-through">
                                        {product.comparePrice.toFixed(2)} EGP
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant={stockStatus.variant}>
                                  {stockStatus.label}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Qty: {product.inventory?.quantity ?? 0}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.status === "active"
                                    ? "default"
                                    : product.status === "draft"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setProductToEdit(product);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/products/${product._id}`} target="_blank">
                                      View in Store
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(product._id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.hasNext || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager onUpdate={fetchProducts} />
        </TabsContent>

        <TabsContent value="packages">
          <PackageManager />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProducts.length} product(s)?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete {selectedProducts.length} Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to bulk import products.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="max-w-xs mx-auto"
              />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>CSV (.csv)</li>
                <li>Excel (.xlsx, .xls)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={productToEdit}
        onSuccess={fetchProducts}
      />
    </div >
  );
}
