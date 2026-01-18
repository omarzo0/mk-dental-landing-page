"use client";

import {
    Edit2,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Package2,
    Loader2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { resolveImageUrl } from "~/lib/image-utils";
import { PackageTableSkeleton } from "~/ui/components/admin/product-skeletons";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
    Card,
    CardContent,
} from "~/ui/primitives/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import { Input } from "~/ui/primitives/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/ui/primitives/table";

import { PackageDialog } from "./package-dialog";

interface Package {
    _id: string;
    name: string;
    description: string;
    images?: string[] | Array<{ url: string; isPrimary?: boolean }>;
    price: number;
    comparePrice?: number;
    productType: "package";
    packageItems: Array<{ productId: string; quantity: number }>;
    badge?: string;
    status: "active" | "inactive" | "draft";
    discount?: {
        type: "percentage" | "fixed";
        value: number;
        isActive: boolean;
    };
    discountedPrice?: number;
}

export function PackageManager() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [packages, setPackages] = React.useState<Package[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [packageDialogOpen, setPackageDialogOpen] = React.useState(false);
    const [selectedPackage, setSelectedPackage] = React.useState<Package | null>(null);

    const fetchPackages = React.useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            const response = await fetch("/api/admin/products?productType=package&limit=100", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as { success: boolean; data: { products: Package[] } };
            if (data.success) {
                setPackages(data.data.products || []);
            }
        } catch (error) {
            console.error("Fetch packages error:", error);
            toast.error("Failed to load packages");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const filteredPackages = packages.filter((pkg) =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedPackage(null);
        setPackageDialogOpen(true);
    };

    const handleEdit = (pkg: Package) => {
        setSelectedPackage(pkg);
        setPackageDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;

        try {
            const token = localStorage.getItem("mk-dental-token");
            const response = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as { success: boolean; message?: string };
            if (data.success) {
                toast.success("Package deleted successfully");
                fetchPackages();
            } else {
                toast.error(data.message || "Failed to delete package");
            }
        } catch (error) {
            console.error("Delete package error:", error);
            toast.error("An error occurred while deleting");
        }
    };

    const handleSavePackage = (updatedPackage: Package) => {
        fetchPackages();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Ready-to-use Packages</h2>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Package
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search packages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <PackageTableSkeleton />
                                ) : filteredPackages.map((pkg) => (
                                    <TableRow key={pkg._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded border bg-muted shrink-0">
                                                    {(pkg.images && pkg.images.length > 0) ? (
                                                        <img
                                                            src={resolveImageUrl(pkg.images[0])}
                                                            alt={pkg.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                if (target.src.includes("/placeholder.svg")) return;
                                                                target.src = "/placeholder.svg";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center p-2 text-muted-foreground">
                                                            <Package2 className="h-full w-full" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{pkg.name}</p>
                                                    {pkg.badge && (
                                                        <Badge variant="secondary" className="text-[10px] px-1 py-0">{pkg.badge}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{pkg.packageItems.length} products</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {pkg.discount?.isActive ? (() => {
                                                    const discounted = pkg.discountedPrice !== undefined
                                                        ? pkg.discountedPrice
                                                        : pkg.discount.type === 'percentage'
                                                            ? pkg.price - (pkg.price * pkg.discount.value / 100)
                                                            : pkg.price - pkg.discount.value;
                                                    return (
                                                        <>
                                                            <p className="font-medium whitespace-nowrap text-primary">{discounted.toFixed(2)} EGP</p>
                                                            <p className="text-xs text-muted-foreground line-through whitespace-nowrap">{pkg.price} EGP</p>
                                                        </>
                                                    );
                                                })() : (
                                                    <p className="font-medium whitespace-nowrap">{pkg.price} EGP</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(pkg)}>
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(pkg._id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && filteredPackages.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No packages found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <PackageDialog
                packageData={selectedPackage}
                open={packageDialogOpen}
                onOpenChange={setPackageDialogOpen}
                onSave={handleSavePackage}
            />
        </div>
    );
}

