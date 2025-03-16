"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { columns } from "./columns";
import { Search, Filter, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  proofImageUrl: string;
  transactionId: string;
  createdAt: string;
  notes?: string;
}

interface TransactionFilters {
  search: string;
  status: string;
  page: number;
  limit: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    status: "ALL",
    page: 1,
    limit: 10,
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setIsFiltering(true);

      const queryParams = new URLSearchParams({
        ...filters,
        status: filters.status === "ALL" ? "" : filters.status,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      const response = await fetch(`/api/admin/transactions?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Transactions fetch error:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleTransactionAction = async (
    id: string,
    action: "APPROVE" | "REJECT",
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });

      if (!response.ok) throw new Error("Failed to update transaction");

      toast.success(`Transaction ${action.toLowerCase()}d successfully`);
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error("Transaction action error:", error);
      toast.error(`Failed to ${action.toLowerCase()} transaction`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Transactions</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTransactions}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4"
              disabled={isFiltering}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              disabled={isFiltering}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          onAction={handleTransactionAction}
        />
      </Card>
    </div>
  );
}
