import { prisma } from "@/lib/prisma";

export class PaymentService {
  static async calculateCommissionRate(userId: string): Promise<number> {
    const stats = await prisma.referralStats.findUnique({
      where: { userId },
      select: { earnings: true },
    });

    const earnings = stats?.earnings || 0;

    if (earnings >= 10000) return 20;
    if (earnings >= 5000) return 15;
    if (earnings >= 1000) return 12;
    return 10;
  }

  static async processPayment(data: {
    userId: string;
    courseId: string;
    amount: number;
    proofImageUrl?: string;
    referralCode?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Get user with referral info
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: {
          id: true,
          referredBy: true,
          referralCode: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId: data.userId,
          courseId: data.courseId,
          amount: data.amount,
          status: "PENDING",
          proofUrl: data?.proofImageUrl || "",
        },
      });

      // If user was referred, process referral bonus
      if (user.referredBy) {
        const referrer = await tx.user.findUnique({
          where: { id: user.referredBy },
          include: {
            referralStats: true,
            wallet: true,
          },
        });

        if (referrer) {
          const bonusAmount = data.amount * 0.1; // 10% commission

          // Create referral bonus
          await tx.referralBonus.create({
            data: {
              userId: referrer.id,
              referredUserId: user.id,
              courseId: data.courseId,
              amount: bonusAmount,
              type: "COURSE_PURCHASE",
              status: "PENDING",
            },
          });

          // Update referrer's stats
          if (referrer.referralStats) {
            await tx.referralStats.update({
              where: { id: referrer.referralStats.id },
              data: {
                totalReferrals: { increment: 1 },
                activeReferrals: { increment: 1 },
                totalEarnings: { increment: bonusAmount },
              },
            });
          } else {
            await tx.referralStats.create({
              data: {
                userId: referrer.id,
                totalReferrals: 1,
                activeReferrals: 1,
                totalEarnings: bonusAmount,
              },
            });
          }

          // Update referrer's wallet
          if (referrer.wallet) {
            await tx.wallet.update({
              where: { id: referrer.wallet.id },
              data: {
                referralBalance: { increment: bonusAmount },
              },
            });
          } else {
            await tx.wallet.create({
              data: {
                userId: referrer.id,
                referralBalance: bonusAmount,
              },
            });
          }
        }
      }

      return payment;
    });
  }

  static async verifyPayment(paymentId: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: {
            select: { referredBy: true },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Update payment status
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "VERIFIED" },
      });

      // Update enrollment status
      await tx.enrollment.updateMany({
        where: {
          userId: payment.userId,
          courseId: payment.courseId,
          status: "PENDING",
        },
        data: { status: "ACTIVE" },
      });

      // Update referral stats if applicable
      if (payment.user.referredBy) {
        const referrer = await tx.user.findUnique({
          where: { referralCode: payment.user.referredBy },
          select: { id: true },
        });

        if (referrer) {
          await tx.referralStats.update({
            where: { userId: referrer.id },
            data: { activeReferrals: { increment: 1 } },
          });
        }
      }

      return payment;
    });
  }

  static async rejectPayment(paymentId: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Update payment status
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "REJECTED" },
      });

      // Delete enrollment record
      await tx.enrollment.deleteMany({
        where: {
          userId: payment.userId,
          courseId: payment.courseId,
          status: "PENDING",
        },
      });

      return payment;
    });
  }
}
