"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { Button } from "~/ui/primitives/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/ui/primitives/card";

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const paymentId = searchParams.get("paymentId");
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");

    const [status, setStatus] = React.useState<"processing" | "success" | "error">("processing");
    const [errorMessage, setErrorMessage] = React.useState("");

    React.useEffect(() => {
        if (!paymentId || !orderNumber) {
            setStatus("error");
            setErrorMessage("Missing payment information");
            return;
        }

        const processPayment = async () => {
            try {
                const response = await fetch(`/api/user/payments/guest/${paymentId}/process`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email || undefined,
                        status: "pending"
                    }),
                });

                const data = await response.json() as { success: boolean; message?: string };

                if (!response.ok || !data.success) {
                    setStatus("error");
                    setErrorMessage(data.message || "Payment processing failed");
                    return;
                }

                setStatus("success");

                // Auto-redirect to confirmation after short delay
                setTimeout(() => {
                    router.push(`/checkout/confirmation?orderId=${orderNumber}`);
                }, 2000);

            } catch (error) {
                console.error("Payment processing error:", error);
                setStatus("error");
                setErrorMessage("An unexpected error occurred");
            }
        };

        processPayment();
    }, [paymentId, orderNumber, router]);

    return (
        <div className="container mx-auto max-w-lg px-4 py-20">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        {status === "processing" && "Processing Payment"}
                        {status === "success" && "Payment Confirmed!"}
                        {status === "error" && "Payment Failed"}
                    </CardTitle>
                    <CardDescription>
                        {status === "processing" && "Please wait while we process your order..."}
                        {status === "success" && `Order ${orderNumber} has been placed successfully!`}
                        {status === "error" && errorMessage}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 py-8">
                    {status === "processing" && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Confirming your order...
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Redirecting to order confirmation...
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                                <XCircle className="h-12 w-12 text-red-600" />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" asChild>
                                    <Link href="/checkout">Try Again</Link>
                                </Button>
                                <Button asChild>

                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto max-w-lg px-4 py-20">
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>
                </div>
            }
        >
            <PaymentContent />
        </Suspense>
    );
}
