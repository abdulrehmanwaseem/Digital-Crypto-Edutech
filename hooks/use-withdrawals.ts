"use client";

import { useState, useEffect } from "react";
import { WithdrawalStatus } from "@prisma/client";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: WithdrawalStatus;
  paymentMethod: string;
  accountDetails: any;
  notes: string | null;
  createdAt: string;
  processedAt: string | null;
}

interface WithdrawalResponse {
  withdrawals: Withdrawal[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

export function useWithdrawals(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: WithdrawalStatus;
}) {
  const [data, setData] = useState<WithdrawalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        setIsLoading(true);
        setError(null);

        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", params.page.toString());
        if (params.limit) searchParams.set("limit", params.limit.toString());
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);

        const queryString = searchParams.toString();
        const response = await fetch(
          `/api/admin/withdrawals${queryString ? `?${queryString}` : ""}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch withdrawals");
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWithdrawals();
  }, [params.page, params.limit, params.search, params.status]);

  return { data, isLoading, error };
}
