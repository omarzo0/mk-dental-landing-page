"use client";

import {
  Building2,
  DollarSign,
  Globe,
  Mail,
  Save,
  Shield,
  Truck,
  Users,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import { Separator } from "~/ui/primitives/separator";
import { Switch } from "~/ui/primitives/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/ui/primitives/tabs";

// Mock shipping settings
const defaultSettings = {
  // Store Information
  storeName: "MK Dental Supplies",
  storeEmail: "support@mkdental.com",
  storePhone: "+1 (555) 123-4567",
  storeAddress: "123 Medical Center Drive",
  storeCity: "Houston",
  storeState: "TX",
  storeZip: "77001",
  storeCountry: "United States",
  
  // Standard Shipping
  standardShippingEnabled: true,
  standardShippingFee: 9.99,
  standardShippingMinDays: 5,
  standardShippingMaxDays: 7,
  
  // Express Shipping
  expressShippingEnabled: true,
  expressShippingFee: 19.99,
  expressShippingMinDays: 2,
  expressShippingMaxDays: 3,
  
  // Overnight Shipping
  overnightShippingEnabled: true,
  overnightShippingFee: 34.99,
  overnightShippingMinDays: 1,
  overnightShippingMaxDays: 1,
  
  // Free Shipping Threshold
  freeShippingEnabled: true,
  freeShippingThreshold: 150,
  
  // Handling Fee
  handlingFeeEnabled: false,
  handlingFee: 2.99,
  
  // International Shipping
  internationalShippingEnabled: false,
  internationalShippingFee: 49.99,
  
  // Tax Settings
  taxEnabled: true,
  taxRate: 8.25,
  taxIncludedInPrices: false,
  
  // Email Notifications
  orderConfirmationEmail: true,
  shippingNotificationEmail: true,
  abandonedCartEmail: true,
  promotionalEmail: false,
  
  // SEO Settings
  metaTitle: "MK Dental - Premium Dental Supplies & Equipment",
  metaDescription: "Shop professional dental instruments, equipment, and supplies at competitive prices. Fast shipping and excellent customer service.",
  
  // Currency & Region
  currency: "USD",
  timezone: "America/Chicago",
  dateFormat: "MM/DD/YYYY",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState(defaultSettings);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // In production, save to database
    localStorage.setItem("mk-dental-shipping-settings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
    setIsSaving(false);
  };

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("mk-dental-shipping-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved) as typeof defaultSettings);
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }, []);

  const updateSetting = <K extends keyof typeof defaultSettings>(
    key: K,
    value: typeof defaultSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store settings and configuration
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="store" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:block" />
            Store
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4 hidden sm:block" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2">
            <DollarSign className="h-4 w-4 hidden sm:block" />
            Tax
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Mail className="h-4 w-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Globe className="h-4 w-4 hidden sm:block" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Store Information Tab */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Store Information</CardTitle>
              </div>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => updateSetting("storeName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Support Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => updateSetting("storeEmail", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={settings.storePhone}
                    onChange={(e) => updateSetting("storePhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Street Address</Label>
                  <Input
                    id="storeAddress"
                    value={settings.storeAddress}
                    onChange={(e) => updateSetting("storeAddress", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="storeCity">City</Label>
                  <Input
                    id="storeCity"
                    value={settings.storeCity}
                    onChange={(e) => updateSetting("storeCity", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeState">State</Label>
                  <Input
                    id="storeState"
                    value={settings.storeState}
                    onChange={(e) => updateSetting("storeState", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeZip">ZIP Code</Label>
                  <Input
                    id="storeZip"
                    value={settings.storeZip}
                    onChange={(e) => updateSetting("storeZip", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeCountry">Country</Label>
                  <Input
                    id="storeCountry"
                    value={settings.storeCountry}
                    onChange={(e) => updateSetting("storeCountry", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Regional Settings</CardTitle>
              </div>
              <CardDescription>
                Currency, timezone, and date format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(v) => updateSetting("currency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(v) => updateSetting("timezone", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(v) => updateSetting("dateFormat", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <CardTitle>Shipping Methods</CardTitle>
              </div>
              <CardDescription>
                Configure shipping options and pricing for your customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {/* Standard Shipping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Standard Shipping</h4>
                  <p className="text-sm text-muted-foreground">Regular delivery option</p>
                </div>
                <Switch
                  checked={settings.standardShippingEnabled}
                  onCheckedChange={(checked) => updateSetting("standardShippingEnabled", checked)}
                />
              </div>
              {settings.standardShippingEnabled && (
                <div className="grid gap-4 sm:grid-cols-3 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="standardFee">Fee ($)</Label>
                    <Input
                      id="standardFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.standardShippingFee}
                      onChange={(e) => updateSetting("standardShippingFee", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="standardMinDays">Min Days</Label>
                    <Input
                      id="standardMinDays"
                      type="number"
                      min="1"
                      value={settings.standardShippingMinDays}
                      onChange={(e) => updateSetting("standardShippingMinDays", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="standardMaxDays">Max Days</Label>
                    <Input
                      id="standardMaxDays"
                      type="number"
                      min="1"
                      value={settings.standardShippingMaxDays}
                      onChange={(e) => updateSetting("standardShippingMaxDays", parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Express Shipping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Express Shipping</h4>
                  <p className="text-sm text-muted-foreground">Faster delivery option</p>
                </div>
                <Switch
                  checked={settings.expressShippingEnabled}
                  onCheckedChange={(checked) => updateSetting("expressShippingEnabled", checked)}
                />
              </div>
              {settings.expressShippingEnabled && (
                <div className="grid gap-4 sm:grid-cols-3 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="expressFee">Fee ($)</Label>
                    <Input
                      id="expressFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.expressShippingFee}
                      onChange={(e) => updateSetting("expressShippingFee", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expressMinDays">Min Days</Label>
                    <Input
                      id="expressMinDays"
                      type="number"
                      min="1"
                      value={settings.expressShippingMinDays}
                      onChange={(e) => updateSetting("expressShippingMinDays", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expressMaxDays">Max Days</Label>
                    <Input
                      id="expressMaxDays"
                      type="number"
                      min="1"
                      value={settings.expressShippingMaxDays}
                      onChange={(e) => updateSetting("expressShippingMaxDays", parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Overnight Shipping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Overnight Shipping</h4>
                  <p className="text-sm text-muted-foreground">Next-day delivery</p>
                </div>
                <Switch
                  checked={settings.overnightShippingEnabled}
                  onCheckedChange={(checked) => updateSetting("overnightShippingEnabled", checked)}
                />
              </div>
              {settings.overnightShippingEnabled && (
                <div className="grid gap-4 sm:grid-cols-3 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="overnightFee">Fee ($)</Label>
                    <Input
                      id="overnightFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.overnightShippingFee}
                      onChange={(e) => updateSetting("overnightShippingFee", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overnightMinDays">Min Days</Label>
                    <Input
                      id="overnightMinDays"
                      type="number"
                      min="1"
                      value={settings.overnightShippingMinDays}
                      onChange={(e) => updateSetting("overnightShippingMinDays", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overnightMaxDays">Max Days</Label>
                    <Input
                      id="overnightMaxDays"
                      type="number"
                      min="1"
                      value={settings.overnightShippingMaxDays}
                      onChange={(e) => updateSetting("overnightShippingMaxDays", parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* International Shipping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">International Shipping</h4>
                  <p className="text-sm text-muted-foreground">Ship to other countries</p>
                </div>
                <Switch
                  checked={settings.internationalShippingEnabled}
                  onCheckedChange={(checked) => updateSetting("internationalShippingEnabled", checked)}
                />
              </div>
              {settings.internationalShippingEnabled && (
                <div className="grid gap-4 sm:grid-cols-1 pl-4 border-l-2 border-muted max-w-xs">
                  <div className="space-y-2">
                    <Label htmlFor="internationalFee">Base Fee ($)</Label>
                    <Input
                      id="internationalFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.internationalShippingFee}
                      onChange={(e) => updateSetting("internationalShippingFee", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Fees Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>Additional Fees & Discounts</CardTitle>
            </div>
            <CardDescription>
              Configure handling fees and free shipping threshold
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Free Shipping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Free Shipping Threshold</h4>
                  <p className="text-sm text-muted-foreground">
                    Offer free shipping on orders above a certain amount
                  </p>
                </div>
                <Switch
                  checked={settings.freeShippingEnabled}
                  onCheckedChange={(checked) => updateSetting("freeShippingEnabled", checked)}
                />
              </div>
              {settings.freeShippingEnabled && (
                <div className="pl-4 border-l-2 border-muted max-w-xs">
                  <div className="space-y-2">
                    <Label htmlFor="freeThreshold">Minimum Order Amount ($)</Label>
                    <Input
                      id="freeThreshold"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => updateSetting("freeShippingThreshold", parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Orders of ${settings.freeShippingThreshold} or more will receive free standard shipping
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Handling Fee */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Handling Fee</h4>
                  <p className="text-sm text-muted-foreground">
                    Additional fee for order processing and packaging
                  </p>
                </div>
                <Switch
                  checked={settings.handlingFeeEnabled}
                  onCheckedChange={(checked) => updateSetting("handlingFeeEnabled", checked)}
                />
              </div>
              {settings.handlingFeeEnabled && (
                <div className="pl-4 border-l-2 border-muted max-w-xs">
                  <div className="space-y-2">
                    <Label htmlFor="handlingFee">Fee per Order ($)</Label>
                    <Input
                      id="handlingFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.handlingFee}
                      onChange={(e) => updateSetting("handlingFee", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Tax Tab */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <CardTitle>Tax Settings</CardTitle>
              </div>
              <CardDescription>
                Configure tax calculation for your orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Tax</h4>
                  <p className="text-sm text-muted-foreground">
                    Calculate and add tax to orders
                  </p>
                </div>
                <Switch
                  checked={settings.taxEnabled}
                  onCheckedChange={(checked) => updateSetting("taxEnabled", checked)}
                />
              </div>

              {settings.taxEnabled && (
                <>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={settings.taxRate}
                        onChange={(e) => updateSetting("taxRate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Prices Include Tax</Label>
                        <p className="text-xs text-muted-foreground">
                          Product prices already include tax
                        </p>
                      </div>
                      <Switch
                        checked={settings.taxIncludedInPrices}
                        onCheckedChange={(checked) => updateSetting("taxIncludedInPrices", checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure which email notifications are sent to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Order Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    Send email when order is placed
                  </p>
                </div>
                <Switch
                  checked={settings.orderConfirmationEmail}
                  onCheckedChange={(checked) => updateSetting("orderConfirmationEmail", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Shipping Notification</h4>
                  <p className="text-sm text-muted-foreground">
                    Send email when order is shipped
                  </p>
                </div>
                <Switch
                  checked={settings.shippingNotificationEmail}
                  onCheckedChange={(checked) => updateSetting("shippingNotificationEmail", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Abandoned Cart</h4>
                  <p className="text-sm text-muted-foreground">
                    Send reminder for abandoned shopping carts
                  </p>
                </div>
                <Switch
                  checked={settings.abandonedCartEmail}
                  onCheckedChange={(checked) => updateSetting("abandonedCartEmail", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Promotional Emails</h4>
                  <p className="text-sm text-muted-foreground">
                    Send promotional and marketing emails
                  </p>
                </div>
                <Switch
                  checked={settings.promotionalEmail}
                  onCheckedChange={(checked) => updateSetting("promotionalEmail", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>SEO Settings</CardTitle>
              </div>
              <CardDescription>
                Optimize your store for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.metaTitle}
                  onChange={(e) => updateSetting("metaTitle", e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {settings.metaTitle.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <textarea
                  id="metaDescription"
                  value={settings.metaDescription}
                  onChange={(e) => updateSetting("metaDescription", e.target.value)}
                  maxLength={160}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  {settings.metaDescription.length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button Footer */}
      <Card>
        <CardFooter className="pt-6">
          <Button onClick={handleSave} disabled={isSaving} className="ml-auto">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
