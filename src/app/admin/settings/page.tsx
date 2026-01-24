"use client";

import {
  AccountSettingsSkeleton,
  AdminTableSkeleton,
  BannerTableSkeleton,
  CouponStatsSkeleton,
  CouponTableSkeleton,
  OrderStatsSkeleton,
  OrderTableSkeleton,
  PackageTableSkeleton,
  PaymentMethodSkeleton,
  PaymentMethodsTableSkeleton,
  PaymentStatsSkeleton,
  PaymentTableSkeleton,
  ProductStatsSkeleton,
  ProductTableSkeleton,
  SecuritySettingsSkeleton,
  ShippingFeeTableSkeleton,
  TransactionStatsSkeleton,
  TransactionTableSkeleton,
} from "~/ui/components/admin/product-skeletons";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CreditCard,
  Edit,
  ExternalLink,
  Eye,
  GripVertical,
  Image,
  ImagePlus,
  Loader2,
  Lock,
  Plus,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import {
  shippingFeeSchema,
  bannerSchema,
  adminSchema,
  passwordChangeSchema,
  paymentMethodSchema,
  profileUpdateSchema,
} from "~/lib/validation-schemas";
import { cn } from "~/lib/cn";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import { Switch } from "~/ui/primitives/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Textarea } from "~/ui/primitives/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/ui/primitives/tabs";

// ==================== SHIPPING FEES ====================

interface ShippingFee {
  _id: string;
  name: string;
  fee: number;
  isFreeShipping: boolean;
  isActive: boolean;
}

function ShippingFeesTab() {
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
  const [errors, setErrors] = React.useState<Record<string, string>>({});
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

      const data = (await response.json()) as {
        success: boolean;
        data: { shippingFees: ShippingFee[] };
      };
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
      fee: fee.fee?.toString() || "0",
      isFreeShipping: fee.isFreeShipping,
      isActive: fee.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setErrors({});
    setSaveLoading(true);
    try {
      const validatedData = shippingFeeSchema.parse({
        ...formData,
        fee: formData.isFreeShipping ? 0 : parseFloat(formData.fee || "0"),
      });

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
        body: JSON.stringify(validatedData),
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
        console.error("Save shipping fee error:", error);
        toast.error("An error occurred while saving");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggle = async (fee: ShippingFee) => {
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/shipping-fees/${fee._id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success(`Shipping fee ${fee.isActive ? "disabled" : "enabled"}`);
        fetchFees();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle shipping fee error:", error);
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
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success("Shipping fee deleted");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Shipping Fees</CardTitle>
              <CardDescription>
                Manage shipping fees by location
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
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
                  <TableHead>Shipping Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <ShippingFeeTableSkeleton />
                ) : filteredFees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No shipping fees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFees.map((fee) => (
                    <TableRow key={fee._id}>
                      <TableCell className="font-medium">{fee.name}</TableCell>
                      <TableCell>
                        {fee.isFreeShipping ? (
                          <Badge variant="secondary">Free Shipping</Badge>
                        ) : (
                          <span>{fee.fee} EGP</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={fee.isActive}
                            onCheckedChange={() => handleToggle(fee)}
                          />
                          <Badge variant={fee.isActive ? "default" : "outline"}>
                            {fee.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(fee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(fee)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFee ? "Edit Shipping Fee" : "Add Shipping Fee"}
            </DialogTitle>
            <DialogDescription>
              {editingFee
                ? "Update the shipping fee details."
                : "Add a new shipping location and fee."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Cairo, Alexandria"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Free Shipping</Label>
                <p className="text-xs text-muted-foreground">
                  Enable free shipping for this location
                </p>
              </div>
              <Switch
                checked={formData.isFreeShipping}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFreeShipping: checked }))
                }
              />
            </div>

            {!formData.isFreeShipping && (
              <div className="space-y-2">
                <Label htmlFor="fee">Shipping Fee (EGP) *</Label>
                <Input
                  id="fee"
                  type="number"
                  placeholder="50"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fee: e.target.value }))
                  }
                  className={cn(errors.fee && "border-destructive")}
                />
                {errors.fee && <p className="text-xs text-destructive">{errors.fee}</p>}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this shipping option
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingFee ? "Save Changes" : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== PAYMENT METHODS ====================

interface PaymentMethod {
  name: string;
  displayName: string;
  description: string;
  instructions?: string;
  icon: string;
  enabled: boolean;
  testMode?: boolean;
  fees?: {
    type: "fixed" | "percentage";
    value: number;
  } | null;
  minAmount?: number;
  maxAmount?: number | null;
  order: number;
}

function PaymentMethodsTab() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [defaultMethod, setDefaultMethod] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingMethod, setDeletingMethod] = React.useState<PaymentMethod | null>(null);
  const [editingMethod, setEditingMethod] = React.useState<PaymentMethod | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    displayName: "",
    description: "",
    instructions: "",
    icon: "credit-card",
    enabled: true,
    testMode: false,
    feeType: "none" as "none" | "fixed" | "percentage",
    feeValue: "",
    minAmount: "",
    maxAmount: "",
    order: 0,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [toggleLoading, setToggleLoading] = React.useState<string | null>(null);
  const [defaultLoading, setDefaultLoading] = React.useState<string | null>(null);

  const fetchMethods = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch("/api/admin/payments/methods", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        data: {
          methods: PaymentMethod[];
          defaultMethod: string;
          totalMethods: number;
          enabledMethods: number;
        };
      };
      if (data.success) {
        setMethods(data.data.methods || []);
        setDefaultMethod(data.data.defaultMethod || "");
      }
    } catch (error) {
      console.error("Fetch payment methods error:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const filteredMethods = methods.filter(
    (method) =>
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingMethod(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      instructions: "",
      icon: "credit-card",
      enabled: true,
      testMode: false,
      feeType: "none",
      feeValue: "",
      minAmount: "",
      maxAmount: "",
      order: methods.length, // Put at the end
    });
    setDialogOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      displayName: method.displayName,
      description: method.description || "",
      instructions: method.instructions || "",
      icon: method.icon || "credit-card",
      enabled: method.enabled,
      testMode: method.testMode || false,
      feeType: method.fees ? method.fees.type : "none",
      feeValue: method.fees?.value?.toString() || "",
      minAmount: method.minAmount?.toString() || "",
      maxAmount: method.maxAmount?.toString() || "",
      order: method.order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setErrors({});
    setSaveLoading(true);
    try {
      const validatedData = paymentMethodSchema.parse({
        ...formData,
        name: editingMethod ? formData.name : formData.name.toLowerCase().replace(/\s+/g, "_"),
        fees: formData.feeType !== "none" && formData.feeValue
          ? {
            type: formData.feeType,
            value: parseFloat(formData.feeValue),
          }
          : null,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        displayName: formData.displayName || formData.name,
      });

      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const url = editingMethod
        ? `/api/admin/payments/methods/${editingMethod.name}`
        : "/api/admin/payments/methods";
      const method = editingMethod ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
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
        toast.success(editingMethod ? "Payment method updated" : "Payment method created");
        setDialogOpen(false);
        fetchMethods();
      } else {
        toast.error(data.message || "Failed to save payment method");
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
        toast.error(`Validation error: ${error.errors[0]?.message || "Check form"}`);
      } else {
        console.error("Save payment method error:", error);
        toast.error("An error occurred while saving");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggle = async (method: PaymentMethod) => {
    setToggleLoading(method.name);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/payments/methods/${method.name}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success(data.message || `Payment method ${method.enabled ? "disabled" : "enabled"}`);
        fetchMethods();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle payment method error:", error);
      toast.error("Failed to update status");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    if (method.name === defaultMethod) return;

    setDefaultLoading(method.name);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/payments/methods/${method.name}/set-default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success(data.message || `${method.displayName} is now the default`);
        fetchMethods();
      } else {
        toast.error(data.message || "Failed to set default");
      }
    } catch (error) {
      console.error("Set default payment method error:", error);
      toast.error("Failed to set default");
    } finally {
      setDefaultLoading(null);
    }
  };

  const handleDeleteClick = (method: PaymentMethod) => {
    setDeletingMethod(method);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingMethod) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/payments/methods/${deletingMethod.name}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success("Payment method deleted");
        setDeleteDialogOpen(false);
        setDeletingMethod(null);
        fetchMethods();
      } else {
        toast.error(data.message || "Failed to delete payment method");
      }
    } catch (error) {
      console.error("Delete payment method error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatFee = (method: PaymentMethod) => {
    if (!method.fees) return "-";
    if (method.fees.type === "fixed") {
      return `${method.fees.value} EGP`;
    }
    return `${method.fees.value}%`;
  };

  const iconOptions = [
    { value: "credit-card", label: "Credit Card" },
    { value: "cash", label: "Cash" },
    { value: "visa", label: "Visa" },
    { value: "mastercard", label: "Mastercard" },
    { value: "paypal", label: "PayPal" },
    { value: "bank", label: "Bank" },
    { value: "wallet", label: "Wallet" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage available payment options for customers
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payment methods..."
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
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <PaymentMethodsTableSkeleton />
                ) : filteredMethods.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                    >
                      No payment methods found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMethods.map((method) => (
                    <TableRow key={method.name}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-sm">{method.order + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{method.displayName}</span>
                              {method.name === defaultMethod && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{method.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatFee(method)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {method.minAmount || method.maxAmount ? (
                            <>
                              {method.minAmount ? `Min: ${method.minAmount} EGP` : ""}
                              {method.minAmount && method.maxAmount ? " / " : ""}
                              {method.maxAmount ? `Max: ${method.maxAmount} EGP` : ""}
                            </>
                          ) : (
                            "-"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={method.enabled}
                            onCheckedChange={() => handleToggle(method)}
                            disabled={toggleLoading === method.name}
                          />
                          <Badge variant={method.enabled ? "default" : "outline"}>
                            {method.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {method.name !== defaultMethod && method.enabled && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSetDefault(method)}
                              disabled={defaultLoading === method.name}
                              title="Set as default"
                            >
                              {defaultLoading === method.name ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Star className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(method)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(method)}
                            disabled={method.name === defaultMethod}
                            title={method.name === defaultMethod ? "Cannot delete default method" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? "Update the payment method details."
                : "Add a new payment method for customers."}
            </DialogDescription>
          </DialogHeader>
          {Object.keys(errors).length > 0 && (
            <div className="mx-6 mt-4 rounded-md bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">Please fix the following errors:</p>
              <ul className="mt-1 list-inside list-disc text-xs text-destructive">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>
                    <span className="font-semibold">{field}:</span> {message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {!editingMethod && (
              <div className="space-y-2">
                <Label htmlFor="pm-name">Identifier *</Label>
                <Input
                  id="pm-name"
                  placeholder="e.g. bank_transfer"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                {!errors.name && (
                  <p className="text-xs text-muted-foreground">
                    Lowercase, use underscores for spaces
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pm-displayName">Display Name *</Label>
              <Input
                id="pm-displayName"
                placeholder="e.g. Bank Transfer"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                }
                className={cn(errors.displayName && "border-destructive")}
              />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-description">Description</Label>
              <Input
                id="pm-description"
                placeholder="Brief description for customers"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className={cn(errors.description && "border-destructive")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-instructions">Instructions</Label>
              <Input
                id="pm-instructions"
                placeholder="Payment instructions for customers"
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                }
                className={cn(errors.instructions && "border-destructive")}
              />
              {errors.instructions && <p className="text-xs text-destructive">{errors.instructions}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-icon">Icon</Label>
              <select
                id="pm-icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pm-feeType">Fee Type</Label>
                <select
                  id="pm-feeType"
                  value={formData.feeType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      feeType: e.target.value as "none" | "fixed" | "percentage",
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="none">No Fee</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              {formData.feeType !== "none" && (
                <div className="space-y-2">
                  <Label htmlFor="pm-feeValue">
                    Fee {formData.feeType === "percentage" ? "(%)" : "(EGP)"}
                  </Label>
                  <Input
                    id="pm-feeValue"
                    type="number"
                    step="0.01"
                    placeholder={formData.feeType === "percentage" ? "2.5" : "10"}
                    value={formData.feeValue}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, feeValue: e.target.value }))
                    }
                    className={cn(errors["fees.value"] && "border-destructive")}
                  />
                  {errors["fees.value"] && <p className="text-xs text-destructive">{errors["fees.value"]}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pm-minAmount">Min Amount (EGP)</Label>
                <Input
                  id="pm-minAmount"
                  type="number"
                  placeholder="0"
                  value={formData.minAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, minAmount: e.target.value }))
                  }
                  className={cn(errors.minAmount && "border-destructive")}
                />
                {errors.minAmount && <p className="text-xs text-destructive">{errors.minAmount}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-maxAmount">Max Amount (EGP)</Label>
                <Input
                  id="pm-maxAmount"
                  type="number"
                  placeholder="No limit"
                  value={formData.maxAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, maxAmount: e.target.value }))
                  }
                  className={cn(errors.maxAmount && "border-destructive")}
                />
                {errors.maxAmount && <p className="text-xs text-destructive">{errors.maxAmount}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enabled</Label>
                <p className="text-xs text-muted-foreground">
                  Make this method available to customers
                </p>
              </div>
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Test Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Enable for testing purposes only
                </p>
              </div>
              <Switch
                checked={formData.testMode}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, testMode: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingMethod ? "Save Changes" : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingMethod?.displayName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== ACCOUNT SETTINGS ====================

interface AccountSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  orderPrefix: string;
}

interface AdminProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  permissions: {
    canManageUsers: boolean;
    canManageProducts: boolean;
    canManageOrders: boolean;
    canManageInventory: boolean;
    canViewAnalytics: boolean;
    canManagePayments: boolean;
    canManageAdmins: boolean;
    canManageSettings: boolean;
  };
}

function AccountSettingsTab() {
  const [loading, setLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [profileSaveLoading, setProfileSaveLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<AccountSettings>({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    orderPrefix: "MKD",
  });
  const [profileFormData, setProfileFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = React.useState<Record<string, string>>({});
  const [adminProfile, setAdminProfile] = React.useState<AdminProfile | null>(null);

  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      // Fetch profile only
      const profileResponse = await fetch("/api/admin/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const profileData = (await profileResponse.json()) as {
        success: boolean;
        data: { admin: AdminProfile };
      };

      if (profileData.success && profileData.data.admin) {
        setAdminProfile(profileData.data.admin);
        setProfileFormData({
          firstName: profileData.data.admin.profile?.firstName || "",
          lastName: profileData.data.admin.profile?.lastName || "",
          phone: profileData.data.admin.profile?.phone || "",
        });
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!formData.storeName) {
      toast.error("Store name is required");
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

      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // API endpoint /api/admin/settings does not exist yet
      toast.success("Settings saved successfully (Local)");
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileErrors({});
    setProfileSaveLoading(true);
    try {
      const validatedData = profileUpdateSchema.parse(profileFormData);

      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch("/api/admin/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
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
        toast.success("Profile updated successfully");
        // Update the local auth storage with new name
        const authData = localStorage.getItem("mk-dental-auth");
        if (authData) {
          const parsed: any = JSON.parse(authData);
          parsed.name = `${profileFormData.firstName} ${profileFormData.lastName}`.trim();
          localStorage.setItem("mk-dental-auth", JSON.stringify(parsed));
        }
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path.join(".")] = err.message;
          }
        });
        setProfileErrors(fieldErrors);
        toast.error("Please check the form for errors");
      } else {
        console.error("Save profile error:", error);
        toast.error("An error occurred while saving");
      }
    } finally {
      setProfileSaveLoading(false);
    }
  };

  if (loading) {
    return <AccountSettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Admin Profile Card */}
      {adminProfile && (
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
              Your administrator account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Read-only info */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{adminProfile.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{adminProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant={adminProfile.role === "super_admin" ? "default" : "secondary"}>
                  {adminProfile.role === "super_admin" ? "Super Admin" : "Admin"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-medium">
                  {adminProfile.lastLogin
                    ? new Date(adminProfile.lastLogin).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={profileFormData.firstName}
                  onChange={(e) =>
                    setProfileFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className={cn(profileErrors.firstName && "border-destructive")}
                />
                {profileErrors.firstName && <p className="text-xs text-destructive">{profileErrors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={profileFormData.lastName}
                  onChange={(e) =>
                    setProfileFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className={cn(profileErrors.lastName && "border-destructive")}
                />
                {profileErrors.lastName && <p className="text-xs text-destructive">{profileErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+20 123 456 7890"
                value={profileFormData.phone}
                onChange={(e) =>
                  setProfileFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className={cn(profileErrors.phone && "border-destructive")}
              />
              {profileErrors.phone && <p className="text-xs text-destructive">{profileErrors.phone}</p>}
            </div>
          </CardContent>
          <div className="flex justify-end px-6 pb-6">
            <Button onClick={handleProfileSave} disabled={profileSaveLoading}>
              {profileSaveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ==================== BANNERS ====================

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  linkType?: "none" | "product" | "category" | "external";
  linkTarget?: string;
  buttonText?: string;
  position: "hero" | "secondary" | "promotional";
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isCurrentlyActive?: boolean;
}

function BannersTab() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [positionFilter, setPositionFilter] = React.useState<string>("all");
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingBanner, setDeletingBanner] = React.useState<Banner | null>(null);
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [formData, setFormData] = React.useState({
    title: "",
    subtitle: "",
    image: "",
    linkType: "none" as "none" | "product" | "category" | "external",
    linkTarget: "",
    buttonText: "",
    position: "hero" as "hero" | "secondary" | "promotional",
    order: "0",
    isActive: true,
    startDate: "",
    endDate: "",
    backgroundColor: "#1a73e8",
    textColor: "#ffffff",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [toggleLoading, setToggleLoading] = React.useState<string | null>(null);

  // Upload States
  const [mainImageFile, setMainImageFile] = React.useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = React.useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainImageFile(file);
    if (mainImagePreview && mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImagePreview(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    setMainImageFile(null);
    if (mainImagePreview && mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const uploadBannerImage = async (file: File): Promise<string> => {
    const token = localStorage.getItem("mk-dental-token");
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json() as any;

    // Use the same extraction logic as products
    const extractUrl = (val: any): string => {
      if (!val) return "";
      if (Array.isArray(val) && val.length > 0) return extractUrl(val[0]);
      if (typeof val === 'string') return val;
      if (val.url) return extractUrl(val.url);
      if (val.secure_url) return extractUrl(val.secure_url);
      if (val.imageUrl) return extractUrl(val.imageUrl);
      if (val.path) return extractUrl(val.path);
      if (val.data) return extractUrl(val.data);
      if (val.image && typeof val.image === 'string') return val.image;
      if (val.image && val.image.url) return val.image.url;
      return "";
    };

    const url = extractUrl(data);
    if (!url) {
      throw new Error(data.message || "Failed to extract image URL from response");
    }
    return url;
  };

  const fetchBanners = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const params = new URLSearchParams();
      if (positionFilter !== "all") params.append("position", positionFilter);

      const response = await fetch(`/api/admin/banners?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        data: Banner[];
        pagination?: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
        };
      };
      if (data.success) {
        setBanners(data.data || []);
      }
    } catch (error) {
      console.error("Fetch banners error:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [positionFilter]);

  React.useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const filteredBanners = banners.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (banner.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      linkType: "none",
      linkTarget: "",
      buttonText: "",
      position: "hero",
      order: "0",
      isActive: true,
      startDate: "",
      endDate: "",
      backgroundColor: "#1a73e8",
      textColor: "#ffffff",
    });
    setMainImageFile(null);
    setMainImagePreview("");
    setDialogOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      linkType: banner.linkType || "none",
      linkTarget: banner.linkTarget || "",
      buttonText: banner.buttonText || "",
      position: banner.position,
      order: banner.order?.toString() || "0",
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
      endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
      backgroundColor: banner.backgroundColor || "#1a73e8",
      textColor: banner.textColor || "#ffffff",
    });
    setMainImageFile(null);
    setMainImagePreview(banner.image);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setErrors({});
    let finalImageUrl = formData.image;

    // Check image early to avoid redundant uploads if title is missing (though Zod handles this)
    if (!formData.image.trim() && !mainImageFile) {
      setErrors((prev) => ({ ...prev, image: "Banner image is required" }));
      toast.error("Banner image is required");
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

      // 1. Upload image if selected
      if (mainImageFile) {
        toast.loading("Uploading image...", { id: "banner-upload" });
        finalImageUrl = await uploadBannerImage(mainImageFile);
        toast.success("Image uploaded successfully", { id: "banner-upload" });
      }

      const validatedData = bannerSchema.parse({
        ...formData,
        image: finalImageUrl,
        order: parseInt(formData.order) || 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      });

      // Get user ID for createdBy field
      const authData = localStorage.getItem("mk-dental-auth");
      const userId = authData ? (JSON.parse(authData) as { id: string }).id : undefined;

      const url = editingBanner
        ? `/api/admin/banners/${editingBanner._id}`
        : "/api/admin/banners";
      const method = editingBanner ? "PUT" : "POST";

      const payload: Record<string, unknown> = {
        ...validatedData,
      };

      // Add createdBy for new banners
      if (!editingBanner && userId) {
        payload.createdBy = userId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
        toast.success(editingBanner ? "Banner updated" : "Banner created");
        setDialogOpen(false);
        fetchBanners();
      } else {
        toast.error(data.message || "Failed to save banner");
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
        console.error("Save banner error:", error);
        toast.error("An error occurred while saving");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggle = async (banner: Banner) => {
    setToggleLoading(banner._id);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/banners/${banner._id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success(data.message || `Banner ${banner.isActive ? "disabled" : "enabled"}`);
        fetchBanners();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle banner error:", error);
      toast.error("Failed to update status");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDeleteClick = (banner: Banner) => {
    setDeletingBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/banners/${deletingBanner._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success("Banner deleted");
        setDeleteDialogOpen(false);
        setDeletingBanner(null);
        fetchBanners();
      } else {
        toast.error(data.message || "Failed to delete banner");
      }
    } catch (error) {
      console.error("Delete banner error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setDeleteLoading(false);
    }
  };

  const positionLabels: Record<string, string> = {
    hero: "Hero",
    secondary: "Secondary",
    promotional: "Promotional",
  };

  const positionColors: Record<string, "default" | "secondary" | "outline"> = {
    hero: "default",
    secondary: "secondary",
    promotional: "outline",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Banners</CardTitle>
              <CardDescription>
                Manage homepage banners and promotional images
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search banners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Order</TableHead>
                  <TableHead>Banner</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <BannerTableSkeleton />
                ) : filteredBanners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No banners found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBanners.map((banner) => (
                    <TableRow key={banner._id}>
                      <TableCell className="font-mono text-sm">
                        {banner.order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-20 rounded border overflow-hidden bg-muted flex-shrink-0">
                            {banner.image ? (
                              <img
                                src={resolveImageUrl(banner.image)}
                                alt={banner.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src.includes("/placeholder.svg")) return;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Image className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{banner.title}</p>
                            {banner.subtitle && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {banner.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={positionColors[banner.position]}>
                          {positionLabels[banner.position]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {banner.startDate || banner.endDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {banner.startDate
                                ? new Date(banner.startDate).toLocaleDateString()
                                : "No start"}
                              {" - "}
                              {banner.endDate
                                ? new Date(banner.endDate).toLocaleDateString()
                                : "No end"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Always</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={banner.isActive}
                          onCheckedChange={() => handleToggle(banner)}
                          disabled={toggleLoading === banner._id}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {banner.linkType === "external" && banner.linkTarget && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={banner.linkTarget} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(banner)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Banner Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
            <DialogDescription>
              {editingBanner
                ? "Update banner details"
                : "Create a new banner for your store"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Banner title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={cn(errors.title && "border-destructive")}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="Banner subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className={cn(errors.subtitle && "border-destructive")}
                />
                {errors.subtitle && <p className="text-xs text-destructive">{errors.subtitle}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className={cn(errors.image && "text-destructive")}>Banner Image *</Label>
              <div className="flex flex-col gap-3">
                {mainImagePreview ? (
                  <div className={cn(
                    "relative aspect-[21/9] w-full rounded-lg overflow-hidden border bg-muted",
                    errors.image && "border-destructive"
                  )}>
                    <img
                      src={mainImagePreview.startsWith("blob:") ? mainImagePreview : resolveImageUrl(mainImagePreview)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full"
                      onClick={() => removeSelectedFile()}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 hover:bg-muted/50 transition-colors",
                      errors.image && "border-destructive border-solid bg-destructive/5"
                    )}
                    onClick={() => document.getElementById("main-image-upload")?.click()}
                  >
                    <ImagePlus className={cn("h-8 w-8 mb-2", errors.image ? "text-destructive" : "text-muted-foreground")} />
                    <span className={cn("text-xs font-medium", errors.image ? "text-destructive" : "text-muted-foreground")}>Click to upload banner image</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Recommended size: 1920x800px or 16:9</span>
                  </div>
                )}
                {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                <input
                  id="main-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkType">Link Type</Label>
                <Select
                  value={formData.linkType}
                  onValueChange={(value: "none" | "product" | "category" | "external") =>
                    setFormData((prev) => ({ ...prev, linkType: value }))
                  }
                >
                  <SelectTrigger id="linkType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.linkType !== "none" && (
                <div className="space-y-2">
                  <Label htmlFor="linkTarget">
                    {formData.linkType === "product" ? "Product ID" :
                      formData.linkType === "category" ? "Category ID" : "External URL"}
                  </Label>
                  <Input
                    id="linkTarget"
                    placeholder={
                      formData.linkType === "product" ? "Enter product ID" :
                        formData.linkType === "category" ? "Enter category ID" : "https://example.com"
                    }
                    value={formData.linkTarget}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkTarget: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  placeholder="Shop Now"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, buttonText: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value: "hero" | "secondary" | "promotional") =>
                    setFormData((prev) => ({ ...prev, position: value }))
                  }
                >
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: e.target.value }))
                  }
                  className={cn(errors.order && "border-destructive")}
                />
                {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, textColor: e.target.value }))
                    }
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={formData.textColor}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, textColor: e.target.value }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className={cn(errors.startDate && "border-destructive")}
                />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className={cn(errors.endDate && "border-destructive")}
                />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Show this banner on the site
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingBanner ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingBanner?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== ADMINS ====================

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

function AdminsTab() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [admins, setAdmins] = React.useState<Admin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingAdmin, setDeletingAdmin] = React.useState<Admin | null>(null);
  const [editingAdmin, setEditingAdmin] = React.useState<Admin | null>(null);
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "admin" as "admin" | "super_admin",
    isActive: true,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [toggleLoading, setToggleLoading] = React.useState<string | null>(null);

  const fetchAdmins = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch("/api/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const data: any = await response.json();
      if (data.success) {
        // Support both old and new API response structures
        if (Array.isArray(data.data)) {
          setAdmins(data.data);
        } else if (data.data && Array.isArray(data.data.admins)) {
          setAdmins(data.data.admins);
        } else {
          setAdmins([]);
        }
      }
    } catch (error) {
      console.error("Fetch admins error:", error);
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingAdmin(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "admin",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: "",
      firstName: (admin as any).profile?.firstName || "",
      lastName: (admin as any).profile?.lastName || "",
      role: admin.role,
      isActive: admin.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setErrors({});
    setSaveLoading(true);
    try {
      const validatedData = adminSchema.parse({
        ...formData,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: "", // formData doesn't have phone, but schema allows optional
        },
      });

      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const url = editingAdmin
        ? `/api/admin/admins/${editingAdmin._id}`
        : "/api/admin/admins";
      const method = editingAdmin ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
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
        toast.success(editingAdmin ? "Admin updated" : "Admin created");
        setDialogOpen(false);
        fetchAdmins();
      } else {
        toast.error(data.message || "Failed to save admin");
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
        console.error("Save admin error:", error);
        toast.error("An error occurred while saving");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggle = async (admin: Admin) => {
    setToggleLoading(admin._id);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/admins/${admin._id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success(data.message || `Admin ${admin.isActive ? "disabled" : "enabled"}`);
        fetchAdmins();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle admin error:", error);
      toast.error("Failed to update status");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDeleteClick = (admin: Admin) => {
    setDeletingAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAdmin) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/admins/${deletingAdmin._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        toast.success("Admin deleted");
        setDeleteDialogOpen(false);
        setDeletingAdmin(null);
        fetchAdmins();
      } else {
        toast.error(data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Delete admin error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setDeleteLoading(false);
    }
  };

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    super_admin: "Super Admin",
  };

  const roleColors: Record<string, "default" | "secondary"> = {
    admin: "secondary",
    super_admin: "default",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage administrator accounts and permissions
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
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
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton />
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No admins found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{admin.username}</p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleColors[admin.role]}>
                          {roleLabels[admin.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={admin.isActive}
                          onCheckedChange={() => handleToggle(admin)}
                          disabled={toggleLoading === admin._id}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(admin)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? "Edit Admin" : "Add New Admin"}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin
                ? "Update admin details"
                : "Create a new administrator account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className={cn(errors["profile.firstName"] && "border-destructive")}
              />
              {errors["profile.firstName"] && <p className="text-xs text-destructive">{errors["profile.firstName"]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className={cn(errors["profile.lastName"] && "border-destructive")}
              />
              {errors["profile.lastName"] && <p className="text-xs text-destructive">{errors["profile.lastName"]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="admin_user"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                className={cn(errors.username && "border-destructive")}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={cn(errors.email && "border-destructive")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {editingAdmin ? "(leave blank to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className={cn(errors.password && "border-destructive")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "super_admin") =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Allow this admin to log in
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingAdmin ? "Save Changes" : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAdmin?.username}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== SECURITY ====================

function SecurityTab() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = passwordChangeSchema.parse(formData);

      setLoading(true);
      const token = localStorage.getItem("mk-dental-token");
      const response = await fetch("/api/admin/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validatedData),
      });

      const data: any = await response.json();

      if (response.ok && data.success) {
        toast.success("Password changed successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Failed to change password");
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
        console.error("Change password error:", error);
        toast.error("An error occurred while changing password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your account password. Make sure to use a strong password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className={cn(errors.currentPassword && "border-destructive")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className={cn(errors.newPassword && "border-destructive")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            {errors.newPassword ? (
              <p className="text-xs text-destructive">{errors.newPassword}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className={cn(errors.confirmPassword && "border-destructive")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ==================== MAIN PAGE ====================

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage store settings and configurations
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="account" className="gap-2">
            <Settings className="h-4 w-4" />
            Account Settings
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            Shipping Fees
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <Image className="h-4 w-4" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-2">
            <Users className="h-4 w-4" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSettingsTab />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingFeesTab />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethodsTab />
        </TabsContent>

        <TabsContent value="banners">
          <BannersTab />
        </TabsContent>

        <TabsContent value="admins">
          <AdminsTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
