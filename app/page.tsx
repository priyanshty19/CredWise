import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, TrendingUp, Shield, Zap, ArrowRight, CheckCircle, BarChart3, PieChart, Target } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="HOME" />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Financial Intelligence
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Make <span className="text-blue-600">Smart</span> Financial Decisions
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              CredWise combines AI-powered credit card recommendations with comprehensive portfolio analysis to help you
              optimize your financial strategy and maximize rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cards">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Get Card Recommendations
                </Button>
              </Link>
              <Link href="/deep-dive">
                <Button size="lg" variant="outline">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Analyze Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Smart Card Recommendations</CardTitle>
                  <p className="text-sm text-gray-600">AI-powered matching system</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Our advanced funnel-based algorithm analyzes your spending patterns, income, and preferences to
                recommend the perfect credit cards for your lifestyle.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>3-Level Filtering System</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Dynamic Brand Filtering</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>TOP 7 Personalized Results</span>
                </div>
              </div>
              <Link href="/cards">
                <Button className="w-full">
                  Start Recommendation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Deep Dive Analysis</CardTitle>
                  <p className="text-sm text-gray-600">Comprehensive portfolio insights</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Upload your financial statements and get detailed analysis of your spending patterns, investment
                portfolio, and personalized optimization recommendations.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span>Portfolio Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  <span>Spending Insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Goal Management</span>
                </div>
              </div>
              <Link href="/deep-dive">
                <Button variant="outline" className="w-full bg-transparent">
                  Explore Deep Dive
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Key Benefits */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CredWise?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with comprehensive financial analysis to give you the edge in
              personal finance management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Intelligence</h3>
                <p className="text-gray-600">
                  Advanced algorithms analyze thousands of data points to provide personalized recommendations tailored
                  to your unique financial profile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600">
                  Your financial data is encrypted and processed securely. We never store sensitive information and
                  prioritize your privacy above all.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Personalized Results</h3>
                <p className="text-gray-600">
                  Every recommendation is customized based on your spending habits, income level, and financial goals
                  for maximum relevance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
            <p className="text-lg text-gray-600">Join the growing community of smart financial decision makers</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-sm text-gray-600">Recommendations Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">₹2.5Cr+</div>
              <div className="text-sm text-gray-600">Rewards Optimized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">AI-Powered Support</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Finances?</h2>
              <p className="text-lg mb-6 opacity-90">
                Start your journey to smarter financial decisions today. Get personalized recommendations in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cards">
                  <Button size="lg" variant="secondary">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Find My Perfect Card
                  </Button>
                </Link>
                <Link href="/deep-dive">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Analyze My Portfolio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold">CredWise</div>
                <div className="text-sm text-gray-400">Smart Financial Decisions</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">© 2024 CredWise. Empowering your financial future.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
