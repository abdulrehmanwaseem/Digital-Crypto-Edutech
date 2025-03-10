"use client"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Copy, CheckCircle, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { CloudinaryUploadWidget } from "@/components/cloudinary-upload-widget"

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [planDetails, setPlanDetails] = useState<{
    name: string;
    price: number;
    referralCode?: string;
    referrerId?: string;
  } | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'crypto' | 'other' | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Get selected plan from session storage
    const selectedPlan = sessionStorage.getItem("selectedPlan")
    if (selectedPlan) {
      setPlanDetails(JSON.parse(selectedPlan))
    } else {
      router.push("/plans")
    }
  }, [router])

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive"
      })
      return
    }

    if (!proofImageUrl) {
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
      const response = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planDetails.name,
          price: planDetails.price,
          paymentMethod,
          transactionId,
          proofImageUrl,
          referralCode: planDetails.referralCode,
          referrerId: planDetails.referrerId
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit payment")
      }

      // Clear plan selection
      sessionStorage.removeItem("selectedPlan")

      toast({
        title: "Success",
        description: "Payment submitted successfully! Our team will verify your payment shortly."
      })

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

  if (!mounted || !planDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground">
            Please complete your payment for the {planDetails.name} plan
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium">Plan</label>
                <p className="text-2xl font-bold">{planDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-2xl font-bold">${planDetails.price}</p>
              </div>
              {planDetails.referralCode && (
                <div>
                  <label className="text-sm font-medium">Referral Code Applied</label>
                  <p className="text-green-600 font-medium">{planDetails.referralCode}</p>
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
            <div className="space-y-4">
              <PaymentMethodCard
                title="Bank Transfer"
                method="bank"
                isSelected={paymentMethod === 'bank'}
              >
                <div className="space-y-2">
                  <p className="font-medium">Bank: Example Bank</p>
                  <p>Account Number: 1234567890</p>
                  <p>Account Name: Crypto LMS</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please transfer the exact amount and use your email as reference
                  </p>
                </div>
              </PaymentMethodCard>

              <PaymentMethodCard
                title="Cryptocurrency"
                method="crypto"
                isSelected={paymentMethod === 'crypto'}
              >
                <div className="space-y-2">
                  <p className="font-medium">USDT (TRC20)</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted p-2 rounded text-sm">
                      TRC20WalletAddressHere
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText("TRC20WalletAddressHere")
                        toast({
                          title: "Copied!",
                          description: "Wallet address copied to clipboard"
                        })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Send exactly ${planDetails.price} USDT to this address
                  </p>
                </div>
              </PaymentMethodCard>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Proof</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Transaction ID</label>
                <Input
                  placeholder="Enter transaction ID or reference number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Upload Payment Screenshot
                </label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {proofImageUrl ? (
                    <div className="relative aspect-video">
                      <Image
                        src={proofImageUrl}
                        alt="Payment proof"
                        fill
                        className="object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setProofImageUrl(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <CloudinaryUploadWidget
                      onUpload={(url: string) => {
                        setProofImageUrl(url)
                        toast({
                          title: "Success",
                          description: "Payment proof uploaded successfully!"
                        })
                      }}
                      options={{
                        maxFiles: 1,
                        sources: ["local", "camera"],
                        resourceType: "image",
                        folder: "crypto-lms/payments"
                      }}
                      onError={(error: Error) => {
                        toast({
                          title: "Error",
                          description: error.message,
                          variant: "destructive"
                        })
                      }}
                    >
                      <div className="text-center cursor-pointer py-8">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Click to upload payment proof
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </CloudinaryUploadWidget>
                  )}
                </div>
              </div>

              <Button
                className="w-full h-12"
                onClick={handlePaymentSubmit}
                disabled={isSubmitting || !paymentMethod || !proofImageUrl || !transactionId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Payment...
                  </>
                ) : (
                  "Submit Payment"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Our team will verify your payment within 24 hours
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}