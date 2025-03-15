import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createReferralCode } from "@/services/referral.service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referral = await createReferralCode(session.user.id);

    return NextResponse.json({
      message: "Referral code generated successfully",
      referral,
    });
  } catch (error) {
    console.error("Generate Referral API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate referral code",
      },
      { status: 500 }
    );
  }
}
