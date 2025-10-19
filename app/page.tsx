import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { CreditCard, Target, Zap, Shield, TrendingUp, Award, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation currentPage="HOME" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="text-blue-600"> Credit Card</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Smart recommendations powered by AI. Get personalized credit card suggestions based on your spending habits,
            income, and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/cards">Get Card Recommendations</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              <Link href="#how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized credit card recommendations in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Share Your Profile</h3>
              <p className="text-gray-600 text-lg">
                Tell us about your income, spending categories, credit score, and preferences
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">AI Analysis</h3>
              <p className="text-gray-600 text-lg">
                Our advanced algorithm analyzes 100+ cards to find the best matches for you
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Get Top Picks</h3>
              <p className="text-gray-600 text-lg">
                Receive your top 7 personalized card recommendations with detailed comparisons
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose CredWise?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The smartest way to find credit cards that match your lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader>
                <Target className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">Personalized Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get recommendations tailored to your exact spending patterns and financial profile
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader>
                <Zap className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">Instant Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Receive your top card recommendations in seconds, not hours of manual research
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">100% Unbiased</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  No hidden commissions or sponsored rankings - only genuine recommendations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">Maximize Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Find cards that offer the highest rewards for YOUR spending categories
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader>
                <Award className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">Premium Options</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Discover premium cards with exclusive benefits you might have missed
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CreditCard className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">Always Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our database is constantly updated with the latest card offers and benefits
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
              <p className="text-xl text-gray-600">
                CredWise uses advanced algorithms to provide truly personalized recommendations
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Multi-Factor Analysis</h3>
                  <p className="text-gray-600 text-lg">
                    We consider income, credit score, spending categories, bank preferences, and fee tolerances
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Two-Tier Recommendation System</h3>
                  <p className="text-gray-600 text-lg">
                    Prioritizes your preferred banks while ensuring you see the absolute best options
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Scoring Algorithm</h3>
                  <p className="text-gray-600 text-lg">
                    Our proprietary scoring considers 4 different scenarios based on your preferences
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Category-Based Matching</h3>
                  <p className="text-gray-600 text-lg">
                    Matches your spending categories with cards that offer maximum rewards in those areas
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Transparent Rankings</h3>
                  <p className="text-gray-600 text-lg">
                    Every recommendation includes a detailed score breakdown so you understand exactly why it was chosen
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Top 7 Curated List</h3>
                  <p className="text-gray-600 text-lg">
                    No overwhelming choices - just the 7 best cards perfectly suited to your profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Find Your Perfect Card?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have found their ideal credit cards with CredWise
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link href="/cards">Start Your Search Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">CredWise</h3>
              <p className="text-gray-400">
                Your trusted partner in finding the perfect credit card for your lifestyle.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/cards" className="hover:text-white transition-colors">
                    Card Recommendations
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Disclaimer</h4>
              <p className="text-sm text-gray-400">
                CredWise provides informational recommendations only. Please verify all details with card issuers before
                applying.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} CredWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
