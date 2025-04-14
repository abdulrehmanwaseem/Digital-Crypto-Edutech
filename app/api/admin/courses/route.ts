import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Course, Payment } from "@prisma/client";

type CourseWithUsers = Course & {
  _count: {
    users: number;
  };
  users: Array<{
    id: string;
    name: string | null;
    email: string | null;
    payments: Array<Payment>;
  }>;
};

interface FormattedCourse {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  activeStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  lastUpdated: Date;
  students: Array<{
    id: string;
    name: string | null;
    email: string | null;
    payments: Array<Payment>;
  }>;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get courses with user and payment stats
    const courses = (await prisma.course.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            payments: true,
          },
        },
      },
    })) as CourseWithUsers[];

    // Transform data for the UI
    const formattedCourses: FormattedCourse[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      price: course.price,
      imageUrl: course.imageUrl,
      activeStudents: course._count.users,
      totalRevenue: course.users.reduce((total: number, user) => {
        const coursePayments = user.payments.filter(
          (p) => p.status === "VERIFIED" && p.courseId === course.id
        );
        return (
          total + coursePayments.reduce((sum: number, p) => sum + p.amount, 0)
        );
      }, 0),
      pendingPayments: course.users.reduce((total: number, user) => {
        return (
          total +
          user.payments.filter(
            (p) => p.status === "PENDING" && p.courseId === course.id
          ).length
        );
      }, 0),
      lastUpdated: course.updatedAt,
      students: course.users,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Admin Courses Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
