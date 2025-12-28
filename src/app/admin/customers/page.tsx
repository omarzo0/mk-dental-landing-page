"use client";

import {
  Download,
  Mail,
  MoreHorizontal,
  Search,
  ShoppingBag,
  User,
  UserPlus,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "~/ui/primitives/avatar";
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

// Mock customers data
const mockCustomers = [
  {
    id: "CUST-001",
    name: "Dr. Sarah Johnson",
    email: "sarah@clinic.com",
    phone: "+1 (555) 123-4567",
    company: "Johnson Dental Clinic",
    totalOrders: 12,
    totalSpent: 4589.99,
    status: "active",
    joinDate: "2024-01-15",
    lastOrder: "2024-12-27",
    address: "123 Medical Center Dr, New York, NY 10001",
  },
  {
    id: "CUST-002",
    name: "Metro Dental Clinic",
    email: "orders@metrodental.com",
    phone: "+1 (555) 234-5678",
    company: "Metro Dental Group",
    totalOrders: 28,
    totalSpent: 15750.00,
    status: "active",
    joinDate: "2023-06-20",
    lastOrder: "2024-12-27",
    address: "456 Healthcare Blvd, Los Angeles, CA 90001",
  },
  {
    id: "CUST-003",
    name: "Dr. Michael Chen",
    email: "mchen@dentalcare.com",
    phone: "+1 (555) 345-6789",
    company: "Chen Dental Care",
    totalOrders: 8,
    totalSpent: 2340.50,
    status: "active",
    joinDate: "2024-03-10",
    lastOrder: "2024-12-26",
    address: "789 Dental Way, Chicago, IL 60601",
  },
  {
    id: "CUST-004",
    name: "Smile Dental Group",
    email: "purchase@smiledental.com",
    phone: "+1 (555) 456-7890",
    company: "Smile Dental Group LLC",
    totalOrders: 45,
    totalSpent: 32500.00,
    status: "vip",
    joinDate: "2022-11-05",
    lastOrder: "2024-12-26",
    address: "321 Smile Ave, Houston, TX 77001",
  },
  {
    id: "CUST-005",
    name: "Dr. Emily Roberts",
    email: "emily@oralhealth.com",
    phone: "+1 (555) 567-8901",
    company: "Oral Health Associates",
    totalOrders: 3,
    totalSpent: 899.97,
    status: "inactive",
    joinDate: "2024-08-22",
    lastOrder: "2024-10-15",
    address: "654 Health St, Phoenix, AZ 85001",
  },
  {
    id: "CUST-006",
    name: "City Dental Practice",
    email: "admin@citydental.com",
    phone: "+1 (555) 678-9012",
    company: "City Dental Practice Inc",
    totalOrders: 19,
    totalSpent: 8920.00,
    status: "active",
    joinDate: "2023-09-12",
    lastOrder: "2024-12-24",
    address: "987 Urban Plaza, Seattle, WA 98101",
  },
  {
    id: "CUST-007",
    name: "Dr. David Park",
    email: "dpark@orthodontics.com",
    phone: "+1 (555) 789-0123",
    company: "Park Orthodontics",
    totalOrders: 15,
    totalSpent: 6780.00,
    status: "active",
    joinDate: "2023-12-01",
    lastOrder: "2024-12-20",
    address: "246 Ortho Lane, Miami, FL 33101",
  },
  {
    id: "CUST-008",
    name: "Sunshine Dental",
    email: "info@sunshinedental.com",
    phone: "+1 (555) 890-1234",
    company: "Sunshine Dental Care",
    totalOrders: 0,
    totalSpent: 0,
    status: "new",
    joinDate: "2024-12-25",
    lastOrder: null,
    address: "135 Sunny Blvd, San Diego, CA 92101",
  },
];

type CustomerStatus = "active" | "inactive" | "vip" | "new";

const statusColors: Record<CustomerStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  vip: "default",
  new: "outline",
};

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [customers, setCustomers] = React.useState(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = React.useState<typeof mockCustomers[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const filteredCustomers = React.useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const viewCustomerDetails = (customer: typeof mockCustomers[0]) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const updateCustomerStatus = (customerId: string, newStatus: CustomerStatus) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId ? { ...customer, status: newStatus } : customer
    ));
    toast.success(`Customer status updated to ${newStatus}`);
  };

  const customerStats = React.useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter(c => c.status === "active").length,
      vip: customers.filter(c => c.status === "vip").length,
      new: customers.filter(c => c.status === "new").length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    };
  }, [customers]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer base
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-2xl">{customerStats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl text-green-600">{customerStats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>VIP Customers</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{customerStats.vip}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New This Month</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{customerStats.new}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">${customerStats.totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        {customer.totalOrders}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${customer.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {customer.lastOrder || "No orders yet"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusColors[customer.status as CustomerStatus]} 
                        className={`capitalize ${customer.status === "vip" ? "bg-purple-600" : ""}`}
                      >
                        {customer.status}
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
                          <DropdownMenuItem onClick={() => viewCustomerDetails(customer)}>
                            <User className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updateCustomerStatus(customer.id, "active")}>
                            Mark as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateCustomerStatus(customer.id, "vip")}>
                            Mark as VIP
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateCustomerStatus(customer.id, "inactive")}>
                            Mark as Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Customer since {selectedCustomer?.joinDate}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(selectedCustomer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                    <Badge 
                      variant={statusColors[selectedCustomer.status as CustomerStatus]}
                      className={`capitalize ${selectedCustomer.status === "vip" ? "bg-purple-600" : ""}`}
                    >
                      {selectedCustomer.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedCustomer.company}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {selectedCustomer.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {selectedCustomer.phone}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Address:</span>{" "}
                      {selectedCustomer.address}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Order Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Total Orders:</span>{" "}
                      <span className="font-medium">{selectedCustomer.totalOrders}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total Spent:</span>{" "}
                      <span className="font-medium">${selectedCustomer.totalSpent.toLocaleString()}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Last Order:</span>{" "}
                      {selectedCustomer.lastOrder || "No orders yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View Orders
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
