import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

interface NavigationProps {
  currentPage?: "HOME" | "CARD RECOMMENDATIONS"
}

export default function Navigation({ currentPage }: NavigationProps) {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CredWise</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                currentPage === "HOME" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              HOME
            </Link>
            <Link
              href="/cards"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                currentPage === "CARD RECOMMENDATIONS" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              CARD RECOMMENDATIONS
            </Link>
            <Button asChild size="sm" className="ml-2">
              <Link href="/cards">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
