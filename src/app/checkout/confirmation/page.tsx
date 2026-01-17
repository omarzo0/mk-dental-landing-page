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
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Separator } from "~/ui/primitives/separator";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderConfirmationData {
  orderNumber: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode: string | null;
  total: number;
  shippingAddress: ShippingAddress;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-000000";

  const [orderData, setOrderData] = useState<OrderConfirmationData | null>(null);

  useEffect(() => {
    // Try to get order data from sessionStorage
    const storedData = sessionStorage.getItem("orderConfirmation");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as OrderConfirmationData;
        setOrderData(parsed);
        // Clear after reading to avoid showing stale data
        sessionStorage.removeItem("orderConfirmation");
      } catch (e) {
        console.error("Failed to parse order data:", e);
      }
    }
  }, []);

  const orderNumber = orderData?.orderNumber || orderId;
  const email = orderData?.email || "customer@example.com";
  const items = orderData?.items || [];
  const subtotal = orderData?.subtotal || 0;
  const shipping = orderData?.shipping || 0;
  const discount = orderData?.discount || 0;
  const couponCode = orderData?.couponCode;
  const total = orderData?.total || 0;
  const shippingAddress = orderData?.shippingAddress;

  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const estimatedDelivery = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
              <p className="text-xl font-bold">{orderNumber}</p>
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
            <span className="font-medium">{email}</span>
          </p>
        </div>
      </div>

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Placed on {orderDate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Items */}
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  {item.image && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                      <Image
                        src={item.image || "/api/placeholder/100/100"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {item.price.toFixed(2)} EGP
                    </p>
                  </div>
                  <p className="font-medium">
                    {(item.price * item.quantity).toFixed(2)} EGP
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No items to display</p>
          )}

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount {couponCode && `(${couponCode})`}</span>
                <span>-{discount.toFixed(2)} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shipping === 0 ? "Free" : `${shipping.toFixed(2)} EGP`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} EGP</span>
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
            {shippingAddress ? (
              <>
                <p className="font-medium">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p className="text-muted-foreground">{shippingAddress.street}</p>
                <p className="text-muted-foreground">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p className="text-muted-foreground">{shippingAddress.country}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Address not available</p>
            )}
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
            <p className="font-medium">Standard Shipping (5-7 business days)</p>
            <p className="text-muted-foreground">
              Estimated delivery: {estimatedDelivery}
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
                  Your package will arrive by {estimatedDelivery}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Track Order button hidden as per user request
        <Button asChild>
          <Link href={`/api/user/orders/track/${orderNumber}?email=${email}`}>
            <Package className="mr-2 h-4 w-4" />
            Track Order
          </Link>
        </Button>
        */}
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
