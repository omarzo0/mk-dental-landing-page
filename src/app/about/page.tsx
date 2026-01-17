"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/ui/primitives/card";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background p-4 md:p-8">
      <section className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold text-center">About MK Dental</h1>
        <p className="text-lg text-muted-foreground text-center">
          A comprehensive world of dental equipment, clinic outfitting, and all the supplies needed for dental practices and hospitals.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Phone:</strong> 01003418089, 01044441663, 062 347 9554</p>
            <p><strong>Email:</strong> <a href="mailto:Marwan.koda@yahoo.com" className="text-primary underline">Marwan.koda@yahoo.com</a></p>
            <p><strong>Address:</strong> Suez, Elshouhda St. front police club</p>
            <p><strong>Working Hours:</strong> 12:00 am – 10:30 pm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warranty</CardTitle>
          </CardHeader>
          <CardContent>
            <p>One‑year warranty on all devices.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Returns and exchanges are accepted within 14 days of purchase with a valid invoice.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no special terms and conditions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping & Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We ship to all governorates. Shipping is free within Suez.</p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" passHref>
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
