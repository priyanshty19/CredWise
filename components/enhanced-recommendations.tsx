"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CreditCard,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Gift,
  Plane,
  Car,
  ShoppingBag,
  Utensils,
  Fuel,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { getCardRecommendationsForForm } from "@/app/actions/card-recommendation"

interface CardRecommendation {
  name: string
  bank: string
  type: string
  annualFee: number
  joiningFee: number
  rewardRate: string
  welcomeBonus: string
  keyFeatures: string[]
  bestFor: string[]
  score: number
  reasoning: string
  applyUrl?: string
}

interface RecommendationResult {
  success: boolean
  recommendations: CardRecommendation[]
  totalCards: number
  userProfile: any
  error?: string
}

interface EnhancedRecommendationsProps {
  formData: {
    monthlyIncome: string
    spendingCategories: string[]
    monthlySpending: string
    currentCards: string
    creditScore: string
    preferredBanks: string[]
    joiningFeePreference: string
  }
}

const categoryIcons: Record<string, any> = {
  dining: Utensils,
  fuel: Fuel,
  groceries: ShoppingBag,
  travel: Plane,
  shopping: ShoppingBag,
  entertainment: Smartphone,
  utilities: Zap,
  transport: Car,
  default: CreditCard,
}

const getCategoryIcon = (category: string) => {
  const IconComponent = categoryIcons[category.toLowerCase()] || categoryIcons.default
  return <IconComponent className="h-4 w-4" />
}

export default function EnhancedRecommendations({ formData }: EnhancedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<CardRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [totalCards, setTotalCards] = useState(0)
  const [isPending, startTransition] = useTransition()

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    startTransition(async () => {
      try {
        const result: RecommendationResult = await getCardRecommendationsForForm(formData)

        if (result.success) {
          setRecommendations(result.recommendations)
          setUserProfile(result.userProfile)
          setTotalCards(result.totalCards)
        } else {
          setError(result.error || "Failed to get recommendations")
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.")
        console.error("Recommendation error:", err)
      } finally {
        setIsLoading(false)
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Poor Match"
  }

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      {userProfile && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Your Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monthly Income:</span>
                <div className="font-semibold">{formatCurrency(userProfile.monthlyIncome)}</div>
              </div>
              <div>
                <span className="text-gray-600">Monthly Spending:</span>
                <div className="font-semibold">{formatCurrency(userProfile.monthlySpending)}</div>
              </div>
              <div>
                <span className="text-gray-600">Credit Score:</span>
                <div className="font-semibold">{userProfile.creditScore}</div>
              </div>
              <div>
                <span className="text-gray-600">Primary Categories:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userProfile.spendingCategories.slice(0, 2).map((category: string) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Get Recommendations Button */}
      {recommendations.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for Your Recommendations?</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Click below to get personalized credit card recommendations based on your profile and spending patterns.
            </p>
            <Button
              onClick={fetchRecommendations}
              disabled={isLoading || isPending}
              size="lg"
              className="min-w-[200px]"
            >
              {isLoading || isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Get My Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button onClick={fetchRecommendations} variant="outline" size="sm" className="ml-4 bg-transparent">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Personalized Recommendations</h2>
              <p className="text-gray-600">
                Found {recommendations.length} cards from {totalCards} total cards that match your profile
              </p>
            </div>
            <Button onClick={fetchRecommendations} variant="outline" disabled={isLoading || isPending}>
              {isLoading || isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          <div className="grid gap-6">
            {recommendations.map((card, index) => (
              <Card key={`${card.bank}-${card.name}-${index}`} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{card.name}</CardTitle>
                        {index === 0 && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Top Pick
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">{card.bank}</span>
                        <span>•</span>
                        <span className="capitalize">{card.type}</span>
                        <span>•</span>
                        <span>{card.rewardRate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(card.score)}`}
                      >
                        {card.score}/100
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{getScoreLabel(card.score)}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Fees */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Joining Fee:</span>
                      <span className="ml-2 font-semibold">
                        {card.joiningFee === 0 ? "Free" : formatCurrency(card.joiningFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Annual Fee:</span>
                      <span className="ml-2 font-semibold">
                        {card.annualFee === 0 ? "Free" : formatCurrency(card.annualFee)}
                      </span>
                    </div>
                    {card.welcomeBonus && (
                      <div>
                        <span className="text-gray-600">Welcome Bonus:</span>
                        <span className="ml-2 font-semibold text-green-600">{card.welcomeBonus}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Key Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {card.keyFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Best For</h4>
                    <div className="flex flex-wrap gap-2">
                      {card.bestFor.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {getCategoryIcon(category)}
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Why This Card Matches You
                    </h4>
                    <p className="text-blue-800 text-sm">{card.reasoning}</p>
                  </div>

                  {/* Apply Button */}
                  <div className="pt-2">
                    <Button className="w-full" size="lg">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply for {card.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="text-center pt-6">
            <Button onClick={fetchRecommendations} variant="outline" disabled={isLoading || isPending}>
              {isLoading || isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Get Fresh Recommendations
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
