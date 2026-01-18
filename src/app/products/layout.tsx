import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Professional Dental Instruments",
    description:
        "Browse our extensive catalog of high-quality dental tools, mirrors, forceps, and surgical instruments. Premium quality for dental professionals.",
    keywords: [
        "dental instruments",
        "dental tools catalog",
        "dental mirrors",
        "dental forceps",
        "surgical instruments",
        "dental equipment shop",
    ],
    openGraph: {
        title: "Professional Dental Instruments | MK Dental",
        description:
            "Browse our extensive catalog of high-quality dental tools, mirrors, forceps, and surgical instruments.",
        type: "website",
    },
    alternates: {
        canonical: "/products",
    },
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
