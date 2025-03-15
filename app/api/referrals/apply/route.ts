import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applyReferralCode } from "@/services/referral.service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    const referral = await applyReferralCode(code, session.user.id);

    return NextResponse.json({
      message: "Referral code applied successfully",
      referral,
    });
  } catch (error) {
    console.error("Apply Referral API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to apply referral code",
      },
      { status: 500 }
    );
  }
}
