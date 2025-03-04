"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const achievements = [
  { title: "Course Completion", value: "8", label: "Courses" },
  { title: "Trading Hours", value: "120", label: "Hours" },
  { title: "Success Rate", value: "92%", label: "Win Rate" }
]

const activities = [
  { 
    type: "course",
    title: "Completed Technical Analysis",
    time: "2 hours ago",
    icon: Briefcase
  },
  {
    type: "achievement",
    title: "Earned Advanced Trader Badge",
    time: "1 day ago",
    icon: Shield
  },
  {
    type: "social",
    title: "Joined Crypto Trading Group",
    time: "2 days ago",
    icon: Users
  }
]

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    bio: "Crypto enthusiast and trader with 3+ years of experience. Passionate about blockchain technology and decentralized finance.",
    location: "New York, USA",
    twitter: "@johndoe",
    telegram: "@johndoe_crypto",
    website: "https://johndoe.com",
    occupation: "Full-time Trader"
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Profile Sidebar */}
            <div className="lg:col-span-4">
              <Card className="sticky top-24 p-6">
                <div className="text-center">
                  <div className="relative mx-auto mb-6 h-32 w-32">
                    <Avatar className="h-32 w-32 ring-4 ring-primary/10">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="mb-1 text-2xl font-semibold">{formData.fullName}</h2>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
                  {achievements.map((achievement) => (
                    <div key={achievement.title} className="text-center">
                      <p className="text-2xl font-bold text-primary">{achievement.value}</p>
                      <p className="text-xs text-muted-foreground">{achievement.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4 border-t pt-6">
                  <h3 className="font-semibold">Recent Activity</h3>
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-8">
              <Card className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit}>
                    <TabsContent value="general">
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium">
                              <User className="mb-1.5 h-4 w-4 text-muted-foreground" />
                              Full Name
                            </label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                              <Mail className="mb-1.5 h-4 w-4 text-muted-foreground" />
                              Email
                            </label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="bio" className="text-sm font-medium">
                            Bio
                          </label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium">
                              <MapPin className="mb-1.5 h-4 w-4 text-muted-foreground" />
                              Location
                            </label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="occupation" className="text-sm font-medium">
                              <Briefcase className="mb-1.5 h-4 w-4 text-muted-foreground" />
                              Occupation
                            </label>
                            <Input
                              id="occupation"
                              name="occupation"
                              value={formData.occupation}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="social">
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="twitter" className="text-sm font-medium">
                              <Twitter className="mb-1.5 h-4 w-4 text-muted-foreground" />
                              Twitter
                            </label>
                            <Input
                              id="twitter"
                              name="twitter"
                              value={formData.twitter}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="telegram" className="text-sm font-medium">
                              <MessageSquare className="mb-1.5 h-4 w-4 text-muted-foreground" />
                              Telegram
                            </label>
                            <Input
                              id="telegram"
                              name="telegram"
                              value={formData.telegram}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="website" className="text-sm font-medium">
                            <Globe className="mb-1.5 h-4 w-4 text-muted-foreground" />
                            Website
                          </label>
                          <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preferences">
                      <div className="space-y-6">
                        {/* Add preferences content here */}
                      </div>
                    </TabsContent>

                    <div className="mt-6 flex items-center justify-end gap-4">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving changes...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}