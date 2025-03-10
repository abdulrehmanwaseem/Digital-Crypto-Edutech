import { Profile, User } from "@prisma/client"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  occupation: string
  referralCode: string
  profile: {
    avatar: string
    bio: string
    location: string
    twitter?: string
    telegram?: string
    website?: string
    achievements: Achievement[]
    activities: Activity[]
  }
}

interface Achievement {
  value: string | number
  label: string
}

interface Activity {
  type: 'course' | 'achievement' | 'social'
  title: string
  time: string
}

export async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch("/api/profile")
  if (!response.ok) {
    throw new Error("Failed to fetch profile")
  }
  return response.json()
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update profile")
  }
  
  return response.json()
}
