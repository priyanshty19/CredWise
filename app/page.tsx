import Link from "next/link"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, CreditCard, Shield, BarChart3, Upload, Zap } from "lucide-react"
import { CardRecommendationForm } from "@/components/card-recommendation-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation currentPage="HOME" />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to CredWise
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Credit Card
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized credit card recommendations based on your income, spending patterns, and financial goals.
            Powered by real-time data and smart algorithms.
          </p>
          <Link href="/card">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Get Started
            </Button>
          </Link>
        </div>

        {/* What is CredWise Section */}
        <Card className="max-w-4xl mx-auto mb-12 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <Zap className="mr-3 h-8 w-8 text-blue-600" />
                What is CredWise?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* About Us */}
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">About Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  CredWise is a modern platform helping users make smarter financial decisions. We securely analyze your
                  preferences and financial details to recommend the best credit cards and investment products for you.
                </p>
              </div>

              {/* How It Works */}
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upload your statements to visualize your investment and savings growth. Use our tools to track stocks
                  and crypto. Fill out a quick form and receive instant, personalized credit card recommendations
                  powered by our intelligent engine.
                </p>
              </div>

              {/* Our Mission */}
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  We empower you to make confident, informed money decisions with transparency and clear, simple
                  analytics. Your financial success is our priority.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Smart Financial Decisions
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Credit Card Recommendations */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Smart Recommendations</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Get personalized credit card recommendations based on your credit score, income, and spending
                  preferences.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI-powered matching algorithm</li>
                  <li>• Real-time approval probability</li>
                  <li>• Detailed feature comparisons</li>
                </ul>
              </CardContent>
            </Card>

            {/* Investment Tracking */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Upload className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Statement Analysis</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Upload your financial statements to visualize your investment growth and savings patterns over time.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure document processing</li>
                  <li>• Visual growth analytics</li>
                  <li>• Spending pattern insights</li>
                </ul>
              </CardContent>
            </Card>

            {/* Portfolio Tracking */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Portfolio Tracking</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Track your stocks, crypto, and other investments with real-time updates and comprehensive analytics.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time market data</li>
                  <li>• Performance analytics</li>
                  <li>• Risk assessment tools</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Make Smarter Financial Decisions?</h2>
              <p className="text-blue-100 mb-6">
                Join thousands of users who trust CredWise for their financial planning needs.
              </p>
              <Link href="/card">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Your Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Card Recommendation Form */}
        <div className="max-w-6xl mx-auto mt-12">
          <CardRecommendationForm />
        </div>
      </main>
    </div>
  )
}
