import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        referredBy: true;
        wallet: true;
      };
    };
    course: {
      select: {
        id: true;
        title: true;
        price: true;
        referralBonus: true;
      };
    };
  };
}>;

export async function GET(request: Request) {
  try {
    // Check admin authorization
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause for filtering
    const where = {
      ...(status && status !== "all" ? { status } : {}),
      ...(search
        ? {
            OR: [
              { user: { email: { contains: search, mode: "insensitive" } } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { course: { title: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    // Get transactions with pagination and filtering
    const [transactions, total] = await Promise.all([
      prisma.payment.findMany({
        where: where as Prisma.PaymentWhereInput,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              referredBy: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              referralBonus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where: where as Prisma.PaymentWhereInput }),
    ]);

    // Transform the data for frontend
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      proofImageUrl: transaction.proofUrl,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
        referredBy: transaction.user.referredBy,
      },
      course: {
        id: transaction.course.id,
        title: transaction.course.title,
        price: transaction.course.price,
        referralBonus: transaction.course.referralBonus,
      },
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId, status } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: "Transaction ID and status are required" },
        { status: 400 }
      );
    }

    // Get the transaction with user and course details
    const transaction = await prisma.payment.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referredBy: true,
            wallet: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            referralBonus: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Update transaction status
    const updatedTransaction = await prisma.payment.update({
      where: { id: transactionId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            referredBy: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            referralBonus: true,
          },
        },
      },
    });

    // If transaction is approved, handle referral bonus
    if (status === "COMPLETED" && transaction.user.referredBy) {
      const bonusAmount = transaction.amount * 0.1; // 10% referral bonus

      // Create referral bonus record
      await prisma.referralBonus.create({
        data: {
          userId: transaction.user.referredBy,
          referredUserId: transaction.user.id,
          courseId: transaction.courseId,
          amount: bonusAmount,
          type: "COURSE_PURCHASE",
          status: "PAID",
        },
      });

      // Update referrer's wallet
      await prisma.wallet.update({
        where: { userId: transaction.user.referredBy },
        data: {
          balance: {
            increment: bonusAmount,
          },
        },
      });

      // Update referral stats
      await prisma.referralStats.update({
        where: { userId: transaction.user.referredBy },
        data: {
          totalReferrals: { increment: 1 },
          activeReferrals: { increment: 1 },
          totalEarnings: { increment: bonusAmount },
        },
      });
    }

    return NextResponse.json(updatedTransaction);
  } catch (error: unknown) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
