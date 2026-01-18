"use client";

import {
    Edit,
    Loader2,
    Plus,
    Search,
    Trash2,
    Truck,
} from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/ui/primitives/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/ui/primitives/alert-dialog";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Switch } from "~/ui/primitives/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/ui/primitives/table";

interface ShippingFee {
    _id: string;
    name: string;
    fee: number;
    isFreeShipping: boolean;
    isActive: boolean;
}

export default function ShippingSettingsPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [fees, setFees] = React.useState<ShippingFee[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deletingFee, setDeletingFee] = React.useState<ShippingFee | null>(null);
    const [editingFee, setEditingFee] = React.useState<ShippingFee | null>(null);
    const [formData, setFormData] = React.useState({
        name: "",
        fee: "",
        isFreeShipping: false,
        isActive: true,
    });
    const [saveLoading, setSaveLoading] = React.useState(false);
    const [deleteLoading, setDeleteLoading] = React.useState(false);

    const fetchFees = React.useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            
            if (!token) {
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }
            
            const response = await fetch("/api/admin/shipping-fees", {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.status === 401) {
                localStorage.removeItem("mk-dental-token");
                localStorage.removeItem("mk-dental-auth");
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }
            
            const data = (await response.json()) as { success: boolean; data: { shippingFees: ShippingFee[] } };
            if (data.success) {
                setFees(data.data.shippingFees || []);
            }

        } catch (error) {
            console.error("Fetch shipping fees error:", error);
            toast.error("Failed to load shipping fees");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchFees();
    }, [fetchFees]);

    const filteredFees = fees.filter((fee) =>
        fee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setEditingFee(null);
        setFormData({
            name: "",
            fee: "",
            isFreeShipping: false,
            isActive: true,
        });
        setDialogOpen(true);
    };

    const handleEdit = (fee: ShippingFee) => {
        setEditingFee(fee);
        setFormData({
            name: fee.name,
            fee: fee.fee.toString(),
            isFreeShipping: fee.isFreeShipping,
            isActive: fee.isActive,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Location name is required");
            return;
        }
        
        if (!formData.isFreeShipping && !formData.fee) {
            toast.error("Shipping fee is required when not free shipping");
            return;
        }

        setSaveLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            
            if (!token) {
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }
            
            const url = editingFee
                ? `/api/admin/shipping-fees/${editingFee._id}`
                : "/api/admin/shipping-fees";
            const method = editingFee ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    fee: formData.isFreeShipping ? 0 : parseFloat(formData.fee || "0"),
                    isFreeShipping: formData.isFreeShipping,
                    isActive: formData.isActive,
                }),
            });

            if (response.status === 401) {
                localStorage.removeItem("mk-dental-token");
                localStorage.removeItem("mk-dental-auth");
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }

            const data = (await response.json()) as { success: boolean; message?: string };
            if (data.success) {
                toast.success(editingFee ? "Shipping fee updated" : "Shipping fee created");
                setDialogOpen(false);
                fetchFees();
            } else {
                toast.error(data.message || "Failed to save shipping fee");
            }
        } catch (error) {
            console.error("Save shipping fee error:", error);
            toast.error("An error occurred while saving");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleToggleStatus = async (fee: ShippingFee) => {
        try {
            const token = localStorage.getItem("mk-dental-token");
            
            if (!token) {
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }
            
            const response = await fetch(`/api/admin/shipping-fees/${fee._id}/toggle`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("mk-dental-token");
                localStorage.removeItem("mk-dental-auth");
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }

            const data = (await response.json()) as { success: boolean; message?: string };
            if (data.success) {
                toast.success(`Shipping for ${fee.name} ${!fee.isActive ? "activated" : "deactivated"}`);
                fetchFees();
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Toggle fee status error:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDeleteClick = (fee: ShippingFee) => {
        setDeletingFee(fee);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingFee) return;
        
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            
            if (!token) {
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }
            
            const response = await fetch(`/api/admin/shipping-fees/${deletingFee._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("mk-dental-token");
                localStorage.removeItem("mk-dental-auth");
                toast.error("Session expired. Please log in again.");
                window.location.href = "/admin/login?expired=true";
                return;
            }

            const data = (await response.json()) as { success: boolean; message?: string };
            if (data.success) {
                toast.success(`Shipping fee for ${deletingFee.name} deleted`);
                setDeleteDialogOpen(false);
                setDeletingFee(null);
                fetchFees();
            } else {
                toast.error(data.message || "Failed to delete shipping fee");
            }
        } catch (error) {
            console.error("Delete shipping fee error:", error);
            toast.error("An error occurred while deleting");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shipping Fees</h1>
                    <p className="text-muted-foreground">Manage location-based shipping costs.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Locations</CardTitle>
                    <CardDescription>Configure shipping charges for different delivery areas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search locations..."
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
                                    <TableHead>Location</TableHead>
                                    <TableHead>Fee (EGP)</TableHead>
                                    <TableHead>Free Shipping</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredFees.map((fee) => (
                                    <TableRow key={fee._id}>
                                        <TableCell className="font-medium">{fee.name}</TableCell>
                                        <TableCell>{fee.isFreeShipping ? "—" : `${fee.fee} EGP`}</TableCell>
                                        <TableCell>
                                            <Badge variant={fee.isFreeShipping ? "default" : "secondary"}>
                                                {fee.isFreeShipping ? "Yes" : "No"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={fee.isActive}
                                                onCheckedChange={() => handleToggleStatus(fee)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(fee)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(fee)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && filteredFees.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No locations configured.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFee ? "Edit Location" : "Add Location"}</DialogTitle>
                        <DialogDescription>
                            Configure shipping rates for a specific area.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="loc-name">Location Name</Label>
                            <Input
                                id="loc-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Cairo, Giza, Alexandria"
                            />
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-b">
                            <div>
                                <Label htmlFor="loc-free-shipping">Free Shipping</Label>
                                <p className="text-sm text-muted-foreground">Enable free shipping for this location</p>
                            </div>
                            <Switch
                                id="loc-free-shipping"
                                checked={formData.isFreeShipping}
                                onCheckedChange={(val) => setFormData({ ...formData, isFreeShipping: val })}
                            />
                        </div>
                        {!formData.isFreeShipping && (
                            <div className="space-y-2">
                                <Label htmlFor="loc-fee">Shipping Fee (EGP)</Label>
                                <Input
                                    id="loc-fee"
                                    type="number"
                                    value={formData.fee}
                                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                    placeholder="50"
                                />
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                                <Label htmlFor="loc-active">Active Status</Label>
                                <p className="text-sm text-muted-foreground">Show this location to customers</p>
                            </div>
                            <Switch
                                id="loc-active"
                                checked={formData.isActive}
                                onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saveLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saveLoading}>
                            {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingFee ? "Save Changes" : "Create Location"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Shipping Fee</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the shipping fee for &quot;{deletingFee?.name}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            disabled={deleteLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
