"use client";

import * as React from "react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface WishlistItem {
  category: string;
  id: string;
  image: string;
  name: string;
  originalPrice?: number;
  price: number;
}

export interface WishlistContextType {
  addItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  itemCount: number;
  items: WishlistItem[];
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
}

/* -------------------------------------------------------------------------- */
/*                                Context                                     */
/* -------------------------------------------------------------------------- */

const WishlistContext = React.createContext<WishlistContextType | undefined>(
  undefined
);

/* -------------------------------------------------------------------------- */
/*                         Local-storage helpers                              */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "wishlist";
const DEBOUNCE_MS = 500;

const loadWishlistFromStorage = (): WishlistItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as WishlistItem[];
    }
  } catch (err) {
    console.error("Failed to load wishlist:", err);
  }
  return [];
};

/* -------------------------------------------------------------------------- */
/*                               Provider                                     */
/* -------------------------------------------------------------------------- */

export function WishlistProvider({ children }: React.PropsWithChildren) {
  const [items, setItems] = React.useState<WishlistItem[]>(
    loadWishlistFromStorage
  );

  /* -------------------- Persist to localStorage (debounced) ------------- */
  const saveTimeout = React.useRef<null | ReturnType<typeof setTimeout>>(null);

  React.useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.error("Failed to save wishlist:", err);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [items]);

  /* ----------------------------- Actions -------------------------------- */
  const addItem = React.useCallback((newItem: WishlistItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) return prev;
      return [...prev, newItem];
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleItem = React.useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const isInWishlist = React.useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const clearWishlist = React.useCallback(() => setItems([]), []);

  /* --------------------------- Derived data ----------------------------- */
  const itemCount = items.length;

  /* ----------------------------- Context value -------------------------- */
  const value = React.useMemo<WishlistContextType>(
    () => ({
      addItem,
      clearWishlist,
      isInWishlist,
      itemCount,
      items,
      removeItem,
      toggleItem,
    }),
    [items, addItem, removeItem, toggleItem, isInWishlist, clearWishlist, itemCount]
  );

  return <WishlistContext value={value}>{children}</WishlistContext>;
}

/* -------------------------------------------------------------------------- */
/*                                 Hook                                      */
/* -------------------------------------------------------------------------- */

export function useWishlist(): WishlistContextType {
  const ctx = React.use(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
