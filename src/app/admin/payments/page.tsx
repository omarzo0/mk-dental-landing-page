"use client";

import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  X,
  XCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Textarea } from "~/ui/primitives/textarea";

// Types
interface Payment {
  _id: string;
  orderId?: {
    _id: string;
    orderNumber: string;
    totals?: { total: number };
  };
  userId?: {
    _id: string;
    username: string;
    email: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  codStatus?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalPayments: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Statistics {
  totalAmount: number;
  totalPayments: number;
  completedPayments: number;
  failedPayments: number;
  averageAmount: number;
}

interface MethodDistribution {
  _id: string;
  count: number;
  totalAmount: number;
}

type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

const statusColors: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  completed: "default",
  failed: "destructive",
  refunded: "secondary",
};

const paymentMethods = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export default function AdminPaymentsPage() {
  const [loading, setLoading] = React.useState(true);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [statistics, setStatistics] = React.useState<Statistics | null>(null);
  const [methodDistribution, setMethodDistribution] = React.useState<MethodDistribution[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [minAmount, setMinAmount] = React.useState("");
  const [maxAmount, setMaxAmount] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState("desc");

  // Dialog states
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [createLoading, setCreateLoading] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    orderId: "",
    userId: "",
    paymentMethod: "cod",
    amount: "",
    currency: "EGP",
    status: "pending",
    notes: "",
  });

  // Update status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(false);
  const [statusPayment, setStatusPayment] = React.useState<Payment | null>(null);
  const [newStatus, setNewStatus] = React.useState<PaymentStatus>("pending");
  const [refundAmount, setRefundAmount] = React.useState("");

  // COD Confirm dialog state
  const [confirmCodOpen, setConfirmCodOpen] = React.useState(false);
  const [confirmCodLoading, setConfirmCodLoading] = React.useState(false);
  const [confirmCodPayment, setConfirmCodPayment] = React.useState<Payment | null>(null);
  const [codCollectedAmount, setCodCollectedAmount] = React.useState("");
  const [codNotes, setCodNotes] = React.useState("");

  // COD Fail dialog state
  const [failCodOpen, setFailCodOpen] = React.useState(false);
  const [failCodLoading, setFailCodLoading] = React.useState(false);
  const [failCodPayment, setFailCodPayment] = React.useState<Payment | null>(null);
  const [failCodReason, setFailCodReason] = React.useState("");

  // Refund dialog state
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [refundLoading, setRefundLoading] = React.useState(false);
  const [refundPayment, setRefundPayment] = React.useState<Payment | null>(null);
  const [refundDialogAmount, setRefundDialogAmount] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("");

  const fetchPayments = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "20");
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (methodFilter !== "all") params.append("paymentMethod", methodFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (minAmount) params.append("minAmount", minAmount);
      if (maxAmount) params.append("maxAmount", maxAmount);
      if (maxAmount) params.append("maxAmount", maxAmount);

      const response = await fetch(`/api/admin/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        data: {
          payments: Payment[];
          pagination: Pagination;
          statistics: Statistics;
          methodDistribution: MethodDistribution[];
        };
        message?: string;
      };

      if (data.success) {
        setPayments(data.data.payments || []);
        setPagination(data.data.pagination || null);
        setStatistics(data.data.statistics || null);
        setMethodDistribution(data.data.methodDistribution || []);
      } else {
        toast.error(data.message || "Failed to load payments");
      }
    } catch (error) {
      console.error("Fetch payments error:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, methodFilter, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder]);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  const viewPaymentDetails = async (payment: Payment) => {
    setDetailsLoading(true);
    setDetailsOpen(true);

    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/payments/${payment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        data: { payment: Payment };
        message?: string;
      };

      if (data.success) {
        setSelectedPayment(data.data.payment);
      } else {
        toast.error(data.message || "Failed to load payment details");
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error("Fetch payment details error:", error);
      toast.error("Failed to load payment details");
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!createForm.orderId.trim()) {
      toast.error("Order ID is required");
      return;
    }

    if (!createForm.paymentMethod) {
      toast.error("Payment method is required");
      return;
    }

    setCreateLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const body: Record<string, string | number> = {
        orderId: createForm.orderId,
        paymentMethod: createForm.paymentMethod,
        currency: createForm.currency,
        status: createForm.status,
      };

      if (createForm.userId) body.userId = createForm.userId;
      if (createForm.amount) body.amount = parseFloat(createForm.amount);
      if (createForm.notes) body.notes = createForm.notes;

      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        toast.success(data.message || "Payment created successfully");
        setCreateDialogOpen(false);
        setCreateForm({
          orderId: "",
          userId: "",
          paymentMethod: "cod",
          amount: "",
          currency: "EGP",
          status: "pending",
          notes: "",
        });
        fetchPayments();
      } else {
        toast.error(data.message || "Failed to create payment");
      }
    } catch (error) {
      console.error("Create payment error:", error);
      toast.error("Failed to create payment");
    } finally {
      setCreateLoading(false);
    }
  };

  const openStatusDialog = (payment: Payment) => {
    setStatusPayment(payment);
    setNewStatus(payment.status);
    setRefundAmount("");
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!statusPayment) return;

    setStatusLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const body: Record<string, string | number> = {
        status: newStatus,
      };

      if (newStatus === "refunded" && refundAmount) {
        body.refundAmount = parseFloat(refundAmount);
      }

      const response = await fetch(`/api/admin/payments/${statusPayment._id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        toast.success(data.message || "Payment status updated successfully");
        setStatusDialogOpen(false);
        setStatusPayment(null);
        fetchPayments();
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update payment status");
    } finally {
      setStatusLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setMethodFilter("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(1);
  };

  // COD Management Functions
  const openConfirmCodDialog = (payment: Payment) => {
    setConfirmCodPayment(payment);
    setCodCollectedAmount(payment.amount.toString());
    setCodNotes("");
    setConfirmCodOpen(true);
  };

  const handleConfirmCod = async () => {
    if (!confirmCodPayment) return;

    if (!codCollectedAmount || parseFloat(codCollectedAmount) <= 0) {
      toast.error("Please enter a valid collected amount");
      return;
    }

    setConfirmCodLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/payments/${confirmCodPayment._id}/confirm-cod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectedAmount: parseFloat(codCollectedAmount),
          notes: codNotes || undefined,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        toast.success(data.message || "COD payment confirmed successfully");
        setConfirmCodOpen(false);
        setConfirmCodPayment(null);
        fetchPayments();
      } else {
        toast.error(data.message || "Failed to confirm COD payment");
      }
    } catch (error) {
      console.error("Confirm COD error:", error);
      toast.error("Failed to confirm COD payment");
    } finally {
      setConfirmCodLoading(false);
    }
  };

  const openFailCodDialog = (payment: Payment) => {
    setFailCodPayment(payment);
    setFailCodReason("");
    setFailCodOpen(true);
  };

  const handleFailCod = async () => {
    if (!failCodPayment) return;

    if (!failCodReason.trim()) {
      toast.error("Please provide a reason for failure");
      return;
    }

    setFailCodLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/payments/${failCodPayment._id}/fail-cod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: failCodReason,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        toast.success(data.message || "COD payment marked as failed");
        setFailCodOpen(false);
        setFailCodPayment(null);
        fetchPayments();
      } else {
        toast.error(data.message || "Failed to mark COD payment as failed");
      }
    } catch (error) {
      console.error("Fail COD error:", error);
      toast.error("Failed to mark COD payment as failed");
    } finally {
      setFailCodLoading(false);
    }
  };

  // Refund Function
  const openRefundDialog = (payment: Payment) => {
    setRefundPayment(payment);
    setRefundDialogAmount("");
    setRefundReason("");
    setRefundDialogOpen(true);
  };

  const handleProcessRefund = async () => {
    if (!refundPayment) return;

    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    const amount = refundDialogAmount ? parseFloat(refundDialogAmount) : refundPayment.amount;
    if (amount <= 0 || amount > refundPayment.amount) {
      toast.error(`Refund amount must be between 0.01 and ${refundPayment.amount}`);
      return;
    }

    setRefundLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/payments/${refundPayment._id}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refundAmount: amount,
          reason: refundReason,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        toast.success(data.message || "Refund processed successfully");
        setRefundDialogOpen(false);
        setRefundPayment(null);
        fetchPayments();
      } else {
        toast.error(data.message || "Failed to process refund");
      }
    } catch (error) {
      console.error("Process refund error:", error);
      toast.error("Failed to process refund");
    } finally {
      setRefundLoading(false);
    }
  };

  const hasActiveFilters = statusFilter !== "all" || methodFilter !== "all" || startDate || endDate || minAmount || maxAmount;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "EGP") => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const getMethodLabel = (method: string) => {
    const found = paymentMethods.find((m) => m.value === method);
    return found?.label || method;
  };

  const filteredPayments = React.useMemo(() => {
    if (!searchQuery) return payments;
    return payments.filter((payment) => {
      const q = searchQuery.toLowerCase();
      return (
        payment.orderId?.orderNumber?.toLowerCase().includes(q) ||
        payment.customer?.firstName?.toLowerCase().includes(q) ||
        payment.customer?.lastName?.toLowerCase().includes(q) ||
        payment.userId?.username?.toLowerCase().includes(q) ||
        payment.userId?.email?.toLowerCase().includes(q) ||
        payment._id.toLowerCase().includes(q)
      );
    });
  }, [payments, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            View and manage all payment records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payments</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "-" : (statistics?.totalPayments || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {loading ? "-" : formatCurrency(statistics?.totalAmount || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "-" : (statistics?.completedPayments || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {loading ? "-" : (statistics?.failedPayments || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Amount</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "-" : formatCurrency(statistics?.averageAmount || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Method Distribution */}
      {methodDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {methodDistribution.map((method) => (
                <div key={method._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium capitalize">{getMethodLabel(method._id)}</p>
                    <p className="text-sm text-muted-foreground">{method.count} payments</p>
                  </div>
                  <p className="font-semibold text-green-600">{formatCurrency(method.totalAmount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalPayments} payments found` : `${payments.length} payments`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setCurrentPage(1)} disabled={loading}>
                Search
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={(value) => { setMethodFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="w-[150px]"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="w-[150px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Min Amount"
                  value={minAmount}
                  onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
                  className="w-[120px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max Amount"
                  value={maxAmount}
                  onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                  className="w-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">
                        {payment.orderId?.orderNumber || "-"}
                      </TableCell>
                      <TableCell>
                        {payment.customer?.firstName || payment.userId?.username || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{getMethodLabel(payment.paymentMethod)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[payment.status]} className="capitalize">
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)}
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
                            <DropdownMenuItem onClick={() => viewPaymentDetails(payment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openStatusDialog(payment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Change Status
                            </DropdownMenuItem>
                            {payment.orderId && (
                              <DropdownMenuItem asChild>
                                <a href={`/admin/orders/${payment.orderId._id}`}>
                                  View Order
                                </a>
                              </DropdownMenuItem>
                            )}
                            {/* COD Actions */}
                            {payment.paymentMethod === "cod" && payment.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground">COD Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openConfirmCodDialog(payment)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Confirm Collection
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openFailCodDialog(payment)}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Mark as Failed
                                </DropdownMenuItem>
                              </>
                            )}
                            {/* Refund Action */}
                            {payment.status === "completed" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openRefundDialog(payment)}>
                                  <RotateCcw className="mr-2 h-4 w-4 text-orange-600" />
                                  Process Refund
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
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
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              {selectedPayment?.orderId?.orderNumber || "Loading..."}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedPayment && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-sm">{selectedPayment._id}</span>
                </div>
                {selectedPayment.orderId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-medium">{selectedPayment.orderId.orderNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {selectedPayment.customer?.firstName || selectedPayment.userId?.username || selectedPayment.userId?.email || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">{getMethodLabel(selectedPayment.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusColors[selectedPayment.status]} className="capitalize">
                    {selectedPayment.status}
                  </Badge>
                </div>
                {selectedPayment.codStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">COD Status</span>
                    <span className="font-medium capitalize">{selectedPayment.codStatus.replace(/_/g, " ")}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </span>
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-medium text-sm">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Payment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payment</DialogTitle>
            <DialogDescription>
              Create a new payment record for an order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID *</Label>
              <Input
                id="orderId"
                placeholder="Enter order ID"
                value={createForm.orderId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, orderId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID (optional)</Label>
              <Input
                id="userId"
                placeholder="Defaults to order's user"
                value={createForm.userId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, userId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={createForm.paymentMethod}
                onValueChange={(value) => setCreateForm((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Defaults to order total"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={createForm.currency}
                  onValueChange={(value) => setCreateForm((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EGP">EGP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={createForm.status}
                onValueChange={(value) => setCreateForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Admin notes..."
                value={createForm.notes}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{createForm.notes.length}/500 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePayment} disabled={createLoading}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Change the status for payment {statusPayment?.orderId?.orderNumber || ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {statusPayment && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status</span>
                  <Badge variant={statusColors[statusPayment.status]} className="capitalize">
                    {statusPayment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(statusPayment.amount, statusPayment.currency)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newStatus">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as PaymentStatus)}
              >
                <SelectTrigger id="newStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === "refunded" && (
              <div className="space-y-2">
                <Label htmlFor="refundAmount">Refund Amount (optional)</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  placeholder={statusPayment ? `Max: ${statusPayment.amount}` : "Enter refund amount"}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for full refund
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={statusLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={statusLoading || (statusPayment?.status === newStatus)}
            >
              {statusLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm COD Dialog */}
      <Dialog open={confirmCodOpen} onOpenChange={setConfirmCodOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              Confirm COD Collection
            </DialogTitle>
            <DialogDescription>
              Confirm cash collection for order {confirmCodPayment?.orderId?.orderNumber || ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {confirmCodPayment && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Amount</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(confirmCodPayment.amount, confirmCodPayment.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {confirmCodPayment.customer?.firstName || confirmCodPayment.userId?.username || confirmCodPayment.userId?.email || "-"}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="codCollectedAmount">Collected Amount *</Label>
              <Input
                id="codCollectedAmount"
                type="number"
                step="0.01"
                placeholder="Enter collected amount"
                value={codCollectedAmount}
                onChange={(e) => setCodCollectedAmount(e.target.value)}
              />
              {confirmCodPayment && codCollectedAmount && parseFloat(codCollectedAmount) !== confirmCodPayment.amount && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Amount differs from expected ({formatCurrency(confirmCodPayment.amount, confirmCodPayment.currency)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codNotes">Notes (optional)</Label>
              <Textarea
                id="codNotes"
                placeholder="e.g., Collected by delivery agent Ahmed"
                value={codNotes}
                onChange={(e) => setCodNotes(e.target.value)}
                rows={2}
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmCodOpen(false)}
              disabled={confirmCodLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmCod} disabled={confirmCodLoading} className="bg-green-600 hover:bg-green-700">
              {confirmCodLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fail COD Dialog */}
      <Dialog open={failCodOpen} onOpenChange={setFailCodOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Mark COD as Failed
            </DialogTitle>
            <DialogDescription>
              Mark COD payment as failed for order {failCodPayment?.orderId?.orderNumber || ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {failCodPayment && (
              <div className="rounded-lg border border-red-200 p-4 space-y-2 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(failCodPayment.amount, failCodPayment.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {failCodPayment.userId?.username || failCodPayment.userId?.email || "-"}
                  </span>
                </div>
                <p className="text-xs text-red-600 pt-2">
                  ⚠️ This will also cancel the associated order
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="failCodReason">Reason for Failure *</Label>
              <Textarea
                id="failCodReason"
                placeholder="e.g., Customer not available after 3 delivery attempts"
                value={failCodReason}
                onChange={(e) => setFailCodReason(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{failCodReason.length}/500 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFailCodOpen(false)}
              disabled={failCodLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFailCod}
              disabled={failCodLoading || !failCodReason.trim()}
              variant="destructive"
            >
              {failCodLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <XCircle className="mr-2 h-4 w-4" />
              Mark as Failed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Process Refund
            </DialogTitle>
            <DialogDescription>
              Issue a refund for order {refundPayment?.orderId?.orderNumber || ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {refundPayment && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(refundPayment.amount, refundPayment.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">{getMethodLabel(refundPayment.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {refundPayment.userId?.username || refundPayment.userId?.email || "-"}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="refundDialogAmount">Refund Amount</Label>
              <Input
                id="refundDialogAmount"
                type="number"
                step="0.01"
                placeholder={refundPayment ? `Full refund: ${refundPayment.amount}` : "Enter amount"}
                value={refundDialogAmount}
                onChange={(e) => setRefundDialogAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for full refund. Max: {refundPayment ? formatCurrency(refundPayment.amount, refundPayment.currency) : "-"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason for Refund *</Label>
              <Textarea
                id="refundReason"
                placeholder="e.g., Customer requested refund - item damaged"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{refundReason.length}/500 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
              disabled={refundLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessRefund}
              disabled={refundLoading || !refundReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {refundLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <RotateCcw className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
