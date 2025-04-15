import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { RegisterSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

const defaultProfile = {
  bio: "Not specified",
  location: "Not specified",
  avatar: "",
  twitter: "",
  telegram: "",
  website: "",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = RegisterSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.errors },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      name,
      occupation,
      referralCode,
      incomeRange,
      occupationType,
      phone,
    } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Check if this is the first user
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    let referredBy: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: {
          id: true,
        },
      });

      if (!referrer) {
        return NextResponse.json(
          { error: "Invalid referral code" },
          { status: 400 }
        );
      }
      referredBy = referrer.id;
    }

    const hashedPassword = await hash(password, 10);
    const newReferralCode = generateReferralCode();

    // Create user and handle referral bonus in a transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // Create the new user
        const user = await tx.user.create({
          data: {
            email,
            hashedPassword,
            name,
            occupation,
            incomeRange,
            occupationType,
            phone,
            role: isFirstUser ? "ADMIN" : "USER",
            referralCode: newReferralCode,
            referredBy,
            profile: {
              create: {
                ...defaultProfile,
              },
            },
          },
          include: {
            profile: true,
          },
        });

        // If user was referred, create referral bonus and update stats
        if (referredBy) {
          // Create or get referrer's wallet
          const referrerWallet = await tx.wallet.upsert({
            where: { userId: referredBy },
            create: {
              userId: referredBy,
              balance: 5, // $5 registration bonus
              referralBalance: 5,
            },
            update: {
              balance: { increment: 5 },
              referralBalance: { increment: 5 },
            },
          });

          // Create referral bonus record
          await tx.referralBonus.create({
            data: {
              userId: referredBy,
              referredUserId: user.id,
              amount: 5,
              type: "REGISTRATION",
              status: "PENDING",
            },
          });

          // Create or update referral stats
          await tx.referralStats.upsert({
            where: { userId: referredBy },
            create: {
              userId: referredBy,
              totalReferrals: 1,
              activeReferrals: 1,
              totalEarnings: 5,
            },
            update: {
              totalReferrals: { increment: 1 },
              activeReferrals: { increment: 1 },
              totalEarnings: { increment: 5 },
            },
          });

          // Create wallet transaction
          await tx.walletTransaction.create({
            data: {
              walletId: referrerWallet.id,
              amount: 5,
              type: "REFERRAL_BONUS",
              status: "COMPLETED",
              description: "Registration referral bonus",
            },
          });
        }

        return user;
      },
      {
        timeout: 10000, // Increase timeout to 10 seconds
        maxWait: 15000, // Maximum time to wait for transaction to start
      }
    );

    return NextResponse.json(
      {
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          occupation: result.occupation,
          role: result.role,
          referralCode: result.referralCode,
          profile: {
            ...result.profile,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
