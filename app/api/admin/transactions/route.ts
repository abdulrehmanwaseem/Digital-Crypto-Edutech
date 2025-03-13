import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
    const status = searchParams.get("status") || undefined;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { transactionId: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status } : {},
      ],
    };

    const [transactions, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    console.log(transactions);

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        userId: t.user.id,
        userName: t.user.name,
        courseId: t.course.id,
        courseName: t.course.title,
        amount: t.amount,
        status: t.status,
        proofImageUrl: t.proofImageUrl,
        transactionId: t.transactionId,
        createdAt: t.createdAt,
        notes: t.notes,
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Transactions API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
