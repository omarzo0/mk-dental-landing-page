"use client";

import { GitCompare, Heart, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { useCart } from "~/lib/hooks/use-cart";
import { useCompare } from "~/lib/hooks/use-compare";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Badge } from "~/ui/primitives/badge";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { addProduct: addToCompare, isInCompare } = useCompare();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    toast.success(`${item.name} added to cart`);
  };

  const handleAddToCompare = (item: typeof items[0]) => {
    const product = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: "Dental Supplies",
      rating: 4.5,
      inStock: true,
    };
    addToCompare(product);
  };

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.success(`${name} removed from wishlist`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                items.forEach((item) => handleAddToCart(item));
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add All to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearWishlist();
                toast.success("Wishlist cleared");
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 bg-background/80 hover:bg-background"
                  onClick={() => handleRemove(item.id, item.name)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {item.originalPrice && item.originalPrice > item.price && (
                  <Badge className="absolute left-2 top-2" variant="destructive">
                    {Math.round(
                      ((item.originalPrice - item.price) / item.originalPrice) *
                        100
                    )}
                    % OFF
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-medium hover:text-primary line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddToCompare(item)}
                    disabled={isInCompare(item.id)}
                  >
                    <GitCompare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save items you love by clicking the heart icon on products
              </p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Viewed Section */}
      <Card>
        <CardHeader>
          <CardTitle>You Might Also Like</CardTitle>
          <CardDescription>
            Based on your wishlist items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                id: "rec-1",
                name: "Dental Mirror Set",
                price: 29.99,
                image: "/placeholder.svg",
              },
              {
                id: "rec-2",
                name: "Sterilization Pouches",
                price: 24.99,
                image: "/placeholder.svg",
              },
              {
                id: "rec-3",
                name: "Composite Kit",
                price: 159.99,
                image: "/placeholder.svg",
              },
              {
                id: "rec-4",
                name: "LED Curing Light",
                price: 249.99,
                image: "/placeholder.svg",
              },
            ].map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="mt-2 text-sm font-medium group-hover:text-primary">
                  {product.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
