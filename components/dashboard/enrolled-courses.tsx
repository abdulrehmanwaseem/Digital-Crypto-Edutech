import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  title: string
  description: string
  imageUrl: string
}

interface Enrollment {
  id: string
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  course: Course
  enrolledAt: string
}

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Icons.clock,
  },
  ACTIVE: {
    color: "bg-green-100 text-green-800",
    icon: Icons.play,
  },
  COMPLETED: {
    color: "bg-blue-100 text-blue-800",
    icon: Icons.check,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800",
    icon: Icons.close,
  },
}

export function EnrolledCourses({ enrollments }: { enrollments: Enrollment[] }) {
  if (!enrollments.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>
            Start your learning journey by enrolling in a course
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Icons.empty className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            You haven&apos;t enrolled in any courses yet.{" "}
            <Link href="/courses" className="text-primary hover:underline">
              Browse our courses
            </Link>{" "}
            to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
        <CardDescription>
          Your enrolled courses and their current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const StatusIcon = statusConfig[enrollment.status].icon
            return (
              <Card key={enrollment.id} className="overflow-hidden">
                <div className="relative aspect-video">
                  <Image
                    src={enrollment.course.imageUrl}
                    alt={enrollment.course.title}
                    fill
                    className="object-cover"
                  />
                  <Badge
                    variant="secondary"
                    className={cn(
                      "absolute right-2 top-2 flex items-center space-x-1",
                      statusConfig[enrollment.status].color
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    <span>{enrollment.status}</span>
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{enrollment.course.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {enrollment.course.description}
                  </p>
                  <div className="mt-4">
                    <Button
                      className="w-full"
                      asChild
                      disabled={enrollment.status === "PENDING"}
                    >
                      <Link href={`/courses/${enrollment.course.id}`}>
                        {enrollment.status === "PENDING" ? (
                          <>Pending Access</>
                        ) : enrollment.status === "COMPLETED" ? (
                          <>Review Course</>
                        ) : (
                          <>Continue Learning</>
                        )}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
