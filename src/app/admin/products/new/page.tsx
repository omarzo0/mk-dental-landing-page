"use client";

import {
  ArrowLeft,
  ImagePlus,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import { Switch } from "~/ui/primitives/switch";

// Categories for products
const categories = [
  "Diagnostic",
  "Surgical",
  "Restorative",
  "Preventive",
  "Orthodontic",
  "Endodontic",
  "Periodontic",
  "Equipment",
];

// Brands
const brands = [
  "DentalPro",
  "MedEquip",
  "OralCare Plus",
  "DentSure",
  "PrecisionDental",
  "Other",
];

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  brand: string;
  price: string;
  originalPrice: string;
  sku: string;
  barcode: string;
  stockQuantity: string;
  lowStockThreshold: string;
  inStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  images: string[];
  weight: string;
  dimensions: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [newTag, setNewTag] = React.useState("");
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    originalPrice: "",
    sku: "",
    barcode: "",
    stockQuantity: "",
    lowStockThreshold: "10",
    inStock: true,
    isActive: true,
    isFeatured: false,
    tags: [],
    images: [],
    weight: "",
    dimensions: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Product created successfully");
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product in your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic product details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => handleSelectChange("category", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(v) => handleSelectChange("brand", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Set the product pricing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price ($) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">
                      Compare at Price ($)
                    </Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Original price before discount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  Manage stock and inventory settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      name="sku"
                      placeholder="Enter SKU"
                      value={formData.sku}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      placeholder="Enter barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      type="number"
                      placeholder="10"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when stock falls below this number
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>
                  Product weight and dimensions for shipping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.weight}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions (L x W x H cm)</Label>
                    <Input
                      id="dimensions"
                      name="dimensions"
                      placeholder="e.g., 10 x 5 x 3"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Add tags to help customers find this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Product is visible in store
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isActive", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>In Stock</Label>
                    <p className="text-xs text-muted-foreground">
                      Product is available for purchase
                    </p>
                  </div>
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("inStock", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Featured</Label>
                    <p className="text-xs text-muted-foreground">
                      Show on homepage
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isFeatured", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload images for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <ImagePlus className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop images here
                  </p>
                  <Input type="file" accept="image/*" multiple className="hidden" id="images" />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label htmlFor="images" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 800x800px, Max 5MB per image
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Creating..." : "Create Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/admin/products")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
