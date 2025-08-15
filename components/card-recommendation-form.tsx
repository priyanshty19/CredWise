"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  CreditCard,
  TrendingUp,
  Shield,
  Star,
  Info,
  Database,
  Settings,
  Sparkles,
  CheckCircle,
} from "lucide-react"
// Import the new component and enhanced action
import EnhancedPersonalization from "@/components/enhanced-personalization"
import { getCardRecommendations, getEnhancedCardRecommendations } from "@/app/actions/card-recommendation"
import { fetchCreditCards } from "@/lib/google-sheets"

interface FormData {
  creditScore: string
  monthlyIncome: string
  cardType: string
  topN: string // Number of recommendations to show
}

interface FormErrors {
  creditScore?: string
  monthlyIncome?: string
  cardType?: string
  topN?: string
}

interface Recommendation {
  cardName: string
  bank: string
  features: string[]
  reason: string
  rating: number
  joiningFee: number
  annualFee: number
  rewardsRate: number
  signUpBonus: number
  compositeScore: number
  monthlyIncomeRequirement: number
}

interface RecommendationResponse {
  success: boolean
  recommendations?: Recommendation[]
  filterCriteria?: string
  scoringLogic?: string
  error?: string
  totalCardsConsidered?: number
  eligibleCardsFound?: number
  scoreEligibleCardsFound?: number // NEW: Cards that meet ≥25.0 score threshold
}

interface EligibleCardCount {
  total: number
  byType: { [key: string]: number }
}

export default function CardRecommendationForm() {
  const [formData, setFormData] = useState<FormData>({
    creditScore: "",
    monthlyIncome: "",
    cardType: "",
    topN: "7", // Default to 7 recommendations
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<RecommendationResponse | null>(null)
  // Add new state for enhanced recommendations
  const [enhancedResult, setEnhancedResult] = useState<RecommendationResponse | null>(null)
  const [isGettingEnhanced, setIsGettingEnhanced] = useState(false)

  // New state for dynamic card counts based on eligibility
  const [eligibleCardCounts, setEligibleCardCounts] = useState<EligibleCardCount>({
    total: 0,
    byType: {},
  })
  const [loadingEligibleCounts, setLoadingEligibleCounts] = useState(false)
  const [recommendationOptions, setRecommendationOptions] = useState<Array<{ value: string; label: string }>>([])

  // Add state to track score-eligible cards vs shown cards
  const [scoreEligibleCards, setScoreEligibleCards] = useState(0)
  const [hasMoreCardsAvailable, setHasMoreCardsAvailable] = useState(false)

  const cardTypes = [
    { value: "Cashback", label: "Cashback" },
    { value: "Travel", label: "Travel" },
    { value: "Rewards", label: "Rewards" },
    { value: "Student", label: "Student" },
    { value: "Business", label: "Business" },
  ]

  // Calculate eligible cards whenever credit score, income, or card type changes
  useEffect(() => {
    const calculateEligibleCards = async () => {
      // Only calculate if we have the required fields
      if (!formData.creditScore || !formData.monthlyIncome || !formData.cardType) {
        setEligibleCardCounts({ total: 0, byType: {} })
        setRecommendationOptions([])
        return
      }

      try {
        setLoadingEligibleCounts(true)
        console.log("📊 Calculating eligible cards for dynamic recommendations...")

        const creditScore = Number.parseInt(formData.creditScore)
        const monthlyIncome = Number.parseInt(formData.monthlyIncome)
        const cardType = formData.cardType

        // Skip if invalid values
        if (isNaN(creditScore) || isNaN(monthlyIncome) || creditScore < 300 || creditScore > 850) {
          setEligibleCardCounts({ total: 0, byType: {} })
          setRecommendationOptions([])
          return
        }

        const cards = await fetchCreditCards()

        // Filter cards based on basic eligibility criteria
        const basicEligibleCards = cards.filter((card) => {
          const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
          const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
          const matchesType = card.cardType === cardType
          return meetsCredit && meetsIncome && matchesType
        })

        // Calculate composite scores and filter by ≥25.0 threshold
        const scoredCards = basicEligibleCards.map((card) => {
          let score = 0

          const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
          const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
          const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
          const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

          const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
          const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
          const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 25 : 0
          const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0

          score = joiningFeeScore + annualFeeScore + rewardsScore + bonusScore
          const compositeScore = Math.round(score * 100) / 100

          return {
            ...card,
            compositeScore,
          }
        })

        // Filter by score threshold ≥25.0
        const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

        console.log(`🎯 Found ${basicEligibleCards.length} basic eligible cards for ${cardType} type`)
        console.log(`🎯 Found ${scoreEligibleCards.length} score-eligible cards (≥25.0) for ${cardType} type`)
        console.log(`📊 Credit Score: ${creditScore}, Monthly Income: ₹${monthlyIncome.toLocaleString()}`)

        // Count by type
        const byType: { [key: string]: number } = {}
        scoreEligibleCards.forEach((card) => {
          byType[card.cardType] = (byType[card.cardType] || 0) + 1
        })

        const eligibleCount = scoreEligibleCards.length
        setEligibleCardCounts({
          total: eligibleCount,
          byType,
        })

        // Generate recommendation options based on business logic
        const options = []
        // Always show Top 7 recommendations by default
        options.push({ value: "7", label: "Top 7 Recommendations" })
        console.log(`📊 ${eligibleCount} score-eligible cards available, showing Top 7 recommendations`)

        setRecommendationOptions(options)

        // Auto-select Top 7
        const newTopN = "7"
        if (formData.topN !== newTopN) {
          setFormData((prev) => ({ ...prev, topN: newTopN }))
        }
      } catch (error) {
        console.error("❌ Error calculating eligible cards:", error)
        setEligibleCardCounts({ total: 0, byType: {} })
        setRecommendationOptions([])
      } finally {
        setLoadingEligibleCounts(false)
      }
    }

    calculateEligibleCards()
  }, [formData.creditScore, formData.monthlyIncome, formData.cardType])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Credit Score validation
    const creditScore = Number.parseInt(formData.creditScore)
    if (!formData.creditScore) {
      newErrors.creditScore = "Credit score is required"
    } else if (isNaN(creditScore) || creditScore < 300 || creditScore > 850) {
      newErrors.creditScore = "Credit score must be between 300 and 850"
    }

    // Monthly Income validation
    const monthlyIncome = Number.parseInt(formData.monthlyIncome)
    if (!formData.monthlyIncome) {
      newErrors.monthlyIncome = "Monthly income is required"
    } else if (isNaN(monthlyIncome) || monthlyIncome < 0) {
      newErrors.monthlyIncome = "Please enter a valid monthly income"
    }

    // Card Type validation
    if (!formData.cardType) {
      newErrors.cardType = "Please select a card type"
    }

    // Top N validation - now automatic, but still validate
    const topN = Number.parseInt(formData.topN)
    if (!formData.topN) {
      newErrors.topN = "Number of recommendations is required"
    } else if (isNaN(topN) || topN < 1) {
      newErrors.topN = "Invalid number of recommendations"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = (): boolean => {
    const creditScore = Number.parseInt(formData.creditScore)
    const monthlyIncome = Number.parseInt(formData.monthlyIncome)
    const topN = Number.parseInt(formData.topN)

    return (
      formData.creditScore !== "" &&
      !isNaN(creditScore) &&
      creditScore >= 300 &&
      creditScore <= 850 &&
      formData.monthlyIncome !== "" &&
      !isNaN(monthlyIncome) &&
      monthlyIncome >= 0 &&
      formData.cardType !== "" &&
      formData.topN !== "" &&
      !isNaN(topN) &&
      topN >= 1
    )
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await getCardRecommendations({
        creditScore: Number.parseInt(formData.creditScore),
        monthlyIncome: Number.parseInt(formData.monthlyIncome),
        cardType: formData.cardType,
        timestamp: new Date().toISOString(),
        topN: Number.parseInt(formData.topN),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      })

      setResult(response)

      // Track score-eligible cards vs shown cards
      if (response.success && response.scoreEligibleCardsFound !== undefined) {
        setScoreEligibleCards(response.scoreEligibleCardsFound)
        const shownCards = response.recommendations?.length || 0
        const hasMore = response.scoreEligibleCardsFound > shownCards
        setHasMoreCardsAvailable(hasMore)

        console.log(`📊 Score-eligible cards (≥25.0): ${response.scoreEligibleCardsFound}`)
        console.log(`📊 Cards shown: ${shownCards}`)
        console.log(`📊 Has more cards available: ${hasMore}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setResult({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Updated handler for enhanced recommendations - fixed at Top 3
  const handleEnhancedRecommendations = async (preferences: {
    preferredBrand: string
    maxJoiningFee: string
  }) => {
    // Check if there are more cards available beyond what was shown
    if (!hasMoreCardsAvailable) {
      console.log("🚫 No additional cards available beyond the initial results")
      setEnhancedResult({
        success: true,
        recommendations: [],
        error: "",
        totalCardsConsidered: scoreEligibleCards,
        eligibleCardsFound: 0,
      })

      // Scroll to enhanced results to show the message
      setTimeout(() => {
        const enhancedSection = document.getElementById("enhanced-results")
        if (enhancedSection) {
          enhancedSection.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
      return
    }

    setIsGettingEnhanced(true)
    setEnhancedResult(null)

    try {
      const response = await getEnhancedCardRecommendations({
        creditScore: Number.parseInt(formData.creditScore),
        monthlyIncome: Number.parseInt(formData.monthlyIncome),
        cardType: formData.cardType,
        timestamp: new Date().toISOString(),
        topN: 3, // Fixed at 3 for enhanced recommendations
        preferredBrand: preferences.preferredBrand || undefined,
        maxJoiningFee:
          preferences.maxJoiningFee && preferences.maxJoiningFee !== "any"
            ? Number.parseInt(preferences.maxJoiningFee)
            : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      })

      setEnhancedResult(response)

      // Scroll to enhanced results
      setTimeout(() => {
        const enhancedSection = document.getElementById("enhanced-results")
        if (enhancedSection) {
          enhancedSection.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    } catch (error) {
      console.error("Error getting enhanced recommendations:", error)
      setEnhancedResult({
        success: false,
        error: "An unexpected error occurred while getting enhanced recommendations.",
      })
    } finally {
      setIsGettingEnhanced(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Data Source Info - Updated to mention Google Sheets only */}
      <Alert className="bg-green-50 border-green-200">
        <Database className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Live Data & Submissions:</strong> Recommendations are generated from your Google Sheets database with
          dynamic rule-based filtering and scoring. All form submissions are stored directly in Google Sheets. Income
          requirements are compared on a <strong>monthly basis</strong>. Only cards with composite score ≥25.0 are
          considered eligible. Check browser console for detailed filtering analysis.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Credit Score */}
          <div className="space-y-2">
            <Label htmlFor="creditScore" className="text-sm font-medium text-gray-700">
              Credit Score <span className="text-red-500">*</span>
            </Label>
            <Input
              id="creditScore"
              type="number"
              placeholder="e.g., 784"
              value={formData.creditScore}
              onChange={(e) => handleInputChange("creditScore", e.target.value)}
              className={errors.creditScore ? "border-red-500 focus:border-red-500" : ""}
              min="300"
              max="850"
            />
            {errors.creditScore && <p className="text-sm text-red-600">{errors.creditScore}</p>}
            <p className="text-xs text-gray-500">Range: 300-850</p>
          </div>

          {/* Monthly Income */}
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome" className="text-sm font-medium text-gray-700">
              Monthly Income (INR) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="e.g., 100000"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
              className={errors.monthlyIncome ? "border-red-500 focus:border-red-500" : ""}
              min="0"
            />
            {errors.monthlyIncome && <p className="text-sm text-red-600">{errors.monthlyIncome}</p>}
            <p className="text-xs text-gray-500">Your monthly salary/income</p>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          {/* Card Type - Now takes full width since we removed the dropdown */}
          <div className="space-y-2">
            <Label htmlFor="cardType" className="text-sm font-medium text-gray-700">
              Preferred Card Type <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.cardType} onValueChange={(value) => handleInputChange("cardType", value)}>
              <SelectTrigger className={errors.cardType ? "border-red-500 focus:border-red-500" : ""}>
                <SelectValue placeholder="Select your preferred card type" />
              </SelectTrigger>
              <SelectContent>
                {cardTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cardType && <p className="text-sm text-red-600">{errors.cardType}</p>}
          </div>
        </div>

        {/* Submit Button with Loader and Success Indicator */}
        <div className="relative">
          <Button
            type="submit"
            disabled={!isFormValid() || isSubmitting || loadingEligibleCounts}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              {/* Left side loader/success indicator */}
              <div className="absolute left-4 flex items-center">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : result && result.success ? (
                  <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                ) : null}
              </div>

              {/* Button text */}
              {isSubmitting ? (
                <>Analyzing & Fetching Recommendations...</>
              ) : loadingEligibleCounts ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating Eligible Cards...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Get My Recommendations with Detailed Analysis
                </>
              )}
            </div>
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {result.success ? (
            <>
              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <CreditCard className="mr-2 h-6 w-6 text-blue-600" />
                    Top {result.recommendations.length} Recommendations
                  </h2>

                  <div className="grid gap-4">
                    {result.recommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-semibold text-gray-900">{rec.cardName}</h3>
                                {index === 0 && (
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                    BEST MATCH
                                  </span>
                                )}
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                  #{index + 1}
                                </span>
                              </div>
                              <p className="text-gray-600 font-medium">{rec.bank}</p>
                              {rec.monthlyIncomeRequirement > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Min Monthly Income: ₹{rec.monthlyIncomeRequirement.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rec.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm text-gray-600">{rec.rating}/5</span>
                              </div>
                              <p className="text-xs text-blue-600 font-medium">Score: {rec.compositeScore}/100</p>
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Joining Fee</p>
                              <p className="font-semibold text-gray-900">
                                {rec.joiningFee === 0 ? "FREE" : `₹${rec.joiningFee.toLocaleString()}`}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Annual Fee</p>
                              <p className="font-semibold text-gray-900">
                                {rec.annualFee === 0 ? "FREE" : `₹${rec.annualFee.toLocaleString()}`}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Rewards Rate</p>
                              <p className="font-semibold text-gray-900">{rec.rewardsRate}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Sign-up Bonus</p>
                              <p className="font-semibold text-gray-900">
                                {rec.signUpBonus === 0 ? "None" : `₹${rec.signUpBonus.toLocaleString()}`}
                              </p>
                            </div>
                          </div>

                          {/* Features */}
                          {rec.features && rec.features.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <TrendingUp className="mr-1 h-4 w-4" />
                                Key Features:
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {rec.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <Alert className="bg-blue-50 border-blue-200">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                              <strong>Why this card?</strong> {rec.reason}
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>No matching cards found.</strong> Try adjusting your criteria or check back later for new
                    card options. Make sure your credit score and monthly income meet the requirements for cards in your
                    preferred category. Check the browser console for detailed analysis.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Error:</strong> {result.error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      {/* Add enhanced personalization section after initial results */}
      {result && result.success && result.recommendations && result.recommendations.length > 0 && (
        <div className="space-y-8">
          <EnhancedPersonalization
            onGetEnhancedRecommendations={handleEnhancedRecommendations}
            isLoading={isGettingEnhanced}
            enhancedResult={enhancedResult}
            hasMoreCardsAvailable={hasMoreCardsAvailable}
            totalEligibleCards={scoreEligibleCards}
            // Pass the current form data to help with dynamic bank filtering
            currentFormData={{
              creditScore: Number.parseInt(formData.creditScore),
              monthlyIncome: Number.parseInt(formData.monthlyIncome),
              cardType: formData.cardType,
            }}
          />

          {/* Enhanced Results Section */}
          {enhancedResult && (
            <div id="enhanced-results" className="space-y-6">
              <div className="border-t-4 border-t-green-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                {enhancedResult.success ? (
                  <>
                    {/* Check if no additional cards were available */}
                    {!hasMoreCardsAvailable ? (
                      <div className="text-center py-8">
                        <h2 className="text-2xl font-bold text-green-900 flex items-center justify-center mb-4">
                          <Sparkles className="mr-2 h-6 w-6 text-green-600" />
                          Reward-Based Analysis Complete
                        </h2>
                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            <strong>No new reward-based recommendations for your inputs.</strong> You have already
                            received all {scoreEligibleCards} cards that match your profile criteria (composite score
                            ≥25.0). There are no additional cards available that could be surfaced through bank or
                            joining fee preferences.
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <>
                        {/* Check if enhanced results are different from original results */}
                        {(() => {
                          // Compare card names from both results
                          const originalCardNames = result?.recommendations?.map((rec) => rec.cardName).sort() || []
                          const enhancedCardNames =
                            enhancedResult?.recommendations?.map((rec) => rec.cardName).sort() || []

                          // Check if arrays are identical
                          const areIdentical =
                            originalCardNames.length === enhancedCardNames.length &&
                            originalCardNames.every((name, index) => name === enhancedCardNames[index])

                          if (
                            areIdentical &&
                            enhancedResult.recommendations &&
                            enhancedResult.recommendations.length > 0
                          ) {
                            return (
                              <div className="text-center py-8">
                                <h2 className="text-2xl font-bold text-green-900 flex items-center justify-center mb-4">
                                  <Sparkles className="mr-2 h-6 w-6 text-green-600" />
                                  Reward-Based Analysis Complete
                                </h2>
                                <Alert className="bg-blue-50 border-blue-200">
                                  <Info className="h-4 w-4 text-blue-600" />
                                  <AlertDescription className="text-blue-800">
                                    <strong>No new reward-based recommendations for your inputs.</strong> The cards that
                                    best match your preferences are already shown in the original recommendations above.
                                    Your current filters (bank and joining fee preferences) result in the same optimal
                                    cards from the available {scoreEligibleCards} eligible cards (composite score
                                    ≥25.0).
                                  </AlertDescription>
                                </Alert>
                              </div>
                            )
                          }

                          // Show enhanced results if they're different
                          return (
                            <>
                              <h2 className="text-2xl font-bold text-green-900 flex items-center mb-4">
                                <Sparkles className="mr-2 h-6 w-6 text-green-600" />🎁 Top{" "}
                                {enhancedResult.recommendations?.length || 0} Reward-Based Recommendations
                              </h2>

                              {/* Enhanced Recommendations */}
                              {enhancedResult.recommendations && enhancedResult.recommendations.length > 0 ? (
                                <div className="grid gap-4">
                                  {enhancedResult.recommendations.map((rec, index) => (
                                    <Card key={index} className="border-l-4 border-l-green-500 bg-white">
                                      <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <h3 className="text-xl font-semibold text-gray-900">{rec.cardName}</h3>
                                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                REWARD #{index + 1}
                                              </span>
                                              {index === 0 && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                                  HIGHEST REWARD
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-gray-600 font-medium">{rec.bank}</p>
                                          </div>
                                          <div className="text-right">
                                            <div className="flex items-center mb-1">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`h-4 w-4 ${
                                                    i < rec.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                                  }`}
                                                />
                                              ))}
                                              <span className="ml-2 text-sm text-gray-600">{rec.rating}/5</span>
                                            </div>
                                            <p className="text-xs text-green-600 font-medium">
                                              Reward Rate: {rec.rewardsRate}%
                                            </p>
                                          </div>
                                        </div>

                                        {/* Same card details structure as original recommendations */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">Joining Fee</p>
                                            <p className="font-semibold text-gray-900">
                                              {rec.joiningFee === 0 ? "FREE" : `₹${rec.joiningFee.toLocaleString()}`}
                                            </p>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">Annual Fee</p>
                                            <p className="font-semibold text-gray-900">
                                              {rec.annualFee === 0 ? "FREE" : `₹${rec.annualFee.toLocaleString()}`}
                                            </p>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">Rewards Rate</p>
                                            <p className="font-semibold text-green-600 text-lg">{rec.rewardsRate}%</p>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">Sign-up Bonus</p>
                                            <p className="font-semibold text-gray-900">
                                              {rec.signUpBonus === 0 ? "None" : `₹${rec.signUpBonus.toLocaleString()}`}
                                            </p>
                                          </div>
                                        </div>

                                        {rec.features && rec.features.length > 0 && (
                                          <div className="mb-4">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                              <TrendingUp className="mr-1 h-4 w-4" />
                                              Key Features:
                                            </h4>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                              {rec.features.map((feature, idx) => (
                                                <li key={idx}>{feature}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        <Alert className="bg-green-50 border-green-200">
                                          <Shield className="h-4 w-4 text-green-600" />
                                          <AlertDescription className="text-green-800">
                                            <strong>Reward Focus:</strong> {rec.reason}
                                          </AlertDescription>
                                        </Alert>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <Alert className="bg-yellow-50 border-yellow-200">
                                  <Info className="h-4 w-4 text-yellow-600" />
                                  <AlertDescription className="text-yellow-800">
                                    <strong>No cards match your reward-based preferences.</strong> Try adjusting your
                                    brand or joining fee preferences, or check the original recommendations below.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </>
                          )
                        })()}
                      </>
                    )}
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Error:</strong> {enhancedResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Separator - only show if we have different enhanced results */}
          {enhancedResult &&
            enhancedResult.success &&
            (() => {
              const originalCardNames = result?.recommendations?.map((rec) => rec.cardName).sort() || []
              const enhancedCardNames = enhancedResult?.recommendations?.map((rec) => rec.cardName).sort() || []
              const areIdentical =
                originalCardNames.length === enhancedCardNames.length &&
                originalCardNames.every((name, index) => name === enhancedCardNames[index])
              return !areIdentical
            })() && (
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Original Balanced Recommendations
                </h2>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
