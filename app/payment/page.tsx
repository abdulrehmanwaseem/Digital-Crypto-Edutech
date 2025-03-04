"use client"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Copy, CheckCircle, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [planDetails, setPlanDetails] = useState<{ name: string; price: number } | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'crypto' | 'other' | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawAddress, setWithdrawAddress] = useState("")

  const planNames: Record<string, string> = {
    premium: "🌟 Premium Pro",
    basic: "🚀 Basic Plus",
    starter: "💫 Starter",
    pro: "💎 Professional"
  }

  useEffect(() => {
    setMounted(true)

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const selectedPlan = localStorage.getItem("selectedPlan")
    if (selectedPlan) {
      setPlanDetails(JSON.parse(selectedPlan))
    }
  }, [router])

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive"
      })
      return
    }

    if (!screenshot) {
      toast({
        title: "Error",
        description: "Please upload payment proof screenshot",
        variant: "destructive"
      })
      return
    }

    if (!transactionId) {
      toast({
        title: "Error",
        description: "Please enter transaction ID or reference number",
        variant: "destructive"
      })
      return
    }

    if (!planDetails) {
      toast({
        title: "Error",
        description: "No plan selected",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const paymentData = {
        planDetails: {
          ...planDetails,
          name: planNames[planDetails.name.toLowerCase()] || planDetails.name
        },
        paymentMethod,
        transactionId,
        screenshot,
        timestamp: new Date().toISOString(),
        status: 'pending'
      }

      // Get existing payments or initialize empty array
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]')
      existingPayments.push(paymentData)
      
      // Save to localStorage
      localStorage.setItem('payments', JSON.stringify(existingPayments))
      localStorage.setItem('lastPaymentId', paymentData.timestamp)

      // Show success message
      toast({
        title: "Success",
        description: "Payment submitted successfully!"
      })

      // Clear plan selection
      localStorage.removeItem("selectedPlan")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)

    } catch (error) {
      console.error("Payment Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setIsConfirmDialogOpen(false)
    }
  }

  const PaymentMethodCard = ({ 
    title, 
    method, 
    isSelected, 
    children 
  }: { 
    title: string; 
    method: 'bank' | 'crypto' | 'other'; 
    isSelected: boolean; 
    children: React.ReactNode 
  }) => (
    <Card 
      className={`p-6 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
      }`}
      onClick={() => setPaymentMethod(method)}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
      </div>
      <Separator className="mb-4" />
      {children}
    </Card>
  )

  const handleProcessPayment = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Get the selected plan
      const storedPlan = localStorage.getItem("selectedPlan")
      if (!storedPlan) {
        throw new Error("No plan selected")
      }

      const plan = JSON.parse(storedPlan)
      
      // Update plan with active status
      const activePlan = {
        ...plan,
        status: 'active',
        purchaseDate: new Date().toISOString()
      }
      
      // Store the updated plan
      localStorage.setItem("selectedPlan", JSON.stringify(activePlan))
      
      // Store payment info
      const paymentInfo = {
        planName: plan.name,
        amount: plan.price,
        status: 'completed',
        date: new Date().toISOString()
      }
      localStorage.setItem("payment", JSON.stringify(paymentInfo))

      toast({
        title: "Payment Successful",
        description: "Your subscription is now active!",
      })

      router.push('/dashboard')
    } catch (error) {
      console.error("Payment Error:", error)
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || !withdrawAddress) {
      toast({
        title: "Error",
        description: "Please fill in all withdrawal details",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      // Simulate withdrawal processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const withdrawalData = {
        amount: withdrawAmount,
        address: withdrawAddress,
        status: 'pending',
        timestamp: new Date().toISOString()
      }

      // Store withdrawal request
      const existingWithdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]')
      existingWithdrawals.push(withdrawalData)
      localStorage.setItem('withdrawals', JSON.stringify(existingWithdrawals))

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully!"
      })
      
      setShowWithdraw(false)
      setWithdrawAmount("")
      setWithdrawAddress("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal request",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {planDetails && (
        <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h2 className="text-lg font-semibold mb-2">Selected Plan Details</h2>
          <p className="text-sm text-gray-600">Plan: {planDetails.name}</p>
          <p className="text-sm text-gray-600">Amount to Pay: ${planDetails.price}</p>
        </div>
      )}
      
      <h1 className="text-2xl font-bold text-center mb-8">Payment Methods</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PaymentMethodCard 
            title="Bank Transfer" 
            method="bank"
            isSelected={paymentMethod === 'bank'}
          >
            <div className="space-y-3">
              <DetailRow label="Name" value="FIROJ MONDAL" copyable />
              <DetailRow label="Bank Name" value="PUNJAB NATIONAL BANK" />
              <DetailRow label="Account No" value="033001020395" copyable />
              <DetailRow label="IFSC Code" value="PUNB0033020" copyable />
            </div>
          </PaymentMethodCard>

          <PaymentMethodCard 
            title="Crypto Currency" 
            method="crypto"
            isSelected={paymentMethod === 'crypto'}
          >
            <div className="space-y-3">
              <DetailRow 
                label="TRON (TRC20)" 
                value="TTHPFAjnpPHZKujeAymbRkeBFPq1GB4SDU" 
                copyable 
              />
              <DetailRow 
                label="BNB Smart Chain (BEP20)" 
                value="0x1d2E14A94ac59749D3A6AF5465125ab168A3612a" 
                copyable 
              />
            </div>
          </PaymentMethodCard>

          <PaymentMethodCard 
            title="Other Methods" 
            method="other"
            isSelected={paymentMethod === 'other'}
          >
            <div className="space-y-3">
              <DetailRow label="Phone Number" value="8972319894" />
              <DetailRow label="Google Pay" value="8972319894" copyable />
            </div>
          </PaymentMethodCard>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Payment Proof</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Transaction ID / Reference Number
                </label>
                <Input
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Payment Screenshot
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {screenshot ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={screenshot}
                        alt="Payment proof"
                        fill
                        className="object-contain rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setScreenshot(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mb-2" />
                            <span className="text-sm text-gray-500">
                              Click to upload screenshot
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          type="button"
          onClick={handleProcessPayment}
          className="w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Complete Purchase
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={() => setShowWithdraw(true)}
          className="w-full md:w-auto min-w-[200px]"
        >
          Withdraw Funds
        </Button>

        {(!paymentMethod || !screenshot || !transactionId) && (
          <div className="text-sm text-muted-foreground text-center">
            <p>Please complete all required fields:</p>
            <ul className="mt-1 list-none">
              {!paymentMethod && <li>• Select a payment method</li>}
              {!screenshot && <li>• Upload payment proof</li>}
              {!transactionId && <li>• Enter transaction ID</li>}
            </ul>
          </div>
        )}
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment Details</DialogTitle>
            <DialogDescription>
              Please verify your payment details before submitting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {planDetails && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">Plan: {planDetails.name}</p>
                <p className="text-sm text-muted-foreground">Amount: ${planDetails.price}</p>
                <p className="text-sm text-muted-foreground">
                  Method: {paymentMethod && paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {transactionId}
                </p>
              </div>
            )}
            
            {screenshot && (
              <div className="relative h-48 w-full">
                <Image
                  src={screenshot}
                  alt="Payment proof"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isProcessing}
              className="min-w-[100px]"
            >
              Back
            </Button>
            <Button 
              type="button"
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="min-w-[140px]"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showWithdraw && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount to Withdraw
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Withdrawal Address
              </label>
              <Input
                placeholder="Enter withdrawal address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
            </div>
            <Button
              onClick={handleWithdrawSubmit}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                "Submit Withdrawal Request"
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

interface DetailRowProps {
  label: string
  value: string
  copyable?: boolean
}

function DetailRow({ label, value, copyable }: DetailRowProps) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between">
        <span className="font-medium">{value}</span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(value)
              toast.success(`${label} copied!`)
            }}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}