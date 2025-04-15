import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, notes } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
        course: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only process pending payments" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: params.id },
        data: {
          status: action === "APPROVE" ? "VERIFIED" : "REJECTED",
        },
      });

      if (action === "APPROVE") {
        // Process referral bonus if user was referred
        if (payment.user.referredBy) {
          const referralBonus = payment.course.referralBonus as {
            percentage: number;
            maxAmount: number;
          };

          if (!referralBonus || !referralBonus.percentage) {
            console.error("Invalid referral bonus structure:", referralBonus);
            return;
          }

          const bonusAmount = Math.min(
            (payment.amount * referralBonus.percentage) / 100,
            referralBonus.maxAmount || Infinity
          );

          if (isNaN(bonusAmount)) {
            console.error("Invalid bonus amount calculation:", {
              amount: payment.amount,
              percentage: referralBonus.percentage,
              maxAmount: referralBonus.maxAmount,
            });
            return;
          }

          // Get or create wallet for referrer
          const referrerWallet = await tx.wallet.upsert({
            where: { userId: payment.user.referredBy },
            create: {
              userId: payment.user.referredBy,
              balance: bonusAmount,
            },
            update: {
              balance: { increment: bonusAmount },
            },
          });

          // Update referral stats
          await tx.referralStats.upsert({
            where: { userId: payment.user.referredBy },
            create: {
              userId: payment.user.referredBy,
              totalReferrals: 1,
              activeReferrals: 1,
              totalEarnings: bonusAmount,
            },
            update: {
              totalEarnings: { increment: bonusAmount },
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
    });

    return NextResponse.json({
      message: `Payment ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("Process Payment Error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
