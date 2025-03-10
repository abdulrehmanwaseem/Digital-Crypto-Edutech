import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Course, Enrollment, Payment, User } from "@prisma/client"

interface CourseWithStats extends Course {
  _count: {
    enrollments: number
  }
  enrollments: (Enrollment & {
    user: Pick<User, "id" | "name" | "email">
    payment: Payment | null
  })[]
}

interface FormattedCourse {
  id: string
  title: string
  price: number
  imageUrl: string | null
  published: boolean
  activeStudents: number
  totalRevenue: number
  pendingPayments: number
  lastUpdated: Date
  enrollments: Array<{
    id: string
    status: string
    student: {
      id: string
      name: string
      email: string
    }
    payment: Payment | null
    createdAt: Date
  }>
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get courses with enrollment and payment stats
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: "ACTIVE"
              }
            }
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            payment: true
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    }) as unknown as CourseWithStats[]

    // Transform data for the UI
    const formattedCourses: FormattedCourse[] = courses.map(course => ({
      id: course.id,
      title: course.title,
      price: course.price,
      imageUrl: course.imageUrl,
      published: course.published,
      activeStudents: course._count.enrollments,
      totalRevenue: course.enrollments.reduce((total: number, enrollment) => {
        if (enrollment.payment?.status === "VERIFIED") {
          return total + (enrollment.payment.amount || 0)
        }
        return total
      }, 0),
      pendingPayments: course.enrollments.filter(
        enrollment => enrollment.payment?.status === "PENDING"
      ).length,
      lastUpdated: course.updatedAt,
      enrollments: course.enrollments.map(enrollment => ({
        id: enrollment.id,
        status: enrollment.status,
        student: enrollment.user,
        payment: enrollment.payment,
        createdAt: enrollment.createdAt
      }))
    }))

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error("Admin Courses Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
