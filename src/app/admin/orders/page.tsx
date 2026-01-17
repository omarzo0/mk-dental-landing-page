"use client";

import {
  ChevronDown,
  Download,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Printer,
  RotateCcw,
  Search,
  StickyNote,
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

// --- New Interfaces from API ---
interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  productType?: "single" | "package";
  packageInfo?: {
    totalItemsCount: number;
    originalTotalPrice: number;
    savings: number;
    savingsPercentage: number;
    items: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      image: string;
      _id: string;
    }>;
  };
}

interface Order {
  _id?: string;
  id?: string;
  orderNumber: string;
  isGuestOrder: boolean;
  userId?: {
    _id: string;
    username: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  customer: Customer;
  customerNote?: string;
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  };
  shippingAddress: Address;
  billingAddress: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingMethod: string;
  paymentMethod: string;
  coupon?: {
    discount: number;
  };
  notes?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "returned" | "cancelled";
type PaymentStatus = "pending" | "paid" | "refunded";

const statusColors: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  shipped: "default",
  delivered: "default",
  returned: "secondary",
  cancelled: "destructive",
};

const paymentStatusColors: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  refunded: "secondary",
};

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = React.useState(false);
  const [orderNotes, setOrderNotes] = React.useState("");

  // Tracking Info State
  const [trackingDialogOpen, setTrackingDialogOpen] = React.useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = React.useState<{ orderId: string, status: OrderStatus } | null>(null);
  const [trackingNumber, setTrackingNumber] = React.useState("");
  const [shippingNotes, setShippingNotes] = React.useState("");

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc"
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        window.location.href = "/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle token expiration
      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = await response.json() as {
        success: boolean;
        data: {
          orders: Order[];
          pagination: Pagination;
          stats: Stats;
        };
        message?: string;
      };

      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    extraData?: { trackingNumber?: string; notes?: string }
  ) => {
    if (!orderId || orderId === "undefined") {
      toast.error("Critical Error: Invalid Order ID in updateOrderStatus");
      console.error("Critical Error: Invalid Order ID", orderId);
      return;
    }
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const body: {
        status: OrderStatus;
        trackingNumber?: string;
        notes?: string;
      } = {
        status: newStatus,
      };

      // Only include trackingNumber if provided (for shipped status)
      if (extraData?.trackingNumber) {
        body.trackingNumber = extraData.trackingNumber;
      }

      // Only include notes if provided
      if (extraData?.notes) {
        body.notes = extraData.notes;
      }

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      // Handle token expiration
      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = await response.json() as { success: boolean; message?: string; data?: Order };

      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh data
        setTrackingDialogOpen(false);
        setPendingStatusUpdate(null);
        setTrackingNumber("");
        setShippingNotes("");
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // Ensure we have a valid ID
    if (!orderId) {
      toast.error("Invalid order ID");
      return;
    }

    if (newStatus === "shipped") {
      setPendingStatusUpdate({ orderId, status: newStatus });
      setTrackingNumber("");
      setShippingNotes("");
      setTrackingDialogOpen(true);
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const confirmShipment = () => {
    if (pendingStatusUpdate) {
      if (!trackingNumber.trim()) {
        toast.error("Please enter a tracking number");
        return;
      }
      updateOrderStatus(pendingStatusUpdate.orderId, pendingStatusUpdate.status, {
        trackingNumber: trackingNumber,
        notes: shippingNotes
      });
    }
  };

  const viewOrderDetails = (order: Order) => {
    console.log("Viewing order details:", order);
    console.log("Order totals:", order.totals);
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handlePrintInvoice = (order: Order) => {
    // Create invoice content
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 30px; }
          .section h3 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; }
          .total { font-size: 18px; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          .package-item { font-size: 12px; color: #666; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MK Dental Supplies</h1>
          <p>Professional Dental Equipment & Supplies</p>
          <p>Invoice #${order.orderNumber}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <strong>Bill To:</strong><br>
            ${order.customer.firstName} ${order.customer.lastName}<br>
            ${order.customer.email}<br>
            ${order.customer.phone || ""}
          </div>
          <div class="info-box">
            <strong>Ship To:</strong><br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}
          </div>
        </div>
        
        <div class="section">
          <h3>Order Details</h3>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
        </div>
        
        <div class="section">
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    ${item.name}
                    ${item.productType === "package" && item.packageInfo ? `
                      <div class="package-items">
                        ${item.packageInfo.items.map(pkgItem => `
                          <div class="package-item">• ${pkgItem.name} (x${pkgItem.quantity})</div>
                        `).join("")}
                      </div>
                    ` : ""}
                  </td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)} EGP</td>
                  <td>${(item.quantity * item.price).toFixed(2)} EGP</td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                <td>${order.totals.subtotal.toFixed(2)} EGP</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Shipping:</strong></td>
                <td>${order.totals.shipping.toFixed(2)} EGP</td>
              </tr>
              ${order.totals.discount > 0 ? `
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Discount:</strong></td>
                <td>-${order.totals.discount.toFixed(2)} EGP</td>
              </tr>
              ` : ""}
              <tr class="total">
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong>${(order.totals.subtotal + order.totals.shipping - order.totals.discount).toFixed(2)} EGP</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>MK Dental Supplies | support@mkdental.com</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success("Invoice opened for printing");
  };

  const handlePrintShippingLabel = (order: Order) => {
    const labelContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .label { border: 3px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
          .from, .to { margin-bottom: 20px; }
          .from { font-size: 12px; }
          .to { font-size: 16px; font-weight: bold; }
          .barcode { text-align: center; margin-top: 20px; font-family: monospace; font-size: 14px; }
          .order-id { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="order-id">${order.orderNumber}</div>
          <div class="from">
            <strong>FROM:</strong><br>
            MK Dental Supplies<br>
            Cairo, Egypt
          </div>
          <div class="to">
            <strong>TO:</strong><br>
            ${order.customer.firstName} ${order.customer.lastName}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(labelContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success("Shipping label opened for printing");
  };

  const handleRefund = (order: Order) => {
    setSelectedOrder(order);
    setRefundDialogOpen(true);
  };

  const processRefund = async () => {
    if (selectedOrder) {
      try {
        const orderId = selectedOrder._id || selectedOrder.id;
        if (!orderId) throw new Error("Invalid order ID");

        const token = localStorage.getItem("mk-dental-token");
        const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json() as { success: boolean; message?: string };
        if (data.success) {
          toast.success("Refund processed successfully");
          setRefundDialogOpen(false);
          fetchOrders();
        } else {
          toast.error(data.message || "Failed to process refund");
        }
      } catch (error) {
        toast.error("Error processing refund");
      }
    }
  };

  const handleAddNotes = (order: Order) => {
    setSelectedOrder(order);
    setOrderNotes(order.notes?.join("\n") || "");
    setNotesDialogOpen(true);
  };

  const saveNotes = async () => {
    if (selectedOrder) {
      try {
        const orderId = selectedOrder._id || selectedOrder.id;
        if (!orderId) throw new Error("Invalid order ID");

        const token = localStorage.getItem("mk-dental-token");
        const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notes: orderNotes.split("\n").filter(n => n.trim()) }),
        });
        const data = await response.json() as { success: boolean; message?: string };
        if (data.success) {
          toast.success("Order notes updated");
          setNotesDialogOpen(false);
          fetchOrders();
        } else {
          toast.error(data.message || "Failed to update notes");
        }
      } catch (error) {
        toast.error("Error updating notes");
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!orderId || orderId === "undefined") {
      toast.error("Invalid order ID for deletion");
      return;
    }

    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle token expiration
      if (response.status === 401) {
        localStorage.removeItem("mk-dental-token");
        localStorage.removeItem("mk-dental-auth");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login?expired=true";
        return;
      }

      const data = await response.json() as { success: boolean; message?: string };
      if (data.success) {
        toast.success("Order deleted successfully");
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownStatusChange = (order: Order, status: OrderStatus) => {
    // DEBUG: Check what we are receiving
    console.log("handleDropdownStatusChange Order:", order);
    const orderId = order._id || order.id;

    if (!orderId) {
      toast.error(`Order ID check failed. _id: ${order._id}, id: ${order.id}`);
      return;
    }

    if (orderId) {
      handleStatusChange(orderId, status);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RotateCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalOrders || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalRevenue.toFixed(2) || 0} EGP</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Order Value</CardDescription>
            <CardTitle className="text-2xl">{stats?.averageOrderValue.toFixed(2) || 0} EGP</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Orders</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {orders.filter(o => ["pending", "processing", "shipped"].includes(o.status)).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            {pagination?.totalOrders || 0} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      {(order.totals.subtotal + order.totals.shipping - order.totals.discount).toFixed(2)} EGP
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusColors[order.paymentStatus]} className="capitalize">
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status]} className="capitalize">
                        {order.status}
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
                          <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintInvoice(order)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Print Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintShippingLabel(order)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Shipping Label
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleDropdownStatusChange(order, "confirmed")}>
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDropdownStatusChange(order, "shipped")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDropdownStatusChange(order, "delivered")}>
                            Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDropdownStatusChange(order, "returned")}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Mark as Returned
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.paymentStatus === "paid" && (
                            <DropdownMenuItem
                              onClick={() => handleRefund(order)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              const orderId = order._id || order.id;
                              if (orderId) deleteOrder(orderId);
                            }}
                          >
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrev || loading}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNext || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
                <DialogDescription>
                  Placed on {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ""}
                </DialogDescription>
              </div>
              {selectedOrder?.isGuestOrder && (
                <Badge variant="secondary">Guest Order</Badge>
              )}
            </div>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="rounded-lg border p-4 space-y-1">
                    <p className="font-medium">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer.phone || "No phone provided"}</p>
                    {selectedOrder.customer.gender && (
                      <p className="text-xs text-muted-foreground capitalize">Gender: {selectedOrder.customer.gender}</p>
                    )}
                    {selectedOrder.customer.dateOfBirth && (
                      <p className="text-xs text-muted-foreground">DOB: {new Date(selectedOrder.customer.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h4 className="font-semibold mb-2">Shipping Details</h4>
                  <div className="rounded-lg border p-4 space-y-1">
                    <p className="text-sm font-medium">Method: <span className="capitalize">{selectedOrder.shippingMethod}</span></p>
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="rounded-lg border divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item._id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="flex gap-2 items-center mt-1">
                            {item.productType === "package" && (
                              <Badge variant="outline" className="text-[10px] h-4">Package</Badge>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {item.price.toFixed(2)} EGP
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          {item.subtotal.toFixed(2)} EGP
                        </p>
                      </div>

                      {item.productType === "package" && item.packageInfo && (
                        <div className="bg-muted/50 rounded-md p-3 mt-2 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package Contents</p>
                          <div className="grid gap-2">
                            {item.packageInfo.items.map((pkgItem) => (
                              <div key={pkgItem._id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">• {pkgItem.name}</span>
                                <span className="font-medium text-xs">x{pkgItem.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-muted-foreground/10 flex justify-between text-xs">
                            <span className="text-green-600 font-medium">You saved: {item.packageInfo.savings.toFixed(2)} EGP</span>
                            <span className="text-muted-foreground">({item.packageInfo.savingsPercentage}% off)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="p-4 space-y-2 bg-muted/20">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{selectedOrder.totals.subtotal.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>{selectedOrder.totals.shipping.toFixed(2)} EGP</span>
                    </div>

                    {selectedOrder.totals.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{selectedOrder.totals.discount.toFixed(2)} EGP</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{(selectedOrder.totals.subtotal + selectedOrder.totals.shipping - selectedOrder.totals.discount).toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Payment */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Order Status</h4>
                  <Badge variant={statusColors[selectedOrder.status]} className="capitalize">
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Payment</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={paymentStatusColors[selectedOrder.paymentStatus]} className="capitalize">
                      {selectedOrder.paymentStatus}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      via <span className="uppercase">{selectedOrder.paymentMethod}</span>
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.customerNote && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Customer Note
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {selectedOrder.customerNote}
                  </p>
                </div>
              )}

              {selectedOrder.notes && selectedOrder.notes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Internal Notes</h4>
                  <div className="space-y-2">
                    {selectedOrder.notes.map((note, i) => (
                      <p key={i} className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintShippingLabel(selectedOrder)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Label
                </Button>
              </div>
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
              Are you sure you want to process a refund for order {selectedOrder?.orderNumber}?
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Refund Amount</p>
                <p className="text-2xl font-bold">{selectedOrder.totals.total.toFixed(2)} EGP</p>
              </div>
              <p className="text-sm text-muted-foreground">
                This will refund the full order amount to the customer's original payment method.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={processRefund}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Notes</DialogTitle>
            <DialogDescription>
              Add internal notes for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (One per line)</Label>
              <textarea
                id="notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add notes about this order..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Tracking Info Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Shipment</DialogTitle>
            <DialogDescription>
              Enter tracking information for this order. This will be sent to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="TRK123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ship-notes">Shipping Notes (Optional)</Label>
              <textarea
                id="ship-notes"
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                placeholder="Shipped via FedEx..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmShipment}>
              Confirm Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
