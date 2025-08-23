"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, TrendingUp, Award, AlertCircle, CheckCircle2, Filter, BarChart3, Target, Zap } from "lucide-react"
import { getFunnelCardRecommendations } from "@/app/actions/funnel-card-recommendation"

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

interface Recommendation {
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
  spendingCategories: string[]
  scoreBreakdown: {
    categoryMatch: number
    rewardsRate: number
    brandMatch?: number
    signUpBonus?: number
  }
  matchPercentage: number
}

interface FunnelStats {
  totalCards: number
  level1Count: number
  level2Count: number
  level3Count: number
  finalCount: number
}

export default function EnhancedRecommendations({ formData }: EnhancedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [brandMismatchNotice, setBrandMismatchNotice] = useState(false)
  const [activeTab, setActiveTab] = useState("recommendations")

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("🔄 Fetching funnel-based recommendations...")
        const result = await getFunnelCardRecommendations(formData)

        if (result.success) {
          setRecommendations(result.recommendations || [])
          setFunnelStats(result.funnelStats)
          setAvailableBrands(result.availableBrands || [])
          setBrandMismatchNotice(result.brandMismatchNotice || false)
          console.log("✅ Funnel-based recommendations loaded successfully")
        } else {
          setError(result.error || "Failed to load recommendations")
          console.error("❌ Failed to load funnel-based recommendations:", result.error)
        }
      } catch (err) {
        console.error("❌ Error fetching funnel-based recommendations:", err)
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [formData])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Processing Your Profile Through Our Funnel...</p>
              <p className="text-sm text-gray-600">
                Level 1: Basic Eligibility → Level 2: Category Matching → Level 3: Fee & Brand Filtering
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    )
  }

  const getFunnelStageColor = (stage: number, count: number) => {
    if (count === 0) return "bg-gray-200"
    switch (stage) {
      case 1:
        return "bg-blue-500"
      case 2:
        return "bg-green-500"
      case 3:
        return "bg-orange-500"
      case 4:
        return "bg-purple-500"
      default:
        return "bg-gray-400"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-blue-600 bg-blue-50"
    if (score >= 40) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Funnel-Based Card Recommendations
          </CardTitle>
          <p className="text-sm text-gray-600">Your personalized recommendations using our 3-level filtering system</p>
        </CardHeader>
      </Card>

      {/* Brand Mismatch Notice */}
      {brandMismatchNotice && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Notice:</strong> Your chosen brand did not match our filtering criteria. Here are the best
            alternatives based on your preferences.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Recommendations ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Funnel Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No cards match your criteria after funnel filtering. Try adjusting your preferences.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((card, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{card.name}</CardTitle>
                        <p className="text-sm text-gray-600">{card.bank}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getScoreColor(card.score)} border-0`}>{card.score}/100</Badge>
                        <p className="text-xs text-gray-500 mt-1">{card.matchPercentage.toFixed(1)}% category match</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Joining Fee</p>
                        <p className="font-medium">
                          {card.joiningFee === 0 ? "Free" : `₹${card.joiningFee.toLocaleString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Annual Fee</p>
                        <p className="font-medium">
                          {card.annualFee === 0 ? "Free" : `₹${card.annualFee.toLocaleString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reward Rate</p>
                        <p className="font-medium">{card.rewardRate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Welcome Bonus</p>
                        <p className="font-medium">{card.welcomeBonus || "None"}</p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Score Breakdown:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="font-medium">{card.scoreBreakdown.categoryMatch.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rewards:</span>
                          <span className="font-medium">{card.scoreBreakdown.rewardsRate.toFixed(1)}</span>
                        </div>
                        {card.scoreBreakdown.brandMatch !== undefined && (
                          <div className="flex justify-between">
                            <span>Brand:</span>
                            <span className="font-medium">{card.scoreBreakdown.brandMatch.toFixed(1)}</span>
                          </div>
                        )}
                        {card.scoreBreakdown.signUpBonus !== undefined && (
                          <div className="flex justify-between">
                            <span>Bonus:</span>
                            <span className="font-medium">{card.scoreBreakdown.signUpBonus.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Best For Categories */}
                    {card.bestFor.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Best for:</p>
                        <div className="flex flex-wrap gap-1">
                          {card.bestFor.map((category, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Features */}
                    <div>
                      <p className="text-sm font-medium mb-2">Key Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {card.keyFeatures.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{card.reasoning}</p>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full" variant={index === 0 ? "default" : "outline"}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {index === 0 ? "Apply Now (Top Pick)" : "Learn More"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Funnel Analysis Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Funnel Analysis
              </CardTitle>
              <p className="text-sm text-gray-600">
                How your profile was processed through our 3-level filtering system
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {funnelStats && (
                <>
                  {/* Funnel Visualization */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Total Cards in Database</p>
                        <p className="text-sm text-gray-600">All available credit cards</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{funnelStats.totalCards}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-2 h-8 bg-gray-300 rounded"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Level 1: Basic Eligibility</p>
                        <p className="text-sm text-gray-600">
                          Income ≥ ₹{formData.monthlyIncome}, Credit Score ≥ {formData.creditScore}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{funnelStats.level1Count}</p>
                        <p className="text-xs text-gray-500">
                          {((funnelStats.level1Count / funnelStats.totalCards) * 100).toFixed(1)}% passed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-2 h-8 bg-gray-300 rounded"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">Level 2: Category Matching</p>
                        <p className="text-sm text-gray-600">
                          Categories: [{formData.spendingCategories.join(", ")}] (&gt;65% match required)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{funnelStats.level2Count}</p>
                        <p className="text-xs text-gray-500">
                          {funnelStats.level1Count > 0
                            ? ((funnelStats.level2Count / funnelStats.level1Count) * 100).toFixed(1)
                            : 0}
                          % passed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-2 h-8 bg-gray-300 rounded"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">Level 3: Fee & Brand Filtering</p>
                        <p className="text-sm text-gray-600">
                          Fee: {formData.joiningFeePreference}, Brands: [{formData.preferredBanks.join(", ") || "Any"}]
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{funnelStats.level3Count}</p>
                        <p className="text-xs text-gray-500">
                          {funnelStats.level2Count > 0
                            ? ((funnelStats.level3Count / funnelStats.level2Count) * 100).toFixed(1)
                            : 0}
                          % passed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-2 h-8 bg-gray-300 rounded"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      <div>
                        <p className="font-medium">Final Recommendations</p>
                        <p className="text-sm text-gray-600">Scored and ranked by adaptive algorithm</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{funnelStats.finalCount}</p>
                        <p className="text-xs text-gray-500">
                          {funnelStats.totalCards > 0
                            ? ((funnelStats.finalCount / funnelStats.totalCards) * 100).toFixed(1)
                            : 0}
                          % of total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Available Brands */}
                  {availableBrands.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Available Brands After Filtering:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableBrands.map((brand, idx) => (
                          <Badge key={idx} variant={formData.preferredBanks.includes(brand) ? "default" : "secondary"}>
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Personalization Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Your Profile Strengths:</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Income: ₹{formData.monthlyIncome} qualifies for premium cards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Credit Score: {formData.creditScore} opens most options
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Clear spending preferences help targeted matching
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Optimization Tips:</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Consider cards with higher category match percentages
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Balance joining fees with long-term rewards value
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Preferred brands get priority in our scoring
                    </li>
                  </ul>
                </div>
              </div>

              {/* Scoring Logic Explanation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How We Score Your Recommendations:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    • <strong>Category Match (30-40%):</strong> How well card categories align with your spending
                  </p>
                  <p>
                    • <strong>Rewards Rate (20-60%):</strong> Higher cashback/points percentage gets higher score
                  </p>
                  <p>
                    • <strong>Brand Match (0-50%):</strong> Bonus points for your preferred brands
                  </p>
                  <p>
                    • <strong>Sign-up Bonus (0-10%):</strong> Welcome offers add value to your score
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
