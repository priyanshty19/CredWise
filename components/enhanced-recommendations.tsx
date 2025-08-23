"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Filter,
  BarChart3,
  Target,
  Zap,
  Trophy,
  Star,
  Info,
} from "lucide-react"
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
  rank: number
  tier: "preferred_brand" | "general"
}

interface FunnelStats {
  totalCards: number
  level1Count: number
  level2Count: number
  level3Count: number
  finalCount: number
}

interface TwoTierInfo {
  showGeneralMessage: boolean
  preferredBrandCount: number
  generalCount: number
  totalRecommendations: number
  preferredBrands: string[]
}

export default function EnhancedRecommendations({ formData }: EnhancedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [twoTierInfo, setTwoTierInfo] = useState<TwoTierInfo | null>(null)
  const [activeTab, setActiveTab] = useState("recommendations")

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getFunnelCardRecommendations(formData)

        if (result.success) {
          setRecommendations(result.recommendations || [])
          setFunnelStats(result.funnelStats)
          setAvailableBrands(result.availableBrands || [])
          setTwoTierInfo(result.twoTierInfo)
        } else {
          setError(result.error || "Failed to load recommendations")
        }
      } catch (err) {
        console.error("❌ Error fetching recommendations:", err)
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
              <p className="text-lg font-medium">Processing Your Profile Through Our Two-Tier System...</p>
              <p className="text-sm text-gray-600">
                Level 1: Eligibility → Level 2: Categories → Level 3: Fees → Two-Tier: Preferred + General
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-blue-600 bg-blue-50"
    if (score >= 40) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getRankBadge = (rank: number, tier: string) => {
    if (rank === 1 && tier === "preferred_brand")
      return (
        <Badge className="bg-yellow-500 text-white">
          <Trophy className="h-3 w-3 mr-1" />
          PREFERRED #1
        </Badge>
      )
    if (rank === 1)
      return (
        <Badge className="bg-blue-600 text-white">
          <Trophy className="h-3 w-3 mr-1" />
          TOP PICK
        </Badge>
      )
    if (tier === "preferred_brand")
      return (
        <Badge className="bg-green-600 text-white">
          <Star className="h-3 w-3 mr-1" />
          PREFERRED #{rank}
        </Badge>
      )
    if (rank <= 3) return <Badge variant="secondary">TOP {rank}</Badge>
    return <Badge variant="outline">#{rank}</Badge>
  }

  const getTierBadge = (tier: string) => {
    if (tier === "preferred_brand") {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Preferred Brand</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800 border-blue-300">General</Badge>
  }

  // Separate recommendations by tier for display
  const preferredBrandCards = recommendations.filter((card) => card.tier === "preferred_brand")
  const generalCards = recommendations.filter((card) => card.tier === "general")

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Your TOP 7 Card Recommendations (Maximum)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Smart recommendations using our two-tier system: preferred brands first, then best alternatives (limited to
            7 cards maximum)
          </p>
        </CardHeader>
      </Card>

      {/* Two-Tier Information */}
      {twoTierInfo && (
        <div className="grid md:grid-cols-2 gap-4">
          {twoTierInfo.preferredBrandCount > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <Star className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>{twoTierInfo.preferredBrandCount} preferred brand cards</strong> found matching your selection:{" "}
                {twoTierInfo.preferredBrands.join(", ")}
              </AlertDescription>
            </Alert>
          )}

          {twoTierInfo.showGeneralMessage && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>{twoTierInfo.generalCount} additional cards</strong> added to complete your TOP 7
                recommendations
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* General Message for Insufficient Preferred Brand Cards */}
      {twoTierInfo?.showGeneralMessage && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Your selected brand does not have sufficient cards matching your preferences.</strong> Here are
            other cards tailored to your preferences to complete your TOP 7 recommendations.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            TOP 7 Cards ({Math.min(recommendations.length, 7)})
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Two-Tier Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No cards match your criteria after funnel filtering. Try adjusting your preferences.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Preferred Brand Cards Section */}
              {preferredBrandCards.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Your Preferred Brand Cards ({preferredBrandCards.length})
                    </h3>
                  </div>
                  <div className="grid gap-4">
                    {preferredBrandCards.slice(0, 7).map((card, index) => (
                      <Card
                        key={`preferred-${index}`}
                        className="hover:shadow-lg transition-shadow ring-2 ring-green-200"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-lg">{card.name}</CardTitle>
                                {getRankBadge(card.rank, card.tier)}
                                {getTierBadge(card.tier)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {card.bank} • {card.type}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${getScoreColor(card.score)} border-0`}>{card.score}/100</Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {card.matchPercentage.toFixed(1)}% category match
                              </p>
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
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">{card.reasoning}</p>
                          </div>

                          {/* Action Button */}
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Apply Now (Preferred Brand)
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* General Cards Section */}
              {generalCards.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-800">
                      {twoTierInfo?.showGeneralMessage ? "Additional Recommendations" : "Top Recommendations"} (
                      {generalCards.length})
                    </h3>
                  </div>
                  <div className="grid gap-4">
                    {generalCards.slice(0, 7 - preferredBrandCards.length).map((card, index) => (
                      <Card key={`general-${index}`} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-lg">{card.name}</CardTitle>
                                {getRankBadge(card.rank, card.tier)}
                                {getTierBadge(card.tier)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {card.bank} • {card.type}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${getScoreColor(card.score)} border-0`}>{card.score}/100</Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {card.matchPercentage.toFixed(1)}% category match
                              </p>
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
                          <Button className="w-full" variant={card.rank === 1 ? "default" : "outline"}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            {card.rank === 1 ? "Apply Now (Top Alternative)" : `Apply for Rank #${card.rank}`}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Two-Tier Analysis Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Two-Tier Funnel Analysis
              </CardTitle>
              <p className="text-sm text-gray-600">
                How your profile was processed through our 3-level filtering + two-tier recommendation system
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {funnelStats && twoTierInfo && (
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
                        <p className="font-medium">Level 3: Joining Fee Filtering</p>
                        <p className="text-sm text-gray-600">Fee Preference: {formData.joiningFeePreference}</p>
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

                    {/* Two-Tier System */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <div>
                          <p className="font-medium">Tier 1: Preferred Brand</p>
                          <p className="text-sm text-gray-600">
                            Brands: [{formData.preferredBanks.join(", ") || "None selected"}]
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{twoTierInfo.preferredBrandCount}</p>
                          <p className="text-xs text-gray-500">cards found</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div>
                          <p className="font-medium">Tier 2: General</p>
                          <p className="text-sm text-gray-600">Best alternatives to fill TOP 7</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{twoTierInfo.generalCount}</p>
                          <p className="text-xs text-gray-500">cards added</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-2 h-8 bg-gray-300 rounded"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      <div>
                        <p className="font-medium">Final TOP 7 Recommendations (Maximum)</p>
                        <p className="text-sm text-gray-600">
                          Two-tier system ensures optimal user experience with 7-card limit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          {Math.min(twoTierInfo.totalRecommendations, 7)}
                        </p>
                        <p className="text-xs text-gray-500">cards (max 7 enforced)</p>
                      </div>
                    </div>
                  </div>

                  {/* Available Brands */}
                  {availableBrands.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Available Brands After Level 3 Filtering:</p>
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
                Two-Tier System Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Two-Tier System Benefits:</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Preferred brand cards always shown first when available
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Transparent messaging when filling gaps with alternatives
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Always get exactly 7 recommendations (or maximum available)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      No duplicate cards across tiers
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">How It Works:</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Tier 1: Filter and score your preferred brand cards
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Tier 2: Fill remaining slots with best general cards
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Smart messaging explains the recommendation mix
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Maintains all scoring weights and thresholds
                    </li>
                  </ul>
                </div>
              </div>

              {/* Two-Tier Logic Explanation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Two-Tier Scoring Logic:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    • <strong>Tier 1 (Preferred Brand):</strong> Cards matching your selected brands get priority
                    scoring with brand match bonus
                  </p>
                  <p>
                    • <strong>Tier 2 (General):</strong> Best remaining cards scored without brand filtering to fill TOP
                    7 slots
                  </p>
                  <p>
                    • <strong>Category Match (30%):</strong> Same threshold (&gt;65%) applied to both tiers
                  </p>
                  <p>
                    • <strong>Rewards Rate (20-60%):</strong> Normalized scoring across all cards in each tier
                  </p>
                  <p className="mt-2 text-blue-600 font-medium">
                    🎯 Result: You always see your preferred brands first, with quality alternatives to complete your
                    selection
                  </p>
                </div>
              </div>

              {/* Current Recommendation Breakdown */}
              {twoTierInfo && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-800">Your Current Recommendation Breakdown:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {twoTierInfo.preferredBrandCount > 0 ? (
                      <p>
                        ✅ <strong>{twoTierInfo.preferredBrandCount} preferred brand cards</strong> from{" "}
                        {twoTierInfo.preferredBrands.join(", ")}
                      </p>
                    ) : (
                      <p>⚠️ No preferred brand cards found (none selected or none available)</p>
                    )}
                    {twoTierInfo.generalCount > 0 && (
                      <p>
                        ➕ <strong>{twoTierInfo.generalCount} general cards</strong> added to complete your selection
                      </p>
                    )}
                    <p className="mt-2 font-medium">
                      🎯 Total: {Math.min(twoTierInfo.totalRecommendations, 7)} personalized recommendations (maximum 7
                      enforced)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
