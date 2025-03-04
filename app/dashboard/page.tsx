"use client"

import { useState, useEffect, memo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Trophy,
  Users,
  Wallet2,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Bell,
  Wallet,
  ArrowDownToLine,
  UserCheck,
  DollarSign
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data
const userData = {
  name: "John Doe",
  plan: "Premium",
  progress: 65,
  coursesCompleted: 8,
  currentModule: "Advanced Technical Analysis",
  wallet: {
    balance: 24,
    stipendNext: "2024-05-01",
    referrals: 3,
    earnings: 45
  }
}

const courses = [
  {
    title: "Crypto Basics",
    progress: 100,
    status: "Completed",
    lastAccessed: "2 days ago"
  },
  {
    title: "Technical Analysis Fundamentals",
    progress: 80,
    status: "In Progress",
    lastAccessed: "5 hours ago"
  },
  {
    title: "Advanced Trading Strategies",
    progress: 30,
    status: "In Progress",
    lastAccessed: "1 day ago"
  },
  {
    title: "Risk Management",
    progress: 0,
    status: "Not Started",
    lastAccessed: null
  }
]

const chartData = [
  { name: "Week 1", progress: 20 },
  { name: "Week 2", progress: 35 },
  { name: "Week 3", progress: 45 },
  { name: "Week 4", progress: 65 },
  { name: "Week 5", progress: 75 },
  { name: "Week 6", progress: 85 }
]

const notifications = [
  {
    title: "New Course Available",
    description: "Advanced DeFi Trading Strategies is now available",
    time: "2 hours ago"
  },
  {
    title: "Achievement Unlocked",
    description: "Completed Basic Technical Analysis module",
    time: "1 day ago"
  },
  {
    title: "Upcoming Live Session",
    description: "Market Analysis with John Smith - Tomorrow at 2 PM",
    time: "1 day ago"
  }
]

interface Payment {
  planDetails: {
    name: string;
    price: number;
    duration: string;
  };
  paymentMethod: string;
  transactionId: string;
  status: string;
  timestamp: string;
  screenshot?: string;
}

interface WithdrawalMethod {
  type: 'bank' | 'crypto'
  bankDetails?: {
    name: string
    bankName: string
    accountNo: string
    ifscCode: string
  }
  cryptoDetails?: {
    network: string
    address: string
  }
}

interface Withdrawal {
  amount: number;
  method: 'bank' | 'crypto';
  details: any;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface Plan {
  name: string;
  price: number;
  status: 'active' | 'expired' | 'pending';
  purchaseDate: string;
  referralBonus: {
    type: 'percentage' | 'fixed';
    value: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

interface ReferredUser {
  name: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  plan: string;
  discount: number;
}

interface ReferralStats {
  myReferralCode: string;
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  earnings: number;
  currentTier: {
    threshold: number;
    bonus: number;
  };
  nextTier?: {
    threshold: number;
    bonus: number;
    remaining: number;
  };
  milestones: {
    achieved: {
      referrals: number;
      reward: {
        type: 'bonus' | 'courseAccess' | 'planUpgrade';
        value: string | number;
      };
    }[];
    next?: {
      referrals: number;
      reward: {
        type: 'bonus' | 'courseAccess' | 'planUpgrade';
        value: string | number;
      };
      remaining: number;
    };
  };
  referredUsers: Array<ReferredUser>;
}

const StatCard = memo(({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
})

const generateReferralCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [userName, setUserName] = useState<string>("")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [walletBalance, setWalletBalance] = useState(1000)
  const [totalEarnings, setTotalEarnings] = useState(2500)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'crypto'>('bank')
  const [bankDetails, setBankDetails] = useState({
    name: '',
    bankName: '',
    accountNo: '',
    ifscCode: ''
  })
  const [cryptoDetails, setCryptoDetails] = useState({
    network: '',
    address: ''
  })
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [amountError, setAmountError] = useState('')
  const [referralData, setReferralData] = useState<ReferralStats>({
    myReferralCode: '',
    code: '',
    totalReferrals: 0,
    activeReferrals: 0,
    earnings: 0,
    currentTier: {
      threshold: 0,
      bonus: 0
    },
    milestones: {
      achieved: [],
      next: undefined
    },
    referredUsers: []
  })

  useEffect(() => {
    setMounted(true)
    
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Get user data
    const userDataStr = localStorage.getItem("userData")
    if (userDataStr) {
      const userData = JSON.parse(userDataStr)
      setUserName(userData.name || "User")
    }

    // Get selected plan and payment status
    const storedPlanStr = localStorage.getItem("selectedPlan")
    const paymentStr = localStorage.getItem("payment")
    
    if (storedPlanStr) {
      try {
        const storedPlan = JSON.parse(storedPlanStr)
        const payment = paymentStr ? JSON.parse(paymentStr) : null
        
        // Only show plan as active if payment is completed
        const planStatus = payment?.status === 'completed' ? 'active' : 'pending'
        
        const formattedPlan: Plan = {
          name: formatPlanName(storedPlan.name),
          price: Number(storedPlan.price),
          status: planStatus,
          purchaseDate: storedPlan.purchaseDate || new Date().toISOString(),
          referralBonus: {
            type: 'percentage',
            value: 10
          }
        }
        
        if (planStatus === 'active') {
          setSelectedPlan(formattedPlan)
        } else {
          setSelectedPlan(null) // Don't show pending plans
        }
      } catch (error) {
        console.error("Error parsing plan/payment data:", error)
        // Clear invalid data
        localStorage.removeItem("selectedPlan")
        localStorage.removeItem("payment")
      }
    }

    // Get wallet stats
    const storedStats = localStorage.getItem('walletStats')
    if (storedStats) {
      const stats = JSON.parse(storedStats)
      setWalletBalance(stats.balance)
      setTotalEarnings(stats.totalEarnings)
      setTotalWithdrawals(stats.totalWithdrawals)
      setPendingWithdrawals(stats.pendingWithdrawals)
    }

    // Load withdrawal history
    const storedWithdrawals = localStorage.getItem('withdrawals')
    if (storedWithdrawals) {
      setWithdrawals(JSON.parse(storedWithdrawals))
    }

    // Get payments from localStorage
    const storedPayments = localStorage.getItem('payments')
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments))
    }

    // Get last payment ID
    const lastId = localStorage.getItem('lastPaymentId')
    if (lastId) {
      setLastPaymentId(lastId)
      localStorage.removeItem('lastPaymentId')
      
      toast.success("Payment submitted! We're processing your request.", {
        duration: 5000,
        icon: '🎉'
      })
    }

    // Get payment status
    const payments = localStorage.getItem('payments')
    if (payments) {
      const paymentsList = JSON.parse(payments)
      if (paymentsList.length > 0) {
        const latestPayment = paymentsList[paymentsList.length - 1]
        // Update plan status based on payment
        if (selectedPlan) {
          setSelectedPlan(prev => prev ? {
            ...prev,
            status: latestPayment.status
          } : null)
        }
      }
    }

    // Initialize or get existing referral code
    let code = localStorage.getItem('myReferralCode')
    if (!code) {
      code = generateReferralCode()
      localStorage.setItem('myReferralCode', code)
      
      // Store this code in the list of valid referral codes
      const storedCodes = JSON.parse(localStorage.getItem('referralCodes') || '[]')
      storedCodes.push(code)
      localStorage.setItem('referralCodes', JSON.stringify(storedCodes))
    }

    // Update referral data state
    setReferralData(prev => ({
      ...prev,
      myReferralCode: code,
      code: code
    }))

    // Add loading state
    const fetchData = async () => {
      try {
        // Fetch data
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }
    fetchData()

    // Set up storage event listener
    window.addEventListener('storage', () => {
      const code = localStorage.getItem('myReferralCode');
      setReferralData(prev => ({
        ...prev,
        myReferralCode: code,
        code: code
      }));
    });
    return () => window.removeEventListener('storage', () => {
      const code = localStorage.getItem('myReferralCode');
      setReferralData(prev => ({
        ...prev,
        myReferralCode: code,
        code: code
      }));
    });
  }, [router])

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (parseFloat(withdrawAmount) > walletBalance) {
      toast.error("Insufficient balance")
      return
    }

    setIsWithdrawing(true)
    try {
      const withdrawalAmount = parseFloat(withdrawAmount)
      
      // Update wallet balance
      const newBalance = walletBalance - withdrawalAmount
      setWalletBalance(newBalance)
      localStorage.setItem('walletBalance', newBalance.toString())

      const newWithdrawal: Withdrawal = {
        amount: withdrawalAmount,
        method: withdrawalMethod,
        details: withdrawalMethod === 'bank' ? bankDetails : cryptoDetails,
        timestamp: new Date().toISOString(),
        status: 'pending' as const
      }

      const updatedWithdrawals = [...withdrawals, newWithdrawal]
      setWithdrawals(updatedWithdrawals)
      localStorage.setItem('withdrawals', JSON.stringify(updatedWithdrawals))

      toast.success("Withdrawal request submitted successfully!")
      setIsWithdrawDialogOpen(false)
      setWithdrawAmount("")
    } catch (error) {
      toast.error("Failed to process withdrawal")
    } finally {
      setIsWithdrawing(false)
    }
  }

  const resetForm = () => {
    setWithdrawAmount("")
    setBankDetails({
      name: '',
      bankName: '',
      accountNo: '',
      ifscCode: ''
    })
    setCryptoDetails({
      network: '',
      address: ''
    })
  }

  const formatPlanName = (name: string) => {
    switch(name?.toLowerCase()) {
      case "basic":
        return "🚀 Basic Plan"
      case "standard":
        return "⭐ Standard Plan"
      case "premium":
        return "💎 Premium Plan"
      case "professional":
        return "👑 Professional Plan"
      default:
        return name || "No Plan Selected"
    }
  }

  // Debug function to check stored data
  useEffect(() => {
    const plan = localStorage.getItem("selectedPlan")
    const payment = localStorage.getItem("payment")
    console.log("Stored plan:", plan ? JSON.parse(plan) : null)
    console.log("Stored payment:", payment ? JSON.parse(payment) : null)
  }, [])

  // Function to add a test referral
  const addTestReferral = () => {
    const newUser = {
      name: `User ${Math.floor(Math.random() * 1000)}`,
      joinedDate: new Date().toISOString(),
      status: 'active' as const
    };

    // Get current data from localStorage
    const currentUsers = JSON.parse(localStorage.getItem('referredUsers') || '[]');
    const updatedUsers = [...currentUsers, newUser];
    
    // Update localStorage
    localStorage.setItem('referredUsers', JSON.stringify(updatedUsers));
    
    // Update earnings
    const currentEarnings = parseFloat(localStorage.getItem('referralEarnings') || '0');
    const newEarnings = currentEarnings + 10; // $10 per referral
    localStorage.setItem('referralEarnings', newEarnings.toString());

    // Update state
    setReferralData(prev => ({
      ...prev,
      totalReferrals: updatedUsers.length,
      activeReferrals: updatedUsers.filter(u => u.status === 'active').length,
      totalEarnings: newEarnings,
      referredUsers: updatedUsers
    }));
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Welcome back, {userName}!</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Active Plan:</span>
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm">
            {selectedPlan?.name || "No Plan Selected"}
          </span>
        </div>
      </div>

      {/* Active Plan Card */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Subscription Details</h2>
            {selectedPlan ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{selectedPlan.name}</span>
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    selectedPlan.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : selectedPlan.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedPlan.status.charAt(0).toUpperCase() + selectedPlan.status.slice(1)}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  ${selectedPlan.price.toFixed(2)}/month
                </p>
                <p className="text-sm text-muted-foreground">
                  Started: {new Date(selectedPlan.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">No active subscription</p>
                <Button
                  onClick={() => router.push('/plans')}
                  variant="outline"
                  className="w-fit"
                >
                  View Plans
                </Button>
              </div>
            )}
          </div>
          {selectedPlan && (
            <Button
              variant="outline"
              onClick={() => router.push('/plans')}
              className="shrink-0"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Overall Progress" value={`${userData.progress}%`} icon={Trophy} />
            <StatCard title="Courses Completed" value={userData.coursesCompleted} icon={BookOpen} />
            <StatCard title="Total Earnings" value={`$${totalEarnings}`} icon={DollarSign} />
            <StatCard title="Active Referrals" value={referralData.activeReferrals} icon={UserCheck} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="col-span-2 p-6">
              <h3 className="mb-6 text-xl font-semibold">Learning Progress</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Recent Notifications</h3>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Referral Program */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Referral Program</CardTitle>
                  <CardDescription>
                    Earn rewards by inviting friends to join our platform
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <code className="relative rounded bg-muted px-3 py-2 font-mono text-sm">
                    {referralData.myReferralCode || 'Loading...'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const code = referralData.myReferralCode;
                      if (code) {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${code}`);
                        toast.success("Referral link copied to clipboard");
                      }
                    }}
                    disabled={!referralData.myReferralCode}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {/* Referral Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Referrals</p>
                        <p className="text-2xl font-bold">{referralData.totalReferrals}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Referrals</p>
                        <p className="text-2xl font-bold">{referralData.activeReferrals}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Bonus</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {referralData.currentTier.bonus}
                          {selectedPlan?.referralBonus.type === 'percentage' ? '%' : '$'}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Wallet2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${referralData.earnings.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Next Tier Progress */}
                {referralData.nextTier && (
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">Next Milestone</h4>
                        <p className="text-sm text-muted-foreground">
                          {referralData.nextTier.remaining} more referrals to unlock {referralData.nextTier.bonus}
                          {selectedPlan?.referralBonus.type === 'percentage' ? '%' : '$'} bonus
                        </p>
                      </div>
                      <Trophy className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="space-y-2">
                      <Progress
                        value={(referralData.totalReferrals / referralData.nextTier.threshold) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{referralData.totalReferrals} Referrals</span>
                        <span className="text-muted-foreground">Goal: {referralData.nextTier.threshold}</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Milestones */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Milestones</h4>
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  
                  {/* Achieved Milestones */}
                  {referralData.milestones.achieved.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {referralData.milestones.achieved.map((milestone, index) => (
                        <Card key={index} className="p-4 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {milestone.referrals} Referrals Achievement
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {milestone.reward.type === 'bonus' 
                                  ? `$${milestone.reward.value} Bonus` 
                                  : milestone.reward.type === 'planUpgrade'
                                  ? `Free upgrade to ${milestone.reward.value} Plan`
                                  : `Free access to ${milestone.reward.value}`}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Next Milestone */}
                  {referralData.milestones.next && (
                    <Card className="p-4 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                          <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Next Achievement</p>
                            <span className="text-sm text-muted-foreground">
                              {referralData.milestones.next.remaining} more needed
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {referralData.milestones.next.reward.type === 'bonus' 
                              ? `$${referralData.milestones.next.reward.value} Bonus` 
                              : referralData.milestones.next.reward.type === 'planUpgrade'
                              ? `Free upgrade to ${referralData.milestones.next.reward.value} Plan`
                              : `Free access to ${referralData.milestones.next.reward.value}`}
                          </p>
                          <Progress
                            value={((referralData.milestones.next.referrals - referralData.milestones.next.remaining) / referralData.milestones.next.referrals) * 100}
                            className="h-1.5 mt-2"
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Referred Users List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Recent Referrals</h4>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3">
                    {referralData.referredUsers.map((user, index) => (
                      <Card key={index} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${
                              user.status === 'active' 
                                ? 'bg-green-100 dark:bg-green-900' 
                                : 'bg-yellow-100 dark:bg-yellow-900'
                            }`}>
                              <UserCheck className={`h-4 w-4 ${
                                user.status === 'active' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{user.name}</p>
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                  {user.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Joined {new Date(user.joinedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{user.plan}</p>
                            <p className="text-sm text-green-600">
                              ${user.discount} discount applied
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="courses">
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.title} className="hover-card overflow-hidden p-6">
                <div className="mb-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-semibold">{course.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {course.status}
                      </span>
                    </div>
                    {course.status === "Completed" && (
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Award className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  {course.lastAccessed && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Last accessed {course.lastAccessed}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallet">
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Wallet Balance</h2>
                  <p className="text-3xl font-bold mt-2 text-green-600">
                    ${walletBalance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available for withdrawal
                  </p>
                </div>
                <Button
                  onClick={() => setIsWithdrawDialogOpen(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  disabled={walletBalance <= 0}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  Withdraw
                </Button>
              </div>
              {walletBalance <= 0 && (
                <p className="text-sm text-red-500">
                  Insufficient balance for withdrawal
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="font-medium text-green-600">${totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-muted-foreground">Total Withdrawals</span>
                  <span className="font-medium text-blue-600">${totalWithdrawals.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                  <span className="text-muted-foreground">Pending Withdrawals</span>
                  <span className="font-medium text-yellow-600">${pendingWithdrawals.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {withdrawals.length > 0 && (
              <Card className="p-6 md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Recent Withdrawals</h2>
                <div className="space-y-3">
                  {withdrawals.map((withdrawal, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">${withdrawal.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(withdrawal.timestamp).toLocaleDateString()} via {withdrawal.method}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover-card p-6">
              <Calendar className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold">Next Stipend</h3>
              <p className="text-3xl font-bold">
                {new Date(userData.wallet.stipendNext).toLocaleDateString()}
              </p>
            </Card>

            <Card className="hover-card p-6">
              <Clock className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold">Referral Earnings</h3>
              <p className="text-3xl font-bold">${userData.wallet.earnings}</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{payment.planDetails.name} Plan</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        payment.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">
                          ${payment.planDetails.price}/{payment.planDetails.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium">{payment.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Transaction ID</p>
                        <p className="font-medium">{payment.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Purchase Date</p>
                        <p className="font-medium">
                          {new Date(payment.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {payment.screenshot && (
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={payment.screenshot}
                        alt="Payment proof"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No purchase history available
              </p>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DialogTitle className="text-xl font-semibold tracking-tight">Withdraw Funds</DialogTitle>
            <DialogDescription className="mt-2.5">
              <div className="flex items-center gap-2.5 bg-muted/50 p-3 rounded-lg">
                <Wallet2 className="h-5 w-5 text-green-600" />
                <span className="text-sm">Available Balance: <span className="font-semibold text-green-600">${walletBalance.toFixed(2)}</span></span>
              </div>
            </DialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Amount Input */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium flex items-center gap-2" htmlFor="withdrawAmount">
                  Amount to Withdraw
                  <span className="inline-flex items-center justify-center rounded-full bg-muted/50 w-4 h-4 text-xs" title="Minimum withdrawal: $10">?</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="withdrawAmount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setWithdrawAmount(value);
                      // Clear error when user starts typing
                      if (amountError) setAmountError('');
                    }}
                    onBlur={() => {
                      const amount = parseFloat(withdrawAmount);
                      if (amount < 10) {
                        setAmountError('Minimum withdrawal amount is $10');
                      } else if (amount > walletBalance) {
                        setAmountError('Amount exceeds available balance');
                      }
                    }}
                    className={`pl-10 h-11 text-lg ${amountError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    placeholder="0.00"
                    min="10"
                    max={walletBalance}
                    step="0.01"
                  />
                </div>
                {amountError && (
                  <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1.5">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                      <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor"/>
                      <path d="M7.5 8.5C7.22386 8.5 7 8.27614 7 8V4C7 3.72386 7.22386 3.5 7.5 3.5C7.77614 3.5 8 3.72386 8 4V8C8 8.27614 7.77614 8.5 7.5 8.5Z" fill="currentColor"/>
                      <path d="M7.5 11C7.77614 11 8 10.7761 8 10.5C8 10.2239 7.77614 10 7.5 10C7.22386 10 7 10.2239 7 10.5C7 10.7761 7.22386 11 7.5 11Z" fill="currentColor"/>
                    </svg>
                    {amountError}
                  </p>
                )}
              </div>

              {/* Method Selection */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium">Select Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={withdrawalMethod === 'bank' ? 'default' : 'outline'}
                    className={`h-24 relative ${withdrawalMethod === 'bank' ? 'bg-primary/10 hover:bg-primary/20 border-primary' : 'hover:bg-muted/50'}`}
                    onClick={() => setWithdrawalMethod('bank')}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21H21M3 18H21M6 10V14M10 10V14M14 10V14M18 10V14M3 7L12 3L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium text-sm">Bank Transfer</span>
                      <span className="text-xs text-muted-foreground">2-3 business days</span>
                    </div>
                    {withdrawalMethod === 'bank' && (
                      <div className="absolute top-2 right-2 text-primary">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                      </svg>
                    </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant={withdrawalMethod === 'crypto' ? 'default' : 'outline'}
                    className={`h-24 relative ${withdrawalMethod === 'crypto' ? 'bg-primary/10 hover:bg-primary/20 border-primary' : 'hover:bg-muted/50'}`}
                    onClick={() => setWithdrawalMethod('crypto')}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.5 2C9.5 2 16.5 6.5 16.5 12C16.5 17.5 9.5 22 9.5 22M6.5 3C6.5 3 15.5 9 15.5 12C15.5 15 6.5 20.5 6.5 20.5M3.5 5C3.5 5 14.5 11.5 14.5 12C14.5 12.5 3.5 19 3.5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium text-sm">Cryptocurrency</span>
                      <span className="text-xs text-muted-foreground">Instant transfer</span>
                    </div>
                    {withdrawalMethod === 'crypto' && (
                      <div className="absolute top-2 right-2 text-primary">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                      </svg>
                    </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Bank Form */}
              {withdrawalMethod === 'bank' && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/50 border-b">
                    <h3 className="font-medium text-sm">Bank Account Details</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="accountName">
                        Account Holder Name
                      </label>
                      <Input
                        id="accountName"
                        value={bankDetails.name}
                        onChange={(e) => setBankDetails({ ...bankDetails, name: e.target.value })}
                        placeholder="Enter account holder name"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="bankName">
                        Bank Name
                      </label>
                      <Input
                        id="bankName"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        placeholder="Enter bank name"
                        className="h-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="accountNo">
                          Account Number
                        </label>
                        <Input
                          id="accountNo"
                          value={bankDetails.accountNo}
                          onChange={(e) => setBankDetails({ ...bankDetails, accountNo: e.target.value })}
                          placeholder="Enter account number"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="ifscCode">
                          IFSC Code
                        </label>
                        <Input
                          id="ifscCode"
                          value={bankDetails.ifscCode}
                          onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                          placeholder="Enter IFSC code"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Crypto Form */}
              {withdrawalMethod === 'crypto' && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/50 border-b">
                    <h3 className="font-medium text-sm">Cryptocurrency Details</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Network</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Button
                            type="button"
                            variant={cryptoDetails.network === 'TRC20' ? 'default' : 'outline'}
                            className={`h-16 w-full ${cryptoDetails.network === 'TRC20' ? 'bg-primary/10 hover:bg-primary/20 border-primary' : 'hover:bg-muted/50'}`}
                            onClick={() => setCryptoDetails({ ...cryptoDetails, network: 'TRC20' })}
                          >
                            <div className="text-left">
                              <div className="font-medium">TRC20</div>
                              <div className="text-xs text-muted-foreground">USDT on Tron Network</div>
                            </div>
                          </Button>
                        </div>
                        <div className="relative">
                          <Button
                            type="button"
                            variant={cryptoDetails.network === 'BEP20' ? 'default' : 'outline'}
                            className={`h-16 w-full ${cryptoDetails.network === 'BEP20' ? 'bg-primary/10 hover:bg-primary/20 border-primary' : 'hover:bg-muted/50'}`}
                            onClick={() => setCryptoDetails({ ...cryptoDetails, network: 'BEP20' })}
                          >
                            <div className="text-left">
                              <div className="font-medium">BEP20</div>
                              <div className="text-xs text-muted-foreground">USDT on BSC Network</div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="cryptoAddress">
                        Wallet Address
                      </label>
                      <Input
                        id="cryptoAddress"
                        value={cryptoDetails.address}
                        onChange={(e) => setCryptoDetails({ ...cryptoDetails, address: e.target.value })}
                        placeholder={`Enter your ${cryptoDetails.network || 'wallet'} address`}
                        className="h-10 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setIsWithdrawDialogOpen(false)
                  resetForm()
                }}
                disabled={isWithdrawing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdrawSubmit}
                disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance}
                className="bg-green-600 hover:bg-green-700"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Withdraw'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DashboardPage