import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const referralSchema = z.object({
  code: z.string().min(1, "Referral code is required")
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code } = referralSchema.parse(body)

    // Don't allow self-referral
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true }
    })

    if (user?.referralCode === code) {
      return NextResponse.json(
        { error: "Cannot use your own referral code" },
        { status: 400 }
      )
    }

    const referrer = await prisma.user.findFirst({
      where: { referralCode: code },
      select: {
        id: true,
        referralStats: true
      }
    })

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      )
    }

    // Check if user already used a referral code
    const existingReferral = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referredBy: true }
    })

    if (existingReferral?.referredBy) {
      return NextResponse.json(
        { error: "You have already used a referral code" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      referrerId: referrer.id,
      stats: referrer.referralStats
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Validate Referral Error:", error)
    return NextResponse.json(
      { error: "Failed to validate referral code" },
      { status: 500 }
    )
  }
}
