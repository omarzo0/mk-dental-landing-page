import { Award, Building2, Heart, Shield, Users } from "lucide-react";
import Image from "next/image";

import { SEO_CONFIG } from "~/app";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          About {SEO_CONFIG.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your trusted partner in professional dental equipment. We provide
          high-quality instruments to dental professionals worldwide.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="grid gap-8 md:grid-cols-2 items-center mb-16">
        <div className="relative h-80 rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60"
            alt="Dental professional at work"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            At {SEO_CONFIG.name}, we believe that every dental professional
            deserves access to high-quality instruments that help them provide
            the best care for their patients.
          </p>
          <p className="text-muted-foreground">
            Founded by dental professionals, we understand the importance of
            precision, durability, and ergonomics in dental instruments. That&apos;s
            why we carefully select each product in our catalog to meet the
            highest standards of quality.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Quality First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every instrument we sell meets FDA standards and is rigorously
                tested for quality and durability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Customer Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our expert team is here to help you find the right instruments
                for your practice needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Professional Excellence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We partner with leading manufacturers to bring you the best
                instruments available.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Integrity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transparent pricing, honest recommendations, and a commitment to
                your success.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-muted/50 rounded-xl p-8 mb-16">
        <div className="grid gap-8 md:grid-cols-4 text-center">
          <div>
            <p className="text-4xl font-bold text-primary">10,000+</p>
            <p className="text-muted-foreground">Dental Professionals Served</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">500+</p>
            <p className="text-muted-foreground">Products Available</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">15+</p>
            <p className="text-muted-foreground">Years of Experience</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">99%</p>
            <p className="text-muted-foreground">Customer Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center">
        <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Our team of dental professionals is here to help you find the right
          instruments for your practice. Contact us for personalized
          recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@dentalpro.com"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Contact Support
          </a>
          <a
            href="tel:+1-800-DENTAL"
            className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Call: 1-800-DENTAL
          </a>
        </div>
      </div>
    </div>
  );
}
