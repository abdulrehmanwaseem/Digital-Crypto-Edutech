import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applyReferralSchema = z.object({
  code: z.string().min(1, "Referral code is required"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = applyReferralSchema.parse(body);

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
      where: { referralCode: code },
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

    // Don't allow self-referral
    if (referrer.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot use your own referral code" },
        { status: 400 }
      );
    }

    // Fixed referral bonus amount of $5
    const referralBonusAmount = 5;

    // Update user and referrer in a transaction
    const [updatedUser, referralBonus] = await prisma.$transaction(
      async (tx) => {
        // Update user with referrer
        const updatedUser = await tx.user.update({
          where: { id: session.user.id },
          data: { referredBy: referrer.id },
        });

        // Create referral bonus for registration
        const bonus = await tx.referralBonus.create({
          data: {
            userId: referrer.id,
            referredUserId: session.user.id,
            amount: referralBonusAmount,
            type: "REGISTRATION",
            status: "PENDING",
          },
        });

        // Update referrer's stats
        await tx.referralStats.upsert({
          where: { userId: referrer.id },
          create: {
            userId: referrer.id,
            totalReferrals: 1,
            activeReferrals: 1,
            totalEarnings: referralBonusAmount,
          },
          update: {
            totalReferrals: { increment: 1 },
            activeReferrals: { increment: 1 },
            totalEarnings: {
              increment: referralBonusAmount,
            },
          },
        });

        // Update referrer's wallet
        await tx.wallet.upsert({
          where: { userId: referrer.id },
          create: {
            userId: referrer.id,
            balance: referralBonusAmount,
            referralBalance: referralBonusAmount,
          },
          update: {
            balance: { increment: referralBonusAmount },
            referralBalance: { increment: referralBonusAmount },
          },
        });

        return [updatedUser, bonus];
      }
    );

    return NextResponse.json({
      success: true,
      message: "Referral code applied successfully",
      referralBonus,
    });
  } catch (error) {
    console.error("Apply Referral API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to apply referral code" },
      { status: 500 }
    );
  }
}
