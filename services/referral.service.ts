import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

export async function createReferralCode(userId: string) {
  // Generate a unique referral code
  let code = generateReferralCode();
  let attempts = 0;
  const maxAttempts = 5;

  // Keep trying until we get a unique code or reach max attempts
  while (attempts < maxAttempts) {
    const existing = await prisma.referral.findUnique({
      where: { code },
    });

    if (!existing) break;
    code = generateReferralCode();
    attempts++;
  }

  if (attempts === maxAttempts) {
    throw new Error("Failed to generate unique referral code");
  }

  // Create referral record and update user
  const [referral] = await prisma.$transaction([
    prisma.referral.create({
      data: {
        code,
        userId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
    }),
    prisma.referralStats.create({
      data: { userId },
    }),
  ]);

  return referral;
}

export async function processReferralBonus(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      course: true,
      referral: {
        include: {
          user: {
            include: {
              wallet: true,
            },
          },
        },
      },
    },
  });

  if (!payment || !payment.referralCode || !payment.referral) {
    return null;
  }

  const referralBonus = payment.course.referralBonus as {
    percentage: number;
    maxAmount: number;
  };

  if (!referralBonus) {
    return null;
  }

  const bonusAmount = Math.min(
    (payment.amount * referralBonus.percentage) / 100,
    referralBonus.maxAmount
  );

  // Update referrer's wallet and stats
  const [wallet, stats, transaction] = await prisma.$transaction([
    // Update wallet balance
    prisma.wallet.update({
      where: { userId: payment.referral.userId },
      data: {
        balance: { increment: bonusAmount },
        referralBonus: { increment: bonusAmount },
      },
    }),
    // Update referral stats
    prisma.referralStats.update({
      where: { userId: payment.referral.userId },
      data: {
        totalReferrals: { increment: 1 },
        activeReferrals: { increment: 1 },
        earnings: { increment: bonusAmount },
      },
    }),
    // Create wallet transaction
    prisma.walletTransaction.create({
      data: {
        walletId: payment.referral.user.wallet!.id,
        amount: bonusAmount,
        type: "REFERRAL_BONUS",
        status: "COMPLETED",
        description: `Referral bonus for ${payment.course.title}`,
      },
    }),
  ]);

  return { wallet, stats, transaction };
}

export async function getReferralStats(userId: string) {
  const stats = await prisma.referralStats.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          referralCode: true,
          wallet: {
            select: {
              referralBonus: true,
            },
          },
        },
      },
    },
  });

  if (!stats) {
    throw new Error("Referral stats not found");
  }

  // Fetch referred users with their total spent
  const referredUsers = await prisma.user.findMany({
    where: { referredBy: userId },
    select: {
      name: true,
      email: true,
      createdAt: true,
      payments: {
        where: {
          status: "VERIFIED",
        },
        select: {
          amount: true,
        },
      },
    },
  });

  return {
    code: stats.user.referralCode,
    totalReferrals: stats.totalReferrals,
    activeReferrals: stats.activeReferrals,
    earnings: stats.earnings,
    availableBalance: stats.user.wallet?.referralBonus || 0,
    referredUsers: referredUsers.map((user) => ({
      name: user.name,
      email: user.email,
      joinedAt: user.createdAt.toISOString(),
      totalSpent: user.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ),
    })),
  };
}

export async function validateReferralCode(code: string, userId: string) {
  // Find the referral and check if it exists
  const referral = await prisma.referral.findUnique({
    where: { code },
    include: {
      user: true,
    },
  });

  if (!referral) {
    throw new Error("Invalid referral code");
  }

  // Check if user is trying to use their own referral code
  if (referral.userId === userId) {
    throw new Error("Cannot use your own referral code");
  }

  // Check if user has already been referred
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.referredBy) {
    throw new Error("You have already used a referral code");
  }

  return referral;
}

export async function applyReferralCode(code: string, userId: string) {
  const referral = await validateReferralCode(code, userId);

  // Update user with referral code
  await prisma.user.update({
    where: { id: userId },
    data: { referredBy: referral.userId },
  });

  return referral;
}
