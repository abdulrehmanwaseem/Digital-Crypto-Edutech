import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePaymentSchema = z.object({
  paymentId: z.string(),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"])
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, status } = updatePaymentSchema.parse(body)

    // Update payment status
const payment = await prisma.payment.update({
  where: { id: paymentId },
  data: { status },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        referredBy: true
      }
    },
    course: true
  }
})

// If payment is verified, update enrollment and handle referral
if (status === "VERIFIED") {
  // Update or create enrollment
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: payment.user.id,
        courseId: payment.courseId
      }
    },
    create: {
      userId: payment.user.id,
      courseId: payment.courseId,
      status: "ACTIVE"
    },
    update: {
      status: "ACTIVE"
    }
  })

  // Handle referral commission if applicable
  if (payment.user.referredBy) {
    const referralCommission = payment.amount * 0.1 // 10% commission

    await prisma.referralStats.upsert({
      where: {
        userId: payment.user.referredBy
      },
      update: {
        earnings: {
          increment: referralCommission
        },
        totalReferrals: {
          increment: 1
        }
      },
      create: {
        userId: payment.user.referredBy,
        earnings: referralCommission,
        totalReferrals: 1,
        activeReferrals: 1
      }
    })
  }
}
    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    console.error("Update Payment Status Error:", error)
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    )
  }
}
