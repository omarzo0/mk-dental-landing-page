"use client";

import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "~/lib/cn";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardFooter } from "~/ui/primitives/card";

type ProductCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError"
> & {
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  product: {
    category: string;
    id: string;
    image: string;
    inStock?: boolean;
    name: string;
    originalPrice?: number;
    price: number;
    rating?: number;
  };
  variant?: "compact" | "default";
};

export function ProductCard({
  className,
  onAddToCart,
  onAddToWishlist,
  product,
  variant = "default",
  ...props
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isInWishlist, setIsInWishlist] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart) {
      setIsAddingToCart(true);
      // Simulate API call
      setTimeout(() => {
        onAddToCart(product.id);
        setIsAddingToCart(false);
      }, 600);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToWishlist) {
      setIsInWishlist(!isInWishlist);
      onAddToWishlist(product.id);
    }
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
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
          </span>
        )}
      </div>
    );
  };

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
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            {product.image && (
              <Image
                alt={product.name}
                className={cn(
                  "object-cover transition-transform duration-300 ease-in-out",
                  isHovered && "scale-105"
                )}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={product.image}
              />
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
            {discount > 0 && (
              <Badge
                className={`
                absolute top-1 right-1 bg-destructive text-[9px] px-1 py-0.5
                sm:text-[10px] sm:top-1.5 sm:right-1.5 sm:px-1.5
                md:text-xs md:top-2 md:right-2
                text-destructive-foreground
              `}
              >
                -{discount}%
              </Badge>
            )}

            {/* Wishlist button */}
            <Button
              className={cn(
                `
                  absolute right-1 bottom-1 z-10 h-6 w-6 rounded-full bg-background/80
                  backdrop-blur-sm transition-opacity duration-300
                  sm:right-1.5 sm:bottom-1.5 sm:h-7 sm:w-7
                  md:right-2 md:bottom-2 md:h-9 md:w-9
                `,
                !isHovered && !isInWishlist && "opacity-0 group-hover:opacity-100"
              )}
              onClick={handleAddToWishlist}
              size="icon"
              type="button"
              variant="outline"
            >
              <Heart
                className={cn(
                  "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4",
                  isInWishlist
                    ? "fill-destructive text-destructive"
                    : "text-muted-foreground"
                )}
              />
              <span className="sr-only">Add to wishlist</span>
            </Button>
          </div>

          <CardContent className="p-2 pt-2 sm:p-3 sm:pt-3 md:p-4 md:pt-4">
            {/* Product name with line clamp */}
            <h3
              className={`
                line-clamp-2 text-xs font-medium leading-tight transition-colors
                sm:text-sm md:text-base
                group-hover:text-primary
              `}
            >
              {product.name}
            </h3>

            {variant === "default" && (
              <>
                <div className="mt-1 hidden sm:block">{renderStars()}</div>
                <div className="mt-1 flex flex-col gap-0 sm:mt-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1 md:mt-2 md:gap-1.5">
                  <span className="text-xs font-semibold text-foreground sm:text-sm md:text-base">
                    {product.price.toFixed(2)} EGP
                  </span>
                  {product.originalPrice ? (
                    <span className="text-[10px] text-muted-foreground line-through sm:text-xs md:text-sm">
                      {product.originalPrice.toFixed(2)} EGP
                    </span>
                  ) : null}
                </div>
              </>
            )}
          </CardContent>

          {variant === "default" && (
            <CardFooter className="p-2 pt-0 sm:p-3 sm:pt-0 md:p-4 md:pt-0">
              <Button
                className={cn(
                  "w-full gap-1 text-[10px] h-7 transition-all sm:gap-1.5 sm:text-xs sm:h-8 md:gap-2 md:text-sm md:h-9",
                  isAddingToCart && "opacity-70"
                )}
                disabled={isAddingToCart}
                onClick={handleAddToCart}
                size="sm"
              >
                {isAddingToCart ? (
                  <div
                    className={`
                      h-3 w-3 animate-spin rounded-full border-2 sm:h-4 sm:w-4
                      border-background border-t-transparent
                    `}
                  />
                ) : (
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="hidden xs:inline">Add to </span>Cart
              </Button>
            </CardFooter>
          )}

          {variant === "compact" && (
            <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0">
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <span className="text-sm font-medium text-foreground sm:text-base">
                    {product.price.toFixed(2)} EGP
                  </span>
                  {product.originalPrice ? (
                    <span className="text-xs text-muted-foreground line-through sm:text-sm">
                      {product.originalPrice.toFixed(2)} EGP
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

          {!product.inStock && (
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
