"use client";

import * as React from "react";

interface CompareProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  inStock: boolean;
  features?: Record<string, string>;
}

interface CompareContextType {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => void;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  isInCompare: (productId: string) => boolean;
  maxProducts: number;
}

const CompareContext = React.createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "mk-dental-compare";
const MAX_PRODUCTS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<CompareProduct[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored) as CompareProduct[]);
      } catch (e) {
        console.error("Failed to parse compare products:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when products change
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isInitialized]);

  const addProduct = React.useCallback((product: CompareProduct) => {
    setProducts((prev) => {
      if (prev.length >= MAX_PRODUCTS) {
        return prev;
      }
      if (prev.some((p) => p.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeProduct = React.useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearAll = React.useCallback(() => {
    setProducts([]);
  }, []);

  const isInCompare = React.useCallback(
    (productId: string) => products.some((p) => p.id === productId),
    [products]
  );

  return (
    <CompareContext.Provider
      value={{
        products,
        addProduct,
        removeProduct,
        clearAll,
        isInCompare,
        maxProducts: MAX_PRODUCTS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = React.useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
