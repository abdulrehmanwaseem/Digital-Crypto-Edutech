import { useState } from "react"
import { format } from "date-fns"
import Image from "next/image"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface CourseEnrollment {
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
}

interface CourseEnrollmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseTitle: string
  enrollments: CourseEnrollment[]
}

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Icons.clock,
  },
  VERIFIED: {
    color: "bg-green-100 text-green-800",
    icon: Icons.checkCircle,
  },
  REJECTED: {
    color: "bg-red-100 text-red-800",
    icon: Icons.ban,
  },
}

export function CourseEnrollmentsDialog({
  open,
  onOpenChange,
  courseTitle,
  enrollments,
}: CourseEnrollmentsDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Enrollments - {courseTitle}</DialogTitle>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => {
                  const StatusIcon = enrollment.payment
                    ? statusConfig[enrollment.payment.status as keyof typeof statusConfig].icon
                    : Icons.clock
                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        {format(new Date(enrollment.createdAt), "PPP")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {enrollment.student.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {enrollment.student.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {enrollment.payment
                          ? `$${enrollment.payment.amount}`
                          : "No payment"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "flex items-center space-x-1",
                            enrollment.payment
                              ? statusConfig[enrollment.payment.status as keyof typeof statusConfig].color
                              : statusConfig.PENDING.color
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>
                            {enrollment.payment?.status || "PENDING"}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {enrollment.payment?.proofImageUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleImageClick(enrollment.payment!.proofImageUrl!)
                            }
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
                        {enrollment.payment ? (
                          updatingId === enrollment.payment.id ? (
                            <div className="flex items-center space-x-2">
                              <Icons.spinner className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">
                                Updating...
                              </span>
                            </div>
                          ) : (
                            <Select
                              defaultValue={enrollment.payment.status}
                              onValueChange={(value) =>
                                handleStatusChange(enrollment.payment!.id, value)
                              }
                              disabled={enrollment.payment.status !== "PENDING"}
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
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No payment
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

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
