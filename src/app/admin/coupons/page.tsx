"use client";

import {
  AlertCircle,
  Copy,
  Edit,
  Loader2,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { couponSchema } from "~/lib/validation-schemas";

import { cn } from "~/lib/cn";
import { CouponStatsSkeleton, CouponTableSkeleton } from "~/ui/components/admin/product-skeletons";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
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

type DiscountType = "percentage" | "fixed" | "free_shipping";

interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  usageLimit: {
    total: number | null;
    perCustomer: number | null;
  };
  usageCount: number;
  minimumPurchase: number;
  minimumItems: number;
  restrictions: {
    categories: string[];
    products: string[];
    excludeCategories: string[];
    excludeProducts: string[];
    productTypes: string[];
    newCustomersOnly: boolean;
    firstOrderOnly: boolean;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: "active" | "expired" | "depleted" | "scheduled" | "inactive";
  notes?: string;
  createdBy?: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface Statistics {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  depletedCoupons: number;
  totalUsage: number;
}

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  usageLimitTotal: string;
  usageLimitPerCustomer: string;
  minimumPurchase: string;
  minimumItems: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  newCustomersOnly: boolean;
  firstOrderOnly: boolean;
  productTypes: string[];
  notes: string;
}

function generateCouponCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function CouponTypeIcon({ type }: { type: DiscountType }) {
  switch (type) {
    case "percentage":
      return <Percent className="h-4 w-4" />;
    case "fixed":
      return <Tag className="h-4 w-4" />;
    case "free_shipping":
      return <Truck className="h-4 w-4" />;
  }
}

function CouponTypeBadge({ type }: { type: DiscountType }) {
  const variants: Record<DiscountType, "default" | "secondary" | "outline"> = {
    percentage: "default",
    fixed: "secondary",
    free_shipping: "outline",
  };

  const labels: Record<DiscountType, string> = {
    percentage: "Percentage",
    fixed: "Fixed Amount",
    free_shipping: "Free Shipping",
  };

  return (
    <Badge variant={variants[type]} className="gap-1">
      <CouponTypeIcon type={type} />
      {labels[type]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: Coupon["status"] }) {
  const variants: Record<Coupon["status"], "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    scheduled: "secondary",
    expired: "destructive",
    depleted: "destructive",
    inactive: "outline",
  };

  const labels: Record<Coupon["status"], string> = {
    active: "Active",
    scheduled: "Scheduled",
    expired: "Expired",
    depleted: "Depleted",
    inactive: "Inactive",
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminCouponsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [statistics, setStatistics] = React.useState<Statistics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [couponToDelete, setCouponToDelete] = React.useState<Coupon | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<Coupon | null>(null);
  const [saveLoading, setSaveLoading] = React.useState(false);

  const initialFormData: CouponFormData = {
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscountAmount: "",
    usageLimitTotal: "",
    usageLimitPerCustomer: "1",
    minimumPurchase: "",
    minimumItems: "",
    startDate: "",
    endDate: "",
    isActive: true,
    newCustomersOnly: false,
    firstOrderOnly: false,
    productTypes: ["single", "package"],
    notes: "",
  };

  const [formData, setFormData] = React.useState<CouponFormData>(initialFormData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const fetchCoupons = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter !== "all") params.set("discountType", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/admin/coupons?${params.toString()}`, {
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
          coupons: Coupon[];
          statistics: Statistics;
        };
      };

      if (data.success) {
        setCoupons(data.data.coupons || []);
        setStatistics(data.data.statistics || null);
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, statusFilter]);

  React.useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const filteredCoupons = React.useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [coupons, searchQuery]);

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/coupons/${couponToDelete._id}`, {
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
        // Show the message from the API (handles both delete and soft-delete cases)
        toast.success(data.message || "Coupon deleted successfully");
        setDeleteDialogOpen(false);
        setCouponToDelete(null);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}" to clipboard`);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/coupons/${coupon._id}/toggle-status`, {
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
        toast.success(data.message || `Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle coupon error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleGenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: generateCouponCode() }));
  };

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingCoupon(null);
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      usageLimitTotal: coupon.usageLimit.total?.toString() || "",
      usageLimitPerCustomer: coupon.usageLimit.perCustomer?.toString() || "",
      minimumPurchase: coupon.minimumPurchase?.toString() || "",
      minimumItems: coupon.minimumItems?.toString() || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split("T")[0] : "",
      isActive: coupon.isActive,
      newCustomersOnly: coupon.restrictions?.newCustomersOnly || false,
      firstOrderOnly: coupon.restrictions?.firstOrderOnly || false,
      productTypes: coupon.restrictions?.productTypes || ["single", "package"],
      notes: coupon.notes || "",
    });
    setCreateDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = couponSchema.parse({
        ...formData,
        discountValue: formData.discountType === "free_shipping" ? 0 : parseFloat(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
        minimumItems: formData.minimumItems ? parseInt(formData.minimumItems) : 0,
        usageLimit: {
          total: formData.usageLimitTotal ? parseInt(formData.usageLimitTotal) : null,
          perCustomer: formData.usageLimitPerCustomer ? parseInt(formData.usageLimitPerCustomer) : null,
        },
        restrictions: {
          newCustomersOnly: formData.newCustomersOnly,
          firstOrderOnly: formData.firstOrderOnly,
          categories: [],
          products: [],
          excludeCategories: [],
          excludeProducts: [],
          productTypes: formData.productTypes,
        },
      });
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon._id}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

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
        toast.success(editingCoupon ? "Coupon updated successfully" : "Coupon created successfully");
        setCreateDialogOpen(false);
        setEditingCoupon(null);
        setFormData(initialFormData);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to save coupon");
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
        console.error("Save coupon error:", error);
        toast.error("An error occurred while saving");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount codes and promotions
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      {loading && !statistics ? (
        <CouponStatsSkeleton />
      ) : statistics ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.activeCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.expiredCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalUsage.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon List</CardTitle>
          <CardDescription>
            {filteredCoupons.length} coupons found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="depleted">Depleted</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <CouponTableSkeleton />
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No coupons found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-medium bg-muted px-2 py-1 rounded">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyCode(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {coupon.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <CouponTypeBadge type={coupon.discountType} />
                      </TableCell>
                      <TableCell>
                        {coupon.discountType === "percentage" && `${coupon.discountValue}%`}
                        {coupon.discountType === "fixed" && `${coupon.discountValue} EGP`}
                        {coupon.discountType === "free_shipping" && "Free"}
                        {coupon.minimumPurchase > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Min: {coupon.minimumPurchase} EGP
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{coupon.usageCount}</span>
                          {coupon.usageLimit.total && (
                            <span className="text-muted-foreground">
                              {" "}/ {coupon.usageLimit.total}
                            </span>
                          )}
                        </div>
                        {coupon.usageLimit.total && (
                          <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                coupon.usageCount / coupon.usageLimit.total > 0.8
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              )}
                              style={{
                                width: `${Math.min(
                                  (coupon.usageCount / coupon.usageLimit.total) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{coupon.startDate ? formatDate(coupon.startDate) : "No start"}</p>
                          <p className="text-muted-foreground">
                            to {coupon.endDate ? formatDate(coupon.endDate) : "No end"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={coupon.isActive}
                            onCheckedChange={() => handleToggleActive(coupon)}
                          />
                          <StatusBadge status={coupon.status} />
                        </div>
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
                            <DropdownMenuItem onClick={() => handleOpenEdit(coupon)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyCode(coupon.code)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(coupon)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon &quot;{couponToDelete?.code}&quot;? This action cannot be undone.
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

      {/* Create/Edit Coupon Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? "Update the coupon details below."
                : "Create a new discount coupon for your customers."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="Enter coupon code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    className={cn("font-mono", errors.code && "border-destructive")}
                    disabled={!!editingCoupon}
                  />
                  {!editingCoupon && (
                    <Button type="button" variant="outline" onClick={handleGenerateCode}>
                      Generate
                    </Button>
                  )}
                </div>
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Summer Sale 20% Off"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(v: DiscountType) =>
                      setFormData((prev) => ({ ...prev, discountType: v }))
                    }
                  >
                    <SelectTrigger className={cn(errors.discountType && "border-destructive")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.discountType && <p className="text-xs text-destructive">{errors.discountType}</p>}
                </div>

                {formData.discountType !== "free_shipping" && (
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      {formData.discountType === "percentage" ? "Percentage *" : "Amount (EGP) *"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder={formData.discountType === "percentage" ? "20" : "50"}
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, discountValue: e.target.value }))
                      }
                      className={cn(errors.discountValue && "border-destructive")}
                    />
                    {errors.discountValue && <p className="text-xs text-destructive">{errors.discountValue}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the coupon"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minimumPurchase">Minimum Purchase (EGP)</Label>
                  <Input
                    id="minimumPurchase"
                    type="number"
                    placeholder="0"
                    value={formData.minimumPurchase}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, minimumPurchase: e.target.value }))
                    }
                    className={cn(errors.minimumPurchase && "border-destructive")}
                  />
                  {errors.minimumPurchase && <p className="text-xs text-destructive">{errors.minimumPurchase}</p>}
                </div>

                {formData.discountType === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount (EGP)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="No limit"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxDiscountAmount: e.target.value,
                        }))
                      }
                      className={cn(errors.maxDiscountAmount && "border-destructive")}
                    />
                    {errors.maxDiscountAmount && <p className="text-xs text-destructive">{errors.maxDiscountAmount}</p>}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="usageLimitTotal">Total Usage Limit</Label>
                  <Input
                    id="usageLimitTotal"
                    type="number"
                    placeholder="Unlimited"
                    value={formData.usageLimitTotal}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, usageLimitTotal: e.target.value }))
                    }
                    className={cn(errors["usageLimit.total"] && "border-destructive")}
                  />
                  {errors["usageLimit.total"] && <p className="text-xs text-destructive">{errors["usageLimit.total"]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usageLimitPerCustomer">Per Customer Limit</Label>
                  <Input
                    id="usageLimitPerCustomer"
                    type="number"
                    placeholder="1"
                    value={formData.usageLimitPerCustomer}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, usageLimitPerCustomer: e.target.value }))
                    }
                    className={cn(errors["usageLimit.perCustomer"] && "border-destructive")}
                  />
                  {errors["usageLimit.perCustomer"] && <p className="text-xs text-destructive">{errors["usageLimit.perCustomer"]}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
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
                  <Label htmlFor="endDate">End Date *</Label>
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

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Coupon can be used immediately
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Customers Only</Label>
                    <p className="text-xs text-muted-foreground">
                      Only for first-time buyers
                    </p>
                  </div>
                  <Switch
                    checked={formData.newCustomersOnly}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, newCustomersOnly: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>First Order Only</Label>
                    <p className="text-xs text-muted-foreground">
                      Valid only for customer&apos;s first order
                    </p>
                  </div>
                  <Switch
                    checked={formData.firstOrderOnly}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, firstOrderOnly: checked }))
                    }
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Applies To</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.productTypes.includes("single")}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            productTypes: e.target.checked
                              ? [...prev.productTypes, "single"]
                              : prev.productTypes.filter((t) => t !== "single"),
                          }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Single Products</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.productTypes.includes("package")}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            productTypes: e.target.checked
                              ? [...prev.productTypes, "package"]
                              : prev.productTypes.filter((t) => t !== "package"),
                          }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Packages</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Input
                  id="notes"
                  placeholder="Internal notes (not visible to customers)"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  For admin use only - e.g., &quot;Approved by marketing&quot;
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={saveLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveLoading}>
                {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
