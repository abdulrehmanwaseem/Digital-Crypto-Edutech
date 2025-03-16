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

export function WalletOverview() {
  const [wallet, setWallet] = useState<any>(null);
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

    try {
      setIsWithdrawing(true);
      const details = {
        ...(withdrawalMethod.type === "bank" && {
          accountName: withdrawalMethod.bankDetails?.name,
          accountNumber: withdrawalMethod.bankDetails?.accountNo,
          bankName: withdrawalMethod.bankDetails?.bankName,
          ifscCode: withdrawalMethod.bankDetails?.ifscCode,
        }),
        ...(withdrawalMethod.type === "crypto" && {
          walletAddress: withdrawalMethod.cryptoDetails?.address,
          network: withdrawalMethod.cryptoDetails?.network,
        }),
      };

      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          method: withdrawalMethod.type,
          details,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit withdrawal");
      }

      toast({
        title: "Success",
        description:
          data.message || "Withdrawal request submitted successfully",
      });
      setIsWithdrawDialogOpen(false);
      setWithdrawAmount("");
      fetchWallet();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit withdrawal request",
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
    return (
      <div className="space-y-6">
        {/* Loading Skeleton for Wallet Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card className="p-6" key={i}>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading Skeleton for Quick Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
          <Separator className="mb-6" />

          {/* Loading Skeleton for Transactions */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Wallet className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <h3 className="text-2xl font-bold">${wallet?.balance || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Gift className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Referral Bonus</p>
              <h3 className="text-2xl font-bold">
                ${wallet?.referralBonus || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Coins className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Stipend Bonus</p>
              <h3 className="text-2xl font-bold">
                ${wallet?.stipendBonus || 0}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Payment Quick Actions</h3>
          <div className="flex  gap-2">
            <Button
              variant="outline"
              onClick={() => openWithdrawDialog("bank")}
              className="flex items-center gap-2"
            >
              <Landmark className="h-4 w-4" />
              Bank Transfer
            </Button>
            <Button
              variant="outline"
              onClick={() => openWithdrawDialog("crypto")}
              className="flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              Crypto Withdrawal
            </Button>
          </div>
        </div>
        <Separator className="mb-6" />

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h4 className="font-medium">Recent Transactions</h4>
          {wallet?.transactions?.length ? (
            wallet.transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{tx.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.description}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    ${Math.abs(tx.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No recent transactions
            </p>
          )}
        </div>
      </Card>

      {/* Withdrawal Dialog */}
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
  );
}
