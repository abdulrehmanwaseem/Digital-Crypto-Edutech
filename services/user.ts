import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { generateReferralCode } from "@/lib/utils";

export type CreateUserData = {
  email: string;
  password: string;
  name: string;
  occupation: string;
  referredBy?: string;
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          select: {
            bio: true,
            location: true,
            avatar: true,
            achievements: true,
            activities: true,
          }
        },
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            bio: true,
            location: true,
            avatar: true,
            achievements: true,
            activities: true,
          }
        },
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserByReferralCode = async (referralCode: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { referralCode },
      include: {
        profile: {
          select: {
            bio: true,
            location: true,
            avatar: true,
            achievements: true,
            activities: true,
          }
        },
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const createUser = async (data: CreateUserData) => {
  try {
    // Generate a unique referral code
    let referralCode = generateReferralCode();
    let existingUser = await getUserByReferralCode(referralCode);
    
    // Keep generating referral codes until we find a unique one
    while (existingUser) {
      referralCode = generateReferralCode();
      existingUser = await getUserByReferralCode(referralCode);
    }
    
    const user = await prisma.user.create({
      data: {
        ...data,
        role: Role.USER,
        referralCode,
        profile: {
          create: {
            achievements: {},
            activities: {},
          }
        },
        referralStats: {
          create: {
            totalReferrals: 0,
            activeReferrals: 0,
            earnings: 0,
          },
        },
      },
      include: {
        profile: {
          select: {
            bio: true,
            location: true,
            avatar: true,
            achievements: true,
            activities: true,
          }
        },
      },
    });

    // If this user was referred, update the referrer's stats
    if (data.referredBy) {
      await prisma.referralStats.update({
        where: { userId: data.referredBy },
        data: {
          totalReferrals: { increment: 1 },
          activeReferrals: { increment: 1 },
        },
      });
    }

    return user;
  } catch (error) {
    console.error("CREATE_USER_ERROR", error);
    return null;
  }
};
