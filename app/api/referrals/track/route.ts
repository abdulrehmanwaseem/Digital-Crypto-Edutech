import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralCode, planId } = await req.json();

    if (!referralCode || !planId) {
      return NextResponse.json(
        { error: "Referral code and plan ID are required" },
        { status: 400 }
      );
    }

    // Find the referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        referralStats: true,
        wallet: true,
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    // Get the plan details
    const plan = await prisma.course.findUnique({
      where: { id: planId },
      select: {
        id: true,
        price: true,
        referralBonus: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Calculate commission
    const commissionRate = await prisma.referralStats
      .findUnique({
        where: { userId: referrer.id },
        select: { earnings: true },
      })
      .then((stats) => {
        const earnings = stats?.earnings || 0;
        if (earnings >= 10000) return 20;
        if (earnings >= 5000) return 15;
        if (earnings >= 1000) return 12;
        return 10;
      });

    const commission = (plan.price * commissionRate) / 100;

    // Update referral stats and wallet in a transaction
    await prisma.$transaction(async (tx) => {
      // Create or update wallet
      const wallet = await tx.wallet.upsert({
        where: { userId: referrer.id },
        create: {
          userId: referrer.id,
          balance: commission,
          referralBonus: commission,
        },
        update: {
          balance: { increment: commission },
          referralBonus: { increment: commission },
        },
      });

      // Update referral stats
      await tx.referralStats.update({
        where: { userId: referrer.id },
        data: {
          earnings: { increment: commission },
        },
      });

      // Create transaction record
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: commission,
          type: "REFERRAL_BONUS",
          status: "COMPLETED",
          description: `Referral commission for plan purchase`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Referral tracked and commission credited successfully",
    });
  } catch (error) {
    console.error("Error tracking referral:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
