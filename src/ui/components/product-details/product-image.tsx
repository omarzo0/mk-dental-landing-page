"use client";

import Image from "next/image";

import { Badge } from "~/ui/primitives/badge";

interface ProductImageProps {
  alt: string;
  discountPercentage?: number;
  inStock: boolean;
  src: string;
}

export function ProductImage({
  alt,
  discountPercentage = 0,
  inStock,
  src,
}: ProductImageProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm">
      <Image
        alt={alt}
        className="object-cover transition-transform duration-300 hover:scale-105"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        src={src}
      />
      
      {/* Discount badge */}
      {discountPercentage > 0 && (
        <Badge
          className="absolute top-3 left-3 bg-destructive text-destructive-foreground"
        >
          -{discountPercentage}% OFF
        </Badge>
      )}

      {/* Out of stock overlay */}
      {!inStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Badge variant="destructive" className="text-sm px-4 py-2">
            Out of Stock
          </Badge>
        </div>
      )}
    </div>
  );
}
