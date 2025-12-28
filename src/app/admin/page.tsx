"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Box,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";

// Mock data for dashboard
const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "from last month",
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+15.2%",
    changeType: "positive" as const,
    icon: ShoppingCart,
    description: "from last month",
  },
  {
    title: "Products",
    value: "524",
    change: "+12",
    changeType: "positive" as const,
    icon: Box,
    description: "new this month",
  },
  {
    title: "Customers",
    value: "1,573",
    change: "+8.4%",
    changeType: "positive" as const,
    icon: Users,
    description: "from last month",
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Dr. Sarah Johnson",
    email: "sarah@clinic.com",
    amount: "$1,250.00",
    status: "completed",
    date: "2024-12-27",
  },
  {
    id: "ORD-002",
    customer: "Metro Dental Clinic",
    email: "orders@metrodental.com",
    amount: "$3,499.00",
    status: "processing",
    date: "2024-12-27",
  },
  {
    id: "ORD-003",
    customer: "Dr. Michael Chen",
    email: "mchen@dentalcare.com",
    amount: "$749.99",
    status: "pending",
    date: "2024-12-26",
  },
  {
    id: "ORD-004",
    customer: "Smile Dental Group",
    email: "purchase@smiledental.com",
    amount: "$5,200.00",
    status: "completed",
    date: "2024-12-26",
  },
  {
    id: "ORD-005",
    customer: "Dr. Emily Roberts",
    email: "emily@oralhealth.com",
    amount: "$899.00",
    status: "shipped",
    date: "2024-12-25",
  },
];

const topProducts = [
  { name: "Professional Dental Mirror Set", sales: 245, revenue: "$17,107.55", trend: "+12%" },
  { name: "Dental Extraction Forceps Kit", sales: 189, revenue: "$47,248.11", trend: "+8%" },
  { name: "Ultrasonic Scaler Unit", sales: 156, revenue: "$77,998.44", trend: "+15%" },
  { name: "Composite Filling Instrument Set", sales: 142, revenue: "$18,457.58", trend: "+5%" },
  { name: "Periodontal Curette Set", sales: 128, revenue: "$19,198.72", trend: "+3%" },
];

const lowStockProducts = [
  { name: "Dental Explorer Set", stock: 5, threshold: 10 },
  { name: "Surgical Scissors", stock: 3, threshold: 15 },
  { name: "Dental Burs Pack", stock: 8, threshold: 20 },
  { name: "Impression Trays", stock: 2, threshold: 10 },
];

const recentActivity = [
  { action: "New order", detail: "ORD-001 from Dr. Sarah Johnson", time: "2 minutes ago", type: "order" },
  { action: "Product updated", detail: "Dental Mirror Set price changed", time: "15 minutes ago", type: "product" },
  { action: "New customer", detail: "Sunshine Dental registered", time: "1 hour ago", type: "customer" },
  { action: "Order shipped", detail: "ORD-098 shipped via FedEx", time: "2 hours ago", type: "order" },
  { action: "Low stock alert", detail: "Dental Explorer Set (5 remaining)", time: "3 hours ago", type: "alert" },
  { action: "Refund processed", detail: "ORD-095 refunded $149.99", time: "4 hours ago", type: "refund" },
];

const orderSummary = {
  pending: 23,
  processing: 45,
  shipped: 67,
  completed: 1892,
  cancelled: 12,
};

// Mock revenue data for chart
const revenueData = {
  daily: [
    { label: "Mon", value: 4200 },
    { label: "Tue", value: 3800 },
    { label: "Wed", value: 5100 },
    { label: "Thu", value: 4700 },
    { label: "Fri", value: 6200 },
    { label: "Sat", value: 3900 },
    { label: "Sun", value: 2800 },
  ],
  weekly: [
    { label: "Week 1", value: 28500 },
    { label: "Week 2", value: 32100 },
    { label: "Week 3", value: 29800 },
    { label: "Week 4", value: 35200 },
  ],
  monthly: [
    { label: "Jan", value: 42000 },
    { label: "Feb", value: 38500 },
    { label: "Mar", value: 45200 },
    { label: "Apr", value: 41800 },
    { label: "May", value: 48900 },
    { label: "Jun", value: 52100 },
    { label: "Jul", value: 49500 },
    { label: "Aug", value: 55200 },
    { label: "Sep", value: 51800 },
    { label: "Oct", value: 58400 },
    { label: "Nov", value: 62100 },
    { label: "Dec", value: 45231 },
  ],
};

const customerGrowth = [
  { month: "Jul", customers: 1120 },
  { month: "Aug", customers: 1245 },
  { month: "Sep", customers: 1320 },
  { month: "Oct", customers: 1398 },
  { month: "Nov", customers: 1485 },
  { month: "Dec", customers: 1573 },
];

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: (typeof stats)[0]) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center",
              changeType === "positive" ? "text-green-600" : "text-red-600"
            )}
          >
            {changeType === "positive" ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3" />
            )}
            {change}
          </span>{" "}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    processing: "secondary",
    pending: "outline",
    shipped: "default",
    cancelled: "destructive",
  };

  return (
    <Badge variant={variants[status] || "outline"} className="capitalize">
      {status}
    </Badge>
  );
}

function SimpleBarChart({ data }: { data: typeof revenueData.daily }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2 h-[200px]">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
            <div 
              className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary min-h-[4px]"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              title={`$${item.value.toLocaleString()}`}
            />
            <span className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerGrowthChart({ data }: { data: typeof customerGrowth }) {
  const maxValue = Math.max(...data.map(d => d.customers));
  const minValue = Math.min(...data.map(d => d.customers));
  const range = maxValue - minValue;
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4 h-[150px]">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
            <div 
              className="w-full bg-blue-500/80 rounded-t-sm transition-all hover:bg-blue-500 min-h-[20px]"
              style={{ height: `${((item.customers - minValue) / range) * 80 + 20}%` }}
              title={`${item.customers} customers`}
            />
            <span className="text-xs text-muted-foreground mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [chartPeriod, setChartPeriod] = React.useState<"daily" | "weekly" | "monthly">("daily");
  
  const currentRevenueData = revenueData[chartPeriod];
  const totalRevenue = currentRevenueData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your store.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/transactions">
              <CreditCard className="mr-2 h-4 w-4" />
              Transactions
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Revenue Chart & Order Summary */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Total: ${totalRevenue.toLocaleString()}
              </CardDescription>
            </div>
            <Select value={chartPeriod} onValueChange={(v) => setChartPeriod(v as typeof chartPeriod)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={currentRevenueData} />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-medium">{orderSummary.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">Processing</span>
              </div>
              <span className="font-medium">{orderSummary.processing}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <span className="text-sm">Shipped</span>
              </div>
              <span className="font-medium">{orderSummary.shipped}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Completed</span>
              </div>
              <span className="font-medium">{orderSummary.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">Cancelled</span>
              </div>
              <span className="font-medium">{orderSummary.cancelled}</span>
            </div>
            <div className="pt-2 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Growth & Low Stock Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers over the last 6 months</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CustomerGrowthChart data={customerGrowth} />
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Total Customers</span>
              <span className="font-medium">1,573</span>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>{lowStockProducts.length} products need attention</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Threshold: {product.threshold} units
                    </p>
                  </div>
                  <Badge variant="destructive">{product.stock} left</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/products?filter=low-stock">Manage Inventory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest orders from your customers
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.customer}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-medium">{order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products this month</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-none line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                    <p className="text-xs text-green-600">{product.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and events in your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  activity.type === "order" && "bg-blue-500",
                  activity.type === "product" && "bg-green-500",
                  activity.type === "customer" && "bg-purple-500",
                  activity.type === "alert" && "bg-yellow-500",
                  activity.type === "refund" && "bg-red-500"
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/admin/products/new">
                <Box className="h-5 w-5" />
                <span>Add Product</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/admin/packages/new">
                <Package className="h-5 w-5" />
                <span>Create Package</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-5 w-5" />
                <span>View Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/admin/customers">
                <Users className="h-5 w-5" />
                <span>Manage Customers</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
