"use client";

import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { products } from "~/app/mocks";
import { cn } from "~/lib/cn";
import { Button } from "~/ui/primitives/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/ui/primitives/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/ui/primitives/dialog";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Filter products based on search query
  const filteredProducts = React.useMemo(() => {
    if (!query.trim()) return [];
    const searchTerm = query.toLowerCase();
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      )
      .slice(0, 6); // Limit to 6 suggestions
  }, [query]);

  // Get popular/recent searches
  const popularSearches = ["Dental Mirror", "Extraction Forceps", "Scaler", "Dental Kit"];

  // Keyboard shortcut to open search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (productId: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/products/${productId}`);
  };

  const handleSearch = (searchQuery: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search products...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search Products</DialogTitle>
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search products, categories..."
                value={query}
                onValueChange={setQuery}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CommandList className="max-h-[400px]">
              <CommandEmpty>
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No products found.</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => handleSearch(query)}
                  >
                    Search for "{query}" in all products
                  </Button>
                </div>
              </CommandEmpty>

              {/* Product Results */}
              {filteredProducts.length > 0 && (
                <CommandGroup heading="Products">
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => handleSelect(product.id)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.price} EGP</p>
                        {product.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {product.originalPrice} EGP
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {query && (
                    <CommandItem
                      onSelect={() => handleSearch(query)}
                      className="justify-center text-primary cursor-pointer"
                    >
                      View all results for "{query}"
                    </CommandItem>
                  )}
                </CommandGroup>
              )}

              {/* Popular Searches (when no query) */}
              {!query && (
                <CommandGroup heading="Popular Searches">
                  {popularSearches.map((search) => (
                    <CommandItem
                      key={search}
                      value={search}
                      onSelect={() => handleSearch(search)}
                      className="cursor-pointer"
                    >
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      {search}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Categories */}
              {!query && (
                <CommandGroup heading="Browse Categories">
                  {["Diagnostic", "Surgical", "Restorative", "Preventive"].map((category) => (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={() => router.push(`/products?category=${category}`)}
                      className="cursor-pointer"
                    >
                      {category}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
