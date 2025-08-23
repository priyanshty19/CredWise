"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Home, TrendingUp } from "lucide-react"

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "HOME",
      href: "/",
      icon: Home,
      description: "Welcome & Overview",
    },
    {
      name: "CARD RECOMMENDATIONS",
      href: "/cards",
      icon: CreditCard,
      description: "AI-Powered Card Matching",
    },
    {
      name: "DEEP DIVE",
      href: "/deep-dive",
      icon: TrendingUp,
      description: "Portfolio Analysis",
    },
  ]

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CredWise</h1>
              <p className="text-sm text-gray-600">Smart Financial Decisions</p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || currentPage === item.name

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {currentPage && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentPage}</h2>
                <p className="text-sm text-gray-600">
                  {navItems.find((item) => item.name === currentPage)?.description}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Active Section
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
