"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferralSection } from "@/components/dashboard/referral-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  BookOpen,
  Trophy,
  Users,
  Wallet2,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Bell,
  ArrowDownToLine,
  DollarSign,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  progress: number;
  status: string;
  lastAccessed: string | null;
}

interface WithdrawalMethod {
  type: "bank" | "crypto";
  bankDetails?: {
    name: string;
    bankName: string;
    accountNo: string;
    ifscCode: string;
  };
  cryptoDetails?: {
    network: string;
    address: string;
  };
}

interface Withdrawal {
  amount: number;
  method: "bank" | "crypto";
  details: WithdrawalMethod;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>({
    type: "bank",
    bankDetails: {
      name: "",
      bankName: "",
      accountNo: "",
      ifscCode: "",
    },
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    fetchUserData();
  }, [session, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || !session.user) {
    return null;
  }

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      return;
    }

    try {
      setIsWithdrawing(true);
      // Add withdrawal submission logic here
      setIsWithdrawDialogOpen(false);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center mb-10">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name}
          </h1>
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <p className="text-muted-foreground">
          Here's an overview of your learning progress and referral earnings
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referral Program</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enrolled Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.filter((c) => c.status === "COMPLETED").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.filter((c) => c.status === "ACTIVE").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {courses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between border-b last:border-0 pb-2"
                    >
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.lastAccessed
                            ? `Last accessed ${new Date(
                                course.lastAccessed
                              ).toLocaleDateString()}`
                            : "Not started yet"}
                        </div>
                      </div>
                      <div>{course.status}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  You haven't enrolled in any courses yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralSection />
        </TabsContent>
      </Tabs>

      <Dialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Earnings</DialogTitle>
            <DialogDescription>
              Enter the amount and select your withdrawal method
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={withdrawAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWithdrawAmount(e.target.value)
                  }
                />
              </div>
            </div>

            {withdrawalMethod.type === "bank" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Account Holder Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={withdrawalMethod.bankDetails?.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setWithdrawalMethod((prev) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails!,
                          name: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bank Name</label>
                  <Input
                    placeholder="Bank Name"
                    value={withdrawalMethod.bankDetails?.bankName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setWithdrawalMethod((prev) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails!,
                          bankName: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWithdrawDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isWithdrawing}>
                {isWithdrawing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Withdraw
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
