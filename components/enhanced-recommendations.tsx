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
  TestTube,
  Eye,
  EyeOff,
} from "lucide-react"
import { getCardRecommendationsForForm } from "@/app/actions/card-recommendation"
import { trackCardApplicationClick, type CardApplicationClick } from "@/lib/google-sheets-submissions"

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
  spendingCategories?: string[]
  scoreBreakdown?: {
    rewards: number
    category: number
    signup: number
    joining: number
    annual: number
    bankBonus: number
  }
}

interface RecommendationResult {
  success: boolean
  recommendations: CardRecommendation[]
  totalCards: number
  userProfile: any
  error?: string
  allCards?: any[] // For testing component
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

// NEW: Card Testing Component
interface CardTesterProps {
  allCards: any[]
  userProfile: any
  recommendations: CardRecommendation[]
}

function CardTester({ allCards, userProfile, recommendations }: CardTesterProps) {
  const [showTester, setShowTester] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string>("")

  if (!showTester) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Card Eligibility Tester</span>
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Debug Mode
              </Badge>
            </div>
            <Button
              onClick={() => setShowTester(true)}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Tester
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter cards by type for testing
  const cardType = userProfile.spendingCategories?.includes("travel")
    ? "Travel"
    : userProfile.spendingCategories?.some((cat: string) => ["dining", "shopping"].includes(cat))
      ? "Rewards"
      : "Cashback"

  const eligibleCards = allCards.filter((card) => card.cardType === cardType)
  const sbiCards = eligibleCards.filter((card) => card.bank === "SBI")

  const testCard = (card: any) => {
    const results = {
      basicEligibility: {
        creditScore: card.creditScoreRequirement === 0 || userProfile.creditScore >= card.creditScoreRequirement,
        income: card.monthlyIncomeRequirement === 0 || userProfile.monthlyIncome >= card.monthlyIncomeRequirement,
        cardType: card.cardType === cardType,
      },
      bankMatch: userProfile.preferredBanks?.includes(card.bank) || false,
      categoryMatch: {
        userCategories: userProfile.spendingCategories || [],
        cardCategories: card.spendingCategories || [],
        matches: (card.spendingCategories || []).filter((cat: string) =>
          (userProfile.spendingCategories || []).map((c: string) => c.toLowerCase()).includes(cat.toLowerCase()),
        ),
      },
      fees: {
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
      },
      rewards: {
        rewardsRate: card.rewardsRate,
        signUpBonus: card.signUpBonus,
      },
    }

    // Calculate composite score
    const maxRewardsRate = Math.max(...eligibleCards.map((c) => c.rewardsRate), 1)
    const maxSignUpBonus = Math.max(...eligibleCards.map((c) => c.signUpBonus), 1)
    const maxJoiningFee = Math.max(...eligibleCards.map((c) => c.joiningFee), 1)
    const maxAnnualFee = Math.max(...eligibleCards.map((c) => c.annualFee), 1)

    const scoreRewards = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 30 : 0
    const scoreCategory =
      results.categoryMatch.matches.length > 0
        ? (results.categoryMatch.matches.length / Math.max(results.categoryMatch.userCategories.length, 1)) * 30
        : 0
    const scoreSignup = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 20 : 0
    const scoreJoining = maxJoiningFee > 0 ? ((maxJoiningFee - card.joiningFee) / maxJoiningFee) * 10 : 10
    const scoreAnnual = maxAnnualFee > 0 ? ((maxAnnualFee - card.annualFee) / maxAnnualFee) * 10 : 10
    const bankBonus = results.bankMatch ? 5 : 0

    const compositeScore = scoreRewards + scoreCategory + scoreSignup + scoreJoining + scoreAnnual + bankBonus

    return {
      ...results,
      compositeScore: Math.round(compositeScore * 100) / 100,
      scoreBreakdown: {
        rewards: scoreRewards,
        category: scoreCategory,
        signup: scoreSignup,
        joining: scoreJoining,
        annual: scoreAnnual,
        bankBonus,
      },
      passesThreshold: compositeScore >= 25.0,
      isRecommended: recommendations.some((rec) => rec.name === card.cardName),
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <TestTube className="h-5 w-5" />
            Card Eligibility Tester
          </CardTitle>
          <Button
            onClick={() => setShowTester(false)}
            variant="outline"
            size="sm"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide Tester
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-orange-600 font-medium">User Profile:</span>
            <div className="text-orange-800">
              Income: ₹{userProfile.monthlyIncome?.toLocaleString()}
              <br />
              Credit Score: {userProfile.creditScore}
              <br />
              Card Type: {cardType}
            </div>
          </div>
          <div>
            <span className="text-orange-600 font-medium">Spending Categories:</span>
            <div className="text-orange-800">{userProfile.spendingCategories?.join(", ") || "None"}</div>
          </div>
          <div>
            <span className="text-orange-600 font-medium">Preferred Banks:</span>
            <div className="text-orange-800">{userProfile.preferredBanks?.join(", ") || "None"}</div>
          </div>
        </div>

        <Separator />

        <div>
          <label className="text-orange-700 font-medium">Test Specific Card:</label>
          <select
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="w-full mt-1 p-2 border border-orange-300 rounded-md bg-white"
          >
            <option value="">Select a card to test...</option>
            <optgroup label="SBI Cards">
              {sbiCards.map((card) => (
                <option key={card.id} value={card.cardName}>
                  {card.cardName} ({card.bank})
                </option>
              ))}
            </optgroup>
            <optgroup label="All Eligible Cards">
              {eligibleCards.slice(0, 20).map((card) => (
                <option key={card.id} value={card.cardName}>
                  {card.cardName} ({card.bank})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {selectedCard && (
          <div className="mt-4">
            {(() => {
              const card = allCards.find((c) => c.cardName === selectedCard)
              if (!card) return <div>Card not found</div>

              const testResults = testCard(card)

              return (
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{card.cardName}</span>
                      <div className="flex items-center gap-2">
                        {testResults.isRecommended && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">✅ RECOMMENDED</Badge>
                        )}
                        <Badge
                          className={
                            testResults.passesThreshold
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          {testResults.passesThreshold ? "✅ PASS" : "❌ FAIL"}({testResults.compositeScore}/105)
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Basic Eligibility */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Basic Eligibility:</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div
                          className={`p-2 rounded ${testResults.basicEligibility.creditScore ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                        >
                          {testResults.basicEligibility.creditScore ? "✅" : "❌"} Credit Score
                          <br />
                          <span className="text-xs">
                            Req: {card.creditScoreRequirement || "None"} | User: {userProfile.creditScore}
                          </span>
                        </div>
                        <div
                          className={`p-2 rounded ${testResults.basicEligibility.income ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                        >
                          {testResults.basicEligibility.income ? "✅" : "❌"} Income
                          <br />
                          <span className="text-xs">
                            Req: ₹{card.monthlyIncomeRequirement?.toLocaleString() || "0"} | User: ₹
                            {userProfile.monthlyIncome?.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-2 rounded ${testResults.basicEligibility.cardType ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                        >
                          {testResults.basicEligibility.cardType ? "✅" : "❌"} Card Type
                          <br />
                          <span className="text-xs">
                            Card: {card.cardType} | Looking for: {cardType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Refined Scoring Breakdown */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Refined Scoring Breakdown:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="font-medium text-blue-800">🎁 Rewards Rate (30%)</div>
                          <div className="text-blue-700">{testResults.scoreBreakdown.rewards.toFixed(1)}/30</div>
                          <div className="text-xs text-blue-600">{card.rewardsRate}% rewards</div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <div className="font-medium text-purple-800">🛍️ Category Match (30%)</div>
                          <div className="text-purple-700">{testResults.scoreBreakdown.category.toFixed(1)}/30</div>
                          <div className="text-xs text-purple-600">
                            {testResults.categoryMatch.matches.length}/{testResults.categoryMatch.userCategories.length}{" "}
                            matches
                          </div>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-800">🎉 Sign-up Bonus (20%)</div>
                          <div className="text-green-700">{testResults.scoreBreakdown.signup.toFixed(1)}/20</div>
                          <div className="text-xs text-green-600">₹{card.signUpBonus?.toLocaleString() || "0"}</div>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded">
                          <div className="font-medium text-yellow-800">💳 Joining Fee (10%)</div>
                          <div className="text-yellow-700">{testResults.scoreBreakdown.joining.toFixed(1)}/10</div>
                          <div className="text-xs text-yellow-600">₹{card.joiningFee?.toLocaleString() || "0"}</div>
                        </div>
                        <div className="p-2 bg-orange-50 rounded">
                          <div className="font-medium text-orange-800">📅 Annual Fee (10%)</div>
                          <div className="text-orange-700">{testResults.scoreBreakdown.annual.toFixed(1)}/10</div>
                          <div className="text-xs text-orange-600">₹{card.annualFee?.toLocaleString() || "0"}</div>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded">
                          <div className="font-medium text-indigo-800">🏦 Bank Bonus (5%)</div>
                          <div className="text-indigo-700">{testResults.scoreBreakdown.bankBonus}/5</div>
                          <div className="text-xs text-indigo-600">
                            {testResults.bankMatch ? "Preferred" : "Not preferred"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Analysis */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Category Analysis:</h4>
                      <div className="text-sm">
                        <div>
                          <strong>User Categories:</strong> [{testResults.categoryMatch.userCategories.join(", ")}]
                        </div>
                        <div>
                          <strong>Card Categories:</strong> [{testResults.categoryMatch.cardCategories.join(", ")}]
                        </div>
                        <div>
                          <strong>Matches:</strong> [{testResults.categoryMatch.matches.join(", ")}]
                        </div>
                      </div>
                    </div>

                    {/* Final Verdict */}
                    <div
                      className={`p-3 rounded-lg ${testResults.passesThreshold ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                    >
                      <div
                        className={`font-semibold ${testResults.passesThreshold ? "text-green-800" : "text-red-800"}`}
                      >
                        Final Verdict: {testResults.passesThreshold ? "ELIGIBLE" : "NOT ELIGIBLE"}
                      </div>
                      <div className={`text-sm ${testResults.passesThreshold ? "text-green-700" : "text-red-700"}`}>
                        Composite Score: {testResults.compositeScore}/105
                        {testResults.passesThreshold ? " (≥25.0 threshold met)" : " (below 25.0 threshold)"}
                      </div>
                      {testResults.passesThreshold && !testResults.isRecommended && (
                        <div className="text-sm text-yellow-700 mt-1">
                          ⚠️ Card is eligible but not in top 7 recommendations
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })()}
          </div>
        )}

        {/* Quick SBI Analysis */}
        <div>
          <h4 className="font-semibold text-orange-800 mb-2">Quick SBI Cards Analysis:</h4>
          <div className="grid gap-2">
            {sbiCards.slice(0, 5).map((card) => {
              const testResults = testCard(card)
              return (
                <div
                  key={card.id}
                  className={`p-2 rounded border text-sm ${
                    testResults.passesThreshold
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{card.cardName}</span>
                    <div className="flex items-center gap-2">
                      {testResults.isRecommended && (
                        <Badge className="text-xs bg-blue-100 text-blue-800">RECOMMENDED</Badge>
                      )}
                      <span>
                        {testResults.passesThreshold ? "✅" : "❌"} {testResults.compositeScore.toFixed(1)}/105
                      </span>
                    </div>
                  </div>
                  <div className="text-xs mt-1">
                    R:{testResults.scoreBreakdown.rewards.toFixed(1)} C:{testResults.scoreBreakdown.category.toFixed(1)}
                    S:{testResults.scoreBreakdown.signup.toFixed(1)} J:{testResults.scoreBreakdown.joining.toFixed(1)}
                    A:{testResults.scoreBreakdown.annual.toFixed(1)} B:{testResults.scoreBreakdown.bankBonus}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
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
  const [allCards, setAllCards] = useState<any[]>([]) // For testing component
  const [isPending, startTransition] = useTransition()
  const [clickingCard, setClickingCard] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    // Log the specific test case
    console.log("🧪 TESTING WITH SPECIFIC USER PROFILE:")
    console.log("- Income: ₹1,00,000")
    console.log("- Monthly Spending: ₹25,000")
    console.log("- Credit Score: Excellent (750-850)")
    console.log("- Spending Categories: Travel")
    console.log("- Preferred Bank: American Express")
    console.log("- Joining Fee: Not a concern")

    startTransition(async () => {
      try {
        const result: RecommendationResult = await getCardRecommendationsForForm(formData)

        if (result.success) {
          console.log("✅ RECOMMENDATION RESULTS FOR TEST PROFILE:")
          console.log(`- Total recommendations: ${result.recommendations.length}`)
          console.log(`- Algorithm used: Adaptive Intersection-Based`)

          result.recommendations.forEach((card, index) => {
            console.log(`\n${index + 1}. ${card.name} (${card.bank})`)
            console.log(`   Score: ${card.score}/100`)
            console.log(`   Categories matched: [${card.bestFor?.join(", ")}]`)
            console.log(`   Joining Fee: ₹${card.joiningFee}`)
            console.log(`   Annual Fee: ₹${card.annualFee}`)
            console.log(`   Reward Rate: ${card.rewardRate}`)
            if (card.scoreBreakdown) {
              console.log(
                `   Score breakdown: R:${card.scoreBreakdown.rewards.toFixed(1)} C:${card.scoreBreakdown.category.toFixed(1)} B:${card.scoreBreakdown.bankBonus}`,
              )
            }
          })

          setRecommendations(result.recommendations)
          setUserProfile(result.userProfile)
          setTotalCards(result.totalCards)
          setAllCards(result.allCards || [])
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

  // Handle card application click tracking
  const handleCardApplicationClick = async (card: CardRecommendation) => {
    setClickingCard(card.name)

    try {
      // Track the click in Google Sheets
      const clickData: CardApplicationClick = {
        timestamp: new Date().toISOString(),
        cardName: card.name,
        bankName: card.bank,
        cardType: card.type,
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardRate: card.rewardRate,
        submissionType: "card_application_click",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      console.log("🎯 Tracking card application click:", clickData)

      // Track the click (don't wait for response to avoid blocking user)
      trackCardApplicationClick(clickData).then((success) => {
        if (success) {
          console.log("✅ Card application click tracked successfully")
        } else {
          console.warn("⚠️ Failed to track card application click")
        }
      })

      // Simulate redirect to bank's application page
      console.log(`🔗 Redirecting to application page for ${card.name}`)
      alert(`Redirecting to ${card.bank} application page for ${card.name}...`)
    } catch (error) {
      console.error("❌ Error tracking card application click:", error)
    } finally {
      setClickingCard(null)
    }
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
              Click below to get personalized credit card recommendations using our refined scoring algorithm that
              prioritizes rewards rate and category matching.
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

      {/* Card Tester Component */}
      {recommendations.length > 0 && allCards.length > 0 && userProfile && (
        <CardTester allCards={allCards} userProfile={userProfile} recommendations={recommendations} />
      )}

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Personalized Recommendations</h2>
              <p className="text-gray-600">
                Found {recommendations.length} cards from {totalCards} total cards using refined scoring algorithm
              </p>
              <p className="text-sm text-blue-600 mt-1">
                🎯 New Algorithm: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus (20%) + Fees (20%)
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
                        {card.score}/105
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

                  {/* Score Breakdown */}
                  {card.scoreBreakdown && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Refined Score Breakdown:</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-blue-600 font-medium">Rewards</div>
                          <div className="text-blue-800">{card.scoreBreakdown.rewards.toFixed(1)}/30</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-600 font-medium">Category</div>
                          <div className="text-purple-800">{card.scoreBreakdown.category.toFixed(1)}/30</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-medium">Bonus</div>
                          <div className="text-green-800">{card.scoreBreakdown.signup.toFixed(1)}/20</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-600 font-medium">Join Fee</div>
                          <div className="text-yellow-800">{card.scoreBreakdown.joining.toFixed(1)}/10</div>
                        </div>
                        <div className="text-center">
                          <div className="text-orange-600 font-medium">Annual</div>
                          <div className="text-orange-800">{card.scoreBreakdown.annual.toFixed(1)}/10</div>
                        </div>
                        <div className="text-center">
                          <div className="text-indigo-600 font-medium">Bank</div>
                          <div className="text-indigo-800">+{card.scoreBreakdown.bankBonus}/5</div>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {/* Apply Button with Click Tracking */}
                  <div className="pt-2">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleCardApplicationClick(card)}
                      disabled={clickingCard === card.name}
                    >
                      {clickingCard === card.name ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Tracking Click...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply for {card.name}
                        </>
                      )}
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
