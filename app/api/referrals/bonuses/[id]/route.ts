import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for updating a referral bonus
const updateBonusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
});

// GET: Fetch a specific referral bonus
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bonus = await prisma.referralBonus.findUnique({
      where: { id: params.id },
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

    if (!bonus) {
      return NextResponse.json(
        { error: "Referral bonus not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to view this bonus
    if (bonus.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ bonus });
  } catch (error) {
    console.error("Fetch Referral Bonus Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral bonus" },
      { status: 500 }
    );
  }
}

// PATCH: Update a specific referral bonus
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateBonusSchema.parse(body);

    // Check if the bonus exists
    const existingBonus = await prisma.referralBonus.findUnique({
      where: { id: params.id },
    });

    if (!existingBonus) {
      return NextResponse.json(
        { error: "Referral bonus not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to update this bonus
    if (
      existingBonus.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the bonus
    const updatedBonus = await prisma.referralBonus.update({
      where: { id: params.id },
      data: { status: validatedData.status },
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

    // If the bonus is marked as PAID, update the wallet
    if (validatedData.status === "PAID" && existingBonus.status !== "PAID") {
      await prisma.wallet.update({
        where: { userId: existingBonus.userId },
        data: {
          balance: { increment: existingBonus.amount },
          referralBalance: { increment: existingBonus.amount },
        },
      });
    }

    return NextResponse.json({
      message: "Referral bonus updated successfully",
      bonus: updatedBonus,
    });
  } catch (error) {
    console.error("Update Referral Bonus Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update referral bonus" },
      { status: 500 }
    );
  }
}
