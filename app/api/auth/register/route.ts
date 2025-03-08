import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { RegisterSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

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

    const { email, password, fullName, occupation, referralCode } = validatedFields.data;
    
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
      });
      if (!referrer) {
        return NextResponse.json(
          { error: "Invalid referral code" },
          { status: 400 }
        );
      }
      referredBy = referrer.id;

      // Update referrer's stats
      await prisma.referralStats.update({
        where: { userId: referrer.id },
        data: {
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
        fullName,
        occupation,
        referralCode: newReferralCode,
        referredBy,
        profile: {
          create: {
            bio: "",
            location: "",
            avatar: "",
            achievements: [],
            activities: [],
          }
        },
        referralStats: {
          create: {
            totalReferrals: 0,
            activeReferrals: 0,
          }
        }
      },
    });

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        occupation: user.occupation,
        role: user.role,
        referralCode: user.referralCode,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}