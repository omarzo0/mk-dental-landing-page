"use client";

import { Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

interface ProductDetailsTabsProps {
  features: string[];
  packageContents: string[];
  specs: Record<string, string>;
}

export function ProductDetailsTabs({
  features,
  packageContents,
  specs,
}: ProductDetailsTabsProps) {
  return (
    <Tabs defaultValue="features" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="contents">Package</TabsTrigger>
      </TabsList>

      {/* Features Tab */}
      <TabsContent value="features" className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {features.map((feature, index) => (
                <li
                  key={`feature-${index}`}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Specifications Tab */}
      <TabsContent value="specs" className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-lg border">
              {Object.entries(specs).map(([key, value], index) => (
                <div
                  key={key}
                  className={`
                    flex flex-col gap-1 p-3 text-sm
                    sm:flex-row sm:items-center sm:justify-between sm:gap-4
                    ${index % 2 === 0 ? "bg-muted/30" : ""}
                  `}
                >
                  <span className="font-medium text-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-muted-foreground sm:text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Package Contents Tab */}
      <TabsContent value="contents" className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">What's in the Box</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {packageContents.map((item, index) => (
                <li
                  key={`content-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="text-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
