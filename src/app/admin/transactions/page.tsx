"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Eye,
  MoreHorizontal,
  Search,
} from "lucide-react";
import * as React from "react";

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

// Mock transactions data
const mockTransactions = [
  {
    id: "TXN-001",
    orderId: "ORD-001",
    customer: "Dr. Sarah Johnson",
    type: "payment",
    method: "Credit Card",
    amount: 199.97,
    fee: 5.80,
    net: 194.17,
    status: "completed",
    date: "2024-12-27 14:32:00",
  },
  {
    id: "TXN-002",
    orderId: "ORD-002",
    customer: "Metro Dental Clinic",
    type: "payment",
    method: "Bank Transfer",
    amount: 999.97,
    fee: 15.00,
    net: 984.97,
    status: "completed",
    date: "2024-12-27 10:15:00",
  },
  {
    id: "TXN-003",
    orderId: "ORD-003",
    customer: "Dr. Michael Chen",
    type: "payment",
    method: "Credit Card",
    amount: 389.97,
    fee: 11.32,
    net: 378.65,
    status: "pending",
    date: "2024-12-26 16:45:00",
  },
  {
    id: "TXN-004",
    orderId: "ORD-004",
    customer: "Smile Dental Group",
    type: "payment",
    method: "PayPal",
    amount: 1599.97,
    fee: 46.40,
    net: 1553.57,
    status: "completed",
    date: "2024-12-26 09:20:00",
  },
  {
    id: "TXN-005",
    orderId: "ORD-005",
    customer: "Dr. Emily Roberts",
    type: "refund",
    method: "Credit Card",
    amount: -149.99,
    fee: 0,
    net: -149.99,
    status: "completed",
    date: "2024-12-25 11:30:00",
  },
  {
    id: "TXN-006",
    orderId: "ORD-006",
    customer: "City Dental Practice",
    type: "payment",
    method: "Credit Card",
    amount: 999.99,
    fee: 29.00,
    net: 970.99,
    status: "completed",
    date: "2024-12-24 15:00:00",
  },
  {
    id: "TXN-007",
    orderId: "ORD-007",
    customer: "Dr. David Park",
    type: "payment",
    method: "Bank Transfer",
    amount: 450.00,
    fee: 5.00,
    net: 445.00,
    status: "failed",
    date: "2024-12-24 08:45:00",
  },
  {
    id: "TXN-008",
    orderId: "ORD-008",
    customer: "Sunshine Dental",
    type: "payment",
    method: "Credit Card",
    amount: 299.99,
    fee: 8.70,
    net: 291.29,
    status: "processing",
    date: "2024-12-23 12:10:00",
  },
];

type TransactionStatus = "completed" | "pending" | "processing" | "failed";
type TransactionType = "payment" | "refund";

const statusColors: Record<TransactionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "outline",
  processing: "secondary",
  failed: "destructive",
};

export default function AdminTransactionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = React.useState<typeof mockTransactions[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const filteredTransactions = React.useMemo(() => {
    return mockTransactions.filter((txn) => {
      const matchesSearch =
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.customer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
      const matchesType = typeFilter === "all" || txn.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  const viewTransactionDetails = (txn: typeof mockTransactions[0]) => {
    setSelectedTransaction(txn);
    setDetailsOpen(true);
  };

  const transactionStats = React.useMemo(() => {
    const payments = mockTransactions.filter(t => t.type === "payment" && t.status === "completed");
    const refunds = mockTransactions.filter(t => t.type === "refund" && t.status === "completed");
    
    return {
      totalTransactions: mockTransactions.length,
      totalRevenue: payments.reduce((sum, t) => sum + t.amount, 0),
      totalRefunds: Math.abs(refunds.reduce((sum, t) => sum + t.amount, 0)),
      totalFees: payments.reduce((sum, t) => sum + t.fee, 0),
      netRevenue: payments.reduce((sum, t) => sum + t.net, 0) + refunds.reduce((sum, t) => sum + t.net, 0),
    };
  }, []);

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
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Transactions
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-2xl">{transactionStats.totalTransactions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gross Revenue</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              ${transactionStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Refunds</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              -${transactionStats.totalRefunds.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing Fees</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              -${transactionStats.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Revenue</CardDescription>
            <CardTitle className="text-2xl">
              ${transactionStats.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.id}</TableCell>
                    <TableCell className="text-muted-foreground">{txn.orderId}</TableCell>
                    <TableCell>{txn.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {txn.type === "payment" ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                        <span className="capitalize">{txn.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{txn.method}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        txn.type === "refund" ? "text-red-600" : "text-green-600"
                      )}>
                        {txn.type === "refund" ? "-" : "+"}${Math.abs(txn.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[txn.status as TransactionStatus]} className="capitalize">
                        {txn.status}
                      </Badge>
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
                          <DropdownMenuItem>
                            View Order
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Download Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium">{selectedTransaction.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{selectedTransaction.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{selectedTransaction.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant={selectedTransaction.type === "payment" ? "default" : "destructive"} className="capitalize">
                    {selectedTransaction.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusColors[selectedTransaction.status as TransactionStatus]} className="capitalize">
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span>${Math.abs(selectedTransaction.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span>-${selectedTransaction.fee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Net Amount</span>
                  <span className={cn(
                    selectedTransaction.type === "refund" ? "text-red-600" : "text-green-600"
                  )}>
                    {selectedTransaction.type === "refund" ? "-" : ""}${Math.abs(selectedTransaction.net).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
