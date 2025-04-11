import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { withdrawalAddress } = body;

    if (!withdrawalAddress) {
      return new NextResponse("Withdrawal address is required", {
        status: 400,
      });
    }

    // Validate the withdrawal address format
    if (
      !withdrawalAddress.startsWith("0x") &&
      !withdrawalAddress.startsWith("T")
    ) {
      return new NextResponse(
        "Invalid withdrawal address format. Must start with 0x (BEP20) or T (TRC20)",
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { withdrawalAddress },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[WITHDRAWAL_ADDRESS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
