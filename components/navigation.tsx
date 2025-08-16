"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreditCardIcon as Card } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Card Recommendations" },
    { href: "/card", label: "Enhanced Recommendations" },
    { href: "/deep-dive", label: "Deep Dive Analysis" },
    { href: "/admin", label: "Admin" },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Card className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CredWise</span>
          </div>

          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant={pathname === item.href ? "default" : "ghost"} size="sm" className="text-sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <select
              value={pathname}
              onChange={(e) => (window.location.href = e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {navItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}
