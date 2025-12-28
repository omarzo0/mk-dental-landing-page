"use client";

import { ChevronDown, Eye, Filter, Package, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import { Input } from "~/ui/primitives/input";
import { Badge } from "~/ui/primitives/badge";
import { Separator } from "~/ui/primitives/separator";

// Mock orders data
const ordersData = [
  {
    id: "ORD-001",
    date: "2024-12-27",
    items: [
      { name: "Premium Dental Mirror Set", quantity: 2, price: 29.99 },
      { name: "Disposable Prophy Angles", quantity: 1, price: 139.99 },
    ],
    total: 199.97,
    status: "delivered",
    trackingNumber: "TRK123456789",
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    estimatedDelivery: "Dec 30, 2024",
    deliveredDate: "Dec 29, 2024",
  },
  {
    id: "ORD-002",
    date: "2024-12-20",
    items: [{ name: "Dental Chair Premium", quantity: 1, price: 499.99 }],
    total: 499.99,
    status: "shipped",
    trackingNumber: "TRK987654321",
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    estimatedDelivery: "Dec 28, 2024",
  },
  {
    id: "ORD-003",
    date: "2024-12-15",
    items: [
      { name: "Sterilization Pouches (200pc)", quantity: 3, price: 24.99 },
      { name: "Dental Burs Assortment", quantity: 1, price: 89.99 },
    ],
    total: 164.96,
    status: "processing",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
    paymentMethod: "PayPal",
    estimatedDelivery: "Dec 25, 2024",
  },
  {
    id: "ORD-004",
    date: "2024-11-10",
    items: [{ name: "Dental X-Ray Sensor", quantity: 1, price: 1299.99 }],
    total: 1299.99,
    status: "delivered",
    trackingNumber: "TRK456789123",
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    deliveredDate: "Nov 15, 2024",
  },
  {
    id: "ORD-005",
    date: "2024-10-05",
    items: [
      { name: "Dental Composite Kit", quantity: 2, price: 159.99 },
      { name: "LED Curing Light", quantity: 1, price: 249.99 },
    ],
    total: 569.97,
    status: "cancelled",
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    cancelledReason: "Customer requested cancellation",
  },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  processing: { label: "Processing", variant: "secondary" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

type OrderStatus = keyof typeof statusConfig;

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-muted-foreground">
          View and track all your orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID or product name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter === "all"
                ? "All Orders"
                : statusConfig[statusFilter as OrderStatus]?.label}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Orders
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("shipped")}>
              Shipped
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>
              Delivered
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <Badge variant={statusConfig[order.status as OrderStatus]?.variant}>
                        {statusConfig[order.status as OrderStatus]?.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      Ordered on {formatDate(order.date)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.trackingNumber && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/account/orders/${order.id}/tracking`}>
                          <Truck className="mr-2 h-4 w-4" />
                          Track Order
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id
                        )
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {expandedOrder === order.id ? "Hide" : "View"} Details
                      <ChevronDown
                        className={`ml-2 h-4 w-4 transition-transform ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Order Items Summary */}
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Shipping Address
                        </h4>
                        <p className="text-sm">{order.shippingAddress}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Payment Method
                        </h4>
                        <p className="text-sm">{order.paymentMethod}</p>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Tracking Number
                          </h4>
                          <p className="text-sm font-mono">{order.trackingNumber}</p>
                        </div>
                      )}
                      {order.estimatedDelivery && order.status !== "delivered" && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Estimated Delivery
                          </h4>
                          <p className="text-sm">{order.estimatedDelivery}</p>
                        </div>
                      )}
                      {order.deliveredDate && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Delivered On
                          </h4>
                          <p className="text-sm text-green-600">{order.deliveredDate}</p>
                        </div>
                      )}
                      {order.cancelledReason && (
                        <div className="sm:col-span-2">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Cancellation Reason
                          </h4>
                          <p className="text-sm text-destructive">{order.cancelledReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {order.status === "delivered" && (
                        <Button variant="outline" size="sm">
                          Write a Review
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Download Invoice
                      </Button>
                      {(order.status === "processing" || order.status === "shipped") && (
                        <Button variant="outline" size="sm">
                          Contact Support
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't placed any orders yet"}
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
