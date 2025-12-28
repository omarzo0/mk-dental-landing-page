"use client";

import {
  ChevronDown,
  Download,
  Eye,
  FileText,
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

// Mock orders data
const mockOrders = [
  {
    id: "ORD-001",
    customer: {
      name: "Dr. Sarah Johnson",
      email: "sarah@clinic.com",
      phone: "+1 (555) 123-4567",
    },
    items: [
      { name: "Professional Dental Mirror Set", quantity: 2, price: 69.99 },
      { name: "Dental Explorer Set", quantity: 1, price: 59.99 },
    ],
    total: 199.97,
    subtotal: 189.97,
    shipping: 9.99,
    tax: 0,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    date: "2024-12-27",
    shippingAddress: "123 Medical Center Dr, New York, NY 10001",
    notes: "",
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "ORD-002",
    customer: {
      name: "Metro Dental Clinic",
      email: "orders@metrodental.com",
      phone: "+1 (555) 234-5678",
    },
    items: [
      { name: "Ultrasonic Scaler Unit", quantity: 1, price: 499.99 },
      { name: "Dental Extraction Forceps Kit", quantity: 2, price: 249.99 },
    ],
    total: 999.97,
    subtotal: 979.97,
    shipping: 19.99,
    tax: 0,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    date: "2024-12-27",
    shippingAddress: "456 Healthcare Blvd, Los Angeles, CA 90001",
    notes: "Handle with care - fragile equipment",
    trackingNumber: "",
  },
  {
    id: "ORD-003",
    customer: {
      name: "Dr. Michael Chen",
      email: "mchen@dentalcare.com",
      phone: "+1 (555) 345-6789",
    },
    items: [
      { name: "Composite Filling Instrument Set", quantity: 3, price: 129.99 },
    ],
    total: 389.97,
    subtotal: 369.97,
    shipping: 19.99,
    tax: 0,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Bank Transfer",
    date: "2024-12-26",
    shippingAddress: "789 Dental Way, Chicago, IL 60601",
    notes: "",
    trackingNumber: "",
  },
  {
    id: "ORD-004",
    customer: {
      name: "Smile Dental Group",
      email: "purchase@smiledental.com",
      phone: "+1 (555) 456-7890",
    },
    items: [
      { name: "Starter Dental Kit", quantity: 2, price: 449.99 },
      { name: "Professional Surgical Bundle", quantity: 1, price: 699.99 },
    ],
    total: 1599.97,
    subtotal: 1564.97,
    shipping: 34.99,
    tax: 0,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    date: "2024-12-26",
    shippingAddress: "321 Smile Ave, Houston, TX 77001",
    notes: "Express shipping requested",
    trackingNumber: "1Z999AA10123456785",
  },
  {
    id: "ORD-005",
    customer: {
      name: "Dr. Emily Roberts",
      email: "emily@oralhealth.com",
      phone: "+1 (555) 567-8901",
    },
    items: [
      { name: "Periodontal Curette Set", quantity: 1, price: 149.99 },
    ],
    total: 149.99,
    subtotal: 139.99,
    shipping: 9.99,
    tax: 0,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Credit Card",
    date: "2024-12-25",
    shippingAddress: "654 Health St, Phoenix, AZ 85001",
    notes: "Customer requested cancellation",
    trackingNumber: "",
  },
  {
    id: "ORD-006",
    customer: {
      name: "City Dental Practice",
      email: "admin@citydental.com",
      phone: "+1 (555) 678-9012",
    },
    items: [
      { name: "Hygiene Pro Package", quantity: 1, price: 999.99 },
    ],
    total: 999.99,
    subtotal: 964.99,
    shipping: 34.99,
    tax: 0,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    date: "2024-12-24",
    shippingAddress: "987 Urban Plaza, Seattle, WA 98101",
    notes: "",
    trackingNumber: "1Z999AA10123456786",
  },
];

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
type PaymentStatus = "pending" | "paid" | "refunded";

const statusColors: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  completed: "default",
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
  const [orders, setOrders] = React.useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = React.useState<typeof mockOrders[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = React.useState(false);
  const [orderNotes, setOrderNotes] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const viewOrderDetails = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handlePrintInvoice = (order: typeof mockOrders[0]) => {
    // Create invoice content
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
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
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MK Dental Supplies</h1>
          <p>Professional Dental Equipment & Supplies</p>
          <p>Invoice #${order.id}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <strong>Bill To:</strong><br>
            ${order.customer.name}<br>
            ${order.customer.email}<br>
            ${order.customer.phone}
          </div>
          <div class="info-box">
            <strong>Ship To:</strong><br>
            ${order.shippingAddress}
          </div>
        </div>
        
        <div class="section">
          <h3>Order Details</h3>
          <p><strong>Date:</strong> ${order.date}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
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
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)} EGP</td>
                  <td>${(item.quantity * item.price).toFixed(2)} EGP</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                <td>${order.subtotal.toFixed(2)} EGP</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Shipping:</strong></td>
                <td>${order.shipping.toFixed(2)} EGP</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Tax:</strong></td>
                <td>${order.tax.toFixed(2)} EGP</td>
              </tr>
              <tr class="total">
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong>${order.total.toFixed(2)} EGP</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>MK Dental Supplies | support@mkdental.com | +1 (555) 123-4567</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success("Invoice opened for printing");
  };

  const handlePrintShippingLabel = (order: typeof mockOrders[0]) => {
    const labelContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${order.id}</title>
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
          <div class="order-id">${order.id}</div>
          <div class="from">
            <strong>FROM:</strong><br>
            MK Dental Supplies<br>
            123 Medical Center Drive<br>
            Houston, TX 77001
          </div>
          <div class="to">
            <strong>TO:</strong><br>
            ${order.customer.name}<br>
            ${order.shippingAddress}
          </div>
          ${order.trackingNumber ? `
            <div class="barcode">
              Tracking: ${order.trackingNumber}
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(labelContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success("Shipping label opened for printing");
  };

  const handleRefund = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setRefundDialogOpen(true);
  };

  const processRefund = () => {
    if (selectedOrder) {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, paymentStatus: "refunded" as PaymentStatus, status: "cancelled" as OrderStatus }
          : order
      ));
      toast.success(`Refund processed for order ${selectedOrder.id}`);
      setRefundDialogOpen(false);
    }
  };

  const handleAddNotes = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setOrderNotes(order.notes);
    setNotesDialogOpen(true);
  };

  const saveNotes = () => {
    if (selectedOrder) {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, notes: orderNotes }
          : order
      ));
      toast.success("Order notes updated");
      setNotesDialogOpen(false);
    }
  };

  const orderStats = React.useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      completed: orders.filter(o => o.status === "completed" || o.status === "delivered").length,
    };
  }, [orders]);

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
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-2xl">{orderStats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{orderStats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{orderStats.processing}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shipped</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{orderStats.shipped}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{orderStats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            {filteredOrders.length} orders found
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
                <SelectItem value="processing">Processing</SelectItem>
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="font-medium">
                      {order.total.toFixed(2)} EGP
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusColors[order.paymentStatus as PaymentStatus]} className="capitalize">
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status as OrderStatus]} className="capitalize">
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
                          <DropdownMenuItem onClick={() => handleAddNotes(order)}>
                            <StickyNote className="mr-2 h-4 w-4" />
                            Add Notes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")}>
                            Mark as Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "shipped")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")}>
                            Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "completed")}>
                            Mark as Completed
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
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder?.date}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer.phone}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Shipping Address:</span><br />
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="rounded-lg border divide-y">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {item.price.toFixed(2)} EGP
                        </p>
                      </div>
                      <p className="font-medium">
                        {(item.quantity * item.price).toFixed(2)} EGP
                      </p>
                    </div>
                  ))}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{selectedOrder.subtotal.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{selectedOrder.shipping.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{selectedOrder.tax.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{selectedOrder.total.toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Tracking */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Order Status</h4>
                  <Badge variant={statusColors[selectedOrder.status as OrderStatus]} className="capitalize">
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment</h4>
                  <Badge variant={paymentStatusColors[selectedOrder.paymentStatus as PaymentStatus]} className="capitalize">
                    {selectedOrder.paymentStatus}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    via {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div>
                  <h4 className="font-semibold mb-2">Tracking Number</h4>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {selectedOrder.trackingNumber}
                  </code>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handlePrintInvoice(selectedOrder)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button 
                  variant="outline"
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
              Are you sure you want to process a refund for order {selectedOrder?.id}?
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Refund Amount</p>
                <p className="text-2xl font-bold">{selectedOrder.total.toFixed(2)} EGP</p>
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
              Add internal notes for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
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
    </div>
  );
}
