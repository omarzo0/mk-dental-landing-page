"use client";

import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "~/lib/hooks/use-cart";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "~/ui/primitives/card";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, itemCount } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleMoveToCart = (item: (typeof items)[0]) => {
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      },
      1
    );
    removeItem(item.id);
    toast.success(`${item.name} moved to cart`);
  };

  const handleRemoveItem = (item: (typeof items)[0]) => {
    removeItem(item.id);
    toast.success(`${item.name} removed from wishlist`);
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addToCart(
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
        },
        1
      );
    });
    clearWishlist();
    toast.success("All items moved to cart");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 sm:py-10">
        <div className="container px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/products"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Wishlist
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {itemCount === 0
                    ? "Your wishlist is empty"
                    : `${itemCount} item${itemCount !== 1 ? "s" : ""} saved`}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMoveAllToCart}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Move All to Cart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearWishlist();
                    toast.success("Wishlist cleared");
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Wishlist items */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Your wishlist is empty</h3>
              <p className="mb-6 max-w-md text-sm text-muted-foreground">
                Save items you love by clicking the heart icon on any product.
                They'll appear here for easy access later.
              </p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div
              className={`
                mx-auto grid max-w-5xl grid-cols-1 gap-4
                sm:grid-cols-2 sm:gap-5
                lg:grid-cols-3 lg:gap-6
              `}
            >
              {items.map((item) => {
                const discount = item.originalPrice
                  ? Math.round(
                      ((item.originalPrice - item.price) / item.originalPrice) *
                        100
                    )
                  : 0;

                return (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl py-0"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove from wishlist</span>
                    </button>

                    {/* Image */}
                    <Link href={`/products/${item.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        {discount > 0 && (
                          <Badge className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground">
                            -{discount}%
                          </Badge>
                        )}
                        <Image
                          alt={item.name}
                          src={item.image}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <Link href={`/products/${item.id}`}>
                        <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary sm:text-base">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.category}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-base font-bold text-foreground sm:text-lg">
                          {item.price.toFixed(2)} EGP
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {item.originalPrice.toFixed(2)} EGP
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Move to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
