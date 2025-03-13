import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export class PaymentService {
  static async processPayment(data: {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    transactionId: string;
    proofImageUrl: string;
    referralCode?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Optionally, fetch the user if you need to validate referral info
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, referredBy: true },
      });
      if (!user) {
        throw new Error("User not found");
      }

      // Create a payment record with a PENDING status
      const payment = await tx.payment.create({
        data: {
          userId: data.userId,
          courseId: data.courseId,
          amount: data.amount,
          currency: data.currency,
          transactionId: data.transactionId,
          proofImageUrl: data.proofImageUrl,
          // Save referralCode from payload (if any)
          referralCode: data.referralCode,
          status: PaymentStatus.PENDING,
        },
      });

      // Create enrollment record with PENDING status
      await tx.enrollment.create({
        data: {
          userId: data.userId,
          courseId: data.courseId,
          status: "PENDING",
        },
      });

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

      if (!payment) throw new Error("Payment not found");

      // Update payment status to VERIFIED and mark the processed time
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.VERIFIED,
          processedAt: new Date(),
        },
      });

      // Update enrollment status to ACTIVE
      await tx.enrollment.updateMany({
        where: {
          userId: payment.userId,
          courseId: payment.courseId,
          status: "PENDING",
        },
        data: { status: "ACTIVE" },
      });

      // Process referral commission if a referral code is present either from the payment or the user record
      const referralCode = payment.referralCode || payment.user.referredBy;
      if (referralCode) {
        await this.processReferralCommission(tx, payment, referralCode);
      }

      return updatedPayment;
    });
  }

  private static async processReferralCommission(
    tx: any,
    payment: any,
    referralCode: string
  ) {
    // Find the referrer based on the referralCode
    const referrer = await tx.user.findUnique({
      where: { referralCode: referralCode },
      select: { id: true },
    });
    if (!referrer) return;

    const commissionRate = await this.calculateCommissionRate(referrer.id);
    const commission = (payment.amount * commissionRate) / 100;

    await tx.referralStats.upsert({
      where: { userId: referrer.id },
      create: {
        userId: referrer.id,
        totalReferrals: 1,
        activeReferrals: 1,
        earnings: commission,
      },
      update: {
        totalReferrals: { increment: 1 },
        activeReferrals: { increment: 1 },
        earnings: { increment: commission },
      },
    });
  }

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

  static async rejectPayment(paymentId: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });
      if (!payment) throw new Error("Payment not found");

      // Update payment status to REJECTED
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REJECTED },
      });

      // Remove the pending enrollment
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
