"use client";

import { ChevronLeft, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";

export default function AdminForgotPasswordPage() {
    const [email, setEmail] = React.useState("");
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSent, setIsSent] = React.useState(false);
    const router = useRouter();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please provide a valid email";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (value: string) => {
        setEmail(value);
        if (errors.email) {
            setErrors({});
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const response = await fetch("/api/admin/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json() as { success: boolean; message?: string; error?: string };

            if (data.success) {
                setIsSent(true);
                toast.success("Password reset code has been sent to your email.");
                setTimeout(() => {
                    router.push(`/admin/reset-password?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                toast.error(data.message || data.error || "Failed to send reset code.");
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("An unexpected error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8 sm:py-12">
            <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
                <CardHeader className="text-center px-4 sm:px-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold sm:text-2xl">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your admin email address and we&apos;ll send you a code to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    {isSent ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                We have sent a 6-digit verification code to <strong>{email}</strong>.
                            </p>
                            <Button asChild className="w-full">
                                <Link href={`/admin/reset-password?email=${encodeURIComponent(email)}`}>
                                    Enter Reset Code
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@clinic.com"
                                    value={email}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={errors.email ? "border-destructive text-destructive" : ""}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Code...
                                    </>
                                ) : (
                                    "Send Reset Code"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 px-4 sm:px-6">
                    <Button variant="ghost" asChild className="w-full text-muted-foreground hover:text-primary">
                        <Link href="/admin/login" className="flex items-center justify-center">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
