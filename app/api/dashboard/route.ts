import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      enrollments,
      payments,
      referralStats,
      latestActivities
    ] = await Promise.all([
      // Get user's enrollments with course details
      prisma.enrollment.findMany({
        where: { userId: session.user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              description: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Get user's payment history
      prisma.payment.findMany({
        where: { userId: session.user.id },
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Get user's referral stats
      prisma.referralStats.findUnique({
        where: { userId: session.user.id },
      }),

      // Get user's latest activities
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          profile: {
            select: {
              activities: true,
            },
          },
        },
      }),
    ]);

    // Format the data for the dashboard
    const dashboardData = {
      enrollments: enrollments.map((enrollment) => ({
        id: enrollment.id,
        status: enrollment.status,
        course: enrollment.course,
        enrolledAt: enrollment.createdAt,
      })),
      recentPayments: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        courseName: payment.course.title,
        date: payment.createdAt,
      })),
      referralStats: {
        totalReferrals: referralStats?.totalReferrals || 0,
        activeReferrals: referralStats?.activeReferrals || 0,
        earnings: referralStats?.earnings || 0,
      },
      activities: latestActivities?.profile?.activities || [],
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
