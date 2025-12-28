"use client";

import * as React from "react";

interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  viewedAt: number;
}

interface RecentlyViewedContextType {
  products: RecentlyViewedProduct[];
  addProduct: (product: Omit<RecentlyViewedProduct, "viewedAt">) => void;
  clearHistory: () => void;
}

const RecentlyViewedContext = React.createContext<RecentlyViewedContextType | undefined>(
  undefined
);

const STORAGE_KEY = "mk-dental-recently-viewed";
const MAX_ITEMS = 10;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<RecentlyViewedProduct[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentlyViewedProduct[];
        // Filter out products viewed more than 30 days ago
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((p) => p.viewedAt > thirtyDaysAgo);
        setProducts(filtered);
      } catch (e) {
        console.error("Failed to parse recently viewed:", e);
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

  const addProduct = React.useCallback(
    (product: Omit<RecentlyViewedProduct, "viewedAt">) => {
      setProducts((prev) => {
        // Remove if already exists
        const filtered = prev.filter((p) => p.id !== product.id);
        // Add to beginning
        const updated = [
          { ...product, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_ITEMS);
        return updated;
      });
    },
    []
  );

  const clearHistory = React.useCallback(() => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ products, addProduct, clearHistory }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = React.useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
