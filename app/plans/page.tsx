"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Crown, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import toast from 'react-hot-toast';

interface Plan {
  name: string;
  price: number;
  duration: string;
  features: string[];
  stipend?: {
    amount: number;
    months: number;
  } | null;
  referralBonus: {
    amount: number;
    type: 'percentage' | 'fixed';
    tiers: {
      threshold: number;
      bonus: number;
    }[];
    milestoneRewards: {
      referrals: number;
      reward: {
        type: 'bonus' | 'courseAccess' | 'planUpgrade';
        value: string | number;
      };
    }[];
  };
}

interface PlanWithReferral extends Plan {
  discountApplied?: boolean;
  originalPrice?: number;
  referralBonus: {
    amount: number;
    type: 'percentage' | 'fixed';
    tiers: {
      threshold: number;
      bonus: number;
    }[];
    milestoneRewards: {
      referrals: number;
      reward: {
        type: 'bonus' | 'courseAccess' | 'planUpgrade';
        value: string | number;
      };
    }[];
  };
}

const plans: PlanWithReferral[] = [
  {
    name: "Basic",
    price: 30,
    duration: "1 month",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access"
    ],
    stipend: null,
    referralBonus: {
      amount: 5,
      type: 'fixed',
      tiers: [
        { threshold: 3, bonus: 7 },
        { threshold: 5, bonus: 10 },
        { threshold: 10, bonus: 15 }
      ],
      milestoneRewards: [
        { 
          referrals: 5,
          reward: { type: 'bonus', value: 25 }
        },
        {
          referrals: 10,
          reward: { type: 'planUpgrade', value: 'Standard' }
        }
      ]
    }
  },
  {
    name: "Standard",
    price: 50,
    duration: "2 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access"
    ],
    stipend: null,
    referralBonus: {
      amount: 10,
      type: 'percentage',
      tiers: [
        { threshold: 3, bonus: 12 },
        { threshold: 5, bonus: 15 },
        { threshold: 10, bonus: 20 }
      ],
      milestoneRewards: [
        { 
          referrals: 5,
          reward: { type: 'bonus', value: 50 }
        },
        {
          referrals: 10,
          reward: { type: 'planUpgrade', value: 'Premium' }
        }
      ]
    }
  },
  {
    name: "Premium",
    price: 100,
    duration: "4 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access"
    ],
    stipend: {
      amount: 6,
      months: 3
    },
    referralBonus: {
      amount: 15,
      type: 'percentage',
      tiers: [
        { threshold: 3, bonus: 18 },
        { threshold: 5, bonus: 20 },
        { threshold: 10, bonus: 25 }
      ],
      milestoneRewards: [
        { 
          referrals: 5,
          reward: { type: 'bonus', value: 100 }
        },
        {
          referrals: 10,
          reward: { type: 'courseAccess', value: 'Advanced Trading Masterclass' }
        }
      ]
    }
  },
  {
    name: "Professional",
    price: 200,
    duration: "6 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access"
    ],
    stipend: {
      amount: 12,
      months: 5
    },
    referralBonus: {
      amount: 20,
      type: 'percentage',
      tiers: [
        { threshold: 3, bonus: 25 },
        { threshold: 5, bonus: 30 },
        { threshold: 10, bonus: 35 }
      ],
      milestoneRewards: [
        { 
          referrals: 5,
          reward: { type: 'bonus', value: 200 }
        },
        {
          referrals: 10,
          reward: { type: 'courseAccess', value: 'Professional Trading Bundle' }
        }
      ]
    }
  }
]

export default function PlansPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const [referralStatus, setReferralStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [isValidating, setIsValidating] = useState(false)
  const [discountedPlans, setDiscountedPlans] = useState(plans)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referredBy', refCode);
    }
  }, []);

  useEffect(() => {
    if (referralStatus === 'valid') {
      const updatedPlans = plans.map(plan => {
        let discount = 0;
        if (plan.referralBonus.type === 'percentage') {
          discount = (plan.price * plan.referralBonus.amount) / 100;
        } else if (plan.referralBonus.type === 'fixed') {
          discount = plan.referralBonus.amount;
        }
        
        return {
          ...plan,
          originalPrice: plan.price,
          price: plan.price - discount,
          discountApplied: discount > 0
        };
      });
      setDiscountedPlans(updatedPlans);
    } else {
      setDiscountedPlans(plans);
    }
  }, [referralStatus]);

  const validateReferralCode = async (code: string) => {
    if (!code) return;
    setIsValidating(true);
    try {
      // Get all stored referral codes from localStorage
      const storedCodes = JSON.parse(localStorage.getItem('referralCodes') || '[]');
      
      if (storedCodes.includes(code)) {
        setReferralStatus('valid');
        localStorage.setItem('appliedReferralCode', code);
        toast.success('Referral code applied successfully!');
      } else {
        setReferralStatus('invalid');
        toast.error('Invalid referral code');
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setReferralStatus('invalid');
      toast.error('Error validating referral code');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePlanSelection = async (plan: PlanWithReferral) => {
    // Get the referral code the user registered with
    const usedReferralCode = localStorage.getItem("usedReferralCode");
    
    if (usedReferralCode) {
      // Apply discount to the plan
      const discount = plan.price * 0.10; // 10% discount for referred users
      const discountedPrice = plan.price - discount;

      // Update the referrer's dashboard with purchase info
      const referredUsers = JSON.parse(localStorage.getItem(`referredUsers_${usedReferralCode}`) || '[]');
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      
      // Find and update the user's purchase info
      const userIndex = referredUsers.findIndex((u: any) => u.name === userData.name);
      if (userIndex !== -1) {
        referredUsers[userIndex] = {
          ...referredUsers[userIndex],
          plan: plan.name,
          discount: discount,
          status: 'active'
        };
        localStorage.setItem(`referredUsers_${usedReferralCode}`, JSON.stringify(referredUsers));

        // Update referrer's earnings
        const currentEarnings = parseFloat(localStorage.getItem(`referralEarnings_${usedReferralCode}`) || '0');
        const newEarnings = currentEarnings + (discount * 0.5); // Referrer gets 50% of the discount as earnings
        localStorage.setItem(`referralEarnings_${usedReferralCode}`, newEarnings.toString());
      }

      // Store the discounted plan details
      localStorage.setItem("selectedPlan", JSON.stringify({
        ...plan,
        originalPrice: plan.price,
        price: discountedPrice,
        discountApplied: discount
      }));
    } else {
      // No referral code, store original plan details
      localStorage.setItem("selectedPlan", JSON.stringify(plan));
    }

    // Redirect to payment or registration
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/register?redirect=/payment");
    } else {
      router.push("/payment");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto mb-8">
        <div className="space-y-2">
          <label htmlFor="referralCode" className="text-sm font-medium">
            Have a referral code?
          </label>
          <div className="flex gap-2">
            <Input
              id="referralCode"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className={`uppercase ${
                referralStatus === 'valid' 
                  ? 'border-green-500' 
                  : referralStatus === 'invalid' 
                    ? 'border-red-500' 
                    : ''
              }`}
            />
            <Button
              onClick={() => validateReferralCode(referralCode)}
              disabled={isValidating || !referralCode}
              variant="outline"
            >
              {isValidating ? "Checking..." : "Apply"}
            </Button>
          </div>
          {referralStatus === 'valid' && (
            <p className="text-sm text-green-600">✓ Valid referral code applied</p>
          )}
          {referralStatus === 'invalid' && (
            <p className="text-sm text-red-600">✗ Invalid referral code</p>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {discountedPlans.map((plan) => (
          <Card 
            key={plan.name}
            className={`p-6 relative overflow-hidden group transition-all duration-300 
              hover:shadow-2xl hover:-translate-y-1 flex flex-col
              ${plan.name === "Premium" ? "border-primary shadow-lg" : ""}
              ${plan.name === "Professional" ? "border-purple-500 shadow-lg" : ""}
            `}
          >
            {/* Popular Badge for Premium */}
            {plan.name === "Premium" && (
              <div className="absolute top-5 -right-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-14 py-1.5 text-sm 
                transform rotate-45 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}
            
            {/* Best Value Badge for Professional */}
            {plan.name === "Professional" && (
              <div className="absolute top-5 -right-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-14 py-1.5 text-sm 
                transform rotate-45 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <div className="flex items-center justify-center gap-1">
                  <Crown className="h-4 w-4" />
                  <span>Best Value</span>
                </div>
              </div>
            )}

            <div className="mb-6 relative">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="flex items-baseline gap-1">
                {plan.discountApplied ? (
                  <>
                    <span className="text-4xl font-bold text-primary">
                      ${plan.price}
                    </span>
                    <span className="text-lg line-through text-muted-foreground">
                      ${plan.originalPrice}
                    </span>
                    <span className="text-sm text-green-600">
                      ({plan.referralBonus.type === 'percentage' 
                        ? `${plan.referralBonus.amount}% off` 
                        : `$${plan.referralBonus.amount} off`})
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                )}
                <span className="text-muted-foreground">/{plan.duration}</span>
              </div>
              {plan.stipend && (
                <p className="text-green-600 font-medium mt-2 text-sm">
                  ${plan.stipend.amount} monthly stipend for {plan.stipend.months} months
                </p>
              )}
            </div>

            <div className="flex-grow">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 group-hover:transform group-hover:translate-x-1 transition-transform duration-200">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.referralBonus && (
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm">
                      {plan.referralBonus.type === 'percentage' 
                        ? `${plan.referralBonus.amount}% referral bonus`
                        : `$${plan.referralBonus.amount} referral bonus`
                      }
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="pt-6 mt-auto border-t">
              <Button
                className={`w-full h-12 text-sm font-medium transition-all duration-300 
                  ${plan.name === "Professional" 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl" 
                    : plan.name === "Premium"
                    ? "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
                    : "hover:bg-primary hover:text-primary-foreground"
                  }
                  group-hover:scale-105
                `}
                variant={plan.name === "Premium" || plan.name === "Professional" ? "default" : "outline"}
                onClick={() => handlePlanSelection(plan)}
              >
                Get Started Now
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3 group-hover:text-primary transition-colors duration-300">
                {plan.name === "Professional" || plan.name === "Premium" 
                  ? "Instant Access to All Features" 
                  : "7-Day Money-Back Guarantee"}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">7-Day Money-Back Guarantee</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Cancel Anytime</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  )
}