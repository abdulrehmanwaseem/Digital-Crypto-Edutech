import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WithdrawalStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, notes } = await request.json();

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: params.id },
      include: { wallet: true },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        { error: "Withdrawal request has already been processed" },
        { status: 400 }
      );
    }

    const updatedWithdrawal = await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      const updated = await tx.withdrawal.update({
        where: { id: params.id },
        data: {
          status: status as WithdrawalStatus,
          processedAt: new Date(),
          notes: notes || null,
        },
      });

      // If approved, update wallet balance
      if (status === "APPROVED") {
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            balance: {
              decrement: withdrawal.amount,
            },
          },
        });

        // Create a wallet transaction record
        await tx.walletTransaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: "WITHDRAWAL",
            amount: withdrawal.amount,
            status: "COMPLETED",
            description: `Withdrawal processed via ${withdrawal.paymentMethod}`,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      message: `Withdrawal request ${status.toLowerCase()}`,
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("Process Withdrawal API Error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal request" },
      { status: 500 }
    );
  }
}
