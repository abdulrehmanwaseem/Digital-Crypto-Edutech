import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a referral code
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true }
    })

    if (user?.referralCode) {
      return NextResponse.json({ referralCode: user.referralCode })
    }

    // Generate a unique referral code
    const referralCode = nanoid(8).toUpperCase()

    // Update user with new referral code and create referral stats
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        referralCode,
        referralStats: {
          create: {
            totalReferrals: 0,
            activeReferrals: 0,
            earnings: 0
          }
        }
      },
      include: {
        referralStats: true
      }
    })

    return NextResponse.json({
      referralCode: updatedUser.referralCode,
      stats: updatedUser.referralStats
    })
  } catch (error) {
    console.error("Generate Referral Code Error:", error)
    return NextResponse.json(
      { error: "Failed to generate referral code" },
      { status: 500 }
    )
  }
}
