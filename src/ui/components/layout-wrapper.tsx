"use client";

import { usePathname } from "next/navigation";

import { AdminFAB } from "~/ui/components/admin-fab";
import { Footer } from "~/ui/components/footer";
import { Header } from "~/ui/components/header/header";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header showAuth={true} />}
      <main className={`flex min-h-screen flex-col`}>{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <AdminFAB />}
    </>
  );
}
