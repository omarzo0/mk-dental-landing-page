"use client";

import { Package, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useAuth } from "~/lib/hooks/use-auth";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";

// Mock order data
const recentOrders = [
  {
    id: "ORD-001",
    date: "Dec 27, 2024",
    total: "199.97 EGP",
    status: "Delivered",
    items: 3,
  },
  {
    id: "ORD-002",
    date: "Dec 20, 2024",
    total: "499.99 EGP",
    status: "Shipped",
    items: 1,
  },
];

export default function AccountPage() {
  const { user } = useAuth();


  const stats = [
    {
      label: "Total Orders",
      value: "12",
      icon: Package,
      href: "/account/orders",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">
          Manage your orders.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.id}</span>
                      <span className="text-xs text-muted-foreground">
                        • {order.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items} item(s) • {order.total}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium ${order.status === "Delivered"
                        ? "text-green-600"
                        : order.status === "Shipped"
                          ? "text-blue-600"
                          : "text-yellow-600"
                        }`}
                    >
                      {order.status}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/account/orders/${order.id}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <Button className="mt-4" asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
