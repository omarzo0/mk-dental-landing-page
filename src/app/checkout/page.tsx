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

// Available coupons for demo
const validCoupons: Record<string, { discount: number; type: "percentage" | "fixed"; minOrder?: number }> = {
  SAVE10: { discount: 10, type: "percentage" },
  DENTAL20: { discount: 20, type: "percentage", minOrder: 100 },
  FLAT50: { discount: 50, type: "fixed", minOrder: 200 },
  FREESHIP: { discount: 0, type: "fixed" },
  WELCOME15: { discount: 15, type: "percentage" },
};

// Shipping options
const shippingOptions = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 9.99,
    freeThreshold: 100,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 19.99,
    freeThreshold: null,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 39.99,
    freeThreshold: null,
  },
];

// Saved addresses for logged in users
const savedAddresses = [
  {
    id: "1",
    name: "Dr. John Smith",
    street: "123 Main Street, Suite 100",
    city: "New York",
    state: "NY",
    zip: "10001",
    isDefault: true,
  },
  {
    id: "2",
    name: "Smith Dental Clinic",
    street: "456 Oak Avenue",
    city: "Brooklyn",
    state: "NY",
    zip: "11201",
    isDefault: false,
  },
];

type CheckoutStep = "information" | "shipping" | "payment" | "review";

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
  const [selectedAddress, setSelectedAddress] = React.useState<string | null>(
    isAuthenticated ? "1" : null
  );
  const [selectedShipping, setSelectedShipping] = React.useState("standard");
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  } | null>(null);
  const [couponError, setCouponError] = React.useState("");

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
    country: "USA",
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
    { id: "shipping", label: "Shipping", icon: <Truck className="h-4 w-4" /> },
    { id: "payment", label: "Payment", icon: <CreditCard className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <Package className="h-4 w-4" /> },
  ];

  const stepOrder: CheckoutStep[] = ["information", "shipping", "payment", "review"];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const shippingCost = React.useMemo(() => {
    const option = shippingOptions.find((o) => o.id === selectedShipping);
    if (!option) return 0;
    if (appliedCoupon?.code === "FREESHIP") return 0;
    if (option.freeThreshold && subtotal >= option.freeThreshold) return 0;
    return option.price;
  }, [selectedShipping, subtotal, appliedCoupon]);

  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.code === "FREESHIP") return 0;
    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  }, [appliedCoupon, subtotal]);

  const taxAmount = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shippingCost + taxAmount;

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    setCouponError("");

    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const coupon = validCoupons[code];
    if (!coupon) {
      setCouponError("Invalid coupon code");
      return;
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      setCouponError(`Minimum order of $${coupon.minOrder} required`);
      return;
    }

    setAppliedCoupon({ code, ...coupon });
    setCouponCode("");
    toast.success(`Coupon "${code}" applied successfully!`);
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    clearCart();
    setIsProcessing(false);
    router.push("/checkout/confirmation?orderId=ORD-" + Date.now().toString().slice(-6));
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Add some items to your cart before checking out.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-2 ${
                  index <= currentStepIndex
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    index < currentStepIndex
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStepIndex
                      ? "border-primary text-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="hidden sm:inline font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Checkout Option */}
          {!isAuthenticated && currentStep === "information" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Have an account?</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in for a faster checkout experience
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/login?redirect=/checkout">Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Information */}
          {currentStep === "information" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    We'll use this to send you order updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      <Label>Select a saved address</Label>
                      <div className="space-y-2">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer ${
                              selectedAddress === addr.id
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setSelectedAddress(addr.id)}
                          >
                            <input
                              type="radio"
                              checked={selectedAddress === addr.id}
                              onChange={() => setSelectedAddress(addr.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{addr.name}</span>
                                {addr.isDefault && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {addr.street}
                                <br />
                                {addr.city}, {addr.state} {addr.zip}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div
                          className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer ${
                            selectedAddress === null
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => setSelectedAddress(null)}
                        >
                          <input
                            type="radio"
                            checked={selectedAddress === null}
                            onChange={() => setSelectedAddress(null)}
                          />
                          <span>Use a different address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!isAuthenticated || selectedAddress === null) && (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                            placeholder="John"
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
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Clinic (Optional)</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({ ...formData, company: e.target.value })
                          }
                          placeholder="ABC Dental Clinic"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          placeholder="123 Main Street"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apartment">
                          Apartment, Suite, etc. (Optional)
                        </Label>
                        <Input
                          id="apartment"
                          value={formData.apartment}
                          onChange={(e) =>
                            setFormData({ ...formData, apartment: e.target.value })
                          }
                          placeholder="Suite 100"
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
                            placeholder="New York"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData({ ...formData, state: e.target.value })
                            }
                            placeholder="NY"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={formData.zip}
                            onChange={(e) =>
                              setFormData({ ...formData, zip: e.target.value })
                            }
                            placeholder="10001"
                            required
                          />
                        </div>
                      </div>
                      {isAuthenticated && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveAddress"
                            checked={formData.saveAddress}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                saveAddress: checked as boolean,
                              })
                            }
                          />
                          <Label htmlFor="saveAddress" className="text-sm">
                            Save this address for future orders
                          </Label>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={goToNextStep}>
                  Continue to Shipping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Shipping */}
          {currentStep === "shipping" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Method</CardTitle>
                  <CardDescription>
                    Choose how you want your order delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shippingOptions.map((option) => {
                      const isFree =
                        appliedCoupon?.code === "FREESHIP" ||
                        (option.freeThreshold && subtotal >= option.freeThreshold);
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                            selectedShipping === option.id
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => setSelectedShipping(option.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={selectedShipping === option.id}
                              onChange={() => setSelectedShipping(option.id)}
                            />
                            <div>
                              <span className="font-medium">{option.name}</span>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {isFree ? (
                              <div>
                                <span className="font-medium text-green-600">
                                  FREE
                                </span>
                                {option.price > 0 && (
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    {option.price.toFixed(2)} EGP
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="font-medium">
                                {option.price.toFixed(2)} EGP
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {subtotal < 100 && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                      <p>
                        Add{" "}
                        <span className="font-medium">
                          {(100 - subtotal).toFixed(2)} EGP
                        </span>{" "}
                        more to qualify for free standard shipping!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={goToNextStep}>
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === "payment" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Your payment information is secure and encrypted
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) =>
                        setFormData({ ...formData, cardName: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, cardNumber: e.target.value })
                      }
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        value={formData.expiry}
                        onChange={(e) =>
                          setFormData({ ...formData, expiry: e.target.value })
                        }
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        value={formData.cvc}
                        onChange={(e) =>
                          setFormData({ ...formData, cvc: e.target.value })
                        }
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Your payment information is secure and encrypted
                  </div>

                  {isAuthenticated && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="savePayment"
                        checked={formData.savePayment}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            savePayment: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="savePayment" className="text-sm">
                        Save this card for future purchases
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="billing-same"
                        checked={formData.billingAddress === "same"}
                        onChange={() =>
                          setFormData({ ...formData, billingAddress: "same" })
                        }
                      />
                      <Label htmlFor="billing-same" className="cursor-pointer">
                        Same as shipping address
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="billing-different"
                        checked={formData.billingAddress === "different"}
                        onChange={() =>
                          setFormData({ ...formData, billingAddress: "different" })
                        }
                      />
                      <Label htmlFor="billing-different" className="cursor-pointer">
                        Use a different billing address
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
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

          {/* Step 4: Review */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                  <CardDescription>
                    Please review your order before placing it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{item.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {(item.price * item.quantity).toFixed(2)} EGP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      {selectedAddress ? (
                        <p className="text-sm text-muted-foreground">
                          {savedAddresses.find((a) => a.id === selectedAddress)?.name}
                          <br />
                          {savedAddresses.find((a) => a.id === selectedAddress)?.street}
                          <br />
                          {savedAddresses.find((a) => a.id === selectedAddress)?.city},{" "}
                          {savedAddresses.find((a) => a.id === selectedAddress)?.state}{" "}
                          {savedAddresses.find((a) => a.id === selectedAddress)?.zip}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {formData.firstName} {formData.lastName}
                          <br />
                          {formData.address}
                          {formData.apartment && `, ${formData.apartment}`}
                          <br />
                          {formData.city}, {formData.state} {formData.zip}
                        </p>
                      )}
                      <Button
                        variant="link"
                        className="h-auto p-0 mt-1"
                        onClick={() => setCurrentStep("information")}
                      >
                        Edit
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping Method
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {shippingOptions.find((o) => o.id === selectedShipping)?.name}
                        <br />
                        {shippingOptions.find((o) => o.id === selectedShipping)?.description}
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 mt-1"
                        onClick={() => setCurrentStep("shipping")}
                      >
                        Edit
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Method
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Card ending in {formData.cardNumber.slice(-4) || "****"}
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 mt-1"
                        onClick={() => setCurrentStep("payment")}
                      >
                        Edit
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formData.email}
                        <br />
                        {formData.phone}
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 mt-1"
                        onClick={() => setCurrentStep("information")}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button size="lg" onClick={handleSubmitOrder} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Place Order - {total.toFixed(2)} EGP
                    </>
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
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
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
                      <Badge variant="secondary" className="text-xs">
                        {appliedCoupon.code === "FREESHIP"
                          ? "Free Shipping"
                          : appliedCoupon.type === "percentage"
                          ? `${appliedCoupon.discount}% off`
                          : `$${appliedCoupon.discount} off`}
                      </Badge>
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
                    >
                      Apply
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-sm text-destructive mt-1">{couponError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Try: SAVE10, DENTAL20, FLAT50, FREESHIP
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toFixed(2)} EGP</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{discountAmount.toFixed(2)} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `${shippingCost.toFixed(2)} EGP`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{taxAmount.toFixed(2)} EGP</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{total.toFixed(2)} EGP</span>
              </div>

              {subtotal >= 100 && !appliedCoupon && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm">
                  <p className="font-medium text-green-600">
                    🎉 You qualify for free shipping!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
