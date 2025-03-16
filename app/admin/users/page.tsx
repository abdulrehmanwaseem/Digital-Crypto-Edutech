"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Users, Shield, User, RefreshCw } from "lucide-react";
import { columns } from "./columns";
import { toast } from "sonner";

interface UserFilters {
  search: string;
  status: string;
  role: string;
  page: number;
  limit: number;
}

interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedDate: string;
  avatar?: string;
  location?: string;
  stats: {
    totalEnrollments: number;
    activeEnrollments: number;
    totalPayments: number;
    pendingPayments: number;
    totalSpent: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    status: "ALL",
    role: "ALL",
    page: 1,
    limit: 10,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setIsFiltering(true);

      const queryParams = new URLSearchParams({
        ...filters,
        // Convert "ALL" to empty string for API
        status: filters.status === "ALL" ? "" : filters.status,
        role: filters.role === "ALL" ? "" : filters.role,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });
      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Users fetch error:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      role: "ALL",
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="space-y-6 p-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
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
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4"
              disabled={isFiltering}
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>

            {/* Status Select */}
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
                <SelectItem value="VERIFIED">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Verified
                  </div>
                </SelectItem>
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Pending
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Role Select */}
            <Select
              value={filters.role}
              onValueChange={(value) => handleFilterChange("role", value)}
              disabled={isFiltering}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="USER">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    User
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Reset Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={isFiltering}
              className="ml-2"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
}
