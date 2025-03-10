import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const paymentSchema = z.object({
  planName: z.string(),
  price: z.number(),
  paymentMethod: z.enum(['bank', 'crypto', 'other']),
  transactionId: z.string(),
  proofImageUrl: z.string().url(),
  referralCode: z.string().optional(),
  referrerId: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        courseId: "default", // We'll update this once we have course integration
        amount: validatedData.price,
        proofImageUrl: validatedData.proofImageUrl,
        status: "PENDING"
      }
    })

    // If referral code was used, update referral stats
    if (validatedData.referrerId) {
      await prisma.referralStats.update({
        where: { userId: validatedData.referrerId },
        data: {
          totalReferrals: { increment: 1 },
          activeReferrals: { increment: 1 },
          earnings: {
            increment: validatedData.price * 0.1 // 10% referral commission
          }
        }
      })

      // Update the referred user's referredBy field
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referredBy: validatedData.referrerId }
      })
    }

    return NextResponse.json({
      message: "Payment submitted successfully",
      paymentId: payment.id
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Payment Submit Error:", error)
    return NextResponse.json(
      { error: "Failed to submit payment" },
      { status: 500 }
    )
  }
}
