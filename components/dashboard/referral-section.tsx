"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  DollarSign,
  UserCheck,
  Copy,
  ExternalLink,
  LinkIcon,
  Share2,
  Download,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReferralData {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  earnings: number;
  referredUsers: Array<{
    name: string;
    email: string;
    joinedAt: string;
    totalSpent?: number;
  }>;
}

export function ReferralSection() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeURL, setQRCodeURL] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  useEffect(() => {
    // Generate the full referral link when referral code is available
    if (referralData?.code) {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/register?ref=${referralData.code}`;
      setReferralLink(link);

      // Generate QR code URL
      const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        link
      )}`;
      setQRCodeURL(qrCodeApi);
    }
  }, [referralData]);

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
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Success",
      description: "Referral link copied to clipboard",
    });
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Join me on Master Crypto Education",
          text: "Use my referral link to join Master Crypto Education and get started with crypto trading!",
          url: referralLink,
        })
        .then(() => {
          toast({
            title: "Success",
            description: "Referral link shared",
          });
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      copyReferralLink();
    }
  };

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
      nextThreshold: nextTier?.threshold,
    };
  };

  if (isLoading) {
    return <ReferralSkeleton />;
  }

  if (!referralData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">
              Unable to load referral data. Please try again later.
            </p>
            <Button onClick={fetchReferralData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferralLink}
              title="Copy referral link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Commission Rate:</span>
              <span className="font-medium text-primary">
                {tierInfo.current}%
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress to next tier ({tierInfo.next}%)</span>
                <span>
                  ${referralData.earnings.toFixed(2)} / $
                  {tierInfo.nextThreshold}
                </span>
              </div>
              <Progress value={tierInfo.progress} className="h-2" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowQRCode(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="3" height="3"></rect>
                <rect x="14" y="7" width="3" height="3"></rect>
                <rect x="7" y="14" width="3" height="3"></rect>
                <rect x="14" y="14" width="3" height="3"></rect>
              </svg>
              QR Code
            </Button>
            <Button className="flex-1" onClick={shareReferralLink}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {referralData.referredUsers.length > 0 && (
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
                    <div className="font-medium">${user?.totalSpent || 0}</div>
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

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Referral QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            {qrCodeURL ? (
              <div className="bg-white p-4 rounded-lg">
                <Image
                  src={qrCodeURL}
                  alt="Referral QR Code"
                  width={200}
                  height={200}
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="animate-pulse bg-muted w-48 h-48 rounded-lg"></div>
            )}
            <p className="mt-4 text-sm text-center text-muted-foreground">
              Scan this code to visit your referral link
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                // Download QR code
                const link = document.createElement("a");
                link.href = qrCodeURL || "";
                link.download = "referral-qr-code.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ReferralSkeleton component for loading state
function ReferralSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
