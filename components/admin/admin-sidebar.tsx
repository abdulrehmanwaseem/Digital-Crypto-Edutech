"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  LayoutDashboard,
  BookOpen,
  Settings,
  FileText,
  DollarSign,
} from "lucide-react"

const adminRoutes = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/courses",
    label: "Courses",
    icon: BookOpen,
  },
  {
    href: "/admin/transactions",
    label: "Transactions",
    icon: DollarSign,
  },
  {
    href: "/admin/content",
    label: "Content",
    icon: FileText,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card h-screen border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="space-y-1 px-3">
        {adminRoutes.map((route) => {
          const Icon = route.icon
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === route.href
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {route.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 