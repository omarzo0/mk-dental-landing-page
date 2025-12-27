import { ArrowRight, Clock, Package, ShoppingBag, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroBadge } from "~/ui/components/hero-badge";
import { ProductCard } from "~/ui/components/product-card";
import { TestimonialsSection } from "~/ui/components/testimonials/testimonials-with-marquee";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";

import { categories, featuredProductsHomepage, packages, testimonials } from "./mocks";

const featuresWhyChooseUs = [
  {
    description:
      "Free shipping on all orders over 100 EGP. Fast and reliable delivery for dental professionals nationwide.",
    icon: <Truck className="h-6 w-6 text-primary" />,
    title: "Free Shipping",
  },
  {
    description:
      "All instruments are sterilization-ready and meet FDA standards. Autoclave safe up to 134°C.",
    icon: <ShoppingBag className="h-6 w-6 text-primary" />,
    title: "Medical Grade Quality",
  },
  {
    description:
      "Expert dental professionals available to help with product selection and technical questions.",
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Expert Support",
  },
  {
    description:
      "Lifetime warranty on all hand instruments. We stand behind the quality of our products.",
    icon: <Star className="h-6 w-6 text-primary" />,
    title: "Lifetime Warranty",
  },
];

export default function HomePage() {
  return (
    <>
      <main
        className={`
          flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50
          via-muted/25 to-background
        `}
      >
        {/* Hero Section */}
        <section
          className={`
            relative overflow-hidden py-24
            md:py-32
          `}
        >
          <div
            className={`
              bg-grid-black/[0.02] absolute inset-0
              bg-[length:20px_20px]
            `}
          />
          <div
            className={`
              relative z-10 container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div
              className={`
                grid items-center gap-10
                lg:grid-cols-2 lg:gap-12
              `}
            >
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <HeroBadge />

                  <h1
                    className={`
                      font-display text-4xl leading-tight font-bold
                      tracking-tight text-foreground
                      sm:text-5xl
                      md:text-6xl
                      lg:leading-[1.1]
                    `}
                  >
                    Professional{" "}
                    <span
                      className={`
                        bg-gradient-to-r from-primary to-primary/70 bg-clip-text
                        text-transparent
                      `}
                    >
                      Dental Tools & Equipment
                    </span>
                  </h1>
                  <p
                    className={`
                      max-w-[700px] text-lg text-muted-foreground
                      md:text-xl
                    `}
                  >
                    Premium quality dental instruments for professionals.
                    Trusted by dentists worldwide with fast delivery and expert support.
                  </p>
                </div>
                <div
                  className={`
                    flex flex-col gap-3
                    sm:flex-row
                  `}
                >
                  <Link href="/products" className="w-full sm:w-auto">
                    <Button
                      className={`
                        h-12 w-full gap-1.5 px-8 transition-colors duration-200 sm:w-auto
                      `}
                      size="lg"
                    >
                      Browse Instruments <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/products" className="w-full sm:w-auto">
                    <Button
                      className="h-12 w-full px-8 transition-colors duration-200 sm:w-auto"
                      size="lg"
                      variant="outline"
                    >
                      View Catalog
                    </Button>
                  </Link>
                </div>
                <div
                  className={`
                    flex flex-wrap gap-5 text-sm text-muted-foreground
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-5 w-5 text-primary/70" />
                    <span>Free shipping over 50 EGP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-5 w-5 text-primary/70" />
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </div>
              <div
                className={`
                  relative mx-auto hidden aspect-square w-full max-w-md
                  overflow-hidden rounded-xl border shadow-lg
                  lg:block
                `}
              >
                <div
                  className={`
                    absolute inset-0 z-10 bg-gradient-to-tr from-primary/20
                    via-transparent to-transparent
                  `}
                />
                <Image
                  alt="Professional dental instruments"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60"
                />
              </div>
            </div>
          </div>
          <div
            className={`
              absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent
              via-primary/20 to-transparent
            `}
          />
        </section>

        {/* Featured Categories */}
        <section
          className={`
            py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
                Shop by Category
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                Find the perfect device for your needs from our curated
                collections
              </p>
            </div>
            <div
              className={`
                grid grid-cols-2 gap-4
                md:grid-cols-4 md:gap-6
              `}
            >
              {categories.map((category) => (
                <Link
                  aria-label={`Browse ${category.name} products`}
                  className={`
                    group relative flex flex-col space-y-4 overflow-hidden
                    rounded-2xl border bg-card shadow transition-all
                    duration-300
                    hover:shadow-lg
                  `}
                  href={`/products?category=${category.name.toLowerCase()}`}
                  key={category.name}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className={`
                        absolute inset-0 z-10 bg-gradient-to-t
                        from-background/80 to-transparent
                      `}
                    />
                    <Image
                      alt={category.name}
                      className={`
                        object-cover transition duration-300
                        group-hover:scale-105
                      `}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      src={category.image}
                    />
                  </div>
                  <div className="relative z-20 -mt-6 p-4">
                    <div className="mb-1 text-lg font-medium">
                      {category.name}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.productCount} products
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section
          className={`
            bg-muted/50 py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
                Featured Products
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                Check out our latest and most popular tech items
              </p>
            </div>
            <div
              className={`
                grid grid-cols-1 gap-6
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              `}
            >
              {featuredProductsHomepage.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link href="/products">
                <Button className="group h-12 px-8" size="lg" variant="outline">
                  View All Products
                  <ArrowRight
                    className={`
                      ml-2 h-4 w-4 transition-transform duration-300
                      group-hover:translate-x-1
                    `}
                  />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Special Packages Section */}
        <section
          className={`
            py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
                Special Packages
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                Save more with our curated bundles - perfect for clinics and dental professionals
              </p>
            </div>
            <div
              className={`
                mx-auto grid max-w-5xl grid-cols-1 gap-6
                md:grid-cols-2
                lg:grid-cols-3
              `}
            >
              {packages.map((pkg) => (
                <Link
                  href={`/products?package=${pkg.id}`}
                  key={pkg.id}
                  className="group"
                >
                  <Card
                    className={`
                      relative h-full overflow-hidden rounded-2xl border
                      bg-card py-0 shadow transition-all duration-300
                      hover:shadow-xl hover:-translate-y-1
                    `}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <div
                        className={`
                          absolute top-3 right-3 z-20 rounded-full bg-primary
                          px-3 py-1 text-xs font-semibold text-primary-foreground
                        `}
                      >
                        {pkg.badge}
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div
                        className={`
                          absolute inset-0 z-10 bg-gradient-to-t
                          from-background via-background/20 to-transparent
                        `}
                      />
                      <Image
                        alt={pkg.name}
                        className={`
                          object-cover transition duration-300
                          group-hover:scale-105
                        `}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={pkg.image}
                      />
                    </div>

                    {/* Content */}
                    <CardHeader className="relative z-20 -mt-8 pb-2">
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {pkg.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-4">
                      {/* Items included */}
                      <div className="mb-3 flex flex-wrap gap-1">
                        {pkg.items.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className={`
                              rounded-full bg-muted px-2 py-0.5 text-xs
                              text-muted-foreground
                            `}
                          >
                            {item}
                          </span>
                        ))}
                        {pkg.items.length > 3 && (
                          <span
                            className={`
                              rounded-full bg-muted px-2 py-0.5 text-xs
                              text-muted-foreground
                            `}
                          >
                            +{pkg.items.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-foreground">
                              {pkg.price.toFixed(2)} EGP
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              {pkg.originalPrice.toFixed(2)} EGP
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              Save {pkg.savings} EGP
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {pkg.itemCount} items
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link href="/products?view=packages">
                <Button className="group h-12 px-8" size="lg" variant="outline">
                  View All Packages
                  <ArrowRight
                    className={`
                      ml-2 h-4 w-4 transition-transform duration-300
                      group-hover:translate-x-1
                    `}
                  />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className={`
            py-12
            md:py-16
          `}
          id="features"
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
                Why Choose Us
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p
                className={`
                  mt-4 max-w-2xl text-center text-muted-foreground
                  md:text-lg
                `}
              >
                We offer the best shopping experience with premium features
              </p>
            </div>
            <div
              className={`
                grid gap-8
                md:grid-cols-2
                lg:grid-cols-4
              `}
            >
              {featuresWhyChooseUs.map((feature) => (
                <Card
                  className={`
                    rounded-2xl border-none bg-background shadow transition-all
                    duration-300
                    hover:shadow-lg
                  `}
                  key={feature.title}
                >
                  <CardHeader className="pb-2">
                    <div
                      className={`
                        mb-3 flex h-12 w-12 items-center justify-center
                        rounded-full bg-primary/10
                      `}
                    >
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          className={`
            bg-muted/50 py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <TestimonialsSection
              className="py-0"
              description="Don't just take our word for it - hear from our satisfied customers"
              testimonials={testimonials}
              title="What Our Customers Say"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section
          className={`
            py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div
              className={`
                relative overflow-hidden rounded-xl bg-primary/10 p-8 shadow-lg
                md:p-12
              `}
            >
              <div
                className={`
                  bg-grid-white/[0.05] absolute inset-0
                  bg-[length:16px_16px]
                `}
              />
              <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2
                  className={`
                    font-display text-3xl leading-tight font-bold tracking-tight
                    md:text-4xl
                  `}
                >
                  Ready to Upgrade Your Tech?
                </h2>
                <p
                  className={`
                    mt-4 text-lg text-muted-foreground
                    md:text-xl
                  `}
                >
                  Join thousands of satisfied customers and experience the best
                  tech products on the market. Sign up today for exclusive deals
                  and offers.
                </p>
                <div
                  className={`
                    mt-6 flex flex-col items-center justify-center gap-3
                    sm:flex-row
                  `}
                >
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button
                      className="h-12 w-full px-8 transition-colors duration-200 sm:w-auto"
                      size="lg"
                    >
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link href="/products" className="w-full sm:w-auto">
                    <Button
                      className="h-12 w-full px-8 transition-colors duration-200 sm:w-auto"
                      size="lg"
                      variant="outline"
                    >
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
