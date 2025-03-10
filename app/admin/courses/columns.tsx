"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { CourseEnrollmentsDialog } from "@/components/admin/course-enrollments-dialog"

export interface Course {
  id: string
  title: string
  price: string
  students: number
  revenue: string
  pending: number
  status: string
  lastUpdated: string
  enrollments: Array<{
    id: string
    status: string
    student: {
      id: string
      name: string
      email: string
    }
    payment: {
      id: string
      amount: number
      status: string
      proofImageUrl: string | null
      createdAt: Date
    } | null
    createdAt: Date
  }>
}

function CourseActions({ row }: { row: any }) {
  const [showEnrollments, setShowEnrollments] = useState(false)

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Icons.edit className="h-4 w-4" />
          <span className="sr-only">Edit course</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEnrollments(true)}
        >
          <Icons.users className="h-4 w-4" />
          <span className="sr-only">View enrollments</span>
        </Button>
      </div>

      <CourseEnrollmentsDialog
        open={showEnrollments}
        onOpenChange={setShowEnrollments}
        courseTitle={row.getValue("title")}
        enrollments={row.original.enrollments}
      />
    </>
  )
}

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: "Course",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("title")}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.price}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "students",
    header: "Students",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Icons.users className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("students")}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Icons.wallet className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("revenue")}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "pending",
    header: "Pending",
    cell: ({ row }) => {
      const pending = row.getValue("pending") as number
      return (
        <div className="flex items-center">
          <Icons.clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{pending}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant="secondary"
          className={cn(
            "flex w-fit items-center",
            status === "Published"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          )}
        >
          {status === "Published" ? (
            <Icons.checkCircle className="mr-1 h-3 w-3" />
          ) : (
            <Icons.alertCircle className="mr-1 h-3 w-3" />
          )}
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated"
  },
  {
    id: "actions",
    cell: ({ row }) => <CourseActions row={row} />
  }
]