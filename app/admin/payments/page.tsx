import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PaymentsTable } from "@/components/admin/payments-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"

async function getPaymentStats() {
  const stats = await prisma.payment.groupBy({
    by: ["status"],
    _count: true,
    _sum: {
      amount: true,
    },
  })

  return stats.reduce((acc, stat) => {
    acc[stat.status.toLowerCase()] = {
      count: stat._count,
      total: stat._sum.amount || 0,
    }
    return acc
  }, {} as Record<string, { count: number; total: number }>)
}

async function getPayments(status?: string) {
  const where = status ? { status: status.toUpperCase() } : {}

  return prisma.payment.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminPaymentsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return notFound()
  }

  const stats = await getPaymentStats()
  const payments = await getPayments()

  async function updatePaymentStatus(paymentId: string, status: string) {
    "use server"
    
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: status as "PENDING" | "VERIFIED" | "REJECTED" },
    })
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <Icons.clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pending?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.pending?.total || 0} total pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verified Payments
              </CardTitle>
              <Icons.check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.verified?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.verified?.total || 0} total revenue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rejected Payments
              </CardTitle>
              <Icons.close className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.rejected?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.rejected?.total || 0} total rejected
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Suspense fallback={<PaymentsTableSkeleton />}>
              <PaymentsTable
                payments={payments}
                onStatusChange={updatePaymentStatus}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Suspense fallback={<PaymentsTableSkeleton />}>
              <PaymentsTable
                payments={payments.filter((p) => p.status === "PENDING")}
                onStatusChange={updatePaymentStatus}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            <Suspense fallback={<PaymentsTableSkeleton />}>
              <PaymentsTable
                payments={payments.filter((p) => p.status === "VERIFIED")}
                onStatusChange={updatePaymentStatus}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <Suspense fallback={<PaymentsTableSkeleton />}>
              <PaymentsTable
                payments={payments.filter((p) => p.status === "REJECTED")}
                onStatusChange={updatePaymentStatus}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PaymentsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-8">
        <div className="space-y-3">
          <div className="h-4 w-[250px] animate-pulse rounded bg-muted" />
          <div className="h-8 w-[450px] animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
