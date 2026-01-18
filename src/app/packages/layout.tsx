import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Special Packages & Bundles",
    description:
        "Save more with our curated dental equipment bundles. Special packages designed for dental clinics and professionals with significant savings.",
    keywords: [
        "dental packages",
        "dental bundles",
        "dental equipment sets",
        "dental clinic starter kit",
        "dental tool bundles",
        "discounted dental equipment",
    ],
    openGraph: {
        title: "Special Packages & Bundles | MK Dental",
        description:
            "Save more with our curated dental equipment bundles designed for dental clinics and professionals.",
        type: "website",
    },
    alternates: {
        canonical: "/packages",
    },
};

export default function PackagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
