import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma, Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // Check admin authorization
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const where: Prisma.UserWhereInput = {
      AND: [
        // Search filter
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        // Status filter
        status
          ? { emailVerified: status === "VERIFIED" ? { not: null } : null }
          : {},
        // Role filter
        role ? { role: role as Role } : {},
      ],
    };

    // Fetch users with related data
    const [users, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              avatar: true,
              location: true,
            },
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true,
              courseId: true,
              proofUrl: true,
              createdAt: true,
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
          wallet: {
            select: {
              balance: true,
              referralBalance: true,
            },
          },
          referralStats: {
            select: {
              totalReferrals: true,
              activeReferrals: true,
              totalEarnings: true,
            },
          },
          _count: {
            select: {
              payments: true,
              referralBonuses: true,
              referredBonuses: true,
              withdrawals: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform the data for frontend
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      occupation: user.occupation,
      status: user.emailVerified ? "VERIFIED" : "PENDING",
      joinedDate: user.createdAt,
      avatar: user.profile?.avatar || "",
      location: user.profile?.location || "Not specified",
      referralCode: user.referralCode,
      stats: {
        totalPayments: user._count.payments,
        totalReferrals: user._count.referralBonuses,
        totalReferred: user._count.referredBonuses,
        totalWithdrawals: user._count.withdrawals,
        totalSpent: user.payments
          .filter((p) => p.status === "PAID")
          .reduce((sum, p) => sum + p.amount, 0),
        walletBalance: user.wallet?.balance || 0,
        referralBalance: user.wallet?.referralBalance || 0,
        totalEarnings: user.referralStats?.totalEarnings || 0,
      },
      courses: user.payments.map((p) => ({
        id: p.id,
        title: p.course?.title || "Unknown Course",
        amount: p.amount,
        status: p.status,
        proofUrl: p.proofUrl,
        date: p.createdAt,
      })),
    }));

    // Return paginated response
    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Update user endpoint
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let updatedUser;

    switch (action) {
      case "UPDATE_ROLE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: data.role },
        });
        break;

      case "VERIFY_EMAIL":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { emailVerified: new Date() },
        });
        break;

      case "SUSPEND":
        // Add user suspension logic
        await prisma.user.update({
          where: { id: userId },
          data: {
            emailVerified: null,
            // Add any other suspension-related fields
          },
        });
        break;

      case "UPDATE_PROFILE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            name: data.name,
            occupation: data.occupation,
            profile: {
              upsert: {
                create: { ...data.profile },
                update: { ...data.profile },
              },
            },
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("User Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete user endpoint (be careful with this!)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete user and related data
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { userId } }),
      prisma.profile.delete({ where: { userId } }),
      prisma.referralStats.delete({ where: { userId } }),
      prisma.wallet.delete({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
