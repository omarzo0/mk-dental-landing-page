import { SEO_CONFIG } from "~/app";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-10">
        <div className="container max-w-4xl px-4 md:px-6">
          <h1 className="mb-6 text-3xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mb-8 text-muted-foreground">
            Last updated: December 27, 2025
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using {SEO_CONFIG.name}&apos;s website and services, you agree
                to be bound by these Terms of Service. If you do not agree to these terms,
                please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Products and Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                {SEO_CONFIG.name} provides professional dental instruments and equipment for
                licensed dental professionals. All products are intended for professional
                use only. We reserve the right to refuse service to anyone for any reason
                at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Pricing and Payment</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All prices are listed in US dollars and are subject to change without notice.
                We accept major credit cards and other payment methods as indicated at checkout.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Prices do not include shipping and handling unless otherwise stated</li>
                <li>Applicable taxes will be added at checkout</li>
                <li>Payment is due at the time of purchase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Shipping and Delivery</h2>
              <p className="text-muted-foreground leading-relaxed">
                We ship to addresses within our service area. Delivery times are estimates
                and are not guaranteed. We are not responsible for delays caused by shipping
                carriers or customs processing for international orders.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Returns and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We want you to be completely satisfied with your purchase. Our return policy:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Returns accepted within 30 days of delivery</li>
                <li>Items must be unused and in original packaging</li>
                <li>Customer is responsible for return shipping costs</li>
                <li>Refunds will be processed within 5-7 business days</li>
                <li>Some items may not be eligible for return due to hygiene regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Product Warranty</h2>
              <p className="text-muted-foreground leading-relaxed">
                All dental instruments come with a manufacturer&apos;s warranty against defects
                in materials and workmanship. Warranty periods vary by product. Warranty
                does not cover normal wear and tear, misuse, or damage caused by improper
                handling or sterilization procedures.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                {SEO_CONFIG.name} shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of our products
                or services. Our total liability shall not exceed the amount paid for the
                product or service in question.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website, including text, graphics, logos, images, and
                software, is the property of {SEO_CONFIG.name} and is protected by copyright
                and trademark laws. You may not reproduce, distribute, or create derivative
                works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be
                effective immediately upon posting to the website. Your continued use of
                our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@mk-dental.com" className="text-primary hover:underline">
                  legal@mk-dental.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
