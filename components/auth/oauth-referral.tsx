"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function OAuthReferral() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const referralCode = searchParams.get("ref");

  useEffect(() => {
    const applyReferralCode = async () => {
      if (!session?.user || !referralCode) return;

      try {
        const response = await fetch("/api/auth/apply-referral", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ referralCode }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to apply referral code");
        }

        toast.success("Referral code applied successfully!");
      } catch (error) {
        console.error("Apply Referral Error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to apply referral code"
        );
      }
    };

    applyReferralCode();
  }, [session, referralCode]);

  return null;
}
