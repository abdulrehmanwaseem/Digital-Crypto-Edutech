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

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
        occupation,
        incomeRange,
        occupationType,
        phone,
        role: isFirstUser ? "ADMIN" : "USER", // Set role based on whether it's the first user
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
