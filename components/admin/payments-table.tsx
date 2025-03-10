'use client'

import { useState } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Payment {
  id: string
  amount: number
  currency: string
  status: "PENDING" | "VERIFIED" | "REJECTED"
  proofImageUrl?: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  course: {
    title: string
  }
}

interface PaymentsTableProps {
  payments: Payment[]
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
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      setUpdatingId(paymentId)
      const response = await fetch("/api/admin/payments/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          status: newStatus
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment status")
      }

      toast.success("Payment status updated successfully")
      // Refresh the page to get updated data
      window.location.reload()
    } catch (error) {
      console.error("Update Status Error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update payment status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsImageDialogOpen(true)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const StatusIcon = statusConfig[payment.status].icon
              return (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.createdAt), "PPP")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{payment.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {payment.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{payment.course.title}</TableCell>
                  <TableCell>
                    {payment.amount} {payment.currency}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {payment.proofImageUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImageClick(payment.proofImageUrl!)}
                      >
                        <Icons.eye className="h-4 w-4" />
                        <span className="sr-only">View proof</span>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No proof
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {updatingId === payment.id ? (
                      <div className="flex items-center space-x-2">
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Updating...
                        </span>
                      </div>
                    ) : (
                      <Select
                        defaultValue={payment.status}
                        onValueChange={(value) =>
                          handleStatusChange(payment.id, value)
                        }
                        disabled={payment.status !== "PENDING"}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="VERIFIED">Verify</SelectItem>
                          <SelectItem value="REJECTED">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-video w-full">
              <Image
                src={selectedImage}
                alt="Payment proof"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
