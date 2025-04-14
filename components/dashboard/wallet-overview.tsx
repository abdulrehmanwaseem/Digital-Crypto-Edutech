"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Landmark,
  Wallet,
  CreditCard,
  ArrowUpRight,
  Coins,
  Gift,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletData {
  balance: number;
  referralBalance: number;
  lastUpdated: string;
}

interface PaymentMethodCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function PaymentMethodCard({
  title,
  description,
  icon,
  onClick,
  disabled,
}: PaymentMethodCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full p-4 rounded-lg border hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
        <div className="text-left">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function WalletOverview() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();

  const [withdrawalMethod, setWithdrawalMethod] = useState<{
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
  }>({
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

  const focusTrapRef = useFocusTrap(isWithdrawDialogOpen);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/wallet");
      if (!response.ok) throw new Error("Failed to fetch wallet");
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Wallet fetch error:", error);
      toast({
        variant: "destructive",
        title: "Failed to load wallet",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > (wallet?.referralBalance || 0)) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description:
          "You don't have enough referral balance for this withdrawal",
      });
      return;
    }

    try {
      setIsWithdrawing(true);
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          method: withdrawalMethod.type,
          details:
            withdrawalMethod.type === "bank"
              ? withdrawalMethod.bankDetails
              : withdrawalMethod.cryptoDetails,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process withdrawal");
      }

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully",
      });

      setIsWithdrawDialogOpen(false);
      setWithdrawAmount("");
      fetchWallet(); // Refresh wallet data
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const openWithdrawDialog = (method: "bank" | "crypto") => {
    setWithdrawalMethod((prev) => ({ ...prev, type: method }));
    setIsWithdrawDialogOpen(true);
  };

  if (isLoading) {
    return <WalletSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Total Balance</h3>
              <p className="text-3xl font-bold mt-2">
                ${wallet?.balance.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Referral Balance</p>
              <p className="text-lg font-medium">
                ${wallet?.referralBalance.toFixed(2) || "0.00"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openWithdrawDialog("bank")}
              disabled={!wallet?.referralBalance || wallet.referralBalance <= 0}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Withdrawal Methods</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose how you want to receive your earnings
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            <PaymentMethodCard
              title="Bank Transfer"
              description="Withdraw directly to your bank account"
              icon={<Landmark className="h-5 w-5" />}
              onClick={() => openWithdrawDialog("bank")}
              disabled={!wallet?.referralBalance || wallet.referralBalance <= 0}
            />
            <PaymentMethodCard
              title="Crypto Wallet"
              description="Withdraw to your cryptocurrency wallet"
              icon={<Coins className="h-5 w-5" />}
              onClick={() => openWithdrawDialog("crypto")}
              disabled={!wallet?.referralBalance || wallet.referralBalance <= 0}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Referral Earnings</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your referral program earnings
            </p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Gift className="h-6 w-6 text-primary" />
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Available for Withdrawal
              </p>
              <p className="text-lg font-medium">
                ${wallet?.referralBalance.toFixed(2) || "0.00"}
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => openWithdrawDialog("bank")}
              disabled={!wallet?.referralBalance || wallet.referralBalance <= 0}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Withdraw Now
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> Withdrawals are processed within 3-5
              business days. Minimum withdrawal amount is $10.
            </p>
          </div>
        </div>
      </Card>

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
                <p className="text-xs text-muted-foreground">
                  Available: ${wallet?.referralBalance.toFixed(2) || "0.00"}
                </p>
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
  );
}

function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24 mt-2" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 mt-1" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-1" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24 mt-1" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    </div>
  );
}
