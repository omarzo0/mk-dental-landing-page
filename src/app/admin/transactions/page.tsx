"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  TrendingUp,
  X,
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
interface Transaction {
  _id: string;
  paymentId?: {
    _id: string;
    orderId?: {
      _id: string;
      orderNumber: string;
      customer?: { email: string };
    };
    paymentMethod: string;
    amount: number;
  };
  userId?: {
    _id: string;
    username: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  type: "sale" | "refund" | "authorization" | "capture";
  amount: number;
  currency: string;
  gatewayTransactionId: string;
  gatewayResponse?: {
    gateway: string;
    status: string;
    authorizationCode?: string;
  };
  status: "success" | "failed" | "pending";
  processedAt: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TransactionSummary {
  _id: null;
  totalAmount: number;
  avgAmount: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
}

interface TransactionDetails {
  transaction: Transaction;
  order?: {
    _id: string;
    orderNumber: string;
    status: string;
    totals: { total: number };
  };
}

type TransactionStatus = "success" | "failed" | "pending";
type TransactionType = "sale" | "refund" | "authorization" | "capture";

const statusColors: Record<TransactionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  pending: "outline",
  failed: "destructive",
};

const typeColors: Record<TransactionType, "default" | "secondary" | "destructive" | "outline"> = {
  sale: "default",
  capture: "default",
  refund: "destructive",
  authorization: "secondary",
};

export default function AdminTransactionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [summary, setSummary] = React.useState<TransactionSummary | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [minAmount, setMinAmount] = React.useState("");
  const [maxAmount, setMaxAmount] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState("desc");

  // Dialog states
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<TransactionDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [refundTransaction, setRefundTransaction] = React.useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("");
  const [refundLoading, setRefundLoading] = React.useState(false);

  const fetchTransactions = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "20");
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (minAmount) params.append("minAmount", minAmount);
      if (maxAmount) params.append("maxAmount", maxAmount);
      if (maxAmount) params.append("maxAmount", maxAmount);

      const response = await fetch(`/api/admin/transactions?${params.toString()}`, {
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
          transactions: Transaction[];
          pagination: Pagination;
          summary: TransactionSummary;
        };
        message?: string;
      };

      if (data.success) {
        setTransactions(data.data.transactions || []);
        setPagination(data.data.pagination || null);
        setSummary(data.data.summary || null);
      } else {
        toast.error(data.message || "Failed to load transactions");
      }
    } catch (error) {
      console.error("Fetch transactions error:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder]);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  const viewTransactionDetails = async (txn: Transaction) => {
    setDetailsLoading(true);
    setDetailsOpen(true);

    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/transactions/${txn._id}`, {
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
        data: TransactionDetails;
        message?: string;
      };

      if (data.success) {
        setSelectedTransaction(data.data);
      } else {
        toast.error(data.message || "Failed to load transaction details");
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error("Fetch transaction details error:", error);
      toast.error("Failed to load transaction details");
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openRefundDialog = (txn: Transaction) => {
    setRefundTransaction(txn);
    setRefundAmount(txn.amount.toString());
    setRefundReason("");
    setRefundDialogOpen(true);
  };

  const handleRefund = async () => {
    if (!refundTransaction) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (amount > refundTransaction.amount) {
      toast.error("Refund amount cannot exceed transaction amount");
      return;
    }

    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    setRefundLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/transactions/${refundTransaction._id}/refund`, {
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
        window.location.href = "/admin/login?expired=true";
        return;
      }

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: {
          refundSummary: {
            refundedAmount: number;
            totalRefunded: number;
            availableForRefund: number;
          };
        };
      };

      if (data.success) {
        toast.success(data.message || "Refund processed successfully");
        setRefundDialogOpen(false);
        setRefundTransaction(null);
        fetchTransactions();
      } else {
        toast.error(data.message || "Failed to process refund");
      }
    } catch (error) {
      console.error("Refund error:", error);
      toast.error("Failed to process refund");
    } finally {
      setRefundLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== "all" || startDate || endDate || minAmount || maxAmount;

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

  const filteredTransactions = React.useMemo(() => {
    if (!searchQuery) return transactions;
    return transactions.filter((txn) => {
      const q = searchQuery.toLowerCase();
      return (
        txn.paymentId?.orderId?.orderNumber?.toLowerCase().includes(q) ||
        txn.customer?.firstName?.toLowerCase().includes(q) ||
        txn.customer?.lastName?.toLowerCase().includes(q) ||
        txn.userId?.profile?.firstName?.toLowerCase().includes(q) ||
        txn.userId?.profile?.lastName?.toLowerCase().includes(q) ||
        txn.userId?.username?.toLowerCase().includes(q) ||
        txn.userId?.email?.toLowerCase().includes(q) ||
        txn._id.toLowerCase().includes(q) ||
        txn.gatewayTransactionId?.toLowerCase().includes(q)
      );
    });
  }, [transactions, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "-" : (pagination?.totalTransactions || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Volume</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {loading ? "-" : formatCurrency(summary?.totalAmount || 0, "EGP")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "-" : (summary?.successCount || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {loading ? "-" : (summary?.failedCount || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Amount</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "-" : formatCurrency(summary?.avgAmount || 0, "EGP")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalTransactions} transactions found` : `${transactions.length} transactions`}
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
                  placeholder="Search by transaction ID, order, gateway ID..."
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
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((txn) => (
                    <TableRow key={txn._id}>
                      <TableCell className="font-mono text-xs">
                        {txn.gatewayTransactionId || txn._id.slice(-8)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {txn.paymentId?.orderId?.orderNumber || "-"}
                      </TableCell>
                      <TableCell>
                        {txn.customer?.firstName || txn.userId?.profile?.firstName || txn.userId?.username || txn.userId?.email || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {txn.type === "sale" || txn.type === "capture" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                          <Badge variant={typeColors[txn.type]} className="capitalize">
                            {txn.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          txn.type === "refund" ? "text-red-600" : "text-green-600"
                        )}>
                          {txn.type === "refund" ? "-" : "+"}{formatCurrency(txn.amount, "EGP")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[txn.status]} className="capitalize">
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(txn.processedAt || txn.createdAt)}
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
                            <DropdownMenuItem onClick={() => viewTransactionDetails(txn)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {txn.paymentId?.orderId && (
                              <DropdownMenuItem asChild>
                                <a href={`/admin/orders/${txn.paymentId.orderId._id}`}>
                                  View Order
                                </a>
                              </DropdownMenuItem>
                            )}
                            {txn.type === "sale" && txn.status === "success" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openRefundDialog(txn)}
                                  className="text-red-600"
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
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

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.transaction?.gatewayTransactionId || "Loading..."}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedTransaction?.transaction && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{selectedTransaction.transaction.gatewayTransactionId}</span>
                </div>
                {selectedTransaction.order && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-medium">{selectedTransaction.order.orderNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {selectedTransaction.transaction.userId?.username || selectedTransaction.transaction.userId?.email || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processed At</span>
                  <span className="font-medium">
                    {formatDate(selectedTransaction.transaction.processedAt || selectedTransaction.transaction.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">
                    {selectedTransaction.transaction.paymentId?.paymentMethod || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant={typeColors[selectedTransaction.transaction.type]} className="capitalize">
                    {selectedTransaction.transaction.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusColors[selectedTransaction.transaction.status]} className="capitalize">
                    {selectedTransaction.transaction.status}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className={cn(
                    "font-medium",
                    selectedTransaction.transaction.type === "refund" ? "text-red-600" : "text-green-600"
                  )}>
                    {selectedTransaction.transaction.type === "refund" ? "-" : ""}
                    {formatCurrency(selectedTransaction.transaction.amount, selectedTransaction.transaction.currency)}
                  </span>
                </div>
              </div>

              {selectedTransaction.transaction.gatewayResponse && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-medium text-sm">Gateway Response</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gateway</span>
                    <span className="capitalize">{selectedTransaction.transaction.gatewayResponse.gateway}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span>{selectedTransaction.transaction.gatewayResponse.status}</span>
                  </div>
                  {selectedTransaction.transaction.gatewayResponse.authorizationCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Auth Code</span>
                      <span className="font-mono">{selectedTransaction.transaction.gatewayResponse.authorizationCode}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund transaction {refundTransaction?.gatewayTransactionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Amount</span>
                <span className="font-medium">
                  {refundTransaction ? formatCurrency(refundTransaction.amount, refundTransaction.currency) : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount *</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                placeholder="Enter refund amount"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum refund: {refundTransaction ? formatCurrency(refundTransaction.amount, refundTransaction.currency) : "-"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason for Refund *</Label>
              <Textarea
                id="refundReason"
                placeholder="Describe the reason for this refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
              />
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
              onClick={handleRefund}
              disabled={refundLoading}
              variant="destructive"
            >
              {refundLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
