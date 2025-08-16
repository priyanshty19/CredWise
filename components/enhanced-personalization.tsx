"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CreditCard, TrendingUp, Building2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitEnhancedFormData, trackCardApplicationClick } from "@/lib/google-sheets-submissions"

// Enhanced card data with refined scoring algorithm
const ENHANCED_CARD_DATA = [
  {
    id: "sbi-cashback",
    name: "SBI Card CashBack",
    bank: "SBI",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 999,
    rewardRate: 5.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["fuel", "grocery", "dining", "online_shopping"],
    description: "5% cashback on fuel, grocery & dining",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-card-cashback.page",
  },
  {
    id: "hdfc-millennia",
    name: "HDFC Bank Millennia Credit Card",
    bank: "HDFC Bank",
    cardType: "Cashback",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.5,
    signupBonus: 1000,
    minCreditScore: 700,
    minIncome: 25000,
    tags: ["online_shopping", "dining"],
    description: "2.5% cashback on online spends",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card",
  },
  {
    id: "icici-amazon-pay",
    name: "Amazon Pay ICICI Bank Credit Card",
    bank: "ICICI Bank",
    cardType: "Cashback",
    joiningFee: 0,
    annualFee: 500,
    rewardRate: 5.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["online_shopping", "amazon"],
    description: "5% cashback on Amazon purchases",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card",
  },
  {
    id: "axis-ace",
    name: "Axis Bank ACE Credit Card",
    bank: "Axis Bank",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 4.0,
    signupBonus: 500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["bill_payments", "online_shopping"],
    description: "4% cashback on bill payments",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/ace-credit-card",
  },
  {
    id: "sbi-prime",
    name: "SBI Card PRIME",
    bank: "SBI",
    cardType: "Rewards",
    joiningFee: 2999,
    annualFee: 2999,
    rewardRate: 3.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["dining", "movies", "grocery"],
    description: "10X reward points on dining & movies",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/rewards/sbi-card-prime.page",
  },
  {
    id: "hdfc-regalia",
    name: "HDFC Bank Regalia Credit Card",
    bank: "HDFC Bank",
    cardType: "Premium",
    joiningFee: 2500,
    annualFee: 2500,
    rewardRate: 2.0,
    signupBonus: 10000,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "dining", "shopping"],
    description: "4X reward points on dining, shopping & travel",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card",
  },
  {
    id: "amex-gold",
    name: "American Express Gold Card",
    bank: "American Express",
    cardType: "Premium",
    joiningFee: 4500,
    annualFee: 4500,
    rewardRate: 2.0,
    signupBonus: 20000,
    minCreditScore: 750,
    minIncome: 60000,
    tags: ["travel", "dining", "shopping"],
    description: "4X Membership Rewards points on dining & travel",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/gold-card/",
  },
]

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
  card: (typeof ENHANCED_CARD_DATA)[0]
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
  const [selectedCardId, setSelectedCardId] = useState<string>("")
  const [selectedCard, setSelectedCard] = useState<ScoredCard | null>(null)

  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId)
    const card = cards.find((c) => c.card.id === cardId)
    setSelectedCard(card || null)
  }

  const sbiCards = cards.filter((c) => c.card.bank === "SBI")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              SBI Cards Overview ({sbiCards.length} cards)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sbiCards.map((scoredCard) => (
                <div key={scoredCard.card.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <div>
                    <span className="font-medium">{scoredCard.card.name}</span>
                    <div className="text-sm text-gray-600">
                      {scoredCard.card.rewardRate}% • ₹{scoredCard.card.joiningFee} joining
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{scoredCard.score.toFixed(1)}</div>
                    <div className={`text-sm ${scoredCard.eligible ? "text-green-600" : "text-red-600"}`}>
                      {scoredCard.eligible ? "✅ Eligible" : "❌ Not Eligible"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Selector */}
          <div className="mb-6">
            <Label htmlFor="card-select">Select a card to analyze:</Label>
            <Select value={selectedCardId} onValueChange={handleCardSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a card to test..." />
              </SelectTrigger>
              <SelectContent>
                {cards.map((scoredCard) => (
                  <SelectItem key={scoredCard.card.id} value={scoredCard.card.id}>
                    {scoredCard.card.name} - Score: {scoredCard.score.toFixed(1)} (
                    {scoredCard.eligible ? "✅ Eligible" : "❌ Not Eligible"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Card Analysis */}
          {selectedCard && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {selectedCard.card.name}
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
                              getCreditScoreValue(formData.creditScoreRange) >= selectedCard.card.minCreditScore
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {getCreditScoreValue(formData.creditScoreRange) >= selectedCard.card.minCreditScore
                              ? "✅ Pass"
                              : "❌ Fail"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Income:</span>
                          <span
                            className={
                              Number.parseInt(formData.monthlyIncome) >= selectedCard.card.minIncome
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {Number.parseInt(formData.monthlyIncome) >= selectedCard.card.minIncome
                              ? "✅ Pass"
                              : "❌ Fail"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Card Type Match:</span>
                          <span className="text-green-600">✅ Pass</span>
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
                        <div className="flex justify-between">
                          <span>🛍️ Category Match (30):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.category.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🎉 Sign-up Bonus (20):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.signup.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💳 Joining Fee (10):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.joining.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>📅 Annual Fee (10):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.annual.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🏦 Bank Bonus (5):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.bank.toFixed(1)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Score:</span>
                          <span>{selectedCard.score.toFixed(1)}/105</span>
                        </div>
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
                          {selectedCard.card.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant={selectedCard.categoryMatches.includes(tag) ? "default" : "secondary"}
                            >
                              {SPENDING_CATEGORIES.find((c) => c.id === tag)?.label || tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Match Rate:</span> {selectedCard.categoryMatches.length}/
                      {formData.spendingCategories.length} categories (
                      {((selectedCard.categoryMatches.length / formData.spendingCategories.length) * 100).toFixed(0)}%)
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
                              ? "It meets the minimum score threshold of 25.0."
                              : "However, it may not appear in top recommendations due to low score."
                          }`
                        : `This card fails eligibility: ${selectedCard.eligibilityReasons.join(", ")}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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

  const calculateRefinedScore = (
    card: (typeof ENHANCED_CARD_DATA)[0],
    userCategories: string[],
    preferredBanks: string[],
    maxValues: { rewards: number; signup: number; joining: number; annual: number },
  ) => {
    // 1. Rewards Rate Score (0-30 points)
    const rewardsScore = (card.rewardRate / maxValues.rewards) * 30

    // 2. Category Match Score (0-30 points)
    const matchingCategories = card.tags.filter((tag) => userCategories.includes(tag))
    const categoryScore = userCategories.length > 0 ? (matchingCategories.length / userCategories.length) * 30 : 0

    // 3. Sign-up Bonus Score (0-20 points)
    const signupScore = (card.signupBonus / maxValues.signup) * 20

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

  const checkEligibility = (card: (typeof ENHANCED_CARD_DATA)[0], formData: FormData) => {
    const reasons: string[] = []
    let eligible = true

    // Credit score check
    const creditScore = getCreditScoreValue(formData.creditScoreRange)
    if (creditScore < card.minCreditScore) {
      eligible = false
      reasons.push(`Credit score too low (need ${card.minCreditScore}+)`)
    }

    // Income check
    const income = Number.parseInt(formData.monthlyIncome)
    if (income < card.minIncome) {
      eligible = false
      reasons.push(`Income too low (need ₹${card.minIncome}+)`)
    }

    return { eligible, reasons }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Calculate max values for normalization
      const maxValues = {
        rewards: Math.max(...ENHANCED_CARD_DATA.map((c) => c.rewardRate)),
        signup: Math.max(...ENHANCED_CARD_DATA.map((c) => c.signupBonus)),
        joining: Math.max(...ENHANCED_CARD_DATA.map((c) => c.joiningFee)),
        annual: Math.max(...ENHANCED_CARD_DATA.map((c) => c.annualFee)),
      }

      // Score and filter all cards
      const scoredCards: ScoredCard[] = ENHANCED_CARD_DATA.map((card) => {
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

      setAllScoredCards(scoredCards)
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
        cardName: card.card.name,
        bankName: card.card.bank,
        cardType: card.card.cardType,
        joiningFee: card.card.joiningFee,
        annualFee: card.card.annualFee,
        rewardRate: `${card.card.rewardRate}%`,
        submissionType: "card_application_click",
        userAgent: navigator.userAgent,
        sessionId: `session_${Date.now()}`,
      }

      await trackCardApplicationClick(clickData)
      window.open(card.card.applyUrl, "_blank")
    } catch (error) {
      console.error("Error tracking card click:", error)
      // Still open the link even if tracking fails
      window.open(card.card.applyUrl, "_blank")
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎯 Enhanced Card Personalization</h1>
        <p className="text-gray-600">Get personalized credit card recommendations with our refined scoring algorithm</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
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
              Show Tester
            </Button>
          </div>

          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Cards are ranked using our refined algorithm: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus
              (20%) + Fees (20%). Only showing cards with score ≥ 25.0.
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
                        <h3 className="text-xl font-bold">{scoredCard.card.name}</h3>
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
                      <div className="font-bold text-green-600">{scoredCard.card.rewardRate}%</div>
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
                      <div className="font-bold text-orange-600">₹{scoredCard.card.signupBonus}</div>
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
      {showTester && allScoredCards.length > 0 && (
        <CardTester cards={allScoredCards} formData={formData} onClose={() => setShowTester(false)} />
      )}
    </div>
  )
}
