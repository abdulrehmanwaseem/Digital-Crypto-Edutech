"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "user",
    header: "User",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "course",
    header: "Course",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "approved"
            ? "default"
            : row.original.status === "rejected"
            ? "destructive"
            : "secondary"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => console.log("Approve", row.original.id)}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => console.log("Reject", row.original.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
] 