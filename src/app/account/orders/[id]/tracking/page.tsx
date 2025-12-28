"use client";

import { Check, MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Badge } from "~/ui/primitives/badge";
import { Separator } from "~/ui/primitives/separator";

// Mock order data
const orderData = {
  id: "ORD-002",
  date: "2024-12-20",
  items: [{ name: "Dental Chair Premium", quantity: 1, price: 499.99 }],
  total: 499.99,
  status: "shipped",
  trackingNumber: "TRK987654321",
  carrier: "FedEx",
  shippingAddress: {
    name: "Dr. John Smith",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA",
  },
  paymentMethod: "Credit Card ending in 4242",
  estimatedDelivery: "Dec 28, 2024",
  trackingHistory: [
    {
      date: "Dec 20, 2024",
      time: "10:30 AM",
      status: "Order Placed",
      location: "Online",
      completed: true,
    },
    {
      date: "Dec 21, 2024",
      time: "2:15 PM",
      status: "Order Confirmed",
      location: "MK Dental Warehouse",
      completed: true,
    },
    {
      date: "Dec 22, 2024",
      time: "9:00 AM",
      status: "Shipped",
      location: "Memphis, TN",
      completed: true,
    },
    {
      date: "Dec 24, 2024",
      time: "6:45 AM",
      status: "In Transit",
      location: "Newark, NJ",
      completed: true,
    },
    {
      date: "Dec 26, 2024",
      time: "11:00 AM",
      status: "Out for Delivery",
      location: "New York, NY",
      completed: false,
      current: true,
    },
    {
      date: "Dec 28, 2024",
      time: "",
      status: "Delivered",
      location: "",
      completed: false,
    },
  ],
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id;

  // In a real app, fetch order data based on orderId
  const order = orderData;

  const currentStepIndex = order.trackingHistory.findIndex(
    (step) => step.current
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/account/orders"
          className="text-muted-foreground hover:text-foreground"
        >
          Orders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{orderId}</span>
        <span className="text-muted-foreground">/</span>
        <span>Tracking</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Track Order {orderId}</h1>
          <p className="text-muted-foreground">
            Tracking Number: {order.trackingNumber}
          </p>
        </div>
        <Badge variant="default" className="w-fit">
          <Truck className="mr-1 h-3 w-3" />
          {order.carrier}
        </Badge>
      </div>

      {/* Delivery Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery Progress
          </CardTitle>
          <CardDescription>
            Estimated delivery: {order.estimatedDelivery}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${((currentStepIndex + 1) / order.trackingHistory.length) * 100}%`,
                }}
              />
            </div>
            <div className="absolute inset-0 flex justify-between">
              {order.trackingHistory.map((_, index) => (
                <div
                  key={index}
                  className={`h-4 w-4 -mt-1 rounded-full border-2 ${
                    index <= currentStepIndex
                      ? "bg-primary border-primary"
                      : "bg-background border-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {order.trackingHistory.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      event.completed
                        ? "bg-primary text-primary-foreground"
                        : event.current
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {event.completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  {index < order.trackingHistory.length - 1 && (
                    <div
                      className={`absolute top-8 h-12 w-0.5 ${
                        event.completed ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p
                      className={`font-medium ${
                        event.current ? "text-primary" : ""
                      }`}
                    >
                      {event.status}
                      {event.current && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.date} {event.time && `at ${event.time}`}
                    </p>
                  </div>
                  {event.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.street}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.country}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{item.price.toFixed(2)} EGP</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{order.total.toFixed(2)} EGP</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" asChild>
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
        <Button variant="outline">
          Contact Carrier
        </Button>
        <Button variant="outline">
          Report an Issue
        </Button>
      </div>
    </div>
  );
}
