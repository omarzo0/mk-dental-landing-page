import Link from "next/link";

import { SEO_CONFIG } from "~/app";

export function HeroBadge() {
  return (
    <Link
      className={`
        inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm
        font-semibold text-primary
      `}
      href="/products"
    >
      <span>🦷 {SEO_CONFIG.slogan}</span>
    </Link>
  );
}
