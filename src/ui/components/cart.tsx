import { cn } from "~/lib/cn";

import { CartClient } from "./cart-client";

export interface CartItem {
  category: string;
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  className?: string;
}

const mockCart: CartItem[] = [
  {
    category: "Diagnostic Instruments",
    id: "1",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&auto=format&fit=crop&q=60",
    name: "Professional Dental Mirror Set",
    price: 69.99,
    quantity: 1,
  },
  {
    category: "Surgical Instruments",
    id: "2",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60",
    name: "Dental Extraction Forceps Kit",
    price: 249.99,
    quantity: 1,
  },
];

export function Cart({ className }: CartProps) {
  return (
    <div className={cn("relative", className)}>
      {/* // TODO: Fetch cart from e.g. LocalStorage and/or database */}
      <CartClient className={cn("", className)} mockCart={mockCart} />
    </div>
  );
}
