import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, referralCode } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a unique referral code for the new user
    const newUserReferralCode = generateUniqueReferralCode(name);

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referralCode: newUserReferralCode,
        referredBy: referralCode || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
      },
    });

    // If user was referred, create initial referral stats
    if (referralCode) {
      await prisma.referralStats.create({
        data: {
          userId: user.id,
          totalReferrals: 0,
          activeReferrals: 0,
        },
      });
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

function generateUniqueReferralCode(name: string): string {
  const prefix = name.slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${random}`;
}
