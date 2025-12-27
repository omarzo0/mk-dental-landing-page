"use client";

import { Star } from "lucide-react";

import { cn } from "~/lib/cn";
import { Badge } from "~/ui/primitives/badge";

interface ProductInfoProps {
  category: string;
  description: string;
  inStock: boolean;
  name: string;
  originalPrice?: number;
  price: number;
  rating: number;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-EG", {
  currency: "EGP",
  style: "currency",
});

export function ProductInfo({
  category,
  description,
  inStock,
  name,
  originalPrice,
  price,
  rating,
}: ProductInfoProps) {
  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Category badge */}
      <Badge variant="secondary" className="text-xs">
        {category}
      </Badge>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        {name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" aria-label={`Rating ${rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={`star-${i}`}
              className={cn(
                "h-5 w-5",
                i < Math.floor(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : i < rating
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)} rating
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground sm:text-4xl">
          {CURRENCY_FORMATTER.format(price)}
        </span>
        {originalPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through sm:text-xl">
              {CURRENCY_FORMATTER.format(originalPrice)}
            </span>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Save {discountPercentage}%
            </Badge>
          </>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            inStock ? "bg-green-500" : "bg-red-500"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            inStock ? "text-green-600" : "text-red-500"
          )}
        >
          {inStock ? "In Stock - Ready to Ship" : "Currently Out of Stock"}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}
