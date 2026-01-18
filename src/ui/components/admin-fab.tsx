"use client";

import { LayoutDashboard, Package, Settings, ShoppingCart, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "~/lib/hooks/use-auth";
import { cn } from "~/lib/cn";
import { Button } from "~/ui/primitives/button";

const quickLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminFAB() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for authenticated admin users
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Quick Links Menu */}
      <div
        className={cn(
          "flex flex-col gap-2 transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-full bg-card border shadow-lg pl-4 pr-5 py-2.5 hover:bg-accent transition-colors group"
          >
            <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Main FAB Button */}
      <Button
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="flex flex-col items-center">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[9px] font-medium mt-0.5">Admin</span>
          </div>
        )}
      </Button>
    </div>
  );
}
