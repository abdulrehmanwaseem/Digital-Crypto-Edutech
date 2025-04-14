import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user ID:", session.user.id);

    // First check if the user exists
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log("User found:", user ? "Yes" : "No");

    // If user doesn't exist, create them
    if (!user) {
      // Generate a unique referral code
      let referralCode = generateReferralCode();
      let existingUserWithCode = await prisma.user.findUnique({
        where: { referralCode },
      });

      // Keep generating until we find a unique code
      while (existingUserWithCode) {
        referralCode = generateReferralCode();
        existingUserWithCode = await prisma.user.findUnique({
          where: { referralCode },
        });
      }

      console.log("Creating new user with ID:", session.user.id);

      // Create the user with referral code
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          name: session.user.name || "Anonymous User",
          email: session.user.email || "",
          role: "USER",
          referralCode,
        },
      });

      console.log("User created successfully:", user.id);
    }

    // Get user's referral stats
    const stats = await prisma.referralStats.findUnique({
      where: { userId: session.user.id },
    });

    console.log("Referral stats found:", stats ? "Yes" : "No");

    if (!stats) {
      // Create stats if they don't exist
      const newStats = await prisma.referralStats.create({
        data: {
          userId: session.user.id,
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarnings: 0,
        },
      });

      console.log("Referral stats created:", newStats.id);

      return NextResponse.json({
        stats: newStats,
        referralCode: user.referralCode,
        wallet: null,
        referredUsers: [],
      });
    }

    // Get user's wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    console.log("Wallet found:", wallet ? "Yes" : "No");

    // Create wallet if it doesn't exist
    if (!wallet) {
      try {
        console.log("Attempting to create wallet for user:", session.user.id);

        // Double-check that the user exists
        const userExists = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!userExists) {
          console.error("User not found when trying to create wallet");
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        wallet = await prisma.wallet.create({
          data: {
            userId: session.user.id,
            balance: 0,
            referralBalance: 0,
          },
        });

        console.log("Wallet created successfully:", wallet.id);
      } catch (error) {
        console.error("Error creating wallet:", error);
        // Continue without wallet if creation fails
      }
    }

    // Get referred users
    const referredUsers = await prisma.user.findMany({
      where: { referredBy: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        payments: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
    });

    // Get recent referral bonuses
    const recentBonuses = await prisma.referralBonus.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
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

    return NextResponse.json({
      stats,
      referralCode: user.referralCode,
      wallet,
      referredUsers,
      recentBonuses,
    });
  } catch (error) {
    console.error("Fetch Referral Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
