"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Shield,
  User,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-react";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role.toLowerCase();
      return (
        <div className="flex items-center gap-2">
          {role === "admin" ? (
            <Shield className="h-4 w-4 text-primary" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();
      return (
        <Badge
          variant={status === "verified" ? "success" : "warning"}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "stats",
    header: "Activity",
    cell: ({ row }) => {
      const stats = row.original.stats;
      return (
        <div className="text-sm">
          <div>
            Enrollments: {stats.activeEnrollments}/{stats.totalEnrollments}
          </div>
          <div className="text-muted-foreground">
            Payments: ${stats.totalSpent.toFixed(2)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "joinedDate",
    header: "Joined",
    cell: ({ row }) => {
      return new Date(row.original.joinedDate).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            {user.status !== "VERIFIED" && (
              <DropdownMenuItem className="text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify User
              </DropdownMenuItem>
            )}
            {user.role === "USER" ? (
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Make Admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Remove Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-yellow-600">
              <Ban className="mr-2 h-4 w-4" />
              Suspend User
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
