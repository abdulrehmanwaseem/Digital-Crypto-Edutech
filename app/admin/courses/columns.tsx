"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "name",
    header: "Course Name",
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant={
        row.original.plan === "Premium" ? "default" : 
        row.original.plan === "Professional" ? "secondary" : 
        "outline"
      }>
        {row.original.plan}
      </Badge>
    ),
  },
  {
    accessorKey: "students",
    header: "Enrolled Students",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit Course</DropdownMenuItem>
          <DropdownMenuItem>View Students</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Disable Course</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

interface Course {
  id: string;
  name: string;
  plan: string;
  students: number;
  status: string;
  lastUpdated: string;
} 