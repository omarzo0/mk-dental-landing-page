"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import * as React from "react";

import { cn } from "~/lib/cn";
import { Button } from "~/ui/primitives/button";

interface AddToCartSectionProps {
  disabled?: boolean;
  isAdding?: boolean;
  onAddToCart: (quantity: number) => void;
}

export function AddToCartSection({
  disabled = false,
  isAdding = false,
  onAddToCart,
}: AddToCartSectionProps) {
  const [quantity, setQuantity] = React.useState(1);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(quantity);
    setQuantity(1);
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Select Quantity
      </h3>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Quantity selector */}
        <div className="flex items-center rounded-lg border bg-background">
          <Button
            aria-label="Decrease quantity"
            className="h-10 w-10 rounded-l-lg rounded-r-none"
            disabled={quantity <= 1 || disabled}
            onClick={handleDecrease}
            size="icon"
            variant="ghost"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="flex h-10 w-16 items-center justify-center border-x">
            <span className="text-base font-medium tabular-nums">{quantity}</span>
          </div>

          <Button
            aria-label="Increase quantity"
            className="h-10 w-10 rounded-l-none rounded-r-lg"
            disabled={disabled}
            onClick={handleIncrease}
            size="icon"
            variant="ghost"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to cart button */}
        <Button
          className={cn(
            "flex-1 gap-2 h-10 sm:h-11",
            isAdding && "opacity-70"
          )}
          disabled={disabled || isAdding}
          onClick={handleAddToCart}
          size="lg"
        >
          {isAdding ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {isAdding ? "Adding to Cart..." : "Add to Cart"}
        </Button>
      </div>

      {/* Quick info */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="text-green-600">✓</span> Free shipping over 100 EGP
        </span>
        <span className="flex items-center gap-1">
          <span className="text-green-600">✓</span> Secure checkout
        </span>
        <span className="flex items-center gap-1">
          <span className="text-green-600">✓</span> Easy returns
        </span>
      </div>
    </div>
  );
}
