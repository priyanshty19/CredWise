"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Navigation({ currentPage }: { currentPage?: string }) {
  const pathname = usePathname()

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "CARD RECOMMENDATIONS", href: "/cards" },
    { name: "DEEP DIVE", href: "/deep-dive" },
    { name: "ADMIN", href: "/admin" },
    { name: "DEBUG", href: "/debug" },
  ]

  return (
    <Card className="w-full bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <div className="text-2xl font-bold text-blue-600">CredWise</div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || currentPage === item.name
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
