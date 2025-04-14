import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface MonthlyData {
  name: string;
  users: number;
  revenue: number;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get active courses count (courses with enrollments)
    const activeCourses = await prisma.course.count({
      where: {
        users: {
          some: {}, // This will count courses that have at least one user enrolled
        },
      },
    });

    // Get total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: "VERIFIED" },
      _sum: { amount: true },
    });

    // Get total referrals
    const totalReferrals = await prisma.referralStats.aggregate({
      _sum: { totalReferrals: true },
    });

    // Get monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get monthly revenue (last 6 months)
    const monthlyRevenue = await prisma.payment.groupBy({
      by: ["createdAt"],
      where: {
        status: "VERIFIED",
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get recent activity
    const recentRegistrations = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const pendingPayments = await prisma.payment.count({
      where: { status: "PENDING" },
    });

    // Format data for charts
    const formatMonthlyData = (): MonthlyData[] => {
      const months: MonthlyData[] = [];
      const currentDate = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        const monthName = date.toLocaleString("default", { month: "short" });
        months.push({
          name: monthName,
          users: 0,
          revenue: 0,
        });
      }

      // Fill in user growth data
      userGrowth.forEach((entry) => {
        const monthName = new Date(entry.createdAt).toLocaleString("default", {
          month: "short",
        });
        const monthData = months.find((m) => m.name === monthName);
        if (monthData) {
          monthData.users = entry._count;
        }
      });

      // Fill in revenue data
      monthlyRevenue.forEach((entry) => {
        const monthName = new Date(entry.createdAt).toLocaleString("default", {
          month: "short",
        });
        const monthData = months.find((m) => m.name === monthName);
        if (monthData && entry._sum.amount) {
          monthData.revenue = entry._sum.amount;
        }
      });

      return months;
    };

    return NextResponse.json({
      stats: {
        totalUsers,
        activeCourses,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalReferrals: totalReferrals._sum.totalReferrals || 0,
      },
      chartData: formatMonthlyData(),
      recentActivity: {
        newUsers: recentRegistrations.length,
        pendingPayments,
        completions: 0, // We'll need to implement this based on your course completion logic
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
