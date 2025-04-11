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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="id-card">ID Card</TabsTrigger>
          <TabsTrigger value="withdrawal">Withdrawal Settings</TabsTrigger>
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
                    htmlFor="withdrawalAddress"
                    className="block text-sm font-medium"
                  >
                    USDT Withdrawal Address
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your USDT withdrawal address (BEP20 or TRC20)
                  </p>
                  <Input
                    id="withdrawalAddress"
                    value={withdrawalAddress}
                    onChange={(e) => setWithdrawalAddress(e.target.value)}
                    placeholder="0x..."
                    className="mt-2"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Withdrawal Address"}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
