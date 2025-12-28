"use client";

import {
  Copy,
  Edit,
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

import { cn } from "~/lib/cn";
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

// Mock coupon data
const mockCoupons = [
  {
    id: "CPN-001",
    code: "WELCOME10",
    type: "percentage" as const,
    value: 10,
    description: "10% off for new customers",
    minPurchase: 50,
    maxDiscount: 100,
    usageLimit: 1000,
    usageCount: 456,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    isActive: true,
    applicableTo: "all",
  },
  {
    id: "CPN-002",
    code: "DENTAL25",
    type: "percentage" as const,
    value: 25,
    description: "25% off all dental equipment",
    minPurchase: 100,
    maxDiscount: 250,
    usageLimit: 500,
    usageCount: 123,
    startDate: "2024-06-01",
    endDate: "2024-12-31",
    isActive: true,
    applicableTo: "category",
  },
  {
    id: "CPN-003",
    code: "FLAT50",
    type: "fixed" as const,
    value: 50,
    description: "$50 off orders over $200",
    minPurchase: 200,
    maxDiscount: null,
    usageLimit: 200,
    usageCount: 89,
    startDate: "2024-09-01",
    endDate: "2024-11-30",
    isActive: false,
    applicableTo: "all",
  },
  {
    id: "CPN-004",
    code: "FREESHIP",
    type: "shipping" as const,
    value: 0,
    description: "Free shipping on all orders",
    minPurchase: 75,
    maxDiscount: null,
    usageLimit: null,
    usageCount: 1234,
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    isActive: true,
    applicableTo: "all",
  },
  {
    id: "CPN-005",
    code: "BULK15",
    type: "percentage" as const,
    value: 15,
    description: "15% off bulk orders",
    minPurchase: 500,
    maxDiscount: 500,
    usageLimit: 100,
    usageCount: 45,
    startDate: "2024-08-01",
    endDate: "2024-12-31",
    isActive: true,
    applicableTo: "all",
  },
];

type CouponType = "percentage" | "fixed" | "shipping";

interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  description: string;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableTo: string;
}

interface CouponFormData {
  code: string;
  type: CouponType;
  value: string;
  description: string;
  minPurchase: string;
  maxDiscount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableTo: string;
}

function generateCouponCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function CouponTypeIcon({ type }: { type: CouponType }) {
  switch (type) {
    case "percentage":
      return <Percent className="h-4 w-4" />;
    case "fixed":
      return <Tag className="h-4 w-4" />;
    case "shipping":
      return <Truck className="h-4 w-4" />;
  }
}

function CouponTypeBadge({ type }: { type: CouponType }) {
  const variants: Record<CouponType, "default" | "secondary" | "outline"> = {
    percentage: "default",
    fixed: "secondary",
    shipping: "outline",
  };

  const labels: Record<CouponType, string> = {
    percentage: "Percentage",
    fixed: "Fixed Amount",
    shipping: "Free Shipping",
  };

  return (
    <Badge variant={variants[type]} className="gap-1">
      <CouponTypeIcon type={type} />
      {labels[type]}
    </Badge>
  );
}

export default function AdminCouponsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [coupons, setCoupons] = React.useState<Coupon[]>(mockCoupons);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [couponToDelete, setCouponToDelete] = React.useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<Coupon | null>(null);

  const initialFormData: CouponFormData = {
    code: "",
    type: "percentage",
    value: "",
    description: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
    applicableTo: "all",
  };

  const [formData, setFormData] = React.useState<CouponFormData>(initialFormData);

  const filteredCoupons = React.useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || coupon.type === typeFilter;
      
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && coupon.isActive) ||
        (statusFilter === "inactive" && !coupon.isActive);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [coupons, searchQuery, typeFilter, statusFilter]);

  const handleDelete = (id: string) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (couponToDelete) {
      setCoupons(coupons.filter((c) => c.id !== couponToDelete));
      toast.success("Coupon deleted successfully");
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}" to clipboard`);
  };

  const handleToggleActive = (id: string) => {
    setCoupons(
      coupons.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
    toast.success("Coupon status updated");
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
      type: coupon.type,
      value: coupon.value.toString(),
      description: coupon.description,
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      isActive: coupon.isActive,
      applicableTo: coupon.applicableTo,
    });
    setCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingCoupon) {
      // Update existing coupon
      setCoupons(
        coupons.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: formData.code,
                type: formData.type,
                value: Number(formData.value),
                description: formData.description,
                minPurchase: Number(formData.minPurchase) || 0,
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                startDate: formData.startDate,
                endDate: formData.endDate,
                isActive: formData.isActive,
                applicableTo: formData.applicableTo,
              }
            : c
        )
      );
      toast.success("Coupon updated successfully");
    } else {
      // Create new coupon
      const newCoupon: Coupon = {
        id: `CPN-${String(coupons.length + 1).padStart(3, "0")}`,
        code: formData.code,
        type: formData.type,
        value: Number(formData.value),
        description: formData.description,
        minPurchase: Number(formData.minPurchase) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        usageCount: 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        applicableTo: formData.applicableTo,
      };
      setCoupons([...coupons, newCoupon]);
      toast.success("Coupon created successfully");
    }

    setCreateDialogOpen(false);
    setEditingCoupon(null);
    setFormData(initialFormData);
  };

  // Stats
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0);

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCoupons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

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
                  <SelectItem value="shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
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
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
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
                        {coupon.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <CouponTypeBadge type={coupon.type} />
                    </TableCell>
                    <TableCell>
                      {coupon.type === "percentage" && `${coupon.value}%`}
                      {coupon.type === "fixed" && `$${coupon.value}`}
                      {coupon.type === "shipping" && "Free"}
                      {coupon.minPurchase > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Min: ${coupon.minPurchase}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{coupon.usageCount}</span>
                        {coupon.usageLimit && (
                          <span className="text-muted-foreground">
                            {" "}/ {coupon.usageLimit}
                          </span>
                        )}
                      </div>
                      {coupon.usageLimit && (
                        <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              coupon.usageCount / coupon.usageLimit > 0.8
                                ? "bg-red-500"
                                : "bg-green-500"
                            )}
                            style={{
                              width: `${Math.min(
                                (coupon.usageCount / coupon.usageLimit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{coupon.startDate}</p>
                        <p className="text-muted-foreground">to {coupon.endDate}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleActive(coupon.id)}
                      />
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
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCoupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No coupons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Coupon Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
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
                <Label htmlFor="code">Coupon Code</Label>
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
                    className="font-mono"
                  />
                  <Button type="button" variant="outline" onClick={handleGenerateCode}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: CouponType) =>
                      setFormData((prev) => ({ ...prev, type: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type !== "shipping" && (
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      {formData.type === "percentage" ? "Percentage" : "Amount ($)"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder={formData.type === "percentage" ? "10" : "50"}
                      value={formData.value}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, value: e.target.value }))
                      }
                    />
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
                  <Label htmlFor="minPurchase">Minimum Purchase ($)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    placeholder="0"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, minPurchase: e.target.value }))
                    }
                  />
                </div>

                {formData.type === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="No limit"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxDiscount: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicableTo">Applicable To</Label>
                  <Select
                    value={formData.applicableTo}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, applicableTo: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="category">Specific Category</SelectItem>
                      <SelectItem value="product">Specific Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                  />
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
                  />
                </div>
              </div>

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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
