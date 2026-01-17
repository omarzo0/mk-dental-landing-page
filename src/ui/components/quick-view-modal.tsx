"use client";

import { Eye, Heart, ShoppingCart, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "~/lib/cn";
import { useCart } from "~/lib/hooks/use-cart";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/ui/primitives/dialog";

import { resolveImageUrl } from "~/lib/image-utils";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    isActive: boolean;
    discountedPrice?: number;
  };
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
}

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = React.useState(1);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const hasDiscount = !!(product.discount?.isActive && product.discount?.discountedPrice && product.discount.discountedPrice < product.price);
  const displayPrice = hasDiscount ? product.discount!.discountedPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : product.originalPrice;

  const discountValue = hasDiscount
    ? (product.discount!.type === "percentage"
      ? product.discount!.value
      : Math.round(((product.price - product.discount!.discountedPrice!) / product.price) * 100))
    : 0;

  const resolvedImage = resolveImageUrl(product.image);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: resolvedImage,
      category: product.category,
    }, quantity);
    toast.success(`Added ${quantity} item(s) to cart`);
    onOpenChange(false);
    setQuantity(1);
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: displayPrice,
        originalPrice: originalPrice,
        image: resolvedImage,
        category: product.category,
      });
      toast.success("Added to wishlist");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square bg-muted">
            <Image
              src={resolvedImage}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
            {discountValue > 0 && (
              <Badge className="absolute top-4 left-4" variant="destructive">
                -{discountValue}%
              </Badge>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg">Out of Stock</Badge>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= product.rating!
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold">{displayPrice.toFixed(2)} EGP</span>
                {originalPrice && originalPrice > displayPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {originalPrice.toFixed(2)} EGP
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    product.inStock ? "bg-green-500" : "bg-red-500"
                  )}
                />
                <span className={cn(
                  "text-sm",
                  product.inStock ? "text-green-600" : "text-red-600"
                )}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      inWishlist && "fill-red-500 text-red-500"
                    )}
                  />
                </Button>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/products/${product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
