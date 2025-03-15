import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processReferralBonus } from "@/services/referral.service";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status || !["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        course: true,
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Payment has already been processed" },
        { status: 400 }
      );
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      // Update payment status
      const updated = await tx.payment.update({
        where: { id: params.id },
        data: {
          status,
          processedAt: new Date(),
        },
      });

      if (status === "VERIFIED") {
        // Create enrollment
        await tx.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            status: "ACTIVE",
          },
        });

        // Process referral bonus if user was referred
        if (payment.user.referredBy) {
          const referralBonus = payment.course.referralBonus as {
            percentage: number;
            maxAmount: number;
          };

          const bonusAmount = Math.min(
            (payment.amount * referralBonus.percentage) / 100,
            referralBonus.maxAmount
          );

          // Get or create wallet for referrer
          const referrerWallet = await tx.wallet.upsert({
            where: { userId: payment.user.referredBy },
            create: {
              userId: payment.user.referredBy,
              balance: bonusAmount,
              referralBonus: bonusAmount,
            },
            update: {
              balance: { increment: bonusAmount },
              referralBonus: { increment: bonusAmount },
            },
          });

          // Update referral stats
          await tx.referralStats.upsert({
            where: { userId: payment.user.referredBy },
            create: {
              userId: payment.user.referredBy,
              totalReferrals: 1,
              activeReferrals: 1,
              earnings: bonusAmount,
            },
            update: {
              totalReferrals: { increment: 1 },
              activeReferrals: { increment: 1 },
              earnings: { increment: bonusAmount },
            },
          });

          // Create wallet transaction
          await tx.walletTransaction.create({
            data: {
              walletId: referrerWallet.id,
              amount: bonusAmount,
              type: "REFERRAL_BONUS",
              status: "COMPLETED",
              description: `Referral bonus for ${payment.course.title}`,
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({
      message: `Payment ${status.toLowerCase()}`,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Process Payment API Error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
