"use client";

import { DashboardOverview } from "@/components/dashboard/overview";
import { ReferralSection } from "@/components/dashboard/referral-section";
import { WalletOverview } from "@/components/dashboard/wallet-overview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  DollarSign,
  Loader2,
  Landmark,
  Wallet as WalletIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentMethodCard } from "@/components/dashboard/payment-method-card";
import { useModalRoot } from "@/hooks/use-modal-root";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import BlurOverlay from "@/components/BlurOverlay";

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

interface PaymentStatus {
  hasPurchasedCourse: boolean;
  isPaymentVerified: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);

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
    cryptoDetails: {
      network: "",
      address: "",
    },
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalEarnings: 0,
    referralEarnings: 0,
  });

  const modalRoot = useModalRoot();
  const focusTrapRef = useFocusTrap(isWithdrawDialogOpen);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    fetchUserData();
  }, [session, router]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch("/api/payment/check-status");
        const data = await response.json();
        setPaymentStatus(data);
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      checkPaymentStatus();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data = await response.json();
      setCourses(data.courses);
      setDashboardStats(data.stats);
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

  const openWithdrawDialog = (method: "bank" | "crypto") => {
    setWithdrawalMethod((prev) => ({ ...prev, type: method }));
    setIsWithdrawDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const getMessage = () => {
    if (!paymentStatus?.hasPurchasedCourse) {
      return "Please purchase a course plan to access dashboard insights.";
    }
    if (!paymentStatus?.isPaymentVerified) {
      return "Your payment is being verified by our admin team. Please wait for approval.";
    }
    return "";
  };

  return (
    <div className="relative">
      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              Welcome back, {session.user.name}
            </h1>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your learning progress and referral
            earnings
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referral Program</TabsTrigger>
            <TabsTrigger value="wallet">My Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview stats={dashboardStats} />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralSection />
          </TabsContent>

          <TabsContent value="wallet">
            <WalletOverview />
          </TabsContent>
        </Tabs>

        <Dialog
          open={isWithdrawDialogOpen}
          onOpenChange={setIsWithdrawDialogOpen}
        >
          <DialogContent className="max-w-md">
            <div ref={focusTrapRef}>
              <DialogHeader>
                <DialogTitle>
                  {withdrawalMethod.type === "bank"
                    ? "Bank Transfer"
                    : "Crypto Withdrawal"}
                </DialogTitle>
                <DialogDescription>
                  Enter the withdrawal details
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleWithdrawSubmit}
                className="space-y-6"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={withdrawAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        setWithdrawAmount(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {withdrawalMethod.type === "bank" ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Account Holder Name"
                      value={withdrawalMethod.bankDetails?.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        setWithdrawalMethod((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails!,
                            name: e.target.value,
                          },
                        }));
                      }}
                    />
                    <Input
                      placeholder="Bank Name"
                      value={withdrawalMethod.bankDetails?.bankName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        setWithdrawalMethod((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails!,
                            bankName: e.target.value,
                          },
                        }));
                      }}
                    />
                    <Input
                      placeholder="Account Number"
                      value={withdrawalMethod.bankDetails?.accountNo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        setWithdrawalMethod((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails!,
                            accountNo: e.target.value,
                          },
                        }));
                      }}
                    />
                    <Input
                      placeholder="IFSC Code"
                      value={withdrawalMethod.bankDetails?.ifscCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        setWithdrawalMethod((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails!,
                            ifscCode: e.target.value,
                          },
                        }));
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      placeholder="Wallet Address"
                      value={withdrawalMethod.cryptoDetails?.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        setWithdrawalMethod((prev) => ({
                          ...prev,
                          cryptoDetails: {
                            ...prev.cryptoDetails!,
                            address: e.target.value,
                          },
                        }));
                      }}
                    />
                    <Input
                      placeholder="Network (e.g., ETH, BSC)"
                      value={withdrawalMethod.cryptoDetails?.network}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        setWithdrawalMethod((prev) => ({
                          ...prev,
                          cryptoDetails: {
                            ...prev.cryptoDetails!,
                            network: e.target.value,
                          },
                        }));
                      }}
                    />
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
                  <Button
                    type="submit"
                    disabled={
                      isWithdrawing ||
                      !withdrawAmount ||
                      (withdrawalMethod.type === "bank" &&
                        (!withdrawalMethod.bankDetails?.name ||
                          !withdrawalMethod.bankDetails?.accountNo)) ||
                      (withdrawalMethod.type === "crypto" &&
                        (!withdrawalMethod.cryptoDetails?.address ||
                          !withdrawalMethod.cryptoDetails?.network))
                    }
                  >
                    {isWithdrawing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Withdraw
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show blur overlay if conditions are not met */}
      {(!paymentStatus?.hasPurchasedCourse ||
        !paymentStatus?.isPaymentVerified) && (
        <BlurOverlay
          message={getMessage()}
          actionLabel={
            !paymentStatus?.hasPurchasedCourse
              ? "Browse Plans"
              : "Contact Support"
          }
          onAction={() =>
            !paymentStatus?.hasPurchasedCourse
              ? router.push("/plans")
              : window.open("contact@cryptoedu.com")
          }
        />
      )}
    </div>
  );
}
