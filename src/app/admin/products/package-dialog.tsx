"use client";

import { Loader2, Save, X, Plus, Search, ImagePlus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { resolveImageUrl } from "~/lib/image-utils";

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
import { Textarea } from "~/ui/primitives/textarea";
import { Badge } from "~/ui/primitives/badge";
import { Checkbox } from "~/ui/primitives/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/ui/primitives/select";
import { Switch } from "~/ui/primitives/switch";

interface ProductItem {
    _id: string;
    name: string;
    price: number;
    images?: Array<{ url: string }>;
}

interface Category {
    _id: string;
    name: string;
}

interface PackageItem {
    productId: string;
    quantity: number;
}

interface Package {
    _id: string;
    name: string;
    description: string;
    images?: string[] | Array<{ url: string; isPrimary?: boolean }>;
    price: number;
    comparePrice?: number;
    productType: "package";
    packageItems: PackageItem[];
    badge?: string;
    category?: string;
    inventory?: {
        quantity: number;
        lowStockAlert?: number;
        trackInventory?: boolean;
    };
    status: "active" | "inactive" | "draft";
}

interface PackageFormData {
    name: string;
    description: string;
    image: string;
    comparePrice: string;
    price: string;
    badge: string;
    stockQuantity: string;
    lowStockThreshold: string;
    packageItems: PackageItem[];
    discount: {
        type: "percentage" | "fixed";
        value: string;
        isActive: boolean;
    };
}

interface PackageDialogProps {
    packageData: Package | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (pkg: Package) => void;
}



export function PackageDialog({
    packageData,
    open,
    onOpenChange,
    onSave,
}: PackageDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [productsLoading, setProductsLoading] = React.useState(false);
    const [availableProducts, setAvailableProducts] = React.useState<ProductItem[]>([]);
    const [availableCategories, setAvailableCategories] = React.useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [formData, setFormData] = React.useState<PackageFormData>({
        name: "",
        description: "",
        image: "",
        comparePrice: "",
        price: "",
        badge: "",
        stockQuantity: "0",
        lowStockThreshold: "10",
        packageItems: [],
        discount: {
            type: "percentage",
            value: "",
            isActive: false,
        },
    });

    const [selectedNewFile, setSelectedNewFile] = React.useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = React.useState<string>("");

    const fetchProducts = React.useCallback(async () => {
        setProductsLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            const response = await fetch("/api/admin/products?productType=single&limit=100", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as { success: boolean; data: { products: ProductItem[] } };
            if (data.success) {
                setAvailableProducts(data.data.products);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
            toast.error("Failed to load products for selection");
        } finally {
            setProductsLoading(false);
        }
    }, []);

    const fetchCategories = React.useCallback(async () => {
        try {
            const token = localStorage.getItem("mk-dental-token");
            const response = await fetch("/api/admin/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as { success: boolean; data: { categories: Category[] } };
            if (data.success && Array.isArray(data.data?.categories)) {
                setAvailableCategories(data.data.categories);
            } else {
                console.error("[PackageDialog] Categories fetch failed or returned non-array:", data);
                setAvailableCategories([]);
            }
        } catch (error) {
            console.error("Fetch categories error:", error);
        }
    }, []);

    React.useEffect(() => {
        if (open) {
            fetchProducts();
            fetchCategories();
        }
    }, [open, fetchProducts, fetchCategories]);

    React.useEffect(() => {
        if (!open) return;

        if (packageData) {
            // Extract first image URL from images array or use empty string
            const existingImage = packageData.images && packageData.images.length > 0
                ? (typeof packageData.images[0] === 'string' ? packageData.images[0] : (packageData.images[0] as { url: string }).url)
                : "";
            setFormData({
                name: packageData.name,
                description: packageData.description,
                image: existingImage,
                comparePrice: (packageData.comparePrice || "").toString(),
                price: packageData.price.toString(),
                badge: packageData.badge || "",
                stockQuantity: packageData.inventory?.quantity.toString() || "0",
                lowStockThreshold: packageData.inventory?.lowStockAlert?.toString() || "10",
                packageItems: packageData.packageItems || [],
                discount: {
                    type: (packageData as any).discount?.type || "percentage",
                    value: (packageData as any).discount?.value?.toString() || "",
                    isActive: (packageData as any).discount?.isActive || false,
                },
            });
            setSelectedNewFile(null);
            setNewImagePreview("");
        } else {
            setFormData({
                name: "",
                description: "",
                image: "",
                comparePrice: "",
                price: "",
                badge: "",
                stockQuantity: "0",
                lowStockThreshold: "10",
                packageItems: [],
                discount: {
                    type: "percentage",
                    value: "",
                    isActive: false,
                },
            });
            setSelectedNewFile(null);
            setNewImagePreview("");
        }
    }, [packageData, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith("image/");
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isImage) {
            toast.error(`${file.name} is not an image`);
            return;
        }
        if (!isLt5M) {
            toast.error(`${file.name} is larger than 5MB`);
            return;
        }

        // Revoke old preview URL if exists
        if (newImagePreview) {
            URL.revokeObjectURL(newImagePreview);
        }

        setSelectedNewFile(file);
        setNewImagePreview(URL.createObjectURL(file));
        // Clear existing image when selecting a new one
        setFormData(prev => ({ ...prev, image: "" }));
    };

    const removeExistingImage = () => {
        setFormData(prev => ({ ...prev, image: "" }));
    };

    const removeNewImage = () => {
        if (newImagePreview) {
            URL.revokeObjectURL(newImagePreview);
        }
        setSelectedNewFile(null);
        setNewImagePreview("");
    };

    const handleDiscountChange = (field: "type" | "value", value: string) => {
        setFormData(prev => ({
            ...prev,
            discount: { ...prev.discount, [field]: value }
        }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        if (name === "discount.isActive") {
            setFormData(prev => ({
                ...prev,
                discount: { ...prev.discount, isActive: checked }
            }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: checked }));
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

    const uploadNewImage = async (): Promise<string> => {
        if (!selectedNewFile) return "";

        const token = localStorage.getItem("mk-dental-token");
        const uploadFormData = new FormData();
        uploadFormData.append("image", selectedNewFile);

        const response = await fetch("/api/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: uploadFormData,
        });

        const data = await response.json() as any;
        console.log("[PackageDialog] Upload response:", JSON.stringify(data, null, 2));

        if (!data.success && !data.url && !data.urls) {
            throw new Error(data.message || "Failed to upload image");
        }

        const extractUrl = (val: any): string => {
            if (!val) return "";
            if (Array.isArray(val) && val.length > 0) {
                return extractUrl(val[0]);
            }
            if (typeof val === 'string') return val;
            if (val.url) return extractUrl(val.url);
            if (val.secure_url) return extractUrl(val.secure_url);
            if (val.imageUrl) return extractUrl(val.imageUrl);
            if (val.image) return extractUrl(val.image);
            if (val.urls) return extractUrl(val.urls);
            if (val.images) return extractUrl(val.images);
            if (val.path) return extractUrl(val.path);
            if (val.fullPath) return extractUrl(val.fullPath);
            if (val.data) return extractUrl(val.data);
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

        console.log("[PackageDialog] Final image URL:", url);
        return url;
    };

    // Auto-calculate price based on selected products and quantities
    React.useEffect(() => {
        if (!open || !Array.isArray(availableProducts) || availableProducts.length === 0) return;

        const totalPrice = formData.packageItems.reduce((sum, item) => {
            const product = availableProducts.find(p => p?._id === item.productId);
            return sum + (product?.price || 0) * item.quantity;
        }, 0);

        // Only update if the value actually changed to prevent unnecessary re-renders
        if (totalPrice.toString() !== formData.price) {
            setFormData(prev => ({
                ...prev,
                price: totalPrice.toString()
            }));
        }
    }, [formData.packageItems, availableProducts, open, formData.price]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleProduct = (productId: string) => {
        setFormData((prev) => {
            const isSelected = prev.packageItems.some(item => item.productId === productId);
            if (isSelected) {
                return { ...prev, packageItems: prev.packageItems.filter((i) => i.productId !== productId) };
            } else {
                return { ...prev, packageItems: [...prev.packageItems, { productId, quantity: 1 }] };
            }
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setFormData(prev => ({
            ...prev,
            packageItems: prev.packageItems.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const name = formData.name;
        const price = formData.price;
        const packageItemsCount = formData.packageItems.length;

        if (!name || !price || packageItemsCount === 0) {
            toast.error("Please fill in required fields and select at least one product");
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("mk-dental-token");
            const url = packageData ? `/api/admin/products/${packageData._id}` : "/api/admin/products";
            const method = packageData ? "PUT" : "POST";

            // 1. Upload new image if any
            let uploadedUrl: string = "";
            if (selectedNewFile) {
                toast.loading("Uploading image...", { id: "pkg-upload" });
                try {
                    uploadedUrl = await uploadNewImage();
                    toast.success("Image uploaded", { id: "pkg-upload" });
                } catch (error) {
                    toast.error("Image upload failed", { id: "pkg-upload" });
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Determine final image - new upload takes priority over existing
            const finalImage = uploadedUrl || formData.image || "";

            // 1b. Debug state
            console.log("[PackageDialog] Debug Image State:", {
                newFile: selectedNewFile?.name,
                existingImage: formData.image,
                finalImage
            });

            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                comparePrice: (formData.comparePrice && !isNaN(parseFloat(formData.comparePrice))) ? parseFloat(formData.comparePrice) : undefined,
                productType: "package",
                packageItems: formData.packageItems,
                badge: formData.badge || undefined,
                status: packageData?.status || "active",
                images: finalImage ? [finalImage] : [],
                discount: {
                    type: formData.discount.type,
                    value: parseFloat(formData.discount.value) || 0,
                    isActive: formData.discount.isActive,
                },
                inventory: {
                    quantity: parseInt(formData.stockQuantity) || 0,
                    lowStockAlert: parseInt(formData.lowStockThreshold) || 10,
                    trackInventory: true,
                },
                category: (() => {
                    const cats = Array.isArray(availableCategories) ? availableCategories : [];
                    return (cats.find(c => c.name === "Packages")?.name || (cats.length > 0 ? cats[0].name : "Packages"));
                })(),
            };

            console.log("[PackageDialog] Full Payload:", JSON.stringify(payload, null, 2));

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = (await response.json()) as { success: boolean; message?: string; data?: { product: Package } };

            if (data.success && data.data) {
                onSave(data.data.product);
                onOpenChange(false);
                toast.success(packageData ? "Package updated" : "Package created");
            } else {
                toast.error(data.message || "Failed to save package");
            }
        } catch (error) {
            console.error("Save package error:", error);
            toast.error("An error occurred while saving the package");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProductName = (id: string) => {
        if (!Array.isArray(availableProducts)) return "Unknown Product";
        return availableProducts.find(p => p?._id === id)?.name || "Unknown Product";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <div className="p-6 border-b">
                    <DialogHeader>
                        <DialogTitle>{packageData ? "Edit Package" : "Create Package"}</DialogTitle>
                        <DialogDescription>
                            {packageData ? "Update package details and products." : "Configure a new bundle package for your store."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Left Side: Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium border-b pb-2">Basic Information</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="pkg-name">Package Name *</Label>
                                    <Input
                                        id="pkg-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Surgery Starter Kit"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pkg-description">Description</Label>
                                    <Textarea
                                        id="pkg-description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe what's special about this bundle..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>Package Image</Label>
                                    <div className="flex gap-4">
                                        {/* Show existing image or new preview, but not both */}
                                        {(formData.image || newImagePreview) ? (
                                            <div className="relative aspect-square w-32 rounded-md overflow-hidden border">
                                                <img
                                                    src={newImagePreview || resolveImageUrl(formData.image)}
                                                    alt="Package image"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        if (target.src.includes("/placeholder.svg")) return;
                                                        target.src = "/placeholder.svg";
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newImagePreview) {
                                                            removeNewImage();
                                                        } else {
                                                            removeExistingImage();
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                <div className={`absolute bottom-0 left-0 right-0 ${newImagePreview ? 'bg-primary/70' : 'bg-black/50'} text-[10px] text-white text-center py-0.5`}>
                                                    {newImagePreview ? 'New' : 'Saved'}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById("pkg-image-input")?.click()}
                                                className="aspect-square w-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-muted/50 transition-colors"
                                            >
                                                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground mt-1">Add Image</span>
                                            </button>
                                        )}
                                        {/* Change button when image exists */}
                                        {(formData.image || newImagePreview) && (
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById("pkg-image-input")?.click()}
                                                className="h-32 px-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-muted/50 transition-colors"
                                            >
                                                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground mt-1">Change</span>
                                            </button>
                                        )}
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="pkg-image-input"
                                        onChange={handleImageChange}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Max 5MB. Single image per package.
                                    </p>
                                </div>
                                {/* Discount Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium border-b pb-1">Discount</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Enable Discount</Label>
                                            <p className="text-[10px] text-muted-foreground">Apply reduction to offer price</p>
                                        </div>
                                        <Switch
                                            checked={formData.discount.isActive}
                                            onCheckedChange={(checked) => handleSwitchChange("discount.isActive", checked)}
                                        />
                                    </div>
                                    {formData.discount.isActive && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="pkg-discount-type">Type</Label>
                                                    <Select
                                                        value={formData.discount.type}
                                                        onValueChange={(v) => handleDiscountChange("type", v as "percentage" | "fixed")}
                                                    >
                                                        <SelectTrigger id="pkg-discount-type">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                            <SelectItem value="fixed">Fixed Amount (EGP)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="pkg-discount-value">Value</Label>
                                                    <Input
                                                        id="pkg-discount-value"
                                                        type="number"
                                                        placeholder="0"
                                                        value={formData.discount.value}
                                                        onChange={(e) => handleDiscountChange("value", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-3 bg-muted/50 border rounded-md">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">Discounted Price</span>
                                                    <span className="text-base font-bold text-primary">{discountedPrice.toFixed(2)} EGP</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pkg-price">Price *</Label>
                                    <Input
                                        id="pkg-price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pkg-badge">Badge (optional)</Label>
                                        <Input
                                            id="pkg-badge"
                                            name="badge"
                                            value={formData.badge}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Best Seller, Save 20%"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pkg-stock">Stock Quantity</Label>
                                        <Input
                                            id="pkg-stock"
                                            name="stockQuantity"
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pkg-low-stock">Low Stock Alert</Label>
                                        <Input
                                            id="pkg-low-stock"
                                            name="lowStockThreshold"
                                            type="number"
                                            value={formData.lowStockThreshold}
                                            onChange={handleInputChange}
                                            placeholder="10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Product Selection */}
                            <div className="space-y-4 flex flex-col overflow-hidden">
                                <h3 className="text-sm font-medium border-b pb-2">Included Products *</h3>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 min-h-[300px] border rounded-md overflow-hidden flex flex-col">
                                    {productsLoading ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto p-2">
                                            <div className="space-y-2">
                                                {filteredProducts.map((product) => (
                                                    <div
                                                        key={product._id}
                                                        className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md group"
                                                    >
                                                        <Checkbox
                                                            id={`prod-${product._id}`}
                                                            checked={formData.packageItems.some(i => i.productId === product._id)}
                                                            onCheckedChange={() => toggleProduct(product._id)}
                                                        />
                                                        <Label
                                                            htmlFor={`prod-${product._id}`}
                                                            className="flex-1 min-w-0 cursor-pointer"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                                                                    {product.name}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground">{product.price} EGP</p>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                ))}
                                                {filteredProducts.length === 0 && (
                                                    <p className="text-xs text-center text-muted-foreground py-10">No products found.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2">
                                    <Label className="text-xs font-semibold">Selected & Quantities ({formData.packageItems.length})</Label>
                                    <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto pr-2">
                                        {formData.packageItems?.map((item) => (
                                            <div key={item.productId} className="flex items-center justify-between gap-4 p-2 bg-muted/50 rounded-sm">
                                                <span className="text-xs truncate flex-1">{getProductName(item.productId)}</span>
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`qty-${item.productId}`} className="sr-only">Qty</Label>
                                                    <Input
                                                        id={`qty-${item.productId}`}
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                        className="h-7 w-16 text-xs px-2"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                        onClick={() => toggleProduct(item.productId)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!formData.packageItems || formData.packageItems.length === 0) && (
                                            <p className="text-xs text-muted-foreground italic">No products selected yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t bg-muted/20">
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
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {packageData ? "Save Changes" : "Create Package"}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
