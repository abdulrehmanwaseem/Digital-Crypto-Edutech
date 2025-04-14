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
  Gift,
  Clock,
  CheckCircle,
  XCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ReferralData {
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
  };
  referralCode: string;
  wallet: {
    balance: number;
    referralBalance: number;
  } | null;
  referredUsers: Array<{
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string;
    payments: Array<{
      amount: number;
      status: string;
    }>;
  }>;
  recentBonuses: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
    referredUser: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
    course?: {
      id: string;
      title: string;
      imageUrl: string;
    };
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
    if (referralData?.referralCode) {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/register?ref=${referralData.referralCode}`;
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

  // Get status badge for bonus
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get type badge for bonus
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "REGISTRATION":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Registration
          </Badge>
        );
      case "COURSE_PURCHASE":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            <Gift className="h-3 w-3 mr-1" />
            Course Purchase
          </Badge>
        );
      case "SUBSCRIPTION":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Subscription
          </Badge>
        );
      case "SPECIAL_PROMOTION":
        return (
          <Badge
            variant="outline"
            className="bg-pink-50 text-pink-700 border-pink-200"
          >
            <Gift className="h-3 w-3 mr-1" />
            Special Promotion
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
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

  const tierInfo = getTierInfo(referralData.stats.totalEarnings);

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
              {referralData.stats.totalReferrals}
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
              {referralData.stats.activeReferrals}
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
              ${referralData.stats.totalEarnings.toFixed(2)}
            </div>
            {referralData.wallet && (
              <p className="text-xs text-muted-foreground mt-1">
                Available: ${referralData.wallet.referralBalance.toFixed(2)}
              </p>
            )}
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
                  ${referralData.stats.totalEarnings.toFixed(2)} / $
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
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={shareReferralLink}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="referred">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referred">Referred Users</TabsTrigger>
          <TabsTrigger value="bonuses">Recent Bonuses</TabsTrigger>
        </TabsList>
        <TabsContent value="referred" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referred Users</CardTitle>
            </CardHeader>
            <CardContent>
              {referralData.referredUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No referred users yet. Share your referral link to start
                  earning!
                </div>
              ) : (
                <div className="space-y-4">
                  {referralData.referredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || "User"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.name || "Anonymous User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined{" "}
                            {formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          $
                          {user.payments
                            .reduce((sum, payment) => sum + payment.amount, 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.payments.length} purchases
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bonuses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bonuses</CardTitle>
            </CardHeader>
            <CardContent>
              {referralData.recentBonuses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No bonuses earned yet. Share your referral link to start
                  earning!
                </div>
              ) : (
                <div className="space-y-4">
                  {referralData.recentBonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          {bonus.referredUser.image ? (
                            <Image
                              src={bonus.referredUser.image}
                              alt={bonus.referredUser.name || "User"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {bonus.referredUser.name || "Anonymous User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {bonus.referredUser.email}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {getTypeBadge(bonus.type)}
                            {getStatusBadge(bonus.status)}
                          </div>
                          {bonus.course && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Course: {bonus.course.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${bonus.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(bonus.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Referral QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {qrCodeURL && (
              <div className="relative h-64 w-64 mb-4">
                <Image
                  src={qrCodeURL}
                  alt="Referral QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scan this QR code to join using your referral link
            </p>
            <Button
              variant="outline"
              onClick={() => {
                if (qrCodeURL) {
                  const link = document.createElement("a");
                  link.href = qrCodeURL;
                  link.download = "referral-qr-code.png";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReferralSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
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
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
