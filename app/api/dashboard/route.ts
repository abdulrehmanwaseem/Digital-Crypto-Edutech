import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [enrollments, payments, referralStats, referredUsers] =
      await Promise.all([
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
                duration: true,
                features: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        }),

        // Get user's payment history
        prisma.payment.findMany({
          where: { userId: session.user.id },
          include: {
            course: {
              select: {
                title: true,
                price: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        // Get user's referral stats
        prisma.referralStats.findUnique({
          where: { userId: session.user.id },
        }),

        // Get referred users with their payment data
        prisma.user.findMany({
          where: { referredBy: session.user.referralCode },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            payments: {
              where: { status: "VERIFIED" },
              select: {
                amount: true,
                createdAt: true,
                course: {
                  select: {
                    title: true,
                    price: true,
                  },
                },
              },
            },
          },
        }),
      ]);

    // Calculate total earnings from verified payments
    const totalEarnings = payments
      .filter((p) => p.status === "VERIFIED")
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate referral earnings (10% of referred users' payments)
    const referralEarnings = referredUsers
      .flatMap((user) => user.payments)
      .reduce((sum, payment) => sum + payment.amount * 0.1, 0);

    // Format courses data
    const courses = enrollments.map((enrollment) => ({
      id: enrollment.courseId,
      title: enrollment.course.title,
      description: enrollment.course.description,
      imageUrl: enrollment.course.imageUrl,
      progress: 0, // You can calculate this based on user progress
      status: enrollment.status,
      lastAccessed: enrollment.updatedAt.toISOString(),
      duration: enrollment.course.duration,
      features: enrollment.course.features,
    }));

    // Format the data for the dashboard
    const dashboardData = {
      courses,
      stats: {
        totalCourses: courses.length,
        completedCourses: courses.filter((c) => c.status === "COMPLETED")
          .length,
        inProgressCourses: courses.filter((c) => c.status === "ACTIVE").length,
        totalEarnings,
        referralEarnings,
      },
      recentPayments: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        courseName: payment.course.title,
        coursePrice: payment.course.price,
        date: payment.createdAt,
      })),
      referralStats: {
        referralCode: session.user.referralCode,
        totalReferrals: referralStats?.totalReferrals || 0,
        activeReferrals: referralStats?.activeReferrals || 0,
        earnings: referralStats?.earnings || 0,
        referredUsers: referredUsers.map((user) => ({
          name: user.name,
          email: user.email,
          joinedAt: user.createdAt,
          totalSpent: user.payments.reduce((sum, p) => sum + p.amount, 0),
          purchases: user.payments.map((p) => ({
            courseName: p.course.title,
            amount: p.amount,
            date: p.createdAt,
          })),
        })),
      },
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
