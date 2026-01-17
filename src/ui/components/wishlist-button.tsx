"use client";

import { Heart } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "~/lib/cn";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { Button } from "~/ui/primitives/button";

interface WishlistButtonProps {
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        category: string;
        originalPrice?: number;
    };
    className?: string;
    variant?: "outline" | "default" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    showText?: boolean;
}

export function WishlistButton({
    product,
    className,
    variant = "outline",
    size = "lg",
    showText = true,
}: WishlistButtonProps) {
    const { toggleItem, isInWishlist } = useWishlist();
    const active = isInWishlist(product.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            originalPrice: product.originalPrice,
        });

        if (active) {
            toast.success("Removed from wishlist");
        } else {
            toast.success("Added to wishlist");
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                "transition-all duration-200",
                active && "border-destructive text-destructive hover:bg-destructive/10",
                className
            )}
            onClick={handleToggle}
        >
            <Heart
                className={cn(
                    "h-5 w-5",
                    active && "fill-destructive",
                    showText && "mr-2"
                )}
            />
            {showText && (active ? "In Wishlist" : "Wishlist")}
        </Button>
    );
}
