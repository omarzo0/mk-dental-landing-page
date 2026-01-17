"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { resolveImageUrl } from "~/lib/image-utils";

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


// --- API Interfaces ---
interface DashboardData {
  today: {
    orders: number;
    revenue: number;
  };
  totals: {
    revenue: number;
    orders: number;
    products: number;
  };
  recentOrders: {
    _id: string;
    orderNumber: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
  topProducts: {
    productId: string;
    name: string;
    totalUnits: number;
    totalRevenue: number;
  }[];
  orderSummary: {
    refunded: number;
    pending: number;
    returned: number;
    shipped: number;
    cancelled: number;
    confirmed: number;
  };
  productStatistics: {
    _id: string | null;
    total: number;
    active: number;
    draft: number;
    outOfStock: number;
  };
  lowStockAlerts: {
    _id: string;
    name: string;
    quantity: number;
    lowStockAlert: number;
    price: number;
    image: string | null;
  }[];
}

// Icon mapping helper
const getIcon = (iconName: string) => {
  switch (iconName) {
    case "dollar-sign": return DollarSign;
    case "shopping-bag": return ShoppingBag;
    case "package": return Package;
    case "users": return Users;
    case "trending-up": return TrendingUp;
    case "alert-triangle": return AlertTriangle;
    case "check-circle": return CheckCircle2;
    case "clock": return Clock;
    default: return TrendingUp;
  }
};

function StatCard({
  title,
  value,
  icon: iconName,
  color,
  description
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'success' | 'info' | 'warning' | 'primary';
  description?: string;
}) {
  const Icon = getIcon(iconName);

  return (
    <Card className={cn("border-l-4 shadow-sm", {
      "border-l-green-500": color === 'success',
      "border-l-blue-500": color === 'info',
      "border-l-yellow-500": color === 'warning',
      "border-l-primary": color === 'primary',
    })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", {
          "bg-green-100 text-green-600": color === 'success',
          "bg-blue-100 text-blue-600": color === 'info',
          "bg-yellow-100 text-yellow-600": color === 'warning',
          "bg-primary/10 text-primary": color === 'primary',
        })}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    delivered: "default",
    shipped: "secondary",
    confirmed: "secondary",
    pending: "outline",
    cancelled: "destructive",
    returned: "destructive",
  };

  return (
    <Badge variant={variants[status.toLowerCase()] || "outline"} className="capitalize">
      {status}
    </Badge>
  );
}







export default function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Helper function to handle token expiration
  const handleTokenExpiration = React.useCallback(() => {
    localStorage.removeItem("mk-dental-token");
    localStorage.removeItem("mk-dental-auth");
    window.location.href = "/login?expired=true";
  }, []);

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mk-dental-token");

      if (!token) {
        handleTokenExpiration();
        return;
      }

      const response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        handleTokenExpiration();
        return;
      }

      const result = await response.json() as { success: boolean; data: DashboardData; message?: string };

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("[Dashboard] Critical fetch error:", error);
      toast.error("A network error occurred while loading dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [handleTokenExpiration]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="p-8 text-center flex flex-col items-center gap-4">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      <span className="text-muted-foreground">Loading dashboard...</span>
    </div>;
  }

  if (!data) return <div className="p-8 text-center">Failed to load dashboard data.</div>;

  // KPI mapping
  const kpiData = [
    {
      title: "Total Revenue",
      value: `${(data.totals?.revenue ?? 0).toLocaleString()} EGP`,
      icon: "dollar-sign",
      color: "success" as const,
      description: "Total lifetime revenue"
    },
    {
      title: "Total Orders",
      value: data.totals?.orders ?? 0,
      icon: "shopping-bag",
      color: "info" as const,
      description: "Total processed orders"
    },
    {
      title: "Total Products",
      value: data.totals?.products ?? 0,
      icon: "package",
      color: "warning" as const,
      description: "Available in catalog"
    },
    {
      title: "Today's Revenue",
      value: `${(data.today?.revenue ?? 0).toLocaleString()} EGP`,
      icon: "dollar-sign",
      color: "success" as const,
      description: "Revenue earned today"
    },
    {
      title: "Today's Orders",
      value: data.today?.orders ?? 0,
      icon: "shopping-cart",
      color: "primary" as const,
      description: "Orders received today"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Real-time store performance overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchDashboardData()} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Manage Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiData.map((kpi, i) => (
          <StatCard
            key={i}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            description={kpi.description}
          />
        ))}
      </div>

      {/* Order Summary & Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Product Status</CardDescription>
            <CardTitle className="text-xl flex justify-between items-center text-primary">
              Active Products
              <span className="text-muted-foreground text-sm font-normal">
                {data.productStatistics?.active || 0} / {data.productStatistics?.total || 0}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Inventory</CardDescription>
            <CardTitle className="text-xl flex justify-between items-center text-red-600">
              Out of Stock
              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                {data.productStatistics?.outOfStock || 0} Items
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Order Summary</CardDescription>
            <CardTitle className="text-xl flex justify-between items-center text-orange-600">
              Pending Orders
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                {data.orderSummary?.pending || 0}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Refunds & Returns</CardDescription>
            <CardTitle className="text-xl flex justify-between items-center text-blue-600">
              Total Managed
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                {(data.orderSummary?.refunded || 0) + (data.orderSummary?.returned || 0)}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
              <Link href="/admin/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(!data.recentOrders || data.recentOrders.length === 0) ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No recent orders found</div>
              ) : (
                data.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-primary">
                          {order.orderNumber}
                        </p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Users className="h-3 w-3" />
                          {order.customer?.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black">{(order.total ?? 0).toLocaleString()} EGP</div>
                      <p className="text-[10px] text-muted-foreground uppercase">{order.paymentStatus}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
            <CardDescription>Best sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(!data.topProducts || data.topProducts.length === 0) ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No sales data available</div>
              ) : (
                data.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-black">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          {product.totalUnits} Units
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-primary">{(product.totalRevenue ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card className="shadow-sm border-yellow-200/50 bg-yellow-50/10 dark:bg-yellow-950/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Critical Stock Alerts
            </CardTitle>
            <CardDescription>{(data.lowStockAlerts?.length ?? 0)} products require immediate restock</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products?filter=low-stock">Full Inventory</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(!data.lowStockAlerts || data.lowStockAlerts.length === 0) ? (
              <div className="col-span-full py-12 text-center flex flex-col items-center gap-2">
                <Zap className="h-8 w-8 text-green-500/50" />
                <span className="text-muted-foreground">All stock levels are optimal</span>
              </div>
            ) : (
              data.lowStockAlerts.map((product) => (
                <div key={product._id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-md transition-shadow">
                  {product.image ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                        {product.quantity ?? 0} left
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Limit: {product.lowStockAlert ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
