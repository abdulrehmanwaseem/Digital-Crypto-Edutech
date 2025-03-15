import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method, details } = body;
    console.log(body, "TEST");

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });
    console.log(wallet, session, "TEST");

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        walletId: wallet.id,
        amount,
        paymentMethod: method,
        accountDetails: details,
        status: "PENDING",
      },
    });

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    );
  }
}
