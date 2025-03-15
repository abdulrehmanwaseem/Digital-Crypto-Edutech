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
  achievements: JSON.stringify([]),
  activities: JSON.stringify([]),
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

    const { email, password, name, occupation, referralCode } =
      validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    let referredBy: string | undefined;
    if (referralCode) {
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
      referredBy = referrer.id;

      // Update referrer's stats
      await prisma.referralStats.upsert({
        where: { userId: referrer.id },
        create: {
          userId: referrer.id,
          totalReferrals: 1,
          activeReferrals: 1,
          earnings: 0,
        },
        update: {
          totalReferrals: { increment: 1 },
          activeReferrals: { increment: 1 },
        },
      });
    }

    const hashedPassword = await hash(password, 10);
    const newReferralCode = generateReferralCode();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        occupation,
        referralCode: newReferralCode,
        referredBy,
        profile: {
          create: {
            ...defaultProfile,
          },
        },
        referralStats: {
          create: {
            totalReferrals: 0,
            activeReferrals: 0,
            earnings: 0,
          },
        },
        wallet: {
          create: {
            balance: 0,
            referralBonus: 0,
          },
        },
      },
      include: {
        profile: true,
        wallet: true,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          occupation: user.occupation,
          role: user.role,
          referralCode: user.referralCode,
          profile: {
            ...user.profile,
            achievements: user.profile?.achievements
              ? JSON.parse(user.profile.achievements as string)
              : [],
            activities: user.profile?.activities
              ? JSON.parse(user.profile.activities as string)
              : [],
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
