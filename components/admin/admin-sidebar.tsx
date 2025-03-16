"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  LayoutDashboard,
  Settings,
  DollarSign,
  Wallet,
} from "lucide-react";

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
    href: "/admin/withdrawals",
    label: "Withdrawals",
    icon: Wallet,
  },
  {
    href: "/admin/transactions",
    label: "Transactions",
    icon: DollarSign,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-card h-screen border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-1 px-3">
          {adminRoutes.map((route) => {
            const Icon = route.icon;
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
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden w-full bg-[#020817] border-b border-slate-800 shadow-sm">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center mx-auto gap-4">
            {adminRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all",
                  pathname === route.href && "text-sky-500 bg-slate-800/75"
                )}
                title={route.label}
              >
                <route.icon className="h-5 w-5" />
                <span className="sr-only">{route.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
