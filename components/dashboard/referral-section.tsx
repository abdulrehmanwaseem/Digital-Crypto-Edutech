"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, UserCheck, Copy, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ReferralData {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  earnings: number;
  referredUsers: Array<{
    name: string;
    email: string;
    joinedAt: string;
  }>;
}

export function ReferralSection() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch("/api/referrals/stats");
      if (!response.ok) throw new Error("Failed to fetch referral data");
      const data = await response.json();
      setReferralData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralData?.code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Success",
      description: "Referral link copied to clipboard",
    });
  };

  if (isLoading) {
    return <div>Loading referral data...</div>;
  }

  if (!referralData) {
    return <div>No referral data available</div>;
  }

  // Calculate commission tier and next milestone
  const getTierInfo = (earnings: number) => {
    const tiers = [
      { threshold: 0, commission: 10 },
      { threshold: 1000, commission: 12 },
      { threshold: 5000, commission: 15 },
      { threshold: 10000, commission: 20 },
    ];

    const currentTier = tiers.reduce((prev, curr) =>
      earnings >= curr.threshold ? curr : prev
    );

    const nextTier = tiers.find((tier) => tier.threshold > earnings);

    return {
      current: currentTier.commission,
      next: nextTier?.commission,
      progress: nextTier ? (earnings / nextTier.threshold) * 100 : 100,
    };
  };

  const tierInfo = getTierInfo(referralData.earnings);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralData.totalReferrals}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Referrals
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralData.activeReferrals}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${referralData.earnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-2 py-1">
              {`${window.location.origin}/register?ref=${referralData.code}`}
            </code>
            <Button variant="outline" size="icon" onClick={copyReferralLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Commission: {tierInfo.current}%</span>
              {tierInfo.next && <span>Next Tier: {tierInfo.next}%</span>}
            </div>
            <Progress value={tierInfo.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {referralData?.referredUsers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referred Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referralData.referredUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b last:border-0 pb-2"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(user.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${user?.totalSpent}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Spent
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
