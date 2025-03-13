import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaymentForm } from "@/components/payment/payment-form";
import { PaymentHistory } from "@/components/payment/payment-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentPageProps {
  params: {
    courseId: string;
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const session = await auth();
  if (!session?.user) {
    return notFound();
  }
  console.log("Requested course ID:", params.courseId);

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
  });

  if (!course) {
    return notFound();
  }

  // Check if user is already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  });

  // Check if there's a pending payment
  const pendingPayment = await prisma.payment.findFirst({
    where: {
      userId: session.user.id,
      courseId: course.id,
      status: "PENDING",
    },
  });

  if (existingEnrollment?.status === "ACTIVE") {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Already Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are already enrolled in this course. You can access it from
              your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-2xl font-bold">${course.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            {pendingPayment ? (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your payment is being processed. You will be notified once
                    it is verified.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <PaymentForm
                courseId={course.id}
                courseTitle={course.title}
                amount={course.price}
              />
            )}
          </div>
        </div>

        <PaymentHistory />
      </div>
    </div>
  );
}
