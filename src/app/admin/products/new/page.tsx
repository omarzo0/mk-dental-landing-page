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
import { productSchema } from "~/lib/validation-schemas";
import { ZodError } from "zod";

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

interface Category {
  _id: string;
  name: string;
  subcategories?: (string | { name: string })[];
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  stockQuantity: string;
  lowStockThreshold: string;
  inStock: boolean;
  isActive: boolean;
  image: string;
  discount: {
    type: "percentage" | "fixed";
    value: string;
    isActive: boolean;
  };
  size: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [availableCategories, setAvailableCategories] = React.useState<Category[]>([]);
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    stockQuantity: "",
    lowStockThreshold: "10",
    inStock: true,
    isActive: true,
    image: "",
    discount: {
      type: "percentage",
      value: "",
      isActive: false,
    },
    size: "",
  });

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const fetchCategories = React.useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");
      const response = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as { success: boolean; data: { categories: Category[] } };
      if (data.success) {
        setAvailableCategories(data.data.categories);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    if (name === "discount.isActive") {
      setFormData(prev => ({
        ...prev,
        discount: { ...prev.discount, isActive: checked }
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDiscountChange = (field: "type" | "value", value: string) => {
    setFormData(prev => ({
      ...prev,
      discount: { ...prev.discount, [field]: value }
    }));
  };

  const discountedPrice = React.useMemo(() => {
    const price = parseFloat(formData.price) || 0;
    const discountValue = parseFloat(formData.discount.value) || 0;
    if (!formData.discount.isActive) return price;

    if (formData.discount.type === "percentage") {
      return price - (price * discountValue / 100);
    }
    return price - discountValue;
  }, [formData.price, formData.discount]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!selectedImage) return [];

    const token = localStorage.getItem("mk-dental-token");
    const uploadData = new FormData();
    uploadData.append("image", selectedImage);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadData,
    });

    const data = await response.json() as any;
    console.log("[New] Upload raw response:", JSON.stringify(data, null, 2));

    const extractUrl = (val: any): string => {
      if (!val) return "";
      if (Array.isArray(val)) {
        return extractUrl(val[0]);
      }
      if (typeof val === 'string') {
        return val;
      }
      if (val.url) return extractUrl(val.url);
      if (val.secure_url) return extractUrl(val.secure_url);
      if (val.imageUrl) return extractUrl(val.imageUrl);
      if (val.path) return extractUrl(val.path);
      if (val.fullPath) return extractUrl(val.fullPath);
      if (val.data) return extractUrl(val.data);
      if (val.image) return extractUrl(val.image);
      return "";
    };

    let url = extractUrl(data);
    if (!url && !data.success && data.message) {
      throw new Error(data.message || "Failed to upload image");
    }

    // Convert relative paths to full URLs for backend validation
    // Using 127.0.0.1 instead of localhost to bypass strict TLD validators
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9000";
      const cleanPath = url.replace(/^\/+/, "");
      url = `${backendUrl}/${cleanPath}`;
    }

    return url ? [url] : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = productSchema.parse({
        ...formData,
        price: parseFloat(formData.price) || 0,
        images: selectedImage ? [URL.createObjectURL(selectedImage)] : [], // Temporary local URL for validation
        inventory: {
          quantity: parseInt(formData.stockQuantity) || 0,
          lowStockAlert: parseInt(formData.lowStockThreshold) || 10,
          trackInventory: true,
        },
        discount: {
          ...formData.discount,
          value: parseFloat(formData.discount.value) || 0,
        },
        specifications: {
          size: formData.size
            ? formData.size.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
            : undefined
        }
      });

      const token = localStorage.getItem("mk-dental-token");
      if (!token) {
        toast.error("Please login to create products");
        setIsLoading(false);
        return;
      }

      // 1. Upload image if selected
      let uploadedUrls: string[] = [];
      if (selectedImage) {
        toast.loading("Uploading image...", { id: "upload-toast" });
        try {
          uploadedUrls = await uploadImages();
          console.log("Uploaded URL received in handleSubmit:", uploadedUrls);
          toast.success("Image uploaded successfully", { id: "upload-toast" });
        } catch (error) {
          toast.error("Failed to upload image", { id: "upload-toast" });
          setIsLoading(false);
          return;
        }
      }

      // Build product data for API
      const productData = {
        ...validatedData,
        images: uploadedUrls, // Always send as array
      };

      console.log("Final product data to be sent:", JSON.stringify(productData, null, 2));

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = (await response.json()) as { success: boolean; message?: string };

      if (data.success) {
        toast.success("Product created successfully");
        router.push("/admin/products");
      } else {
        toast.error(data.message || "Failed to create product");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path.join(".")] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please check the form for errors");
      } else {
        console.error("Create product error:", error);
        toast.error("Failed to create product");
      }
    } finally {
      setIsLoading(false);
    }
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
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.description ? "border-destructive" : ""}`}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => {
                        setFormData(prev => ({ ...prev, category: v, subcategory: "" }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          </div>
                        ) : availableCategories.map((cat) => (
                          <SelectItem key={cat._id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="subcategory">
                      Subcategory
                    </Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(v) => handleSelectChange("subcategory", v)}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.category ? "Select subcategory" : "Select category first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const selectedCat = availableCategories.find(c => c.name === formData.category);
                          const subcats = selectedCat?.subcategories || [];
                          if (subcats.length === 0) return <SelectItem value="_none" disabled>No subcategories</SelectItem>;
                          return subcats.map((sub: string | { name: string }) => {
                            const subName = typeof sub === 'string' ? sub : sub.name;
                            return (
                              <SelectItem key={subName} value={subName}>
                                {subName}
                              </SelectItem>
                            );
                          });
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Discount */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Discount</CardTitle>
                <CardDescription>
                  Set the product pricing and discount information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Base Price ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Discount</Label>
                      <p className="text-sm text-muted-foreground">Apply a discount to this product</p>
                    </div>
                    <Switch
                      checked={formData.discount.isActive}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("discount.isActive", checked)
                      }
                    />
                  </div>

                  {formData.discount.isActive && (
                    <div className="grid gap-4 sm:grid-cols-2 p-4 bg-muted/30 rounded-lg animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="discount-type">Discount Type</Label>
                        <Select
                          value={formData.discount.type}
                          onValueChange={(v) => handleDiscountChange("type", v as "percentage" | "fixed")}
                        >
                          <SelectTrigger id="discount-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount (EGP)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount-value">Discount Value</Label>
                        <Input
                          id="discount-value"
                          name="discount-value"
                          type="number"
                          placeholder="0"
                          value={formData.discount.value}
                          onChange={(e) => handleDiscountChange("value", e.target.value)}
                          className={errors["discount.value"] ? "border-destructive" : ""}
                        />
                        {errors["discount.value"] && <p className="text-xs text-destructive">{errors["discount.value"]}</p>}
                      </div>

                      {discountedPrice !== parseFloat(formData.price) && (
                        <div className="sm:col-span-2 pt-2 border-t flex justify-between items-center">
                          <span className="text-sm font-medium">Final Price:</span>
                          <span className="text-lg font-bold text-primary">
                            {discountedPrice.toFixed(2)} EGP
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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
                  <div className="space-y-4">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      className={errors["inventory.quantity"] ? "border-destructive" : ""}
                    />
                    {errors["inventory.quantity"] && <p className="text-xs text-destructive">{errors["inventory.quantity"]}</p>}
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      type="number"
                      placeholder="10"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      className={errors["inventory.lowStockAlert"] ? "border-destructive" : ""}
                    />
                    {errors["inventory.lowStockAlert"] && <p className="text-xs text-destructive">{errors["inventory.lowStockAlert"]}</p>}
                    <p className="text-xs text-muted-foreground">
                      Alert when stock falls below this number
                    </p>
                  </div>



                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>
                  Additional product details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (comma separated)</Label>
                  <Input
                    id="size"
                    name="size"
                    placeholder="e.g. 10, 20, 30"
                    value={formData.size}
                    onChange={handleInputChange}
                    className={errors["specifications.size"] ? "border-destructive" : ""}
                  />
                  {errors["specifications.size"] && <p className="text-xs text-destructive">{errors["specifications.size"]}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter numeric sizes separated by commas
                  </p>
                </div>
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
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative aspect-square rounded-md overflow-hidden border max-w-[200px] mx-auto">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes("/placeholder.svg")) return;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg flex items-center justify-center p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      <div className="space-y-2">
                        <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Click to upload image</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      Change Image
                    </Button>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image"
                  onChange={handleImageChange}
                />
                {errors.images && <p className="text-xs text-destructive mt-2 text-center">{errors.images}</p>}
                <p className="text-xs text-muted-foreground">
                  Recommended: 800x800px, Max 5MB per image
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        {selectedImage ? "Uploading & Creating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Product
                      </>
                    )}
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
