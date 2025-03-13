import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PaymentService } from "@/lib/services/payment";
import { z } from "zod";

const updatePaymentSchema = z.object({
  action: z.enum(["verify", "reject"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = updatePaymentSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const { action } = validatedFields.data;

    const payment = action === "verify"
      ? await PaymentService.verifyPayment(params.id)
      : await PaymentService.rejectPayment(params.id);

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Update Payment Error:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
