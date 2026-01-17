"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  ShoppingBag,
  Truck,
  CreditCard,
  Tag,
} from "lucide-react";
import { resolveImageUrl } from "~/lib/image-utils";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "~/lib/cn";
import { useCart } from "~/lib/hooks/use-cart";
import { useMediaQuery } from "~/lib/hooks/use-media-query";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "~/ui/primitives/drawer";
import { Input } from "~/ui/primitives/input";
import { Separator } from "~/ui/primitives/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "~/ui/primitives/sheet";

interface CartClientProps {
  className?: string;
}

export function CartClient({ className }: CartClientProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState("");
  const [appliedPromo, setAppliedPromo] = React.useState<string | null>(null);
  const [discount, setDiscount] = React.useState(0);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const {
    items: cartItems,
    itemCount: totalItems,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    isCartOpen,
    setIsCartOpen
  } = useCart();
  const { addItem: addToWishlist } = useWishlist();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id);
    toast.success(`${name} removed from cart`);
  };

  const handleMoveToWishlist = (item: typeof cartItems[0]) => {
    addToWishlist({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    removeItem(item.id);
    toast.success(`${item.name} moved to wishlist`);
  };

  const handleClearCart = () => {
    clearCart();
    setAppliedPromo(null);
    setDiscount(0);
    toast.success("Cart cleared");
  };

  const handleApplyPromo = () => {
    const codes: Record<string, number> = {
      "SAVE10": 10,
      "DENTAL20": 20,
      "FLAT50": 50,
    };

    const code = promoCode.toUpperCase().trim();
    if (codes[code]) {
      setAppliedPromo(code);
      setDiscount(codes[code]);
      toast.success(`Promo code applied! ${codes[code]}% off`);
      setPromoCode("");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscount(0);
    toast.success("Promo code removed");
  };

  const discountAmount = (subtotal * discount) / 100;
  const shippingCost = 0;
  const finalTotal = subtotal - discountAmount + shippingCost;

  const CartTrigger = (
    <Button
      aria-label="Open cart"
      className="relative h-9 w-9 rounded-full"
      size="icon"
      variant="outline"
    >
      <ShoppingCart className="h-4 w-4" />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1"
          >
            <Badge
              className="h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
              variant="default"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );

  const EmptyCart = (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, y: 20 }}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
        <ShoppingBag className="h-12 w-12 text-primary/60" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">Your cart is empty</h3>
      <p className="mb-6 text-center text-sm text-muted-foreground max-w-[250px]">
        Discover our premium dental supplies and add items to your cart.
      </p>
      {isDesktop ? (
        <SheetClose asChild>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Button>
          </Link>
        </SheetClose>
      ) : (
        <DrawerClose asChild>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Button>
          </Link>
        </DrawerClose>
      )}
    </motion.div>
  );

  const CartItemComponent = ({ item }: { item: typeof cartItems[0] }) => (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="group relative flex gap-4 rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md"
      exit={{ opacity: 0, x: -20 }}
      initial={{ opacity: 0, x: 20 }}
      layout
      transition={{ duration: 0.2 }}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.id}`}
        onClick={() => setIsCartOpen(false)}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        <Image
          alt={item.name}
          className="object-cover transition-transform group-hover:scale-105"
          fill
          src={resolveImageUrl(item.image)}
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              className="line-clamp-2 text-sm font-medium leading-tight hover:text-primary transition-colors"
              href={`/products/${item.id}`}
              onClick={() => setIsCartOpen(false)}
            >
              {item.name}
            </Link>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.category}
          </p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {item.price.toFixed(2)} EGP
          </p>
        </div>

        {/* Quantity & Actions */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border bg-background">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              type="button"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex h-8 w-10 items-center justify-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              type="button"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => handleMoveToWishlist(item)}
              title="Move to wishlist"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveItem(item.id, item.name)}
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

    </motion.div>
  );

  const CartContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <p className="text-sm text-muted-foreground">
            {totalItems === 0
              ? "No items yet"
              : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </p>
        </div>
        {cartItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleClearCart}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <AnimatePresence mode="popLayout">
          {cartItems.length === 0 ? (
            EmptyCart
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer - Summary & Checkout */}
      {cartItems.length > 0 && (
        <div className="border-t bg-muted/30 px-6 py-4">
          {/* Order Summary */}
          <div className="space-y-2 text-sm mb-4">
            {discount > 0 && (
              <div className="flex items-center justify-between text-destructive">
                <span>Discount ({discount}%)</span>
                <span>-{discountAmount.toFixed(2)} EGP</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg text-primary">{finalTotal.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="mt-4 space-y-2">
            {isDesktop ? (
              <>
                <SheetClose asChild>
                  <Link href="/checkout" className="block">
                    <Button className="w-full gap-2" size="lg">
                      <CreditCard className="h-4 w-4" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/products" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Continue Shopping
                    </Button>
                  </Link>
                </SheetClose>
              </>
            ) : (
              <>
                <DrawerClose asChild>
                  <Link href="/checkout" className="block">
                    <Button className="w-full gap-2" size="lg">
                      <CreditCard className="h-4 w-4" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                </DrawerClose>
                <DrawerClose asChild>
                  <Link href="/products" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Continue Shopping
                    </Button>
                  </Link>
                </DrawerClose>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              100% Safe
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (!isMounted) {
    return (
      <div className={cn("relative", className)}>
        <Button
          aria-label="Open cart"
          className="relative h-9 w-9 rounded-full"
          size="icon"
          variant="outline"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isDesktop ? (
        <Sheet onOpenChange={setIsCartOpen} open={isCartOpen}>
          <SheetTrigger asChild>{CartTrigger}</SheetTrigger>
          <SheetContent className="flex w-[420px] flex-col p-0 sm:max-w-[420px]">
            <SheetTitle className="sr-only">Shopping Cart Overview</SheetTitle>
            {CartContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer onOpenChange={setIsCartOpen} open={isCartOpen}>
          <DrawerTrigger asChild>{CartTrigger}</DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <DrawerTitle className="sr-only">Shopping Cart Overview</DrawerTitle>
            {CartContent}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
