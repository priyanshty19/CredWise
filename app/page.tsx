import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CreditCard, BarChart3, Target, Zap, ArrowRight, Star, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation currentPage="HOME" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            🚀 India's Smartest Wealth Management Platform
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Financial Balance
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Get personalized credit card recommendations and financial goals. Make smarter financial decisions with
            CredWise.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/cards">
              <Button size="lg" className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700">
                <CreditCard className="mr-2 h-5 w-5" />
                Get Card Recommendations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/deep-dive">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 bg-transparent">
                <BarChart3 className="mr-2 h-5 w-5" />
                Deep Dive Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Credit Cards Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">₹2Cr+</div>
              <div className="text-gray-600">Savings Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CredWise?</h2>
          <p className="text-lg text-gray-600">Advanced AI-powered recommendations tailored just for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get credit card suggestions based on your unique spending patterns, income, and financial goals.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Deep Portfolio Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upload your bank statements for comprehensive analysis and insights into your spending behavior.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get your personalized recommendations in seconds with our advanced matching algorithm.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>100% Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your financial data is encrypted and secure. We never store sensitive information.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Expert Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Backed by financial experts and updated with the latest card offers and benefits.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Always Free</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our recommendation service is completely free. No hidden charges or subscription fees.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Credit Card?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have already optimized their credit card portfolio
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cards">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Start Recommendations
                </Button>
              </Link>

              <Link href="/deep-dive">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analyze Portfolio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-4">CredWise</div>
            <p className="text-gray-400 mb-4">Making credit card decisions smarter, one recommendation at a time.</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 CredWise. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
