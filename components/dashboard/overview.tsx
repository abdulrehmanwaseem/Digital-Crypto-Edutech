import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

interface DashboardStats {
  enrollments: number
  activeEnrollments: number
  totalSpent: number
  referralEarnings: number
}

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Enrollments
          </CardTitle>
          <Icons.book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.enrollments}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeEnrollments} active courses
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spent
          </CardTitle>
          <Icons.wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalSpent}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime course purchases
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Referral Earnings
          </CardTitle>
          <Icons.users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.referralEarnings}</div>
          <p className="text-xs text-muted-foreground">
            From successful referrals
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Learning Progress
          </CardTitle>
          <Icons.chart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((stats.activeEnrollments / stats.enrollments) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Course completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
