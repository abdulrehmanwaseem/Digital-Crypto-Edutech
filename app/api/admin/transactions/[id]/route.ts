import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, notes } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        course: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only process pending payments" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: params.id },
        data: {
          status: action === "APPROVE" ? "VERIFIED" : "REJECTED",
        },
      });

      if (action === "APPROVE") {
        // Create or update enrollment
        await tx.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: payment.userId,
              courseId: payment.courseId,
            },
          },
          create: {
            userId: payment.userId,
            courseId: payment.courseId,
            status: "ACTIVE",
          },
          update: {
            status: "ACTIVE",
          },
        });
      }
    });

    return NextResponse.json({
      message: `Payment ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("Transaction Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
