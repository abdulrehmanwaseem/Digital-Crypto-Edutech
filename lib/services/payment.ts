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
    currency: string;
    proofImageUrl?: string;
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
          currency: data.currency,
          proofImageUrl: data?.proofImageUrl || "",
          status: "PENDING",
        },
      });

      // Create enrollment record
      await tx.enrollment.create({
        data: {
          userId: data.userId,
          courseId: data.courseId,
          status: "PENDING",
        },
      });

      // Handle referral commission if user was referred
      if (user.referredBy) {
        const commissionRate = await PaymentService.calculateCommissionRate(
          user.referredBy
        );
        const commission = (data.amount * commissionRate) / 100;

        // Update referrer's wallet
        const wallet = await tx.wallet.upsert({
          where: { userId: user.referredBy },
          create: {
            userId: user.referredBy,
            balance: commission,
            referralBonus: commission,
          },
          update: {
            balance: { increment: commission },
            referralBonus: { increment: commission },
          },
        });

        // Update referral stats
        await tx.referralStats.upsert({
          where: { userId: user.referredBy },
          create: {
            userId: user.referredBy,
            totalReferrals: 1,
            activeReferrals: 1,
            earnings: commission,
          },
          update: {
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
            description: `Referral commission for course purchase`,
          },
        });
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
