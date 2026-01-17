"use client";

import { Eye, GitCompare, Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "~/lib/cn";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardFooter } from "~/ui/primitives/card";
import { resolveImageUrl } from "~/lib/image-utils";

type ProductCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError"
> & {
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  onAddToCompare?: (productId: string) => void;
  isInWishlist?: boolean;
  isInCompare?: boolean;
  product: {
    category: string;
    id: string;
    _id?: string;
    image: string;
    inStock?: boolean;
    name: string;
    originalPrice?: number;
    price: number;
    discountedPrice?: number;
    discount?: {
      type: "percentage" | "fixed";
      value: number;
      isActive: boolean;
      discountedPrice?: number;
    };
    rating?: number;
    brand?: string;
    reviews?: number;
    quantity?: number;
  };
  variant?: "compact" | "default";
  viewMode?: "grid" | "list";
};

export function ProductCard({
  className,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onAddToCompare,
  isInWishlist: isInWishlistProp = false,
  isInCompare = false,
  product,
  variant = "default",
  viewMode = "grid",
  ...props
}: ProductCardProps) {
  // Determine stock status based on quantity if present
  const isOutOfStock = typeof product.quantity === "number" ? product.quantity === 0 : product.inStock === false;
  const inStock = !isOutOfStock;
  const [isHovered, setIsHovered] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const { toggleItem, isInWishlist: checkIsInWishlist } = useWishlist();
  const isInWishlist = checkIsInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart) {
      setIsAddingToCart(true);
      setTimeout(() => {
        onAddToCart(product.id);
        setIsAddingToCart(false);
      }, 600);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    toggleItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image,
      category: product.category,
      originalPrice: originalPrice,
    });

    if (isInWishlist) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist");
    }

    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView(product.id);
    }
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCompare) {
      onAddToCompare(product.id);
    }
  };

  const hasDiscount = !!(product.discount?.isActive && product.discount?.discountedPrice && product.discount.discountedPrice < product.price);
  const displayPrice = hasDiscount ? product.discount!.discountedPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : product.originalPrice;

  const discountValue = hasDiscount
    ? (product.discount!.type === "percentage"
      ? product.discount!.value
      : Math.round(((product.price - product.discount!.discountedPrice!) / product.price) * 100))
    : 0;

  const renderStars = () => {
    const rating = product.rating ?? 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            className={cn(
              "h-3 w-3 sm:h-4 sm:w-4",
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "stroke-muted/40 text-muted"
            )}
            key={`star-${product.id}-position-${i + 1}`}
          />
        ))}
        {rating > 0 && (
          <span className="ml-1 text-[10px] text-muted-foreground sm:text-xs">
            {rating.toFixed(1)}
            {product.reviews && ` (${product.reviews})`}
          </span>
        )}
      </div>
    );
  };

  // List view layout
  if (viewMode === "list") {
    return (
      <div className={cn("group", className)} {...props}>
        <Card
          className="relative overflow-hidden rounded-lg transition-all duration-200 hover:shadow-md"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex gap-4 p-4">
            {/* Image */}
            <Link href={`/products/${product.id}`} className="relative h-10 w-10 flex-shrink-0">
              <Image
                alt={product.name}
                className="object-cover rounded-md"
                fill
                sizes="18px"
                src={resolveImageUrl(product.image)}
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes("/placeholder.svg")) return;
                  target.src = "/placeholder.svg";
                }}
              />
              {discountValue > 0 && (
                <Badge className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-xs">
                  -{discountValue}%
                </Badge>
              )}
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-2 text-xs">
                    {product.category}
                  </Badge>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium hover:text-primary line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
                  )}
                  <div className="mt-2">{renderStars()}</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{displayPrice.toFixed(2)} EGP</span>
                  {originalPrice && originalPrice > displayPrice && (
                    <span className="block text-sm text-muted-foreground line-through">
                      {originalPrice.toFixed(2)} EGP
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!inStock || isAddingToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAddingToCart ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button variant="outline" size="icon" onClick={handleAddToWishlist}>
                  <Heart className={cn("h-4 w-4", isInWishlist && "fill-destructive text-destructive")} />
                </Button>
                {onQuickView && (
                  <Button variant="outline" size="icon" onClick={handleQuickView}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onAddToCompare && (
                  <Button variant="outline" size="icon" onClick={handleAddToCompare} disabled={isInCompare}>
                    <GitCompare className={cn("h-4 w-4", isInCompare && "text-primary")} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("group", className)} {...props}>
      <Link href={`/products/${product.id}`}>
        <Card
          className={cn(
            `
              relative h-full overflow-hidden rounded-lg py-0 transition-all
              duration-200 ease-in-out
              hover:shadow-md
            `,
            isHovered && "ring-1 ring-primary/20"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-32 sm:h-40 w-full overflow-hidden rounded-t-lg bg-muted/30">
            {product.image && (
              <Image
                alt={product.name}
                className={cn(
                  "object-cover transition-transform duration-300 ease-in-out",
                  isHovered && "scale-105"
                )}
                fill
                sizes="(max-width: 368px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={resolveImageUrl(product.image)}
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes("/placeholder.svg")) return;
                  target.src = "/placeholder.svg";
                }}
              />
            )}

            {/* Stock badge */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
              </div>
            )}

            {/* Category badge */}
            <Badge
              className={`
                absolute top-1 left-1 bg-background/80 backdrop-blur-sm text-[9px] max-w-[70%] truncate px-1.5 py-0.5
                sm:text-[10px] sm:top-1.5 sm:left-1.5 sm:px-2 sm:py-0.5
                md:text-xs md:top-2 md:left-2 md:max-w-none
              `}
              variant="outline"
            >
              {product.category}
            </Badge>

            {/* Discount badge */}
            {discountValue > 0 && (
              <Badge
                className={`
                absolute top-1 right-1 bg-destructive text-[9px] px-1 py-0.5
                sm:text-[10px] sm:top-1.5 sm:right-1.5 sm:px-1.5
                md:text-xs md:top-2 md:right-2
                text-destructive-foreground
              `}
              >
                -{discountValue}%
              </Badge>
            )}

            {/* Action buttons */}
            <div
              className={cn(
                "absolute bottom-2 left-2 right-2 flex justify-center gap-2 transition-all duration-300",
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
            >
              {onQuickView && (
                <Button
                  className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm"
                  onClick={handleQuickView}
                  size="icon"
                  variant="outline"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Quick view</span>
                </Button>
              )}
              {onAddToCompare && (
                <Button
                  className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm"
                  onClick={handleAddToCompare}
                  size="icon"
                  variant="outline"
                  disabled={isInCompare}
                >
                  <GitCompare className={cn("h-4 w-4", isInCompare && "text-primary")} />
                  <span className="sr-only">Add to compare</span>
                </Button>
              )}
              <Button
                className={cn(
                  "h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm",
                  isInWishlist && "text-destructive"
                )}
                onClick={handleAddToWishlist}
                size="icon"
                variant="outline"
              >
                <Heart className={cn("h-4 w-4", isInWishlist && "fill-destructive text-destructive")} />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </div>
          </div>

          <CardContent className="p-2 pt-2 sm:p-3 sm:pt-3">
            {/* Product name with line clamp */}
            <h3
              className={`
                line-clamp-2 text-xs font-medium leading-tight transition-colors
                sm:text-sm
                group-hover:text-primary
              `}
            >
              {product.name}
            </h3>

            {variant === "default" && (
              <>
                <div className="mt-1 hidden sm:block">{renderStars()}</div>
                <div className="mt-1 flex flex-col gap-0 sm:mt-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1 md:mt-2 md:gap-1.5">
                  <span className="text-xs font-semibold text-foreground sm:text-sm">
                    {displayPrice.toFixed(2)} EGP
                  </span>
                  {originalPrice && originalPrice > displayPrice ? (
                    <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
                      {originalPrice.toFixed(2)} EGP
                    </span>
                  ) : null}
                </div>
              </>
            )}
          </CardContent>

          {variant === "default" && (
            <CardFooter className="p-2 pt-0 sm:p-3 sm:pt-0">
              <Button
                className={cn(
                  "w-full gap-1 text-[10px] h-7 transition-all sm:gap-1.5 sm:text-xs sm:h-8",
                  isAddingToCart && "opacity-70"
                )}
                disabled={isAddingToCart}
                onClick={handleAddToCart}
                size="sm"
              >
                {isAddingToCart ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent sm:h-4 sm:w-4" />
                ) : (
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                Cart
              </Button>
            </CardFooter>
          )}

          {variant === "compact" && (
            <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0">
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <span className="text-sm font-medium text-foreground sm:text-base">
                    {displayPrice.toFixed(2)} EGP
                  </span>
                  {originalPrice && originalPrice > displayPrice ? (
                    <span className="text-xs text-muted-foreground line-through sm:text-sm">
                      {originalPrice.toFixed(2)} EGP
                    </span>
                  ) : null}
                </div>
                <Button
                  className="h-8 w-8 rounded-full"
                  disabled={isAddingToCart}
                  onClick={handleAddToCart}
                  size="icon"
                  variant="ghost"
                >
                  {isAddingToCart ? (
                    <div
                      className={`
                        h-4 w-4 animate-spin rounded-full border-2
                        border-primary border-t-transparent
                      `}
                    />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  <span className="sr-only">Add to cart</span>
                </Button>
              </div>
            </CardFooter>
          )}

          {isOutOfStock && (
            <div
              className={`
                absolute inset-0 flex items-center justify-center
                bg-background/50
              `}
            >
              <Badge className="px-3 py-1 text-sm" variant="destructive">
                Out of Stock
              </Badge>
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
}
