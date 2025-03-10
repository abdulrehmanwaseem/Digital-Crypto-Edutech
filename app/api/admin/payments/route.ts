import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePaymentSchema = z.object({
  paymentId: z.string(),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = status ? { status: status.toUpperCase() } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Admin Payments Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = updatePaymentSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }

    const { paymentId, status } = validatedFields.data;

    // Get the payment with its associated enrollment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        course: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Start a transaction to update both payment and enrollment
    const updatedPayment = await prisma.$transaction(async (tx) => {
      // Update payment status
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: { status },
      });

      // Update enrollment status based on payment status
      if (status === "VERIFIED") {
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

        // Update referral stats if the user was referred
        const user = await tx.user.findUnique({
          where: { id: payment.userId },
          select: { referredBy: true },
        });

        if (user?.referredBy) {
          await tx.referralStats.update({
            where: { userId: user.referredBy },
            data: {
              totalReferrals: { increment: 1 },
              activeReferrals: { increment: 1 },
              earnings: { increment: payment.amount * 0.1 }, // 10% commission
            },
          });
        }
      } else if (status === "REJECTED") {
        await tx.enrollment.updateMany({
          where: {
            userId: payment.userId,
            courseId: payment.courseId,
            status: "PENDING",
          },
          data: {
            status: "CANCELLED",
          },
        });
      }

      return payment;
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("Update Payment Error:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
