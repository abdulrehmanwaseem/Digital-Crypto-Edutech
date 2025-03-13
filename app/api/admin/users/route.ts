import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
    const where = {
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
        role ? { role: role } : {},
      ],
    };

    // Fetch users with related data
    const [users, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          occupation: true,
          emailVerified: true,
          createdAt: true,
          referralCode: true,
          _count: {
            select: {
              enrollments: true,
              payments: true,
            },
          },
          profile: {
            select: {
              avatar: true,
              location: true,
            },
          },
          payments: {
            select: {
              status: true,
              amount: true,
            },
          },
          enrollments: {
            select: {
              status: true,
              course: {
                select: {
                  title: true,
                },
              },
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
        totalEnrollments: user._count.enrollments,
        totalPayments: user._count.payments,
        activeEnrollments: user.enrollments.filter((e) => e.status === "ACTIVE")
          .length,
        pendingPayments: user.payments.filter((p) => p.status === "PENDING")
          .length,
        totalSpent: user.payments
          .filter((p) => p.status === "VERIFIED")
          .reduce((sum, p) => sum + p.amount, 0),
      },
      courses: user.enrollments.map((e) => ({
        title: e.course.title,
        status: e.status,
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
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: {
              emailVerified: null,
              // Add any other suspension-related fields
            },
          }),
          prisma.enrollment.updateMany({
            where: { userId },
            data: { status: "SUSPENDED" },
          }),
        ]);
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
      prisma.enrollment.deleteMany({ where: { userId } }),
      prisma.payment.deleteMany({ where: { userId } }),
      prisma.profile.delete({ where: { userId } }),
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
