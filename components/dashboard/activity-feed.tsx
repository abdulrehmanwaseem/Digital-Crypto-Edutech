import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"

interface Activity {
  type: string
  title: string
  time: string
}

interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  earnings: number
}

interface ActivityFeedProps {
  activities: Activity[]
  referralStats: ReferralStats
  referralCode: string
}

export function ActivityFeed({
  activities,
  referralStats,
  referralCode,
}: ActivityFeedProps) {
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success("Referral code copied to clipboard")
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest learning activities and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Icons.empty className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                No recent activities to show.
                Start learning to track your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 rounded-lg border p-4"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "course_progress" && (
                      <Icons.book className="h-5 w-5 text-primary" />
                    )}
                    {activity.type === "achievement" && (
                      <Icons.trophy className="h-5 w-5 text-yellow-500" />
                    )}
                    {activity.type === "payment" && (
                      <Icons.wallet className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.time), "PPp")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>
            Share your referral code and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Referrals</p>
                <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Active Referrals</p>
                <p className="text-2xl font-bold">{referralStats.activeReferrals}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold">${referralStats.earnings}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Your Referral Code</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 rounded bg-muted px-2 py-1">
                  {referralCode}
                </code>
                <button
                  onClick={copyReferralCode}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
                >
                  <Icons.copy className="h-4 w-4" />
                  <span className="sr-only">Copy referral code</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this code with friends to earn 10% commission on their course purchases
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Share via</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const text = `Join me on Crypto LMS! Use my referral code: ${referralCode}`
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)
                  }}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
                >
                  <Icons.twitter className="h-4 w-4" />
                  <span className="sr-only">Share on Twitter</span>
                </button>
                <button
                  onClick={() => {
                    const text = `Join me on Crypto LMS! Use my referral code: ${referralCode}`
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`)
                  }}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
                >
                  <Icons.telegram className="h-4 w-4" />
                  <span className="sr-only">Share on Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
