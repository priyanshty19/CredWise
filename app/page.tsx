import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CreditCard, Target, Zap, ArrowRight, Star, Users, Shield, TrendingUp, Award, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation currentPage="HOME" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-6 py-2 text-base">
            <Star className="h-4 w-4 mr-2 inline" />
            India's Smartest Credit Card Recommendation Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Credit Card
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Get AI-powered, personalized credit card recommendations based on your spending patterns, income, and
            preferences. Make smarter financial decisions with CredWise.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/cards">
              <Button
                size="lg"
                className="px-10 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <CreditCard className="mr-3 h-6 w-6" />
                Get Recommendations Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Credit Cards Analyzed</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Happy Users</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-green-600 mb-2">₹2Cr+</div>
              <div className="text-gray-600 font-medium">Savings Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How CredWise Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, smart, and personalized - find your perfect credit card in 3 easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Share Your Profile</h3>
            <p className="text-gray-600">Tell us about your income, spending categories, and card preferences</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
            <p className="text-gray-600">Our advanced algorithm analyzes 500+ cards to find the best matches</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Get Top Picks</h3>
            <p className="text-gray-600">Receive personalized recommendations ranked by rewards and benefits</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose CredWise?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered recommendations tailored to your unique financial profile
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get credit card suggestions based on your unique spending patterns, income, and financial preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-purple-200">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Smart Scoring Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our advanced funnel-based system analyzes eligibility, categories, and fees to find your best matches.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-green-200">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get your personalized TOP 7 credit card recommendations in seconds with detailed scoring breakdown.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-orange-200">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>100% Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your financial data is encrypted and secure. We never store sensitive information or share your data.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-red-200">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Expert Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Backed by financial experts with continuously updated card database, offers, and benefits.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-indigo-200">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Always Free</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our recommendation service is completely free. No hidden charges, subscriptions, or commitments.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Makes Us Different?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Multi-Tier Filtering</h3>
                <p className="text-gray-600">3-level funnel ensures only eligible and relevant cards reach you</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Brand Preference Support</h3>
                <p className="text-gray-600">Select up to 3 preferred banks and get prioritized recommendations</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Category-Based Matching</h3>
                <p className="text-gray-600">Matches cards to your top spending categories for maximum rewards</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Fee Transparency</h3>
                <p className="text-gray-600">Clear joining and annual fee filters to match your budget</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Detailed Scoring</h3>
                <p className="text-gray-600">See exactly why each card was recommended with score breakdowns</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Always Updated</h3>
                <p className="text-gray-600">Live Google Sheets integration ensures latest card data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-2xl">
          <CardContent className="p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Credit Card?</h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who have already optimized their credit card rewards and benefits
            </p>

            <Link href="/cards">
              <Button
                size="lg"
                variant="secondary"
                className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <CreditCard className="mr-3 h-6 w-6" />
                Start Your Free Recommendation
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>

            <p className="mt-6 text-sm opacity-75">No signup required • 100% Free • Instant results</p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CreditCard className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">CredWise</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              India's most intelligent credit card recommendation platform. Making financial decisions smarter, one card
              at a time.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2025 CredWise. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
