"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { CloudinaryUploadWidget } from "@/components/cloudinary-upload-widget";
import { Input } from "@/components/ui/input";

interface PaymentFormProps {
  courseId: string;
  courseTitle: string;
  amount: number;
  onSuccess?: () => void;
}

export function PaymentForm({
  courseId,
  courseTitle,
  amount,
  onSuccess,
}: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState<string>();
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState(false);
  const [referrerId, setReferrerId] = useState<string>();
  const [transactionId, setTransactionId] = useState("");

  const validateReferralCode = async (code: string) => {
    if (!code) {
      setReferralValid(false);
      setReferrerId(undefined);
      return;
    }

    try {
      const response = await fetch("/api/referral/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (response.ok && data.valid) {
        setReferralValid(true);
        setReferrerId(data.referrerId);
        toast.success("Valid referral code!");
      } else {
        setReferralValid(false);
        setReferrerId(undefined);
        if (code) toast.error("Invalid referral code");
      }
    } catch (error) {
      console.error("Referral validation error:", error);
      setReferralValid(false);
      setReferrerId(undefined);
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofImageUrl) {
      toast.error("Please upload payment proof");
      return;
    }

    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          amount,
          proofImageUrl,
          transactionId: transactionId.trim(),
          referrerId: referralValid ? referrerId : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process payment");
      }

      toast.success("Payment submitted successfully");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = (url: string) => {
    setProofImageUrl(url);
    toast.success("Payment proof uploaded successfully");
  };

  return (
    <form onSubmit={submitPayment}>
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Payment Details</h3>
            <p className="text-sm text-muted-foreground">
              Complete your payment for {courseTitle}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Amount</p>
            <p className="text-2xl font-bold">${amount}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Payment Instructions</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Send the exact amount to our crypto wallet</li>
              <li>Copy the transaction ID from your payment</li>
              <li>Take a screenshot of your payment confirmation</li>
              <li>Upload the screenshot below</li>
              <li>Click submit to complete your payment</li>
            </ol>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Crypto Wallet Address</p>
            <div className="flex items-center space-x-2 bg-muted p-2 rounded-md">
              <code className="text-sm">0x1234...5678</code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText("0x1234...5678");
                  toast.success("Wallet address copied");
                }}
              >
                <Icons.copy className="h-4 w-4" />
                <span className="sr-only">Copy wallet address</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Transaction ID</p>
            <Input
              type="text"
              placeholder="Enter your transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Upload Payment Proof</p>
            <div className="flex items-center space-x-2">
              <CloudinaryUploadWidget
                onUpload={handleUpload}
                options={{
                  maxFiles: 1,
                  sources: ["local", "camera"],
                  resourceType: "image",
                  folder: "crypto-lms/payments",
                }}
              >
                <Icons.upload className="mr-2 h-4 w-4" />
                Upload Screenshot
              </CloudinaryUploadWidget>
              {proofImageUrl && (
                <p className="text-sm text-green-600">
                  <Icons.check className="mr-2 h-4 w-4 inline" />
                  Screenshot uploaded
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Referral Code (Optional)</p>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(e.target.value);
                  validateReferralCode(e.target.value);
                }}
              />
              {referralCode && (
                <div className="flex items-center">
                  {referralValid ? (
                    <Icons.check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Icons.x className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!proofImageUrl || !transactionId.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Submit Payment</>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
