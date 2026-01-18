"use client";

import { ImagePlus, Save, X, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { resolveImageUrl } from "~/lib/image-utils";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/ui/primitives/dialog";
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
import { Card, CardContent } from "~/ui/primitives/card";

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
    isFeatured: boolean;
    showInHomepage: boolean;
    image: string;
    discount: {
        type: "percentage" | "fixed";
        value: string;
        isActive: boolean;
    };
    size: string;
}

// Product type (mirroring the one in page.tsx)
interface Product {
    _id: string;
    name: string;
    description?: string;
    category: string;
    subcategory?: string;
    price: number;
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
    showInHomepage?: boolean;
    productType?: "single" | "package";
    discount?: {
        type: "percentage" | "fixed";
        value: number;
        isActive: boolean;
    };
    specifications?: {
        barcode?: string;
        material?: string;
        size?: number[];
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        slug?: string;
    };
}

interface EditProductDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditProductDialog({
    product,
    open,
    onOpenChange,
    onSuccess,
}: EditProductDialogProps) {
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
        isFeatured: false,
        showInHomepage: false,
        image: "",
        discount: {
            type: "percentage",
            value: "",
            isActive: false,
        },
        size: "",
    });
    const [selectedNewImage, setSelectedNewImage] = React.useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = React.useState<string>("");

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
        if (open) {
            fetchCategories();
        }
    }, [open, fetchCategories]);

    // Pre-fill form when product changes
    React.useEffect(() => {
        if (product && open) {
            const firstImage = product.images?.[0];
            const imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage?.url || "");

            setFormData({
                name: product.name,
                description: product.description || "",
                category: product.category,
                subcategory: product.subcategory || "",
                price: product.price?.toString() || "",
                stockQuantity: product.inventory?.quantity.toString() || "0",
                lowStockThreshold: product.inventory?.lowStockAlert?.toString() || "10",
                inStock: (product.inventory?.quantity ?? 0) > 0,
                isActive: product.status === "active",
                isFeatured: product.featured || false,
                showInHomepage: product.showInHomepage || false,
                image: imageUrl,
                discount: {
                    type: product.discount?.type || "percentage",
                    value: product.discount?.value?.toString() || "",
                    isActive: product.discount?.isActive || false,
                },
                size: product.specifications?.size?.join(", ") || "",
            });
            setSelectedNewImage(null);
            setNewImagePreview("");
        }
    }, [product, open]);

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
            setSelectedNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeExistingImage = () => {
        setFormData(prev => ({
            ...prev,
            image: ""
        }));
    };

    const removeNewImage = () => {
        setSelectedNewImage(null);
        setNewImagePreview("");
    };

    const uploadNewImages = async (): Promise<string[]> => {
        if (!selectedNewImage) return [];

        const token = localStorage.getItem("mk-dental-token");
        const formData = new FormData();
        formData.append("image", selectedNewImage);

        const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json() as any;
        console.log("[Edit] Upload raw response:", JSON.stringify(data, null, 2));

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
        if (!product) return;

        // Validate required fields
        if (!formData.name || !formData.category || !formData.price) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            if (!token) {
                toast.error("Please login to update products");
                setIsLoading(false);
                return;
            }

            // 1. Upload new image if selected
            let uploadedUrls: string[] = [];
            if (selectedNewImage) {
                toast.loading("Uploading new image...", { id: "edit-upload" });
                try {
                    uploadedUrls = await uploadNewImages();
                    toast.success("Image uploaded", { id: "edit-upload" });
                } catch (error) {
                    toast.error("Image upload failed", { id: "edit-upload" });
                    setIsLoading(false);
                    return;
                }
            }

            // Combine images: new upload takes absolute priority, then existing image
            const finalImages = uploadedUrls.length > 0 ? uploadedUrls : (formData.image ? [formData.image] : []);

            // Build product data for API
            const productData = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                subcategory: formData.subcategory,
                price: parseFloat(formData.price),
                inventory: {
                    quantity: parseInt(formData.stockQuantity) || 0,
                    lowStockAlert: parseInt(formData.lowStockThreshold) || 10,
                    trackInventory: true,
                },
                status: formData.isActive ? "active" : "inactive",
                featured: formData.isFeatured,
                showInHomepage: formData.showInHomepage,
                images: finalImages,
                discount: {
                    type: formData.discount.type,
                    value: parseFloat(formData.discount.value) || 0,
                    isActive: formData.discount.isActive,
                },
                specifications: {
                    size: formData.size
                        ? formData.size.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
                        : undefined
                }
            };

            console.log("Final product edit data to be sent:", JSON.stringify(productData, null, 2));

            const response = await fetch(`/api/admin/products/${product._id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            const data = (await response.json()) as { success: boolean; message?: string };

            if (data.success) {
                toast.success("Product updated successfully");
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(data.message || "Failed to update product");
            }
        } catch (error) {
            console.error("Update product error:", error);
            toast.error("Failed to update product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>
                        Update product details for {product?.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Basic Information</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">
                                        Product Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <textarea
                                        id="edit-description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-4">
                                        <Label htmlFor="edit-category">Category</Label>
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
                                                        <Loader2 className="h-4 w-4 animate-spin" />
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
                                        <Label htmlFor="edit-subcategory">Subcategory</Label>
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
                            </div>

                            {/* Pricing & Discount */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium border-b pb-1">Pricing & Discount</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-price">
                                            Base Price <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="edit-price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium">Enable Discount</Label>
                                                <p className="text-[10px] text-muted-foreground">Apply reduction to price</p>
                                            </div>
                                            <Switch
                                                checked={formData.discount.isActive}
                                                onCheckedChange={(checked) => handleSwitchChange("discount.isActive", checked)}
                                            />
                                        </div>

                                        {formData.discount.isActive && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 p-3 bg-muted/30 rounded-lg border">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-discount-type" className="text-xs">Type</Label>
                                                        <Select
                                                            value={formData.discount.type}
                                                            onValueChange={(v) => handleDiscountChange("type", v as "percentage" | "fixed")}
                                                        >
                                                            <SelectTrigger id="edit-discount-type" className="h-8 text-xs">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                                <SelectItem value="fixed">Fixed (EGP)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-discount-value" className="text-xs">Value</Label>
                                                        <Input
                                                            id="edit-discount-value"
                                                            type="number"
                                                            value={formData.discount.value}
                                                            onChange={(e) => handleDiscountChange("value", e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t mt-2">
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Final Price</span>
                                                    <span className="text-sm font-bold text-primary">{discountedPrice.toFixed(2)} EGP</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>



                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Inventory */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Inventory</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-stockQuantity">Stock Quantity</Label>
                                        <Input
                                            id="edit-stockQuantity"
                                            name="stockQuantity"
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-lowStockThreshold">Low Stock Alert</Label>
                                        <Input
                                            id="edit-lowStockThreshold"
                                            name="lowStockThreshold"
                                            type="number"
                                            value={formData.lowStockThreshold}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Specifications</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-size">Size (comma separated)</Label>
                                        <Input
                                            id="edit-size"
                                            name="size"
                                            placeholder="e.g. 10, 20, 30"
                                            value={formData.size}
                                            onChange={handleInputChange}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter numeric sizes separated by commas
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Active Status</Label>
                                            <p className="text-xs text-muted-foreground">Visible in store</p>
                                        </div>
                                        <Switch
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Featured</Label>
                                            <p className="text-xs text-muted-foreground">Show on homepage</p>
                                        </div>
                                        <Switch
                                            checked={formData.isFeatured}
                                            onCheckedChange={(checked) => handleSwitchChange("isFeatured", checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Product Image</h3>
                                <div className="space-y-4">
                                    {(formData.image || newImagePreview) ? (
                                        <div className="relative aspect-square rounded-md overflow-hidden border max-w-[200px] mx-auto">
                                            <img
                                                src={newImagePreview || resolveImageUrl(formData.image)}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={newImagePreview ? removeNewImage : removeExistingImage}
                                                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-sm"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed rounded-lg flex items-center justify-center p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => document.getElementById("edit-image")?.click()}
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

                                    {(formData.image || newImagePreview) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => document.getElementById("edit-image")?.click()}
                                        >
                                            Change Image
                                        </Button>
                                    )}

                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="edit-image"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
