"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    occupation: "",
    incomeRange: "",
    occupationType: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const redirectTo = searchParams?.get("redirect") || "/dashboard";
  const referralCode = searchParams?.get("ref");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          occupation: formData.occupation,
          incomeRange: formData.incomeRange,
          occupationType: formData.occupationType,
          phone: formData.phone,
          referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Show the first validation error message
          const errorMessage = data.details[0].message;
          throw new Error(errorMessage);
        }
        throw new Error(data.error || "Registration failed");
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Auto-login failed");
      }

      toast({
        title: "Registration Successful",
        description: referralCode
          ? "Referral code applied! Welcome to CryptoEdu!"
          : "Welcome to CryptoEdu!",
      });

      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      toast({
        title: "Google Error",
        description: "Google service is currently down.",
        variant: "default",
      });
      // await signIn("google", { callbackUrl: redirectTo })
    } catch (error) {
      toast({
        description: "Error connecting to Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/50">
      <main className="flex-1">
        <div className="container flex items-center justify-center py-12">
          <Card className="w-full max-w-3xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Welcome to CryptoEdu
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your account to get started
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  variant="outline"
                  className="hover:bg-muted"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="occupation">
                    Occupation
                  </label>
                  <Input
                    id="occupation"
                    name="occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="incomeRange">
                    Income Range
                  </label>
                  <select
                    id="incomeRange"
                    name="incomeRange"
                    value={formData.incomeRange}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select income range</option>
                    <option value="0-25000">$0 - $25,000</option>
                    <option value="25000-50000">$25,000 - $50,000</option>
                    <option value="50000-75000">$50,000 - $75,000</option>
                    <option value="75000-100000">$75,000 - $100,000</option>
                    <option value="100000+">$100,000+</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="occupationType"
                  >
                    Occupation Type
                  </label>
                  <select
                    id="occupationType"
                    name="occupationType"
                    value={formData.occupationType}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select occupation type</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="phone">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
