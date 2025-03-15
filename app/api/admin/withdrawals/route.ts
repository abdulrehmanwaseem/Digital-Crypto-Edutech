import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WithdrawalStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status =
      (searchParams.get("status") as WithdrawalStatus) || undefined;

    const where = {
      ...(status && { status }),
      ...(search && {
        user: {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      }),
    };

    type WithdrawalWithUser = Awaited<
      ReturnType<typeof prisma.withdrawal.findFirst>
    > & {
      user: { id: string; name: string; email: string };
    };

    const [withdrawals, total] = await prisma.$transaction([
      prisma.withdrawal.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return NextResponse.json({
      withdrawals: (withdrawals as WithdrawalWithUser[]).map((w) => ({
        id: w.id,
        userId: w.userId,
        userName: w.user.name,
        amount: w.amount,
        status: w.status,
        paymentMethod: w.paymentMethod,
        accountDetails: w.accountDetails,
        notes: w.notes,
        createdAt: w.createdAt,
        processedAt: w.processedAt,
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Withdrawals API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}
