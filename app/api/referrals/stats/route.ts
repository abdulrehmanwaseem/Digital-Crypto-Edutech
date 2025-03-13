import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await prisma.referralStats.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            referralCode: true
          }
        }
      }
    })

    if (!stats) {
      return NextResponse.json({
        referralCode: session.user.referralCode,
        totalReferrals: 0,
        activeReferrals: 0,
        earnings: 0,
        referredUsers: []
      })
    }

    // Get referred users
    const referredUsers = await prisma.user.findMany({
      where: { referredBy: session.user.referralCode },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        payments: {
          where: { status: "VERIFIED" },
          select: {
            amount: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({
      referralCode: session.user.referralCode,
      totalReferrals: stats.totalReferrals,
      activeReferrals: stats.activeReferrals,
      earnings: stats.earnings,
      referredUsers: referredUsers.map(user => ({
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt,
        totalSpent: user.payments.reduce((sum, p) => sum + p.amount, 0)
      }))
    })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}