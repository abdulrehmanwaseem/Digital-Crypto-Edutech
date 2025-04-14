import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for creating a referral bonus
const createBonusSchema = z.object({
  referredUserId: z.string(),
  courseId: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum([
    "REGISTRATION",
    "COURSE_PURCHASE",
    "SUBSCRIPTION",
    "SPECIAL_PROMOTION",
  ]),
});

// GET: Fetch all referral bonuses for the current user
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build filter conditions
    const where: any = { userId: session.user.id };
    if (status) where.status = status;
    if (type) where.type = type;

    const bonuses = await prisma.referralBonus.findMany({
      where,
      include: {
        referredUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bonuses });
  } catch (error) {
    console.error("Fetch Referral Bonuses Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral bonuses" },
      { status: 500 }
    );
  }
}

// POST: Create a new referral bonus
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBonusSchema.parse(body);

    // Check if the referred user exists
    const referredUser = await prisma.user.findUnique({
      where: { id: validatedData.referredUserId },
    });

    if (!referredUser) {
      return NextResponse.json(
        { error: "Referred user not found" },
        { status: 404 }
      );
    }

    // Check if the course exists if provided
    if (validatedData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: validatedData.courseId },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }
    }

    // Create the referral bonus
    const bonus = await prisma.referralBonus.create({
      data: {
        userId: session.user.id,
        referredUserId: validatedData.referredUserId,
        courseId: validatedData.courseId,
        amount: validatedData.amount,
        type: validatedData.type,
        status: "PENDING",
      },
      include: {
        referredUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
    });

    // Update the user's wallet and referral stats
    await prisma.$transaction([
      // Update wallet
      prisma.wallet.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          balance: validatedData.amount,
          referralBalance: validatedData.amount,
        },
        update: {
          balance: { increment: validatedData.amount },
          referralBalance: { increment: validatedData.amount },
        },
      }),
      // Update referral stats
      prisma.referralStats.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalReferrals: 1,
          activeReferrals: 1,
          totalEarnings: validatedData.amount,
        },
        update: {
          totalEarnings: { increment: validatedData.amount },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Referral bonus created successfully",
      bonus,
    });
  } catch (error) {
    console.error("Create Referral Bonus Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create referral bonus" },
      { status: 500 }
    );
  }
}
