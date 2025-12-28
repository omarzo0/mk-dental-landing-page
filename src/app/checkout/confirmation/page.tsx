"use client";

import {
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  Package,
  Printer,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Separator } from "~/ui/primitives/separator";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-000000";

  // Mock order data - in production this would come from the backend
  const orderDetails = {
    id: orderId,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    email: "john@example.com",
    items: [
      { name: "Premium Dental Mirror Set", quantity: 2, price: 29.99 },
      { name: "Disposable Prophy Angles (500pc)", quantity: 1, price: 89.99 },
    ],
    subtotal: 149.97,
    shipping: 0,
    tax: 12.0,
    discount: 15.0,
    total: 146.97,
    shippingAddress: {
      name: "Dr. John Smith",
      street: "123 Main Street, Suite 100",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
    shippingMethod: "Standard Shipping (5-7 business days)",
    estimatedDelivery: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been received.
        </p>
      </div>

      {/* Order Number */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold">{orderDetails.id}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Confirmation */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4 mb-6">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm">
            A confirmation email has been sent to{" "}
            <span className="font-medium">{orderDetails.email}</span>
          </p>
        </div>
      </div>

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Placed on {orderDetails.date}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Items */}
          <div className="space-y-4">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {(item.price * item.quantity).toFixed(2)} EGP
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{orderDetails.subtotal.toFixed(2)} EGP</span>
            </div>
            {orderDetails.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{orderDetails.discount.toFixed(2)} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {orderDetails.shipping === 0
                  ? "Free"
                  : `${orderDetails.shipping.toFixed(2)} EGP`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{orderDetails.tax.toFixed(2)} EGP</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{orderDetails.total.toFixed(2)} EGP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Delivery */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{orderDetails.shippingAddress.name}</p>
            <p className="text-muted-foreground">
              {orderDetails.shippingAddress.street}
            </p>
            <p className="text-muted-foreground">
              {orderDetails.shippingAddress.city},{" "}
              {orderDetails.shippingAddress.state}{" "}
              {orderDetails.shippingAddress.zip}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{orderDetails.shippingMethod}</p>
            <p className="text-muted-foreground">
              Estimated delivery: {orderDetails.estimatedDelivery}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What's Next */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-muted-foreground">
                  We're preparing your order for shipment
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Shipping Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email with tracking information
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Your package will arrive by {orderDetails.estimatedDelivery}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/account/orders">
            <Package className="mr-2 h-4 w-4" />
            Track Order
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>

      {/* Support */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Questions about your order?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted" />
            <div className="h-8 w-48 mx-auto bg-muted rounded" />
            <div className="h-4 w-64 mx-auto bg-muted rounded" />
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
