  "use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchProfile, updateProfile, type UserProfile } from "@/services/profile"
import { showToast } from "@/lib/toast"
import { 
  Camera, 
  Loader2, 
  User, 
  Users,
  Mail, 
  MapPin, 
  Twitter, 
  MessageSquare,
  Shield,
  Bell,
  Key,
  Globe,
  Briefcase
} from "lucide-react"
import { CloudinaryUploadWidget } from "@/components/cloudinary-upload-widget"

type FormData = {
  name: string
  email: string
  occupation: string
  profile: {
    bio: string
    location: string
    twitter: string
    telegram: string
    website: string
  }
}

const defaultProfile: UserProfile = {
  id: "",
  name: "",
  email: "",
  role: "USER",
  occupation: "",
  referralCode: "",
  profile: {
    avatar: "",
    bio: "",
    location: "",
    twitter: "",
    telegram: "",
    website: "",
    achievements: [],
    activities: []
  }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    occupation: "",
    profile: {
      bio: "",
      location: "",
      twitter: "",
      telegram: "",
      website: ""
    }
  })

  const getInitials = (name: string | undefined) => {
    if (!name) return ""
    return name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
  }

  const handleAvatarUpload = async (url: string) => {
    console.log(url)
    try {
      setAvatarLoading(true)
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          occupation: profile.occupation,
          profile: {
            ...profile.profile,
            avatar: url,
          }
        })
      })

      console.log(response)

      if (!response.ok) {
        throw new Error("Failed to update avatar")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      showToast.success("Avatar updated successfully")
    } catch (error) {
      console.error("Avatar Update Error:", error)
      showToast.error("Failed to update avatar")
    } finally {
      setAvatarLoading(false)
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile()
        setProfile(data)
        setFormData({
          name: data.name,
          email: data.email,
          occupation: data.occupation,
          profile: {
            bio: data.profile.bio,
            location: data.profile.location,
            twitter: data.profile.twitter || "",
            telegram: data.profile.telegram || "",
            website: data.profile.website || ""
          }
        })
      } catch (error) {
        showToast.error("Failed to load profile data")
      }
    }
    loadProfile()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, string>),
          [child]: value
        }
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const updatedProfile = await updateProfile({
        name: formData.name,
        occupation: formData.occupation,
        profile: {
          ...formData.profile,
          avatar: profile.profile.avatar,
          achievements: profile.profile.achievements,
          activities: profile.profile.activities
        }
      })
      setProfile(updatedProfile)
      showToast.success("Your profile has been successfully updated")
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!profile.id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="general">
                <User className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={profile.profile.avatar || "/placeholder-avatar.jpg"}
                            alt={profile.name}
                          />
                          <AvatarFallback>
                            {getInitials(profile.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2">
                          <CloudinaryUploadWidget
                            onUpload={handleAvatarUpload}
                            options={{
                              maxFiles: 1,
                              sources: ["local", "camera"],
                              resourceType: "image",
                              folder: "crypto-lms/avatars",
                            }}
                          >
                            {avatarLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="mr-2 h-4 w-4" />
                            )}
                            {avatarLoading ? "Updating..." : "Update"}
                          </CloudinaryUploadWidget>
                        </div>
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl font-semibold">{profile.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="occupation" className="text-sm font-medium">
                          Occupation
                        </label>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="occupation"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            placeholder="Your occupation"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                            placeholder="Your email"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">
                          Location
                        </label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            name="profile.location"
                            value={formData.profile.location}
                            onChange={handleChange}
                            placeholder="Your location"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="twitter" className="text-sm font-medium">
                          Twitter
                        </label>
                        <div className="flex items-center space-x-2">
                          <Twitter className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="twitter"
                            name="profile.twitter"
                            value={formData.profile.twitter}
                            onChange={handleChange}
                            placeholder="Your Twitter handle"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="telegram" className="text-sm font-medium">
                          Telegram
                        </label>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="telegram"
                            name="profile.telegram"
                            value={formData.profile.telegram}
                            onChange={handleChange}
                            placeholder="Your Telegram username"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="website" className="text-sm font-medium">
                          Website
                        </label>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="website"
                            name="profile.website"
                            value={formData.profile.website}
                            onChange={handleChange}
                            placeholder="Your website URL"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                          Bio
                        </label>
                        <Textarea
                          id="bio"
                          name="profile.bio"
                          value={formData.profile.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your password and security preferences
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your notification preferences
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}