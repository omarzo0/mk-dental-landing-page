"use client";

import { ArrowLeft, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { cn } from "~/lib/cn";
import { useCart } from "~/lib/hooks/use-cart";
import { useCompare } from "~/lib/hooks/use-compare";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";

export default function ComparePage() {
  const { products, removeProduct, clearAll } = useCompare();
  const { addItem } = useCart();

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    toast.success("Added to cart");
  };

  if (products.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Compare Products</h1>
          <p className="text-muted-foreground mb-8">
            You haven't added any products to compare yet.
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Feature comparison rows
  const comparisonFeatures = [
    { label: "Price", getValue: (p: typeof products[0]) => `$${p.price}` },
    {
      label: "Original Price",
      getValue: (p: typeof products[0]) =>
        p.originalPrice ? `$${p.originalPrice}` : "-",
    },
    {
      label: "Savings",
      getValue: (p: typeof products[0]) =>
        p.originalPrice
          ? `$${(p.originalPrice - p.price).toFixed(2)} (${Math.round(
              ((p.originalPrice - p.price) / p.originalPrice) * 100
            )}%)`
          : "-",
    },
    { label: "Category", getValue: (p: typeof products[0]) => p.category },
    {
      label: "Rating",
      getValue: (p: typeof products[0]) =>
        p.rating ? `${p.rating} / 5` : "No ratings",
    },
    {
      label: "Availability",
      getValue: (p: typeof products[0]) =>
        p.inStock ? "In Stock" : "Out of Stock",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Compare Products</h1>
          <p className="text-muted-foreground">
            Comparing {products.length} product(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Add More
            </Link>
          </Button>
          <Button variant="destructive" onClick={clearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Product Headers */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeProduct(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6">
                  <div className="relative aspect-square mb-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <Badge variant="secondary" className="mt-2">
                    {product.category}
                  </Badge>
                  <div className="mt-4">
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Rows */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {comparisonFeatures.map((feature) => (
                  <div
                    key={feature.label}
                    className="grid gap-4 py-4"
                    style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                  >
                    <div className="font-medium">{feature.label}</div>
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className={cn(
                          "text-center",
                          feature.label === "Availability" &&
                            (product.inStock ? "text-green-600" : "text-red-600")
                        )}
                      >
                        {feature.getValue(product)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
