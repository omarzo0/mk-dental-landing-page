"use client";

import { ShoppingCart } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useCart } from "~/lib/hooks/use-cart";
import { Button } from "~/ui/primitives/button";

interface AddToCartButtonProps {
    item: {
        id: string;
        name: string;
        price: number;
        image: string;
        category: string;
    };
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    disabled?: boolean;
    text?: string;
}

export function AddToCartButton({
    item,
    variant = "default",
    size = "lg",
    className,
    disabled,
    text = "Add to Cart"
}: AddToCartButtonProps) {
    const { addItem, openCart } = useCart();
    const [isAdding, setIsAdding] = React.useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
        setTimeout(() => {
            addItem(item, 1);
            openCart();
            toast.success(`${item.name} added to cart`);
            setIsAdding(false);
        }, 600);
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            disabled={disabled || isAdding}
            onClick={handleAddToCart}
        >
            {isAdding ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-primary-foreground border-t-transparent" />
            ) : (
                <ShoppingCart className="mr-2 h-5 w-5" />
            )}
            {isAdding ? "Adding..." : text}
        </Button>
    );
}
