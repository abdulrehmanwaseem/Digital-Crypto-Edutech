import { auth } from "@/auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const achievementSchema = z.object({
  value: z.union([z.string(), z.number()]),
  label: z.string(),
});

const activitySchema = z.object({
  type: z.enum(["course", "achievement", "social"]),
  title: z.string(),
  time: z.string(),
});

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  occupation: z.string().max(100),
  profile: z.object({
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    twitter: z.string().max(100).optional(),
    telegram: z.string().max(100).optional(),
    website: z.string().url().optional().or(z.string().max(100).optional()),
    avatar: z.string().optional(),
    achievements: z.array(achievementSchema).optional(),
    activities: z.array(activitySchema).optional(),
  }),
});

const safeParseJSON = (jsonString: string | null, defaultValue: any[] = []) => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return defaultValue;
  }
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, occupation, profile } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        occupation,
        profile: {
          upsert: {
            create: profile,
            update: profile,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
