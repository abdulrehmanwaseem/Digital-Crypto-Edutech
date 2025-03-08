"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import {
  ChevronLeft,
  ChevronRight,
  Wallet2,
  BookOpen,
  Users2,
  Trophy,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Crown, Star } from "lucide-react"

const slides = [
  {
    image: "/images/image1.jpg",
    title: "Master Crypto Trading",
    description: "Learn from industry experts and start your journey in cryptocurrency trading",
  },
  {
    image: "/images/image2.jpg",
    title: "Earn While You Learn",
    description: "Get stipends and rewards as you progress through our comprehensive courses",
  },
  {
    image: "/images/image3.jpg",
    title: "Join Our Community",
    description: "Connect with fellow traders and build your network in the crypto space",
  },
  {
    image: "/images/image4.jpg",
    title: "Advanced Trading Tools",
    description: "Access professional trading tools and real-time market analysis",
  },
]

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description: "Learn from experienced traders and industry professionals",
  },
  {
    icon: Wallet2,
    title: "Earn Stipends",
    description: "Receive rewards as you progress through your learning journey",
  },
  {
    icon: Users2,
    title: "Community Support",
    description: "Join a thriving community of crypto enthusiasts",
  },
  {
    icon: Trophy,
    title: "Certification",
    description: "Earn recognized certificates upon course completion",
  },
]

const stats = [
  { value: "20K+", label: "Active Students" },
  { value: "95%", label: "Success Rate" },
  { value: "50+", label: "Expert Instructors" },
  { value: "24/7", label: "Support Available" },
]

const plans = [
  {
    name: "Basic",
    price: 30,
    duration: "1 month",
    stipend: null,
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources"
    ]
  },
  {
    name: "Standard",
    price: 50,
    duration: "2 months",
    stipend: null,
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources",
      "Fundamental Analysis Training"
    ]
  },
  {
    name: "Premium",
    price: 100,
    duration: "4 months",
    stipend: {
      amount: 6,
      months: 3
    },
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources",
      "Fundamental Analysis Training",
      "Priority Support",
      "Advanced Market Analysis"
    ]
  },
  {
    name: "Professional",
    price: 200,
    duration: "6 months",
    stipend: {
      amount: 12,
      months: 5
    },
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources",
      "Fundamental Analysis Training",
      "Priority Support",
      "Advanced Market Analysis",
      "One-on-One Mentoring",
      "Custom Trading Strategies"
    ]
  }
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    if (touchStart - touchEnd < -75) {
      // Swipe right
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div 
          className="relative h-[600px] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides */}
          <div className="relative h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-all duration-700",
                  currentSlide === index 
                    ? "opacity-100 translate-x-0" 
                    : currentSlide < index
                    ? "opacity-0 translate-x-full"
                    : "opacity-0 -translate-x-full"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-[2s]",
                    currentSlide === index && "scale-105"
                  )}
                  priority={index === 0}
                  onLoadingComplete={() => setIsLoading(false)}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="container px-4 text-center text-white">
                    <h1 
                      className={cn(
                        "mb-6 text-4xl font-bold transition-all duration-700 sm:text-5xl md:text-6xl",
                        currentSlide === index 
                          ? "translate-y-0 opacity-100" 
                          : "translate-y-4 opacity-0"
                      )}
                    >
                      {slide.title}
                    </h1>
                    <p 
                      className={cn(
                        "mx-auto mb-8 max-w-2xl text-lg text-gray-200 transition-all delay-100 duration-700 sm:text-xl",
                        currentSlide === index 
                          ? "translate-y-0 opacity-100" 
                          : "translate-y-4 opacity-0"
                      )}
                    >
                      {slide.description}
                    </p>
                    <div 
                      className={cn(
                        "flex justify-center gap-4 transition-all delay-200 duration-700",
                        currentSlide === index 
                          ? "translate-y-0 opacity-100" 
                          : "translate-y-4 opacity-0"
                      )}
                    >
                      <Button size="lg" className="min-w-[150px]" asChild>
                        <Link href="/plans">Get Started</Link>
                      </Button>
                      <Button size="lg" variant="outline" className="min-w-[150px]" asChild>
                        <Link href="/about">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlide === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center"
                >
                  <p className="mb-2 text-4xl font-bold">{stat.value}</p>
                  <p className="text-lg text-primary-foreground/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Why Choose CryptoEdu?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Join thousands of successful traders who started their journey with our comprehensive platform
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover-card overflow-hidden border-2 p-6"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 rounded-2xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted/50 py-24">
          <div className="container">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold">Your Path to Success</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                We provide everything you need to become a successful crypto trader
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">Structured Learning Path</h3>
                    <p className="text-muted-foreground">
                      Follow our carefully designed curriculum that takes you from basics to advanced trading
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TrendingUp className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">Real Market Experience</h3>
                    <p className="text-muted-foreground">
                      Practice with real market data and simulated trading environments
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">Risk Management</h3>
                    <p className="text-muted-foreground">
                      Learn essential risk management strategies to protect your investments
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src="https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&q=80&w=2070"
                  alt="Trading Dashboard"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section className="py-16 bg-muted/50">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Learning Path</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select a plan that best suits your learning goals. Each plan includes comprehensive curriculum and dedicated support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                <Card key={index} className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full",
                  plan.name === "Premium" && "border-primary"
                )}>
                  {plan.name === "Premium" && (
                    <div className="absolute top-4 right-4">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.duration}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.stipend && (
                        <li className="flex items-center gap-2 font-medium text-primary">
                          <Star className="h-5 w-5 flex-shrink-0" />
                          <span>${plan.stipend.amount} monthly stipend for {plan.stipend.months} months</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="p-6 pt-0 mt-auto border-t">
                    <div className="space-y-3">
                      <Button className="w-full" variant={plan.name === "Premium" ? "default" : "outline"} asChild>
                        <Link href="/plans">Choose {plan.name}</Link>
                      </Button>
                      <Button variant="link" className="w-full text-sm text-muted-foreground hover:text-primary" asChild>
                        <Link href="/plans">View detailed features</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                All plans include access to our community and learning resources
              </p>
              <Button variant="link" asChild>
                <Link href="/plans" className="text-primary font-medium hover:underline">
                  View detailed plan comparison <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-primary/10" />
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-4xl font-bold">
                Ready to Start Your Crypto Journey?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join thousands of successful traders who started with CryptoEdu. 
                Get access to expert-led courses, community support, and earn while you learn.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button 
                  size="lg" 
                  className="min-w-[200px] text-lg"
                  asChild
                >
                  <Link href="/register">Start Learning</Link>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="min-w-[200px] text-lg"
                  asChild
                >
                  <Link href="/contact">Talk to an Expert</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}