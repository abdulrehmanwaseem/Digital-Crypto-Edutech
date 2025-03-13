"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  proofImageUrl?: string;
  createdAt: string;
  course: {
    title: string;
    imageUrl: string;
  };
}

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Icons.clock,
  },
  VERIFIED: {
    color: "bg-green-100 text-green-800",
    icon: Icons.check,
  },
  REJECTED: {
    color: "bg-red-100 text-red-800",
    icon: Icons.close,
  },
};

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/payments");
        if (!response.ok) throw new Error("Failed to fetch payments");

        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error("Fetch Payments Error:", error);
        toast.error("Failed to load payment history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Icons.empty className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No payments yet</h3>
        <p className="text-sm text-muted-foreground">
          Your payment history will appear here once you make a purchase
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          View and track all your course payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {payments.map((payment) => {
            const StatusIcon = statusConfig[payment.status].icon;
            return (
              <div
                key={payment.id}
                className="flex items-start space-x-4 rounded-lg border p-4"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={payment.course.imageUrl}
                    alt={payment.course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{payment.course.title}</h4>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "flex items-center space-x-1",
                        statusConfig[payment.status].color
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      <span>{payment.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payment.createdAt), "PPP")}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {payment.amount} {payment.currency}
                    </p>
                    {payment.proofImageUrl && (
                      <button
                        onClick={() =>
                          window.open(payment.proofImageUrl, "_blank")
                        }
                        className="text-sm text-primary hover:underline"
                      >
                        View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
