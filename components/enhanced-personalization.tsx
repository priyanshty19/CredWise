"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, CreditCardIcon, TrendingUp, AlertCircle, Eye, EyeOff, Building2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitEnhancedFormData, trackCardApplicationClick } from "@/lib/google-sheets-submissions"
import { fetchCreditCards } from "@/lib/google-sheets"

interface CreditCardData {
  id: string
  cardName: string
  bank: string
  cardType: string
  joiningFee: number
  annualFee: number
  creditScoreRequirement: number
  monthlyIncomeRequirement: number
  rewardsRate: number
  signUpBonus: number
  features: string[]
  description: string
  spendingCategories: string[]
}

interface FormData {
  monthlyIncome: string
  monthlySpending: string
  creditScoreRange: string
  currentCards: string
  spendingCategories: string[]
  preferredBanks: string[]
  joiningFeePreference: string
}

interface ScoredCard {
  card: CreditCardData
  score: number
  scoreBreakdown: {
    rewards: number
    category: number
    signup: number
    joining: number
    annual: number
    bank: number
  }
  eligible: boolean
  eligibilityReasons: string[]
  categoryMatches: string[]
}

interface CardTesterProps {
  cards: CreditCardData[]
  formData: FormData
  onClose: () => void
}

function CardTester({ cards, formData, onClose }: CardTesterProps) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCard, setSelectedCard] = useState<ScoredCard | null>(null)
  const [searchResults, setSearchResults] = useState<CreditCardData[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Live search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSelectedCard(null)
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(() => {
      const filtered = cards.filter(
        (card) =>
          card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.cardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setSearchResults(filtered.slice(0, 10)) // Limit to 10 results for performance
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, cards])

  // Auto-select card if exact match
  useEffect(() => {
    if (searchResults.length === 1) {
      handleCardSelect(searchResults[0])
    }
  }, [searchResults])

  const handleCardSelect = (card: CreditCardData) => {
    // Calculate score for this card in real-time
    const maxValues = {
      rewards: Math.max(...cards.map((c) => c.rewardsRate)),
      signup: Math.max(...cards.map((c) => c.signUpBonus)),
      joining: Math.max(...cards.map((c) => c.joiningFee)),
      annual: Math.max(...cards.map((c) => c.annualFee)),
    }

    const eligibility = checkEligibility(card, formData)
    const scoring = calculateRefinedScore(card, formData.spendingCategories, formData.preferredBanks, maxValues)

    const scoredCard: ScoredCard = {
      card,
      score: scoring.total,
      scoreBreakdown: scoring.breakdown,
      eligible: eligibility.eligible,
      eligibilityReasons: eligibility.reasons,
      categoryMatches: scoring.categoryMatches,
    }

    setSelectedCard(scoredCard)
  }

  const sbiCards = cards.filter((c) => c.bank === "SBI")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">🧪 Card Eligibility & Scoring Tester</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* SBI Cards Quick Overview */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              SBI Cards Overview ({sbiCards.length} cards available)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {sbiCards.slice(0, 9).map((card) => (
                <div key={card.id} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                  <div>
                    <span className="font-medium">{card.cardName}</span>
                    <div className="text-xs text-gray-600">
                      {card.rewardsRate}% • ₹{card.joiningFee} joining • {card.cardType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Search Input */}
          <div className="mb-6 space-y-4">
            <div>
              <Label htmlFor="card-search">Search Cards (All {cards.length} cards available):</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
                <Input
                  id="card-search"
                  type="text"
                  placeholder="Type card name, bank, or description to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
              </div>
            </div>

            {/* Live Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                <div className="p-2 bg-gray-50 text-sm font-medium">
                  Found {searchResults.length} cards (showing top 10)
                </div>
                {searchResults.map((card) => (
                  <div
                    key={card.id}
                    className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCardSelect(card)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{card.cardName}</div>
                        <div className="text-sm text-gray-600">
                          {card.bank} • {card.cardType} • {card.rewardsRate}% rewards
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>₹{card.joiningFee} joining</div>
                        <div className="text-gray-500">₹{card.annualFee} annual</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-4 text-gray-500">
                No cards found matching "{searchTerm}". Try different keywords.
              </div>
            )}
          </div>

          {/* Selected Card Analysis */}
          {selectedCard && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5" />
                    {selectedCard.card.cardName}
                  </CardTitle>
                  <CardDescription>
                    {selectedCard.card.bank} • {selectedCard.card.cardType} • {selectedCard.card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Eligibility */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Basic Eligibility Check
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Credit Score:</span>
                          <span
                            className={
                              getCreditScoreValue(formData.creditScoreRange) >= selectedCard.card.creditScoreRequirement
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {getCreditScoreValue(formData.creditScoreRange) >= selectedCard.card.creditScoreRequirement
                              ? "✅ Pass"
                              : "❌ Fail"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Required: {selectedCard.card.creditScoreRequirement}+ | Your Range:{" "}
                          {formData.creditScoreRange} (≈
                          {getCreditScoreValue(formData.creditScoreRange)})
                        </div>

                        <div className="flex justify-between">
                          <span>Monthly Income:</span>
                          <span
                            className={
                              Number.parseInt(formData.monthlyIncome) >= selectedCard.card.monthlyIncomeRequirement
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {Number.parseInt(formData.monthlyIncome) >= selectedCard.card.monthlyIncomeRequirement
                              ? "✅ Pass"
                              : "❌ Fail"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Required: ₹{selectedCard.card.monthlyIncomeRequirement?.toLocaleString()}+ | Your Income: ₹
                          {Number.parseInt(formData.monthlyIncome)?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>Card Type Match:</span>
                          <span className="text-green-600">✅ Pass</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Card Type: {selectedCard.card.cardType} (All types accepted)
                        </div>
                      </div>
                    </div>

                    {/* Refined Scoring Breakdown */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Refined Scoring Breakdown
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>🎁 Rewards Rate (30):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.rewards.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">Card Rate: {selectedCard.card.rewardsRate}%</div>

                        <div className="flex justify-between">
                          <span>🛍️ Category Match (30):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.category.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Matches: {selectedCard.categoryMatches.length}/{formData.spendingCategories.length} categories
                        </div>

                        <div className="flex justify-between">
                          <span>🎉 Sign-up Bonus (20):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.signup.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Bonus: ₹{selectedCard.card.signUpBonus?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>💳 Joining Fee (10):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.joining.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Fee: ₹{selectedCard.card.joiningFee?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>📅 Annual Fee (10):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.annual.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Fee: ₹{selectedCard.card.annualFee?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>🏦 Bank Bonus (5):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.bank.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {formData.preferredBanks.some((bank) =>
                            selectedCard.card.bank.toLowerCase().includes(bank.toLowerCase()),
                          )
                            ? "Preferred bank"
                            : "Not preferred"}
                        </div>

                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Score:</span>
                          <span>{selectedCard.score.toFixed(1)}/105</span>
                        </div>
                        <div className="text-xs text-gray-600">Threshold: 25.0 points (for recommendations)</div>
                      </div>
                    </div>
                  </div>

                  {/* Category Matching */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Category Matching Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Your Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.spendingCategories.map((cat) => (
                            <Badge key={cat} variant="outline">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Card Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCard.card.spendingCategories.map((tag) => (
                            <Badge
                              key={tag}
                              variant={selectedCard.categoryMatches.includes(tag) ? "default" : "secondary"}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Match Rate:</span> {selectedCard.categoryMatches.length}/
                      {formData.spendingCategories.length} categories (
                      {formData.spendingCategories.length > 0
                        ? ((selectedCard.categoryMatches.length / formData.spendingCategories.length) * 100).toFixed(0)
                        : 0}
                      %)
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Card Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bank:</span>
                        <div className="font-medium">{selectedCard.card.bank}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Card Type:</span>
                        <div className="font-medium">{selectedCard.card.cardType}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Reward Rate:</span>
                        <div className="font-medium">{selectedCard.card.rewardsRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Sign-up Bonus:</span>
                        <div className="font-medium">₹{selectedCard.card.signUpBonus?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Final Verdict */}
                  <div className="mt-6 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-2">Final Verdict</h4>
                    <div className={`text-lg font-bold ${selectedCard.eligible ? "text-green-600" : "text-red-600"}`}>
                      {selectedCard.eligible ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}
                    </div>
                    <div className="text-sm mt-1">
                      {selectedCard.eligible
                        ? `This card passes all eligibility checks and scores ${selectedCard.score.toFixed(
                            1,
                          )} points. ${
                            selectedCard.score >= 25.0
                              ? "It meets the minimum score threshold of 25.0 and will appear in recommendations."
                              : "However, it may not appear in top recommendations due to low score (below 25.0 threshold)."
                          }`
                        : `This card fails eligibility: ${selectedCard.eligibilityReasons.join(", ")}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Quick Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Cards:</span>
                <div className="font-bold text-lg">{cards.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Search Results:</span>
                <div className="font-bold text-lg text-blue-600">{searchResults.length}</div>
              </div>
              <div>
                <span className="text-gray-600">SBI Cards:</span>
                <div className="font-bold text-lg text-orange-600">{sbiCards.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Selected Card:</span>
                <div className="font-bold text-lg text-green-600">{selectedCard ? "1" : "0"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCreditScoreValue(range: string): number {
  switch (range) {
    case "300-549":
      return 425
    case "550-649":
      return 600
    case "650-749":
      return 700
    case "750-850":
      return 800
    default:
      return 700
  }
}

const calculateRefinedScore = (
  card: CreditCardData,
  userCategories: string[],
  preferredBanks: string[],
  maxValues: { rewards: number; signup: number; joining: number; annual: number },
) => {
  // 1. Rewards Rate Score (0-30 points)
  const rewardsScore = (card.rewardsRate / maxValues.rewards) * 30

  // 2. Category Match Score (0-30 points)
  const matchingCategories = card.spendingCategories.filter((tag) => userCategories.includes(tag))
  const categoryScore = userCategories.length > 0 ? (matchingCategories.length / userCategories.length) * 30 : 0

  // 3. Sign-up Bonus Score (0-20 points)
  const signupScore = (card.signUpBonus / maxValues.signup) * 20

  // 4. Joining Fee Score (0-10 points) - Lower fee = higher score
  const joiningScore = ((maxValues.joining - card.joiningFee) / maxValues.joining) * 10

  // 5. Annual Fee Score (0-10 points) - Lower fee = higher score
  const annualScore = ((maxValues.annual - card.annualFee) / maxValues.annual) * 10

  // 6. Bank Preference Bonus (0-5 points)
  const bankScore = preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())) ? 5 : 0

  const totalScore = rewardsScore + categoryScore + signupScore + joiningScore + annualScore + bankScore

  return {
    total: totalScore,
    breakdown: {
      rewards: rewardsScore,
      category: categoryScore,
      signup: signupScore,
      joining: joiningScore,
      annual: annualScore,
      bank: bankScore,
    },
    categoryMatches: matchingCategories,
  }
}

const checkEligibility = (card: CreditCardData, formData: FormData) => {
  const reasons: string[] = []
  let eligible = true

  // Credit score check
  const creditScore = getCreditScoreValue(formData.creditScoreRange)
  if (creditScore < card.creditScoreRequirement) {
    eligible = false
    reasons.push(`Credit score too low (need ${card.creditScoreRequirement}+)`)
  }

  // Income check
  const income = Number.parseInt(formData.monthlyIncome)
  if (income < card.monthlyIncomeRequirement) {
    eligible = false
    reasons.push(`Income too low (need ₹${card.monthlyIncomeRequirement}+)`)
  }

  return { eligible, reasons }
}

export default function EnhancedPersonalization() {
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: "",
    monthlySpending: "",
    creditScoreRange: "",
    currentCards: "",
    spendingCategories: [],
    preferredBanks: [],
    joiningFeePreference: "",
  })

  const [recommendations, setRecommendations] = useState<ScoredCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTester, setShowTester] = useState(false)
  const [allCards, setAllCards] = useState<CreditCardData[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableBanks, setAvailableBanks] = useState<string[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Fetch live data on component mount
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setIsDataLoading(true)

        // Fetch all cards from database
        const cards = await fetchCreditCards()
        setAllCards(cards)

        // Extract unique spending categories from cards
        const categories = [...new Set(cards.flatMap((card) => card.spendingCategories))].sort()
        setAvailableCategories(categories)

        // Extract unique banks from cards
        const banks = [...new Set(cards.map((card) => card.bank))].sort()
        setAvailableBanks(banks)

        console.log(`✅ Loaded ${cards.length} cards, ${categories.length} categories, ${banks.length} banks`)
      } catch (error) {
        console.error("Error fetching live data:", error)
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchLiveData()
  }, [])

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      spendingCategories: checked
        ? [...prev.spendingCategories, categoryId]
        : prev.spendingCategories.filter((id) => id !== categoryId),
    }))
  }

  const handleBankChange = (bankId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredBanks: checked ? [...prev.preferredBanks, bankId] : prev.preferredBanks.filter((id) => id !== bankId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Calculate max values for normalization
      const maxValues = {
        rewards: Math.max(...allCards.map((c) => c.rewardsRate)),
        signup: Math.max(...allCards.map((c) => c.signUpBonus)),
        joining: Math.max(...allCards.map((c) => c.joiningFee)),
        annual: Math.max(...allCards.map((c) => c.annualFee)),
      }

      // Score and filter all cards
      const scoredCards: ScoredCard[] = allCards.map((card) => {
        const eligibility = checkEligibility(card, formData)
        const scoring = calculateRefinedScore(card, formData.spendingCategories, formData.preferredBanks, maxValues)

        return {
          card,
          score: scoring.total,
          scoreBreakdown: scoring.breakdown,
          eligible: eligibility.eligible,
          eligibilityReasons: eligibility.reasons,
          categoryMatches: scoring.categoryMatches,
        }
      })

      // Filter eligible cards with score >= 25.0
      const eligibleCards = scoredCards.filter((card) => card.eligible && card.score >= 25.0)

      // Sort by score (highest first) and take top 7
      const topRecommendations = eligibleCards.sort((a, b) => b.score - a.score).slice(0, 7)

      setRecommendations(topRecommendations)

      // Submit to Google Sheets
      const submissionData = {
        timestamp: new Date().toISOString(),
        monthlyIncome: Number.parseInt(formData.monthlyIncome),
        monthlySpending: Number.parseInt(formData.monthlySpending),
        creditScoreRange: formData.creditScoreRange,
        currentCards: formData.currentCards,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
        joiningFeePreference: formData.joiningFeePreference,
        submissionType: "enhanced_personalization",
        userAgent: navigator.userAgent,
      }

      await submitEnhancedFormData(submissionData)
    } catch (error) {
      console.error("Error generating recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = async (card: ScoredCard) => {
    try {
      const clickData = {
        timestamp: new Date().toISOString(),
        cardName: card.card.cardName,
        bankName: card.card.bank,
        cardType: card.card.cardType,
        joiningFee: card.card.joiningFee,
        annualFee: card.card.annualFee,
        rewardRate: `${card.card.rewardsRate}%`,
        submissionType: "card_application_click",
        userAgent: navigator.userAgent,
        sessionId: `session_${Date.now()}`,
      }

      await trackCardApplicationClick(clickData)
      // Note: We would need to add applyUrl to the CreditCard interface and database
      // For now, we'll just log the click
      console.log("Card application click tracked:", clickData)
    } catch (error) {
      console.error("Error tracking card click:", error)
    }
  }

  if (isDataLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🎯 Enhanced Card Personalization</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading live data from database...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎯 Enhanced Card Personalization</h1>
        <p className="text-gray-600">Get personalized credit card recommendations with our refined scoring algorithm</p>
        <p className="text-sm text-gray-500 mt-1">Now with all {allCards.length} cards loaded live from database!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Financial Profile</CardTitle>
          <CardDescription>Help us understand your spending patterns and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Financial Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="50000"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthlySpending">Monthly Spending (₹)</Label>
                <Input
                  id="monthlySpending"
                  type="number"
                  placeholder="25000"
                  value={formData.monthlySpending}
                  onChange={(e) => handleInputChange("monthlySpending", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Credit Score and Current Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creditScore">Credit Score Range</Label>
                <Select
                  value={formData.creditScoreRange}
                  onValueChange={(value) => handleInputChange("creditScoreRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your credit score range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300-549">Poor (300-549)</SelectItem>
                    <SelectItem value="550-649">Fair (550-649)</SelectItem>
                    <SelectItem value="650-749">Good (650-749)</SelectItem>
                    <SelectItem value="750-850">Excellent (750-850)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currentCards">Number of Current Credit Cards</Label>
                <Select
                  value={formData.currentCards}
                  onValueChange={(value) => handleInputChange("currentCards", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of cards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 cards</SelectItem>
                    <SelectItem value="1">1 card</SelectItem>
                    <SelectItem value="2">2 cards</SelectItem>
                    <SelectItem value="3">3 cards</SelectItem>
                    <SelectItem value="4+">4+ cards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Spending Categories - Live from database */}
            <div>
              <Label>Primary Spending Categories (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-48 overflow-y-auto">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.spendingCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <Label htmlFor={category} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Banks - Live from database */}
            <div>
              <Label>Preferred Banks (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-32 overflow-y-auto">
                {availableBanks.map((bank) => (
                  <div key={bank} className="flex items-center space-x-2">
                    <Checkbox
                      id={bank}
                      checked={formData.preferredBanks.includes(bank)}
                      onCheckedChange={(checked) => handleBankChange(bank, checked as boolean)}
                    />
                    <Label htmlFor={bank} className="text-sm">
                      {bank}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Joining Fee Preference */}
            <div>
              <Label htmlFor="joiningFee">Joining Fee Preference</Label>
              <Select
                value={formData.joiningFeePreference}
                onValueChange={(value) => handleInputChange("joiningFeePreference", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select joining fee preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (₹0)</SelectItem>
                  <SelectItem value="low">Low (₹1-1000)</SelectItem>
                  <SelectItem value="medium">Medium (₹1001-3000)</SelectItem>
                  <SelectItem value="any_amount">Any Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Generating Recommendations..." : "Get Personalized Recommendations"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🏆 Top Recommendations</h2>
            <Button variant="outline" onClick={() => setShowTester(true)} className="flex items-center gap-2">
              {showTester ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Card Tester ({allCards.length} cards)
            </Button>
          </div>

          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Cards are ranked using our refined algorithm: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus
              (20%) + Fees (20%). Only showing cards with score ≥ 25.0. Analyzed from {allCards.length} total cards
              loaded live from database.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {recommendations.map((scoredCard, index) => (
              <Card key={scoredCard.card.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <h3 className="text-xl font-bold">{scoredCard.card.cardName}</h3>
                        <Badge variant="outline">{scoredCard.card.bank}</Badge>
                      </div>
                      <p className="text-gray-600">{scoredCard.card.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{scoredCard.score.toFixed(1)}</div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{scoredCard.card.rewardsRate}%</div>
                      <div className="text-sm text-gray-500">Reward Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">₹{scoredCard.card.joiningFee}</div>
                      <div className="text-sm text-gray-500">Joining Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">₹{scoredCard.card.annualFee}</div>
                      <div className="text-sm text-gray-500">Annual Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">₹{scoredCard.card.signUpBonus}</div>
                      <div className="text-sm text-gray-500">Sign-up Bonus</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {scoredCard.categoryMatches.map((category) => (
                      <Badge key={category} variant="default">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <Button onClick={() => handleCardClick(scoredCard)} className="w-full">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Card Tester Modal */}
      {showTester && <CardTester cards={allCards} formData={formData} onClose={() => setShowTester(false)} />}
    </div>
  )
}
