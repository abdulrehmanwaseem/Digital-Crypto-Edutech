import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { columns, type Course } from "./columns";
import { format } from "date-fns";
import { Payment } from "@prisma/client";

interface CourseStats {
  totalStudents: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface APIResponse {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  published: boolean;
  activeStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  lastUpdated: string;
  enrollments: Array<{
    id: string;
    status: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
    payment: Payment | null;
    createdAt: Date;
  }>;
}

async function getCourses() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/courses`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch courses");
    }

    return response.json() as Promise<APIResponse[]>;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

export default async function CoursesPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-8">
        <div className="space-y-3">
          <div className="h-4 w-[250px] animate-pulse rounded bg-muted" />
          <div className="h-8 w-[450px] animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return notFound();
    }

    const courses = await getCourses();

    // Calculate overall stats
    const stats = courses.reduce(
      (acc: CourseStats, course: APIResponse) => {
        acc.totalStudents += course.activeStudents;
        acc.totalRevenue += course.totalRevenue;
        acc.pendingPayments += course.pendingPayments;
        return acc;
      },
      {
        totalStudents: 0,
        totalRevenue: 0,
        pendingPayments: 0,
      }
    );

    // Format data for the table
    const formattedCourses: Course[] = courses.map((course: APIResponse) => ({
      id: course.id,
      title: course.title,
      price: `$${course.price}`,
      students: course.activeStudents,
      revenue: `$${course.totalRevenue}`,
      pending: course.pendingPayments,
      status: course.published ? "Published" : "Draft",
      lastUpdated: format(new Date(course.lastUpdated), "PPP"),
      enrollments: course.enrollments,
    }));

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Students
              </CardTitle>
              <Icons.users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <Icons.wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                From verified payments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border">
            <Suspense fallback={<DataTableSkeleton />}>
              <DataTable columns={columns} data={formattedCourses} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering CoursesPage:", error);
    return <div>Error rendering CoursesPage</div>;
  }
}

function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-8">
        <div className="space-y-3">
          <div className="h-4 w-[250px] animate-pulse rounded bg-muted" />
          <div className="h-8 w-[450px] animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
