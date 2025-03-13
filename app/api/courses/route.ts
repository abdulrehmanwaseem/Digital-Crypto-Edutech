// app/api/courses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      // Remove or adjust the filter if needed
      // where: { published: true },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        price: true,
        duration: true,
        features: true,
        stipend: true,
        referralBonus: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}
