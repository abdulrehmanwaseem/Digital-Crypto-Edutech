import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const achievementSchema = z.object({
  value: z.union([z.string(), z.number()]),
  label: z.string()
})

const activitySchema = z.object({
  type: z.enum(['course', 'achievement', 'social']),
  title: z.string(),
  time: z.string()
})

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
    activities: z.array(activitySchema).optional()
  })
})

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
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
     console.log(session?.user?.email );
     

    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email },
      include: { profile: true }
    })
    console.log(user)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Parse JSON fields and return formatted data
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      occupation: user.occupation,
      referralCode: user.referralCode,
      profile: {
        avatar: user.profile?.avatar || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        twitter: user.profile?.twitter || "",
        telegram: user.profile?.telegram || "",
        website: user.profile?.website || "",
        achievements: safeParseJSON(user.profile?.achievements as string | null),
        activities: safeParseJSON(user.profile?.activities as string | null)
      }
    })
  } catch (error) {
    console.error("Profile GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)
    console.log(body)

    // Stringify arrays before saving
    const achievements = validatedData.profile.achievements ? 
      JSON.stringify(validatedData.profile.achievements) : 
      JSON.stringify([])
    
    const activities = validatedData.profile.activities ? 
      JSON.stringify(validatedData.profile.activities) : 
      JSON.stringify([])

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        occupation: validatedData.occupation,
        profile: {
          upsert: {
            create: {
              bio: validatedData.profile.bio || "Not specified",
              location: validatedData.profile.location || "Not specified",
              avatar: validatedData.profile.avatar || "",
              twitter: validatedData.profile.twitter || "",
              telegram: validatedData.profile.telegram || "",
              website: validatedData.profile.website || "",
              achievements,
              activities
            },
            update: {
              bio: validatedData.profile.bio,
              location: validatedData.profile.location,
              avatar: validatedData.profile.avatar,
              twitter: validatedData.profile.twitter,
              telegram: validatedData.profile.telegram,
              website: validatedData.profile.website,
              achievements,
              activities
            }
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Return the updated data with parsed JSON fields
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      occupation: updatedUser.occupation,
      referralCode: updatedUser.referralCode,
      profile: {
        avatar: updatedUser.profile?.avatar || "",
        bio: updatedUser.profile?.bio || "",
        location: updatedUser.profile?.location || "",
        twitter: updatedUser.profile?.twitter || "",
        telegram: updatedUser.profile?.telegram || "",
        website: updatedUser.profile?.website || "",
        achievements: safeParseJSON(updatedUser.profile?.achievements as string | null),
        activities: safeParseJSON(updatedUser.profile?.activities as string | null)
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Profile PUT Error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
