"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, Building2, ChevronUp, CheckCircle, Info } from "lucide-react"
import { fetchCreditCards } from "@/lib/google-sheets"

interface EnhancedPersonalizationProps {
  onGetEnhancedRecommendations: (preferences: {
    preferredBrand: string
    maxJoiningFee: string
  }) => void
  isLoading: boolean
  enhancedResult?: any
  hasMoreCardsAvailable?: boolean
  totalEligibleCards?: number
  currentFormData?: {
    creditScore: number
    monthlyIncome: number
    cardType: string
  }
}

interface BankJoiningFeeIntersection {
  [key: string]: {
    totalCards: number
    byJoiningFee: { [fee: string]: number }
  }
}

export default function EnhancedPersonalization({
  onGetEnhancedRecommendations,
  isLoading,
  enhancedResult,
  hasMoreCardsAvailable = true,
  totalEligibleCards = 0,
  currentFormData,
}: EnhancedPersonalizationProps) {
  const [showPersonalization, setShowPersonalization] = useState(false)
  const [preferences, setPreferences] = useState({
    preferredBrand: "",
    maxJoiningFee: "",
  })
  const [availableBanks, setAvailableBanks] = useState<Array<{ value: string; label: string; count: number }>>([
    { value: "Any", label: "Any Bank", count: 0 },
  ])
  const [intersectionData, setIntersectionData] = useState<BankJoiningFeeIntersection>({})
  const [loadingIntersection, setLoadingIntersection] = useState(false)
  const [intersectionCount, setIntersectionCount] = useState(0)

  const joiningFeeRanges = [
    { value: "any", label: "Any Amount" },
    { value: "0", label: "Free (₹0)" },
    { value: "500", label: "Up to ₹500" },
    { value: "1000", label: "Up to ₹1,000" },
    { value: "2500", label: "Up to ₹2,500" },
    { value: "5000", label: "Up to ₹5,000" },
    { value: "10000", label: "Up to ₹10,000" },
  ]

  // Load bank and joining fee intersection data when component mounts or form data changes
  useEffect(() => {
    const fetchIntersectionData = async () => {
      try {
        setLoadingIntersection(true)
        console.log("🏦💰 Loading bank and joining fee intersection data...")

        const cards = await fetchCreditCards()

        // Filter cards based on current form data if available
        let eligibleCards = cards
        if (currentFormData) {
          eligibleCards = cards.filter((card) => {
            const meetsCredit =
              card.creditScoreRequirement === 0 || currentFormData.creditScore >= card.creditScoreRequirement
            const meetsIncome =
              card.monthlyIncomeRequirement === 0 || currentFormData.monthlyIncome >= card.monthlyIncomeRequirement
            const matchesType = card.cardType === currentFormData.cardType
            return meetsCredit && meetsIncome && matchesType
          })

          console.log(`🎯 Filtered to ${eligibleCards.length} eligible cards for enhanced personalization`)
        }

        // Build intersection data: Bank x Joining Fee
        const intersection: BankJoiningFeeIntersection = {}
        eligibleCards.forEach((card) => {
          if (!intersection[card.bank]) {
            intersection[card.bank] = {
              totalCards: 0,
              byJoiningFee: {},
            }
          }

          intersection[card.bank].totalCards++

          // Categorize by joining fee ranges
          const joiningFee = card.joiningFee
          let feeCategory = "10000+" // Default for high fees

          if (joiningFee === 0) feeCategory = "0"
          else if (joiningFee <= 500) feeCategory = "500"
          else if (joiningFee <= 1000) feeCategory = "1000"
          else if (joiningFee <= 2500) feeCategory = "2500"
          else if (joiningFee <= 5000) feeCategory = "5000"
          else if (joiningFee <= 10000) feeCategory = "10000"

          intersection[card.bank].byJoiningFee[feeCategory] =
            (intersection[card.bank].byJoiningFee[feeCategory] || 0) + 1
        })

        console.log("🏦💰 Bank and joining fee intersection data:", intersection)
        setIntersectionData(intersection)

        // Create bank options with counts
        const uniqueBanks = Object.keys(intersection).sort()
        const bankOptions = [
          { value: "Any", label: "Any Bank", count: eligibleCards.length },
          ...uniqueBanks.map((bank) => ({
            value: bank,
            label: bank,
            count: intersection[bank].totalCards,
          })),
        ]

        setAvailableBanks(bankOptions)
      } catch (error) {
        console.error("Error fetching intersection data:", error)
        // Fallback
        setAvailableBanks([{ value: "Any", label: "Any Bank", count: 0 }])
      } finally {
        setLoadingIntersection(false)
      }
    }

    if (showPersonalization) {
      fetchIntersectionData()
    }
  }, [showPersonalization, currentFormData])

  // Calculate intersection count when preferences change
  useEffect(() => {
    if (!intersectionData || Object.keys(intersectionData).length === 0) {
      setIntersectionCount(0)
      return
    }

    let count = 0

    if (preferences.preferredBrand === "" || preferences.preferredBrand === "Any") {
      // Count all banks
      if (preferences.maxJoiningFee === "" || preferences.maxJoiningFee === "any") {
        // All cards from all banks
        count = Object.values(intersectionData).reduce((sum, bankData) => sum + bankData.totalCards, 0)
      } else {
        // All banks, but filtered by joining fee
        const maxFee = Number.parseInt(preferences.maxJoiningFee)
        Object.values(intersectionData).forEach((bankData) => {
          Object.entries(bankData.byJoiningFee).forEach(([feeCategory, cardCount]) => {
            const categoryMaxFee = feeCategory === "10000+" ? 999999 : Number.parseInt(feeCategory)
            if (categoryMaxFee <= maxFee) {
              count += cardCount
            }
          })
        })
      }
    } else {
      // Specific bank selected
      const bankData = intersectionData[preferences.preferredBrand]
      if (bankData) {
        if (preferences.maxJoiningFee === "" || preferences.maxJoiningFee === "any") {
          // All cards from this bank
          count = bankData.totalCards
        } else {
          // Specific bank, filtered by joining fee
          const maxFee = Number.parseInt(preferences.maxJoiningFee)
          Object.entries(bankData.byJoiningFee).forEach(([feeCategory, cardCount]) => {
            const categoryMaxFee = feeCategory === "10000+" ? 999999 : Number.parseInt(feeCategory)
            if (categoryMaxFee <= maxFee) {
              count += cardCount
            }
          })
        }
      }
    }

    console.log(
      `🎯 Intersection count for Bank: "${preferences.preferredBrand || "Any"}", Max Fee: "${preferences.maxJoiningFee || "Any"}": ${count} cards`,
    )
    setIntersectionCount(count)
  }, [preferences.preferredBrand, preferences.maxJoiningFee, intersectionData])

  const handleSubmit = () => {
    // Check if there are more cards available before proceeding
    if (!hasMoreCardsAvailable) {
      console.log("🚫 No additional cards available - triggering immediate response")
    }
    onGetEnhancedRecommendations(preferences)
  }

  const isFormValid = () => {
    // At least one preference should be selected for enhanced recommendations
    return (
      (preferences.preferredBrand !== "" && preferences.preferredBrand !== "Any") ||
      (preferences.maxJoiningFee !== "" && preferences.maxJoiningFee !== "any")
    )
  }

  if (!showPersonalization) {
    return (
      <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Want Reward-Based Recommendations?</h3>
              <p className="text-gray-600 mb-4">
                Get <strong>Top 3</strong> recommendations ranked purely by <strong>highest reward rates</strong> with
                your preferred filters
              </p>
              <Button onClick={() => setShowPersonalization(true)} className="bg-blue-600 hover:bg-blue-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Reward-Based Recommendations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no more cards are available, show a simplified version that will trigger the "no more cards" message
  if (!hasMoreCardsAvailable) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-blue-900">
              <Sparkles className="mr-2 h-5 w-5" />
              Reward-Based Recommendations
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPersonalization(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-2">
                <p>
                  <strong>📊 Analysis:</strong>
                </p>
                <p className="text-sm">
                  • You have received all <strong>{totalEligibleCards} cards</strong> that match your profile criteria
                </p>
                <p className="text-sm">• No additional cards are available beyond what was already shown</p>
                <p className="text-sm">• Bank and joining fee preferences won't surface different cards</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="relative">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Confirm Analysis
                  </>
                )}
              </div>
            </Button>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis Result:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                • Total Eligible Cards: <span className="font-medium">{totalEligibleCards}</span>
              </p>
              <p>
                • Cards Already Shown: <span className="font-medium">{totalEligibleCards}</span>
              </p>
              <p>
                • Additional Cards Available: <span className="font-medium text-red-600">0</span>
              </p>
            </div>
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
              <strong>🎯 Result:</strong> All matching cards have already been displayed. Reward-based filtering cannot
              surface additional options.
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show the full form if more cards are available
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-blue-900">
            <Sparkles className="mr-2 h-5 w-5" />
            Reward-Based Recommendations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPersonalization(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loading state for intersection data */}
        {loadingIntersection && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Analyzing intersection...</strong> Calculating bank and joining fee combinations for your profile.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preferred Brand */}
          <div className="space-y-2">
            <Label htmlFor="preferredBrand" className="text-sm font-medium text-gray-700 flex items-center">
              <Building2 className="mr-1 h-4 w-4" />
              Preferred Bank
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </Label>
            <Select
              value={preferences.preferredBrand}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, preferredBrand: value }))}
              disabled={loadingIntersection}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingIntersection ? "Loading banks..." : "Select your preferred bank"} />
              </SelectTrigger>
              <SelectContent>
                {availableBanks.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                    {bank.count > 0 && <span className="text-xs text-gray-500 ml-2">({bank.count} cards)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {preferences.preferredBrand && intersectionData[preferences.preferredBrand]
                ? `${intersectionData[preferences.preferredBrand].totalCards} eligible cards available`
                : "Choose a specific bank if you have a preference"}
            </p>
          </div>

          {/* Maximum Joining Fee */}
          <div className="space-y-2">
            <Label htmlFor="maxJoiningFee" className="text-sm font-medium text-gray-700 flex items-center">
              ₹ {/* Changed from DollarSign to Rupee symbol */}
              <span className="ml-1">Maximum Joining Fee</span>
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </Label>
            <Select
              value={preferences.maxJoiningFee}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, maxJoiningFee: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your budget for joining fee" />
              </SelectTrigger>
              <SelectContent>
                {joiningFeeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Set your maximum budget for one-time joining fee</p>
          </div>
        </div>

        {/* Enhanced Recommendations Button with Loader and Success Indicator */}
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || loadingIntersection}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300"
              size="lg"
            >
              <div className="flex items-center justify-center">
                {/* Left side loader/success indicator */}
                <div className="absolute left-4 flex items-center">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : enhancedResult && enhancedResult.success ? (
                    <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  ) : null}
                </div>

                {/* Button text */}
                {isLoading ? (
                  <>Getting Reward-Based Recommendations...</>
                ) : loadingIntersection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Intersection Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Reward-Based Recommendations
                  </>
                )}
              </div>
            </Button>
          </div>

          {intersectionCount === 0 &&
            !loadingIntersection &&
            (preferences.preferredBrand || preferences.maxJoiningFee) && (
              <p className="text-xs text-amber-600 text-center">
                ⚠️ No cards match your current intersection. Try adjusting your preferences.
              </p>
            )}
        </div>

        {/* Current Preferences Summary */}
        {(preferences.preferredBrand || preferences.maxJoiningFee) && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Your Reward-Based Filters:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {preferences.preferredBrand && (
                <p>
                  • Preferred Bank:{" "}
                  <span className="font-medium">
                    {availableBanks.find((b) => b.value === preferences.preferredBrand)?.label}
                    {preferences.preferredBrand !== "Any" && intersectionData[preferences.preferredBrand] && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({intersectionData[preferences.preferredBrand].totalCards} cards)
                      </span>
                    )}
                  </span>
                </p>
              )}
              {preferences.maxJoiningFee && (
                <p>
                  • Max Joining Fee:{" "}
                  <span className="font-medium">
                    {joiningFeeRanges.find((r) => r.value === preferences.maxJoiningFee)?.label}
                  </span>
                </p>
              )}
              <p>
                • Number of Results: <span className="font-medium">Top 3 (Fixed)</span>
              </p>
            </div>
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <strong>🎯 Ranking Logic:</strong> From the intersection of your preferences, cards will be sorted by
              highest reward rate first and Top 3 will be shown.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
