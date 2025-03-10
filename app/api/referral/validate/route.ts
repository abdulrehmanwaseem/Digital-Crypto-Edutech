import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Referral code is required" },
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

    return NextResponse.json({
      valid: true,
      referrerId: referrer.id,
      stats: referrer.referralStats
    })
  } catch (error) {
    console.error("Validate Referral Error:", error)
    return NextResponse.json(
      { error: "Failed to validate referral code" },
      { status: 500 }
    )
  }
}
