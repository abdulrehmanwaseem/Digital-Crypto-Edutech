"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile/profile-form";
import { IDCard } from "@/components/profile/id-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    occupation: string;
    referralCode?: string;
    profile?: {
      avatar?: string;
      bio?: string;
      location?: string;
      twitter?: string;
      telegram?: string;
      website?: string;
    };
    withdrawalAddress?: string;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { toast } = useToast();
  const [withdrawalAddress, setWithdrawalAddress] = useState(
    user.withdrawalAddress || ""
  );
  const [withdrawalAddressType, setWithdrawalAddressType] = useState(
    user.withdrawalAddress?.startsWith("T") ? "TRC20" : "BEP20"
  );
  const [loading, setLoading] = useState(false);

  const handleWithdrawalAddressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile/withdrawal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalAddress }),
      });

      if (!response.ok) {
        throw new Error("Failed to update withdrawal address");
      }

      toast({
        title: "Success",
        description: "Withdrawal address updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update withdrawal address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Success",
      description: "Referral link copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="id-card">ID Card</TabsTrigger>
          <TabsTrigger value="withdrawal">Withdrawal Settings</TabsTrigger>
          <TabsTrigger value="referral">Referral Link</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="id-card" className="space-y-6">
          <IDCard user={user} />
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-6">
          <div className="max-w-md mx-auto">
            <form
              onSubmit={handleWithdrawalAddressUpdate}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="withdrawalAddressType"
                    className="block text-sm font-medium"
                  >
                    USDT Withdrawal Network
                  </label>
                  <select
                    id="withdrawalAddressType"
                    value={withdrawalAddressType}
                    onChange={(e) => setWithdrawalAddressType(e.target.value)}
                    className="mt-2 w-full rounded-md border border-input p-2"
                  >
                    <option value="TRC20">TRC20 (TRON Network)</option>
                    <option value="BEP20">BEP20 (Binance Smart Chain)</option>
                  </select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the network for your USDT withdrawal address
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="withdrawalAddress"
                    className="block text-sm font-medium"
                  >
                    USDT {withdrawalAddressType} Address
                  </label>
                  <Input
                    id="withdrawalAddress"
                    value={withdrawalAddress}
                    onChange={(e) => setWithdrawalAddress(e.target.value)}
                    placeholder={
                      withdrawalAddressType === "TRC20" ? "T..." : "0x..."
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {withdrawalAddressType === "TRC20"
                      ? "TRC20 addresses typically start with 'T'"
                      : "BEP20 addresses typically start with '0x'"}
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Withdrawal Address"}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="referral" className="space-y-6">
          <div className="max-w-md mx-auto">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    Your Referral Code
                  </label>
                  <div className="mt-2 flex items-center space-x-2">
                    <Input
                      value={
                        "http://localhost:3000/register?ref=" +
                          user.referralCode || ""
                      }
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      onClick={handleCopyReferralLink}
                      disabled={!user.referralCode}
                    >
                      Copy Link
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share this link with friends to earn referral bonuses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
