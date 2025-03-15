"use client";

import { useState } from "react";
import { WithdrawalRequestsTable } from "@/components/admin/withdrawal-requests-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WithdrawalStatus } from "@prisma/client";
import { useWithdrawals } from "@/hooks/use-withdrawals";
import { useToast } from "@/hooks/use-toast";

function WithdrawalRequestsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function updateWithdrawalStatus(
  id: string,
  status: WithdrawalStatus,
  notes?: string
) {
  const response = await fetch(`/api/admin/withdrawals/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    throw new Error("Failed to update withdrawal status");
  }

  return response.json();
}

export default function WithdrawalsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: WithdrawalStatus;
  };
}) {
  const [page, setPage] = useState(parseInt(searchParams.page || "1"));
  const { data, isLoading, error } = useWithdrawals({
    page,
    limit: parseInt(searchParams.limit || "10"),
    search: searchParams.search,
    status: searchParams.status as WithdrawalStatus,
  });
  const { toast } = useToast();

  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <WithdrawalRequestsSkeleton />
          ) : (
            <WithdrawalRequestsTable
              withdrawals={data?.withdrawals || []}
              onStatusUpdate={updateWithdrawalStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
