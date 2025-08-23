"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car as Card, BarChart3, Menu, X, Home } from "lucide-react"
import { useState } from "react"

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      name: "HOME",
      href: "/",
      icon: Home,
      isActive: pathname === "/" || currentPage === "HOME",
    },
    {
      name: "CARD RECOMMENDATIONS",
      href: "/cards",
      icon: Card,
      isActive: pathname === "/cards" || currentPage === "CARD RECOMMENDATIONS",
    },
    {
      name: "DEEP DIVE",
      href: "/deep-dive",
      icon: BarChart3,
      isActive: pathname === "/deep-dive" || currentPage === "DEEP DIVE",
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Card className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CredWise</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      item.isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
