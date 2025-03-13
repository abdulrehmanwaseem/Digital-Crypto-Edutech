import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations/payment";
import { PaymentService } from "@/lib/services/payment";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    const validatedFields = paymentSchema.safeParse(body);
    console.log(validatedFields.error);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      courseId,
      amount,
      currency,
      transactionId,
      proofImageUrl,
      referralCode,
    } = validatedFields.data;

    // Check if the course (or plan) exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, price: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Validate that the payment amount matches the course price
    if (amount !== course.price) {
      return NextResponse.json(
        { error: "Payment amount does not match course price" },
        { status: 400 }
      );
    }

    // Process the payment
    const payment = await PaymentService.processPayment({
      userId: session.user.id,
      courseId,
      amount,
      currency,
      transactionId,
      proofImageUrl,
      referralCode: referralCode || undefined, // Ensure it’s null if not provided
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
