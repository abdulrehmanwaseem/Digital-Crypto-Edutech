import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralCode } = await req.json();

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Check if user already has a referrer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referredBy: true },
    });

    if (user?.referredBy) {
      return NextResponse.json(
        { error: "You have already used a referral code" },
        { status: 400 }
      );
    }

    // Find the referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        referralStats: true,
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    // Update user and referrer in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user with referrer
      await tx.user.update({
        where: { id: session.user.id },
        data: { referredBy: referrer.id },
      });

      // Update referrer's stats
      await tx.referralStats.upsert({
        where: { userId: referrer.id },
        create: {
          userId: referrer.id,
          totalReferrals: 1,
          activeReferrals: 1,
          earnings: 0,
        },
        update: {
          totalReferrals: { increment: 1 },
          activeReferrals: { increment: 1 },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Referral code applied successfully",
    });
  } catch (error) {
    console.error("Apply Referral Error:", error);
    return NextResponse.json(
      { error: "Failed to apply referral code" },
      { status: 500 }
    );
  }
}
