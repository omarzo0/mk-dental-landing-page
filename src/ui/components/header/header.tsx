"use client";

import { Heart, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SEO_CONFIG } from "~/app";
import { cn } from "~/lib/cn";
import { useWishlist } from "~/lib/hooks/use-wishlist";
import { Cart } from "~/ui/components/cart";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";

import { ThemeToggle } from "../theme-toggle";

interface HeaderProps {
  children?: React.ReactNode;
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount: wishlistCount } = useWishlist();

  const navigation = [
    { href: "/", name: "Home" },
    { href: "/products", name: "Products" },
    { href: "/about", name: "About" },
    { href: "/contact", name: "Contact" },
  ];

  const renderContent = () => (
    <header
      className={`
        sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur
        supports-[backdrop-filter]:bg-background/60
      `}
    >
      <div
        className={`
          container mx-auto max-w-7xl px-4
          sm:px-6
          lg:px-8
        `}
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link className="flex items-center gap-2" href="/">
              <Image
                src="/logo.jpeg"
                alt="MK Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
             
            </Link>
            <nav
              className={`
                hidden
                md:flex
              `}
            >
              <ul className="flex items-center gap-6">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));

                  return (
                    <li key={item.name}>
                      <Link
                        className={cn(
                          `
                            text-sm font-medium transition-colors
                            hover:text-primary
                          `,
                          isActive
                            ? "font-semibold text-primary"
                            : "text-muted-foreground",
                        )}
                        href={item.href}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon"
              variant="ghost"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <Link href="/wishlist">
              <Button size="icon" variant="ghost" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]"
                    variant="default"
                  >
                    {wishlistCount}
                  </Badge>
                )}
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>
            <Cart />
            <ThemeToggle />

            {/* Auth buttons - hidden on mobile, shown in mobile menu */}
            {showAuth && (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-b px-4 py-3">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  className={cn(
                    "block rounded-md px-3 py-2 text-base font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : `
                        text-foreground
                        hover:bg-muted/50 hover:text-primary
                      `,
                  )}
                  href={item.href}
                  key={item.name}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            {/* Auth links for mobile */}
            {showAuth && (
              <div className="mt-3 flex gap-2 border-t pt-3">
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );

  return renderContent();
}
