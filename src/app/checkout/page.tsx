"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Package,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useAuth } from "~/lib/hooks/use-auth";
import { useCart } from "~/lib/hooks/use-cart";
import { resolveImageUrl } from "~/lib/image-utils";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Checkbox } from "~/ui/primitives/checkbox";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";
import { Badge } from "~/ui/primitives/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import { Textarea } from "~/ui/primitives/textarea";

// Mock data removed in favor of real API integration

// Saved addresses for logged in users (removed as per user request)
const savedAddresses: any[] = [];

type CheckoutStep = "information" | "payment" | "review";

interface FormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  gender: string;
  dateOfBirth: string;
  notes: string;
  saveAddress: boolean;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvc: string;
  savePayment: boolean;
  billingAddress: "same" | "different";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [currentStep, setCurrentStep] = React.useState<CheckoutStep>("information");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedShipping, setSelectedShipping] = React.useState("standard");
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discount: number;
    type: "percentage" | "fixed";
    freeShipping?: boolean;
  } | null>(null);
  const [couponError, setCouponError] = React.useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);
  const [publicCoupons, setPublicCoupons] = React.useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = React.useState(false);

  const [shippingFees, setShippingFees] = React.useState<{ id: string; name: string; fee: number }[]>([]);
  const [selectedShippingFee, setSelectedShippingFee] = React.useState(0);

  React.useEffect(() => {
    const fetchShippingFees = async () => {
      console.log("Fetching shipping fees...");
      try {
        const response = await fetch("/api/user/shipping-fees");
        console.log("Shipping fees response status:", response.status);
        const data = await response.json() as { success: boolean; data: { id: string; name: string; fee: number }[] };
        console.log("Shipping fees data received:", data);
        if (data.success) {
          // Handle both direct array and nested shippingFees structure
          const feesData = data.data as any;
          const fees = Array.isArray(feesData)
            ? feesData
            : (feesData && Array.isArray(feesData.shippingFees) ? feesData.shippingFees : []);

          const normalizedFees = fees.map((f: any) => ({
            ...f,
            id: f.id || f._id // Fallback to _id if id is missing
          }));

          setShippingFees(normalizedFees);
        } else {
          console.error("Shipping fees API returned success: false or invalid data structure");
          setShippingFees([]);
        }
      } catch (error) {
        console.error("Failed to fetch shipping fees:", error);
      }
    };
    fetchShippingFees();

    const fetchPublicCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const response = await fetch("/api/user/coupons");
        const data = await response.json() as any;
        if (data.success && Array.isArray(data.data)) {
          setPublicCoupons(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch public coupons:", error);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchPublicCoupons();
  }, []);

  const [formData, setFormData] = React.useState<FormData>({
    email: user?.email || "",
    phone: "",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "Egypt",
    gender: "male",
    dateOfBirth: "1990-01-01",
    notes: "",
    saveAddress: false,
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
    savePayment: false,
    billingAddress: "same",
  });

  const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { id: "information", label: "Information", icon: <User className="h-4 w-4" /> },
    { id: "payment", label: "Payment", icon: <CreditCard className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <Package className="h-4 w-4" /> },
  ];

  const stepOrder: CheckoutStep[] = ["information", "payment", "review"];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const shippingCost = appliedCoupon?.freeShipping ? 0 : selectedShippingFee;

  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  }, [appliedCoupon, subtotal]);

  const taxAmount = (subtotal - discountAmount) * 0; // Tax 0 as per simplified UI
  const total = subtotal - discountAmount + shippingCost + taxAmount;

  const handleApplyCoupon = async () => {
    const code = couponCode.toUpperCase().trim();
    setCouponError("");

    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await fetch("/api/user/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          totalPrice: subtotal,
          items: items.map((item) => ({
            productId: item.id,
            price: item.price,
            quantity: item.quantity,
          })),
          email: formData.email,
        }),
      });

      const data = await response.json() as {
        success: boolean;
        message?: string;
        data: {
          code: string;
          discount: number;
          type: "percentage" | "fixed";
          freeShipping?: boolean;
          message?: string;
        }
      };

      if (data.success) {
        setAppliedCoupon({
          code: data.data.code,
          discount: data.data.discount,
          type: data.data.type,
          freeShipping: data.data.freeShipping,
        });
        setCouponCode("");
        toast.success(data.data.message || `Coupon "${code}" applied!`);
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon validation failed:", error);
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };

  const handleSubmitOrder = async () => {
    setIsProcessing(true);

    // Filter out items with invalid product IDs (must be non-empty string, valid MongoDB ObjectId format)
    const validItems = items.filter(item => {
      const id = item.id;
      // Check for valid MongoDB ObjectId format (24 hex characters)
      return id && typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
    });

    if (validItems.length === 0) {
      toast.error("No valid items in cart. Please add products again.");
      setIsProcessing(false);
      return;
    }

    if (validItems.length !== items.length) {
      console.warn("Some items have invalid IDs and were filtered out:",
        items.filter(item => !validItems.includes(item))
      );
    }

    const orderPayload = {
      customerInfo: {
        email: formData.email,
        firstName: formData.firstName || user?.name?.split(" ")[0] || "Guest",
        lastName: formData.lastName || user?.name?.split(" ")[1] || "User",
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth
      },
      items: validItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      shippingAddress: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip,
        country: formData.country
      },
      paymentMethod: "cod",
      notes: formData.notes,
      ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {})
    };

    console.log("Submitting order payload:", JSON.stringify(orderPayload, null, 2));

    try {
      const response = await fetch("/api/user/orders/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json() as {
        success: boolean;
        message?: string;
        data?: {
          order: { orderNumber: string; _id: string };
          payment: { id: string };
        };
      };

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to create order");
        setIsProcessing(false);
        return;
      }

      // Store order details for confirmation page
      const orderConfirmationData = {
        orderNumber: data.data?.order?.orderNumber,
        email: formData.email,
        items: validItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: resolveImageUrl(item.image)
        })),
        subtotal: subtotal,
        shipping: shippingCost,
        discount: discountAmount,
        couponCode: appliedCoupon?.code || null,
        total: total,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip,
          country: formData.country
        }
      };

      // Save to sessionStorage for confirmation page
      sessionStorage.setItem('orderConfirmation', JSON.stringify(orderConfirmationData));

      // Clear cart and redirect to payment page
      clearCart();

      const orderNumber = data.data?.order?.orderNumber;
      const email = encodeURIComponent(formData.email);

      // Skip payment processing for COD orders to prevent automatic "completed" status
      if (formData.billingAddress === "same" || true) { // We are currently hardcoded to "cod" as per line 307
        router.push(`/checkout/confirmation?orderId=${orderNumber || data.data?.order?._id}`);
      } else {
        const paymentId = data.data?.payment?.id;
        if (paymentId && orderNumber) {
          router.push(`/checkout/payment?paymentId=${paymentId}&orderNumber=${orderNumber}&email=${email}`);
        } else {
          router.push(`/checkout/confirmation?orderId=${orderNumber || data.data?.order?._id}`);
        }
      }

      toast.success("Order created successfully!");
    } catch (error) {
      console.error("Order submission failed:", error);
      toast.error("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button asChild>
          <Link href="/products">Go Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-8 sm:pt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Stepper */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-[600px] items-center justify-between sm:min-w-0 sm:justify-center sm:gap-12">
            {steps.map((step, index) => {
              const active = currentStep === step.id;
              const completed = stepOrder.indexOf(currentStep) > index;
              return (
                <div key={`${step.id}-${index}`} className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${active
                      ? "bg-primary text-primary-foreground"
                      : completed
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {completed ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"
                      }`}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="h-px w-8 bg-muted sm:w-12" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Information */}
            {currentStep === "information" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact & Personal Information</CardTitle>
                    <CardDescription>
                      Tell us a bit about yourself for order verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+20 100 000 0000"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData({ ...formData, gender: value })
                          }
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({ ...formData, dateOfBirth: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          placeholder="First Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          placeholder="Last Name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Street name, building number"
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State / Governorate</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => {
                            const selected = shippingFees.find(f => f.name === value);
                            setFormData({ ...formData, state: value });
                            if (selected) {
                              setSelectedShippingFee(selected.fee);
                            }
                          }}
                        >
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(shippingFees) && shippingFees.map((fee, index) => (
                              <SelectItem key={`${fee.id}-${index}`} value={fee.name}>
                                {fee.name} (+{fee.fee} EGP)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={formData.zip}
                          onChange={(e) =>
                            setFormData({ ...formData, zip: e.target.value })
                          }
                          placeholder="ZIP"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData({ ...formData, country: value })
                        }
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="UAE">UAE</SelectItem>
                          <SelectItem value="International">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Special instructions for delivery..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={goToNextStep}>
                    Continue to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment (Simplified for COD) */}
            {currentStep === "payment" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Currently only Cash on Delivery (COD) is supported
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Check className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Cash on Delivery</h4>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={goToPreviousStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={goToNextStep}>
                    Review Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === "review" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Shipping Information</h4>
                        <p className="text-sm">
                          {formData.firstName} {formData.lastName}<br />
                          {formData.address}<br />
                          {formData.city}, {formData.state} {formData.zip}<br />
                          {formData.country}
                        </p>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2" onClick={() => setCurrentStep("information")}>Edit</Button>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Contact Information</h4>
                        <p className="text-sm">
                          {formData.email}<br />
                          {formData.phone}<br />
                          {formData.gender} ({formData.dateOfBirth})
                        </p>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2" onClick={() => setCurrentStep("information")}>Edit</Button>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Payment Method</h4>
                      <p className="text-sm">Cash on Delivery (COD)</p>
                    </div>
                    {formData.notes && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Order Notes</h4>
                          <p className="text-sm italic">"{formData.notes}"</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={goToPreviousStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button size="lg" className="px-8" onClick={handleSubmitOrder} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {items.length} {items.length === 1 ? "item" : "items"} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted flex-shrink-0">
                        <Image
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toFixed(2)} EGP each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <Label htmlFor="coupon" className="text-sm">
                    Coupon Code
                  </Label>
                  {appliedCoupon ? (
                    <div className="mt-2 flex items-center justify-between rounded-md border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {appliedCoupon.code}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {appliedCoupon.freeShipping && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30">
                              Free Shipping
                            </Badge>
                          )}
                          {appliedCoupon.discount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {appliedCoupon.type === "percentage"
                                ? `${appliedCoupon.discount}% off`
                                : `${appliedCoupon.discount} EGP off`}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleRemoveCoupon}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        placeholder="Enter code"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon}
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-sm text-destructive mt-1">{couponError}</p>
                  )}

                  {publicCoupons.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Available Offers</p>
                      <div className="flex flex-wrap gap-2">
                        {publicCoupons.map((coupon) => (
                          <button
                            key={coupon._id}
                            onClick={() => {
                              setCouponCode(coupon.code);
                              setCouponError("");
                            }}
                            className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-primary"
                          >
                            <Tag className="h-3 w-3" />
                            <span className="font-bold">{coupon.code}</span>
                            <span>•</span>
                            <span>{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' EGP'} OFF</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} EGP</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{discountAmount.toFixed(2)} EGP</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Shipping</span>
                    <span className={(shippingCost === 0 || appliedCoupon?.freeShipping) ? (appliedCoupon?.freeShipping || (formData.state !== "" && shippingCost === 0) ? "text-green-600 font-bold" : "") : ""}>
                      {appliedCoupon?.freeShipping
                        ? "FREE"
                        : formData.state === ""
                          ? "Select governorate"
                          : shippingCost === 0
                            ? "FREE"
                            : `${shippingCost.toFixed(2)} EGP`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
