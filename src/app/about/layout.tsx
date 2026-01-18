import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us",
    description:
        "Learn about MK Dental - your trusted supplier of professional dental equipment in Suez, Egypt. Contact us for high-quality dental tools with warranty.",
    keywords: [
        "about MK Dental",
        "dental equipment supplier Egypt",
        "dental tools Suez",
        "dental equipment company",
    ],
    openGraph: {
        title: "About MK Dental",
        description:
            "Your trusted supplier of professional dental equipment in Suez, Egypt. Quality dental tools with warranty.",
        type: "website",
    },
    alternates: {
        canonical: "/about",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
