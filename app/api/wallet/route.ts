import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check if the user exists
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // If user doesn't exist, create them
    if (!user) {
      // Create the user
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          name: session.user.name || "Anonymous User",
          email: session.user.email || "",
          role: "USER",
        },
      });
    }

    // Get or create wallet
    const wallet = await prisma.wallet.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        balance: 0,
        referralBalance: 0,
      },
      update: {},
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Wallet API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
