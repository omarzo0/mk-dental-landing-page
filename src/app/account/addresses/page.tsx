"use client";

import { Edit2, Home, MapPin, MoreVertical, Plus, Trash2, Building2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/primitives/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Badge } from "~/ui/primitives/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import { Checkbox } from "~/ui/primitives/checkbox";

interface Address {
  id: string;
  type: "home" | "office" | "other";
  name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: "1",
    type: "office",
    name: "Dr. John Smith",
    phone: "(555) 123-4567",
    street: "123 Main Street",
    apartment: "Suite 100",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA",
    isDefault: true,
  },
  {
    id: "2",
    type: "home",
    name: "John Smith",
    phone: "(555) 987-6543",
    street: "456 Oak Avenue",
    city: "Brooklyn",
    state: "NY",
    zip: "11201",
    country: "USA",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: "home",
    country: "USA",
    isDefault: false,
  });

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        type: "home",
        country: "USA",
        isDefault: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id
            ? { ...formData, id: addr.id } as Address
            : formData.isDefault
            ? { ...addr, isDefault: false }
            : addr
        )
      );
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
      } as Address;
      if (newAddress.isDefault) {
        setAddresses([
          ...addresses.map((a) => ({ ...a, isDefault: false })),
          newAddress,
        ]);
      } else {
        setAddresses([...addresses, newAddress]);
      }
    }
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormData({ type: "home", country: "USA", isDefault: false });
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const getTypeIcon = (type: Address["type"]) => {
    switch (type) {
      case "home":
        return Home;
      case "office":
        return Building2;
      default:
        return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Address Book</h1>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? "Update your address information"
                  : "Add a new shipping or billing address"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Address Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as Address["type"],
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="home">Home</option>
                  <option value="office">Office/Clinic</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.street || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">
                  Apartment, Suite, etc. (Optional)
                </Label>
                <Input
                  id="apartment"
                  value={formData.apartment || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apartment: e.target.value })
                  }
                  placeholder="Suite 100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, zip: e.target.value })
                    }
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="USA"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked as boolean })
                  }
                />
                <Label htmlFor="isDefault" className="text-sm font-normal">
                  Set as default address
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingAddress ? "Save Changes" : "Add Address"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addresses Grid */}
      {addresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => {
            const Icon = getTypeIcon(address.type);
            return (
              <Card
                key={address.id}
                className={address.isDefault ? "border-primary" : ""}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {address.type.charAt(0).toUpperCase() +
                          address.type.slice(1)}
                        {address.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(address)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {!address.isDefault && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(address.id)}
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{address.name}</p>
                    <p className="text-muted-foreground">{address.phone}</p>
                    <p className="text-muted-foreground">
                      {address.street}
                      {address.apartment && `, ${address.apartment}`}
                    </p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </p>
                    <p className="text-muted-foreground">{address.country}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
              <p className="text-muted-foreground mb-4">
                Add an address to make checkout faster
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Address
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
