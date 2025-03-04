"use client"

import {
  BookOpen,
  Signal,
  Newspaper,
  LineChart,
  BarChart,
  BookOpenCheck,
  HeadphonesIcon,
  Wallet,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react"
import { Card } from "@/components/ui/card"

const services = [
  {
    icon: GraduationCap,
    title: "Crypto Education (Basic to Advance)",
    description: "Comprehensive curriculum covering everything from cryptocurrency basics to advanced trading strategies",
    access: "All Plans",
    highlight: true
  },
  {
    icon: Shield,
    title: "All Crypto Services",
    description: "Complete access to our suite of cryptocurrency trading and analysis tools",
    access: "All Plans",
    highlight: true
  },
  {
    icon: Signal,
    title: "Crypto Signal",
    description: "Real-time trading signals with detailed analysis and market insights",
    access: "All Plans",
    highlight: true
  },
  {
    icon: Newspaper,
    title: "Crypto News & Guide",
    description: "Latest market news, trends, and comprehensive trading guides",
    access: "All Plans",
    highlight: true
  },
  {
    icon: LineChart,
    title: "Crypto Analysis",
    description: "In-depth market analysis tools and resources",
    access: "All Plans",
    highlight: true
  },
  {
    icon: TrendingUp,
    title: "Technical Analysis",
    description: "Advanced technical analysis tools and training",
    access: "Standard+",
    highlight: true
  },
  {
    icon: Lightbulb,
    title: "Fundamental Analysis",
    description: "Comprehensive fundamental analysis training and resources",
    access: "Premium+",
    highlight: true
  },
  {
    icon: HeadphonesIcon,
    title: "24*7 Customer Support",
    description: "Round-the-clock customer support and assistance",
    access: "All Plans",
    highlight: true
  },
  {
    icon: MessageSquare,
    title: "Community Access",
    description: "Join our thriving community of crypto traders",
    access: "All Plans"
  },
  {
    icon: Clock,
    title: "Market Updates",
    description: "Real-time market updates and alerts",
    access: "All Plans"
  },
  {
    icon: BookOpenCheck,
    title: "Learning Resources",
    description: "Extensive library of educational materials",
    access: "All Plans"
  },
  {
    icon: Wallet,
    title: "Stipend Program",
    description: "Monthly stipends for eligible premium plans",
    access: "Premium+"
  }
]

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="bg-primary py-16 text-primary-foreground">
          <div className="container text-center">
            <h1 className="mb-4 text-4xl font-bold">Our Services</h1>
            <p className="text-lg">
              Comprehensive crypto education and trading resources
            </p>
          </div>
        </div>

        <div className="container py-16">
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-center">Student Services</h2>
            <p className="text-center text-muted-foreground">
              Everything you need to succeed in your crypto trading journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <Card 
                key={service.title} 
                className={`group hover-card overflow-hidden border-2 p-6 ${
                  service.highlight ? 'border-primary/50' : ''
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 rounded-2xl p-3 transition-colors ${
                    service.highlight 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                  }`}>
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-auto">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      service.highlight 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {service.access}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}