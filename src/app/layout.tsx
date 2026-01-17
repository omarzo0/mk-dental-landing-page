import type { Metadata } from "next";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";

import { SEO_CONFIG } from "~/app";
import { AuthProvider } from "~/lib/hooks/use-auth";
import { CartProvider } from "~/lib/hooks/use-cart";
import { CompareProvider } from "~/lib/hooks/use-compare";
import { RecentlyViewedProvider } from "~/lib/hooks/use-recently-viewed";
import { WishlistProvider } from "~/lib/hooks/use-wishlist";
import "~/css/globals.css";
import { LayoutWrapper } from "~/ui/components/layout-wrapper";
import { ThemeProvider } from "~/ui/components/theme-provider";
import { Toaster } from "~/ui/primitives/sonner";


const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mk-dental.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SEO_CONFIG.fullName,
    template: `%s | ${SEO_CONFIG.name}`,
  },
  description: SEO_CONFIG.description,
  keywords: ["dental tools", "dental equipment", "dental instruments", "dentistry", "medical supplies"],
  authors: [{ name: SEO_CONFIG.name }],
  creator: SEO_CONFIG.name,
  publisher: SEO_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: SEO_CONFIG.name,
    title: SEO_CONFIG.fullName,
    description: SEO_CONFIG.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.fullName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.fullName,
    description: SEO_CONFIG.description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          min-h-screen bg-gradient-to-br from-white to-slate-100
          text-neutral-900 antialiased
          selection:bg-primary/80
          dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-100
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <CompareProvider>
                    <LayoutWrapper>{children}</LayoutWrapper>
                    <Toaster />
                  </CompareProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
