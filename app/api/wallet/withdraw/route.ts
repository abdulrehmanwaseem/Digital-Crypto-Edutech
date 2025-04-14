import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Define validation schemas for different withdrawal methods
const bankDetailsSchema = z.object({
  name: z.string().min(1, "Account holder name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNo: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
});

const cryptoDetailsSchema = z.object({
  network: z.string().min(1, "Network is required"),
  address: z.string().min(1, "Wallet address is required"),
});

const withdrawalRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["bank", "crypto"]),
  details: z.union([bankDetailsSchema, cryptoDetailsSchema]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = withdrawalRequestSchema.parse(body);

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check if user has sufficient balance
    if (wallet.referralBalance < validatedData.amount) {
      return NextResponse.json(
        { error: "Insufficient referral balance" },
        { status: 400 }
      );
    }

    // Process withdrawal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create withdrawal request
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          amount: validatedData.amount,
          paymentMethod: validatedData.method,
          accountDetails: validatedData.details,
          status: "PENDING",
        },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          referralBalance: {
            decrement: validatedData.amount,
          },
        },
      });

      // Create wallet transaction record
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: validatedData.amount,
          type: "WITHDRAWAL",
          status: "PENDING",
          description: `Withdrawal request via ${validatedData.method}`,
        },
      });

      return withdrawal;
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal: result,
    });
  } catch (error) {
    console.error("Withdrawal Request Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit withdrawal request" },
      { status: 500 }
    );
  }
}
