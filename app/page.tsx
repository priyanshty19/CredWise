import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, BarChart3, TrendingUp, Shield, Zap, Target, ArrowRight, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="HOME" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to <span className="text-blue-200">CredWise</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Your intelligent financial companion for smart credit card recommendations and comprehensive portfolio
              analysis. Make informed financial decisions with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cards">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Get Card Recommendations
                </Button>
              </Link>
              <Link href="/deep-dive">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-700 bg-transparent"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analyze Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Financial Solutions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From personalized credit card recommendations to deep portfolio analysis, we've got your financial journey
              covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Card Recommendations Feature */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Smart Card Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get personalized credit card recommendations based on your spending patterns, income, and financial
                  goals. Our AI analyzes your profile to find the perfect cards for maximum rewards and benefits.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Funnel-based recommendation system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Category-wise spending analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Brand preference matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Top 7 curated recommendations</span>
                  </div>
                </div>
                <Link href="/cards">
                  <Button className="w-full">
                    Explore Card Recommendations
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Deep Dive Feature */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Deep Dive Portfolio Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive financial portfolio analysis with advanced insights, goal planning, and portfolio
                  management tools. Upload your statements and get detailed financial health reports.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Multi-file portfolio upload</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Spending pattern analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Investment insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Goal tracking & management</span>
                  </div>
                </div>
                <Link href="/deep-dive">
                  <Button className="w-full bg-transparent" variant="outline">
                    Start Portfolio Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CredWise?</h2>
            <p className="text-xl text-gray-600">Advanced AI technology meets personalized financial guidance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Advanced algorithms analyze your financial profile for optimal recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">Your financial data is protected with enterprise-grade security</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized</h3>
              <p className="text-gray-600 text-sm">Tailored recommendations based on your unique spending patterns</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Growth Focused</h3>
              <p className="text-gray-600 text-sm">
                Maximize your rewards and optimize your financial growth potential
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Credit Cards Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Recommendation Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">₹2.5L+</div>
              <div className="text-gray-600">Average Annual Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Financial Journey?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of users who have already discovered their perfect credit cards and optimized their
            portfolios with CredWise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cards">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                Get Started with Card Recommendations
              </Button>
            </Link>
            <Link href="/deep-dive">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-700 bg-transparent"
              >
                Analyze Your Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">CredWise</span>
          </div>
          <p className="text-gray-400">Your intelligent financial companion for smart decisions and optimal growth.</p>
        </div>
      </footer>
    </div>
  )
}
