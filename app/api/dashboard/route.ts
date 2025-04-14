import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Payment,
  User,
  ReferralStats,
  Wallet,
  ReferralBonus,
  Course,
} from "@prisma/client";
import { generateReferralCode } from "@/lib/utils";

interface DashboardData {
  courses: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    progress: number;
    status: string;
    lastAccessed: string;
    duration: string | null;
    features: string[];
  }>;
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalEarnings: number;
    referralEarnings: number;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    courseName: string;
    coursePrice: number;
    date: string;
  }>;
  referralStats: {
    referralCode: string | null;
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    wallet: {
      balance: number;
      referralBalance: number;
    } | null;
    referredUsers: Array<{
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      createdAt: string;
      payments: Array<{
        amount: number;
        status: string;
      }>;
    }>;
    recentBonuses: Array<{
      id: string;
      amount: number;
      type: string;
      status: string;
      createdAt: string;
      referredUser: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
      };
      course?: {
        id: string;
        title: string;
        imageUrl: string | null;
      } | null;
    }>;
  };
}

interface PaymentWithCourse extends Payment {
  course: {
    title: string;
    price: number;
  };
}

interface UserWithPayments {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  payments: Array<{
    amount: number;
    status: string;
  }>;
}

interface ReferralBonusWithRelations extends ReferralBonus {
  referredUser: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  course?: {
    id: string;
    title: string;
    imageUrl: string | null;
  } | null;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check if the user exists
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

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
    }

    // Ensure wallet and referral stats exist
    const [wallet, referralStats] = await Promise.all([
      prisma.wallet.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          balance: 0,
          referralBalance: 0,
        },
        update: {},
      }),
      prisma.referralStats.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarnings: 0,
        },
        update: {},
      }),
    ]);

    const [enrollments, payments, referredUsers, recentBonuses] =
      await Promise.all([
        // Get user's enrollments with course details
        prisma.course.findMany({
          where: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            description: true,
            duration: true,
            features: true,
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
        }) as Promise<PaymentWithCourse[]>,

        // Get referred users with their payment data
        prisma.user.findMany({
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
        }) as Promise<UserWithPayments[]>,

        // Get recent referral bonuses
        prisma.referralBonus.findMany({
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
        }) as Promise<ReferralBonusWithRelations[]>,
      ]);

    // Calculate total earnings from verified payments
    const totalEarnings = payments
      .filter((p: PaymentWithCourse) => p.status === "PAID")
      .reduce((sum: number, p: PaymentWithCourse) => sum + p.amount, 0);

    // Calculate referral earnings from referral bonuses
    const referralEarnings = referralStats?.totalEarnings || 0;

    // Format courses data
    const courses = enrollments.map((enrollment) => ({
      id: enrollment.id,
      title: enrollment.title,
      description: enrollment.description,
      imageUrl: enrollment.imageUrl,
      progress: 0, // You can calculate this based on user progress
      status: "ACTIVE", // You can determine this based on enrollment status
      lastAccessed: new Date().toISOString(),
      duration: enrollment.duration,
      features: enrollment.features,
    }));

    // Format the data for the dashboard
    const dashboardData: DashboardData = {
      courses,
      stats: {
        totalCourses: courses.length,
        completedCourses: courses.filter((c) => c.status === "COMPLETED")
          .length,
        inProgressCourses: courses.filter((c) => c.status === "ACTIVE").length,
        totalEarnings,
        referralEarnings,
      },
      recentPayments: payments.map((payment: PaymentWithCourse) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        courseName: payment.course.title,
        coursePrice: payment.course.price,
        date: payment.createdAt.toISOString(),
      })),
      referralStats: {
        referralCode: user.referralCode,
        totalReferrals: referralStats?.totalReferrals || 0,
        activeReferrals: referralStats?.activeReferrals || 0,
        totalEarnings: referralStats?.totalEarnings || 0,
        wallet: wallet
          ? {
              balance: wallet.balance,
              referralBalance: wallet.referralBalance,
            }
          : null,
        referredUsers: referredUsers.map((user: UserWithPayments) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt.toISOString(),
          payments: user.payments,
        })),
        recentBonuses: recentBonuses.map(
          (bonus: ReferralBonusWithRelations) => ({
            id: bonus.id,
            amount: bonus.amount,
            type: bonus.type,
            status: bonus.status,
            createdAt: bonus.createdAt.toISOString(),
            referredUser: bonus.referredUser,
            course: bonus.course,
          })
        ),
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
