"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Users, Trophy, Target, Wallet2, Shield } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Education",
    description: "Learn from industry professionals with years of trading experience"
  },
  {
    icon: Users,
    title: "Community Focus",
    description: "Join a thriving community of crypto enthusiasts and traders"
  },
  {
    icon: Trophy,
    title: "Proven Track Record",
    description: "Thousands of successful graduates trading professionally"
  },
  {
    icon: Target,
    title: "Structured Learning",
    description: "Carefully crafted curriculum from basics to advanced strategies"
  },
  {
    icon: Wallet2,
    title: "Earn While Learning",
    description: "Unique stipend program for eligible premium plans"
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    description: "Recognized leader in cryptocurrency education since 2021"
  }
]

const stats = [
  { label: "Active Students", value: "5,000+" },
  { label: "Course Completion Rate", value: "94%" },
  { label: "Professional Traders", value: "1,200+" },
  { label: "Countries Reached", value: "50+" }
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-primary py-16 text-primary-foreground">
          <div className="container text-center">
            <h1 className="mb-4 text-4xl font-bold">About CryptoEdu</h1>
            <p className="mx-auto max-w-2xl text-lg">
              Empowering individuals with professional cryptocurrency trading
              education and hands-on experience since 2021
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <section className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              To democratize cryptocurrency trading education by providing
              accessible, comprehensive, and practical learning experiences that
              empower individuals to achieve financial independence through
              informed trading decisions.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-16 grid gap-8 rounded-lg bg-muted p-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="mb-2 text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <feature.icon className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/30 py-16">
          <div className="container">
            <h2 className="mb-12 text-center text-3xl font-bold">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <h3 className="mb-4 text-xl font-semibold">Excellence</h3>
                <p className="text-muted-foreground">
                  Committed to providing the highest quality education and
                  resources to our students
                </p>
              </div>
              <div className="text-center">
                <h3 className="mb-4 text-xl font-semibold">Innovation</h3>
                <p className="text-muted-foreground">
                  Continuously evolving our curriculum to reflect the latest
                  market trends and strategies
                </p>
              </div>
              <div className="text-center">
                <h3 className="mb-4 text-xl font-semibold">Community</h3>
                <p className="text-muted-foreground">
                  Fostering a supportive environment where traders can learn
                  and grow together
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}