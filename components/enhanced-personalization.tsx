"use client"

import type { React } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CreditCard, TrendingUp, Building2, Eye, EyeOff, Search, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitEnhancedFormData, trackCardApplicationClick } from "@/lib/google-sheets-submissions"
import { fetchCreditCards } from "@/lib/google-sheets"

const SPENDING_CATEGORIES = [
  { id: "dining", label: "Dining & Restaurants" },
  { id: "grocery", label: "Grocery & Supermarkets" },
  { id: "fuel", label: "Fuel & Gas Stations" },
  { id: "online_shopping", label: "Online Shopping" },
  { id: "travel", label: "Travel & Hotels" },
  { id: "movies", label: "Movies & Entertainment" },
  { id: "bill_payments", label: "Bill Payments & Utilities" },
  { id: "shopping", label: "Shopping & Retail" },
  { id: "amazon", label: "Amazon Purchases" },
  { id: "luxury", label: "Luxury & Premium Services" },
  { id: "concierge", label: "Concierge Services" },
  { id: "golf", label: "Golf & Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "departmental_stores", label: "Departmental Stores" },
  { id: "health", label: "Health & Wellness" },
  { id: "pharmacy", label: "Pharmacy & Medical" },
  { id: "airlines", label: "Airlines & Flight Booking" },
  { id: "hotels", label: "Hotels & Accommodation" },
  { id: "railways", label: "Railways & Train Booking" },
  { id: "sports", label: "Sports & Fitness" },
  { id: "fashion", label: "Fashion & Apparel" },
  { id: "wellness", label: "Wellness & Spa" },
  { id: "business", label: "Business Expenses" },
  { id: "corporate", label: "Corporate Spending" },
  { id: "student", label: "Student Expenses" },
  { id: "youth", label: "Youth & Lifestyle" },
  { id: "customizable", label: "Customizable Categories" },
  { id: "instant", label: "Instant Approval" },
  { id: "digital", label: "Digital Services" },
  { id: "international", label: "International Transactions" },
  { id: "regional", label: "Regional Benefits" },
  { id: "microfinance", label: "Microfinance Services" },
  { id: "small_finance", label: "Small Finance Benefits" },
]

const BANK_OPTIONS = [
  { id: "sbi", label: "SBI" },
  { id: "hdfc", label: "HDFC Bank" },
  { id: "icici", label: "ICICI Bank" },
  { id: "axis", label: "Axis Bank" },
  { id: "amex", label: "American Express" },
  { id: "kotak", label: "Kotak Mahindra Bank" },
  { id: "yes", label: "YES Bank" },
  { id: "indusind", label: "IndusInd Bank" },
  { id: "standard_chartered", label: "Standard Chartered" },
  { id: "citibank", label: "Citibank" },
  { id: "rbl", label: "RBL Bank" },
  { id: "idfc_first", label: "IDFC FIRST Bank" },
  { id: "federal", label: "Federal Bank" },
  { id: "bob", label: "Bank of Baroda" },
  { id: "pnb", label: "Punjab National Bank" },
  { id: "union", label: "Union Bank of India" },
  { id: "indian", label: "Indian Bank" },
  { id: "canara", label: "Canara Bank" },
  { id: "central", label: "Central Bank of India" },
  { id: "iob", label: "Indian Overseas Bank" },
  { id: "uco", label: "UCO Bank" },
  { id: "boi", label: "Bank of India" },
  { id: "hsbc", label: "HSBC" },
  { id: "deutsche", label: "Deutsche Bank" },
]

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
  card: any
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
  cards: ScoredCard[]
  formData: FormData
  onClose: () => void
}

function CardTester({ cards, formData, onClose }: CardTesterProps) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [allCards, setAllCards] = useState<any[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [filteredCards, setFilteredCards] = useState<any[]>([])

  // Load all cards when component mounts or when search term changes
  import("react").useEffect(() => {
    const loadCards = async () => {
      if (allCards.length === 0) {
        setIsLoadingCards(true)
        try {
          const fetchedCards = await fetchCreditCards()
          setAllCards(fetchedCards)
          setFilteredCards(fetchedCards.slice(0, 20)) // Show first 20 cards initially
        } catch (error) {
          console.error("Error loading cards:", error)
        } finally {
          setIsLoadingCards(false)
        }
      }
    }

    loadCards()
  }, [allCards.length])

  // Filter cards based on search term
  import("react").useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCards(allCards.slice(0, 20)) // Show first 20 cards when no search
    } else {
      const filtered = allCards.filter(
        (card) =>
          card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.cardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredCards(filtered.slice(0, 50)) // Show up to 50 matching cards
    }
  }, [searchTerm, allCards])

  const handleCardSelect = (card: any) => {
    setSelectedCard(card)
    
    // Calculate test results for the selected card
    const testResults = testCard(card)
    setSelectedCard({ ...card, testResults })
  }

  const testCard = (card: any) => {
    // Determine card type based on spending categories
    const cardType = formData.spendingCategories?.includes("travel")
      ? "Travel"
      : formData.spendingCategories?.some((cat: string) => ["dining", "shopping"].includes(cat))
        ? "Rewards"
        : "Cashback"

    const results = {
      basicEligibility: {
        creditScore: card.creditScoreRequirement === 0 || getCreditScoreValue(formData.creditScoreRange) >= card.creditScoreRequirement,
        income: card.monthlyIncomeRequirement === 0 || Number.parseInt(formData.monthlyIncome) >= card.monthlyIncomeRequirement,
        cardType: card.cardType === cardType,
      },
      bankMatch: formData.preferredBanks?.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())) || false,
      categoryMatch: {
        userCategories: formData.spendingCategories || [],
        cardCategories: card.spendingCategories || [],
        matches: (card.spendingCategories || []).filter((cat: string) =>
          (formData.spendingCategories || []).map((c: string) => c.toLowerCase()).includes(cat.toLowerCase()),
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

    // Calculate composite score using the same logic as the main algorithm
    const maxRewardsRate = 15 // Reasonable max for normalization
    const maxSignUpBonus = 100000 // Reasonable max for normalization
    const maxJoiningFee = 50000 // Reasonable max for normalization
    const maxAnnualFee = 60000 // Reasonable max for normalization

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
      isRecommended: cards.some((rec) => rec.card.cardName === card.cardName),
    }
  }

  const sbiCards = allCards.filter((c) => c.bank === "SBI")

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
          {sbiCards.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                SBI Cards Overview ({sbiCards.length} cards available)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                {sbiCards.slice(0, 9).map((card) => {
                  const scoredCard = cards.find((c) => c.card.cardName === card.cardName)
                  return (
                    <div key={card.id} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                      <div>
                        <span className="font-medium">{card.cardName}</span>
                        <div className="text-xs text-gray-600">
                          {card.rewardsRate}% • ₹{card.joiningFee} joining • {card.cardType}
                        </div>
                      </div>
                      <div className="text-right">
                        {scoredCard ? (
                          <>
                            <div className="font-bold text-sm">{scoredCard.score.toFixed(1)}</div>
                            <div className={`text-xs ${scoredCard.eligible ? "text-green-600" : "text-red-600"}`}>
                              {scoredCard.eligible ? "✅" : "❌"}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500">Not scored</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search and Card Input */}
          <div className="mb-6 space-y-4">
            <div>
              <Label htmlFor="card-search">Search and Select Card to Test:</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="card-search"
                  type="text"
                  placeholder="Type card name, bank, or description to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isLoadingCards && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading cards from database...
                </div>
              )}
            </div>

            {/* Card Selection Grid */}
            {filteredCards.length > 0 && (
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <div className="grid gap-1 p-2">
                  {filteredCards.map((card) => {
                    const scoredCard = cards.find((c) => c.card.cardName === card.cardName)
                    const isSelected = selectedCard?.id === card.id
                    
                    return (
                      <div
                        key={card.id}
                        onClick={() => handleCardSelect(card)}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          isSelected 
                            ? "bg-blue-100 border-blue-300 border" 
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{card.cardName}</div>
                            <div className="text-xs text-gray-600">
                              {card.bank} • {card.cardType} • {card.rewardsRate}% rewards
                            </div>
                            {card.description && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {card.description}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            {scoredCard && (
                              <>
                                <div className="text-xs font-bold">{scoredCard.score.toFixed(1)}</div>
                                <div className={`text-xs ${scoredCard.eligible ? "text-green-600" : "text-red-600"}`}>
                                  {scoredCard.eligible ? "✅" : "❌"}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {searchTerm && filteredCards.length === 0 && !isLoadingCards && (
              <div className="text-center py-4 text-gray-500">
                No cards found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Selected Card Analysis */}
          {selectedCard && selectedCard.testResults && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {selectedCard.cardName}
                  </CardTitle>
                  <CardDescription>
                    {selectedCard.bank} • {selectedCard.cardType} • {selectedCard.description}
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
                              selectedCard.testResults.basicEligibility.creditScore
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {selectedCard.testResults.basicEligibility.creditScore ? "✅ Pass" : "❌ Fail"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Required: {selectedCard.creditScoreRequirement}+ | Your Range: {formData.creditScoreRange} (≈
                          {getCreditScoreValue(formData.creditScoreRange)})
                        </div>

                        <div className="flex justify-between">
                          <span>Monthly Income:</span>
                          <span
                            className={
                              selectedCard.testResults.basicEligibility.income ? "text-green-600" : "text-red-600"
                            }
                          >
                            {selectedCard.testResults.basicEligibility.income ? "✅ Pass" : "❌ Fail"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Required: ₹{selectedCard.monthlyIncomeRequirement?.toLocaleString()}+ | Your Income: ₹
                          {Number.parseInt(formData.monthlyIncome)?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>Card Type Match:</span>
                          <span
                            className={
                              selectedCard.testResults.basicEligibility.cardType ? "text-green-600" : "text-red-600"
                            }
                          >
                            {selectedCard.testResults.basicEligibility.cardType ? "✅ Pass" : "❌ Fail"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Card Type: {selectedCard.cardType} | Expected: Based on your spending categories
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
                          <span className="font-medium">{selectedCard.testResults.scoreBreakdown.rewards.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">Card Rate: {selectedCard.rewardsRate}%</div>

                        <div className="flex justify-between">
                          <span>🛍️ Category Match (30):</span>
                          <span className="font-medium">{selectedCard.testResults.scoreBreakdown.category.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Matches: {selectedCard.testResults.categoryMatch.matches.length}/{formData.spendingCategories.length} categories
                        </div>

                        <div className="flex justify-between">
                          <span>🎉 Sign-up Bonus (20):</span>
                          <span className="font-medium">{selectedCard.testResults.scoreBreakdown.signup.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Bonus: ₹{selectedCard.signUpBonus?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>💳 Joining Fee (10):</span>
                          <span className="font-medium">{selectedCard.testResults.scoreBreakdown.joining.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Fee: ₹{selectedCard.joiningFee?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>📅 Annual Fee (10):</span>
                          <span className="font-medium">{selectedCard.testResults.scoreBreakdown.annual.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Fee: ₹{selectedCard.annualFee?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>🏦 Bank Bonus (5):</span>
                          <span className="font-medium">{selectedCard.testResults.scoreBreakdown.bankBonus.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {selectedCard.testResults.bankMatch ? "Preferred bank" : "Not preferred"}
                        </div>

                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Score:</span>
                          <span>{selectedCard.testResults.compositeScore.toFixed(1)}/105</span>
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
                              {SPENDING_CATEGORIES.find((c) => c.id === cat)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Card Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(selectedCard.spendingCategories || []).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant={selectedCard.testResults.categoryMatch.matches.includes(tag) ? "default" : "secondary"}
                            >
                              {SPENDING_CATEGORIES.find((c) => c.id === tag)?.label || tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Match Rate:</span> {selectedCard.testResults.categoryMatch.matches.length}/
                      {formData.spendingCategories.length} categories (
                      {formData.spendingCategories.length > 0
                        ? ((selectedCard.testResults.categoryMatch.matches.length / formData.spendingCategories.length) * 100).toFixed(0)
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
                        <div className="font-medium">{selectedCard.bank}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Card Type:</span>
                        <div className="font-medium">{selectedCard.cardType}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Reward Rate:</span>
                        <div className="font-medium">{selectedCard.rewardsRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Sign-up Bonus:</span>
                        <div className="font-medium">₹{selectedCard.signUpBonus?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Final Verdict */}
                  <div className="mt-6 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-2">Final Verdict</h4>
                    <div className={`text-lg font-bold ${
                      selectedCard.testResults.passesThreshold && 
                      selectedCard.testResults.basicEligibility.creditScore && 
                      selectedCard.testResults.basicEligibility.income && 
                      selectedCard.testResults.basicEligibility.cardType
                        ? "text-green-600" 
                        : "text-red-600"
                    }`}>
                      {selectedCard.testResults.passesThreshold && 
                       selectedCard.testResults.basicEligibility.creditScore && 
                       selectedCard.testResults.basicEligibility.income && 
                       selectedCard.testResults.basicEligibility.cardType
                        ? "✅ ELIGIBLE" 
                        : "❌ NOT ELIGIBLE"}
                    </div>
                    <div className="text-sm mt-1">
                      {selectedCard.testResults.passesThreshold && 
                       selectedCard.testResults.basicEligibility.creditScore && 
                       selectedCard.testResults.basicEligibility.income && 
                       selectedCard.testResults.basicEligibility.cardType
                        ? `This card passes all eligibility checks and scores ${selectedCard.testResults.compositeScore.toFixed(
                            1,
                          )} points. ${
                            selectedCard.testResults.compositeScore >= 25.0
                              ? "It meets the minimum score threshold of 25.0 and will appear in recommendations."
                              : "However, it may not appear in top recommendations due to low score (below 25.0 threshold)."
                          }`
                        : `This card fails eligibility checks or score threshold.`}
                    </div>

                    {/* Show if card is in current recommendations */}
                    {selectedCard.testResults.isRecommended && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        🎯 This card is currently in your recommendations list!
                      </div>
                    )}
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
                <div className="font-bold text-lg">{allCards.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Eligible Cards:</span>
                <div className="font-bold text-lg text-green-600">{cards.filter((c) => c.eligible).length}</div>
              </div>
              <div>
                <span className="text-gray-600">In Recommendations:</span>
                <div className="font-bold text-lg text-blue-600">{cards.filter((c) => c.score >= 25.0).length}</div>
              </div>
              <div>
                <span className="text-gray-600">SBI Cards:</span>
                <div className="font-bold text-lg text-orange-600">{sbiCards.length}</div>
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
  card: any,
  userCategories: string[],
  preferredBanks: string[],
  maxValues: { rewards: number; signup: number; joining: number; annual: number },
) => {
  // 1. Rewards Rate Score (0-30 points)
  const rewardsScore = (card.rewardsRate / maxValues.rewards) * 30

  // 2. Category Match Score (0-30 points)
  const matchingCategories = (card.spendingCategories || []).filter((tag: string) => userCategories.includes(tag))
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

const checkEligibility = (card: any, formData: FormData) => {
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
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [totalCards, setTotalCards] = useState(0)
  const [showTester, setShowTester] = useState(false)
  const [allScoredCards, setAllScoredCards] = useState<ScoredCard[]>([])

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

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Fetch cards from database
      const allCards = await fetchCreditCards()
      
      if (allCards.length === 0) {
        setError("No cards found in database. Please try again later.")
        return
      }

      // Calculate max values for normalization
      const maxValues = {
        rewards: Math.max(...allCards.map((c: any) => c.rewardsRate)),
        signup: Math.max(...allCards.map((c: any) => c.signUpBonus)),
        joining: Math.max(...allCards.map((c: any) => c.joiningFee)),
        annual: Math.max(...allCards.map((c: any) => c.annualFee)),
      }

      // Score and filter all cards
      const scoredCards: ScoredCard[] = allCards.map((card: any) => {
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

      // Prioritize cards from preferred banks
      const preferredBankCards = scoredCards.filter((card) =>
        formData.preferredBanks.some((bank) => card.card.bank.toLowerCase().includes(bank.toLowerCase())),
      )
      const otherCards = scoredCards.filter(
        (card) => !formData.preferredBanks.some((bank) => card.card.bank.toLowerCase().includes(bank.toLowerCase())),
      )

      // Ensure preferred bank cards are included, even if they don't meet the score threshold
      const combinedRecommendations = [...preferredBankCards, ...topRecommendations].slice(0, 7)

      setAllScoredCards(scoredCards)
      setRecommendations(combinedRecommendations)
      setTotalCards(allCards.length)
      setUserProfile({
        monthlyIncome: Number.parseInt(formData.monthlyIncome),
        monthlySpending: Number.parseInt(formData.monthlySpending),
        creditScore: getCreditScoreValue(formData.creditScoreRange),
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
      })

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
      setError("Failed to generate recommendations. Please try again.")
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
      // In a real app, you would redirect to the card application URL
      alert(`Redirecting to application page for ${card.card.cardName}...`)
    } catch (error) {
      console.error("Error tracking card click:", error)
      // Still show the alert even if tracking fails
      alert(`Redirecting to application page for ${card.card.cardName}...`)
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎯 Enhanced Card Personalization</h1>
        <p className="text-gray-600">Get personalized credit card recommendations with our refined scoring algorithm</p>
        <p className="text-sm text-gray-500 mt-1">Data fetched live from our database!</p>
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

            {/* Spending Categories */}
            <div>
              <Label>Primary Spending Categories (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-48 overflow-y-auto">
                {SPENDING_CATEGORIES.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={formData.spendingCategories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <Label htmlFor={category.id} className="text-sm">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Banks */}
            <div>
              <Label>Preferred Banks (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-32 overflow-y-auto">
                {BANK_OPTIONS.map((bank) => (
                  <div key={bank.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={bank.id}
                      checked={formData.preferredBanks.includes(bank.id)}
                      onCheckedChange={(checked) => handleBankChange(bank.id, checked as boolean)}
                    />
                    <Label htmlFor={bank.id} className="text-sm">
                      {bank.label}
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
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                "Get Personalized Recommendations"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
                <Button onClick={() => setError(null)} variant="outline" size="sm" className="ml-4 bg-transparent">
                  Dismiss
                </Button>
              </AlertDescription>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🏆 Top Recommendations</h2>
            <Button variant="outline" onClick={() => setShowTester(true)} className="flex items-center gap-2">
              {showTester ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Show Tester ({totalCards} cards)
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Cards are ranked using our refined algorithm: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus
                  (20%) + Fees (20%). Only showing cards with score ≥ 25.0. Analyzed from {totalCards} total
                  cards fetched live from database.
                </AlertDescription>
              </div>
            </CardContent>
          </Card>

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
                        {SPENDING_CATEGORIES.find((c) => c.id === category)?.label || category}
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
      {showTester && <CardTester cards={allScoredCards} formData={formData} onClose={() => setShowTester(false)} />}
    </div>
  )
}
