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

// Enhanced card data with refined scoring algorithm - ALL AVAILABLE CARDS
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
    id: "sbi-simplyclick",
    name: "SBI Card SimplyCLICK",
    bank: "SBI",
    cardType: "Cashback",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 10.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["online_shopping", "dining"],
    description: "10X reward points on online spends",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-card-simplyclick.page",
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
    id: "sbi-elite",
    name: "SBI Card ELITE",
    bank: "SBI",
    cardType: "Premium",
    joiningFee: 4999,
    annualFee: 4999,
    rewardRate: 2.0,
    signupBonus: 10000,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium lifestyle benefits with travel rewards",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/premium/sbi-card-elite.page",
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
    id: "hdfc-infinia",
    name: "HDFC Bank Infinia Credit Card",
    bank: "HDFC Bank",
    cardType: "Super Premium",
    joiningFee: 12500,
    annualFee: 12500,
    rewardRate: 3.3,
    signupBonus: 25000,
    minCreditScore: 800,
    minIncome: 200000,
    tags: ["travel", "dining", "shopping", "luxury"],
    description: "Ultra-premium card with unlimited airport lounge access",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia-credit-card",
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
    id: "icici-platinum",
    name: "ICICI Bank Platinum Credit Card",
    bank: "ICICI Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["dining", "shopping", "fuel"],
    description: "2X reward points on dining and shopping",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/platinum-credit-card",
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
    id: "axis-magnus",
    name: "Axis Bank Magnus Credit Card",
    bank: "Axis Bank",
    cardType: "Premium",
    joiningFee: 12500,
    annualFee: 12500,
    rewardRate: 2.4,
    signupBonus: 25000,
    minCreditScore: 750,
    minIncome: 150000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium travel and lifestyle benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/magnus-credit-card",
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
  {
    id: "amex-platinum",
    name: "American Express Platinum Card",
    bank: "American Express",
    cardType: "Super Premium",
    joiningFee: 60000,
    annualFee: 60000,
    rewardRate: 1.8,
    signupBonus: 80000,
    minCreditScore: 800,
    minIncome: 250000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-luxury card with exclusive privileges",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/platinum-card/",
  },
  {
    id: "kotak-811",
    name: "Kotak 811 #Dream Different Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Entry Level",
    joiningFee: 0,
    annualFee: 500,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 600,
    minIncome: 15000,
    tags: ["fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/811-credit-card.html",
  },
  {
    id: "yes-first-exclusive",
    name: "YES FIRST Exclusive Credit Card",
    bank: "YES Bank",
    cardType: "Premium",
    joiningFee: 2999,
    annualFee: 2999,
    rewardRate: 3.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["dining", "movies", "fuel"],
    description: "6X reward points on dining and movies",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-first-exclusive",
  },
  {
    id: "indusind-legend",
    name: "IndusInd Bank Legend Credit Card",
    bank: "IndusInd Bank",
    cardType: "Super Premium",
    joiningFee: 10000,
    annualFee: 10000,
    rewardRate: 3.0,
    signupBonus: 15000,
    minCreditScore: 750,
    minIncome: 100000,
    tags: ["travel", "dining", "shopping", "golf"],
    description: "Luxury lifestyle card with golf privileges",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/legend.html",
  },
  {
    id: "standard-chartered-manhattan",
    name: "Standard Chartered Manhattan Credit Card",
    bank: "Standard Chartered",
    cardType: "Premium",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 5.0,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["dining", "shopping", "entertainment"],
    description: "5X reward points on dining and entertainment",
    applyUrl: "https://www.sc.com/in/credit-cards/manhattan-credit-card/",
  },
  {
    id: "citibank-rewards",
    name: "Citi Rewards Credit Card",
    bank: "Citibank",
    cardType: "Rewards",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2500,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["dining", "movies", "departmental_stores"],
    description: "10X reward points on dining and movies",
    applyUrl: "https://www.online.citibank.co.in/products-services/credit-cards/citi-rewards-card",
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
  { id: "luxury", label: "Luxury & Premium Services" },
  { id: "concierge", label: "Concierge Services" },
  { id: "golf", label: "Golf & Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "departmental_stores", label: "Departmental Stores" },
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
    // Find the card from ALL cards, not just scored cards
    let card = cards.find((c) => c.card.id === cardId)

    // If not found in scored cards, create a scored version from raw data
    if (!card) {
      const rawCard = ENHANCED_CARD_DATA.find((c) => c.id === cardId)
      if (rawCard) {
        // Calculate score for this card
        const maxValues = {
          rewards: Math.max(...ENHANCED_CARD_DATA.map((c) => c.rewardRate)),
          signup: Math.max(...ENHANCED_CARD_DATA.map((c) => c.signupBonus)),
          joining: Math.max(...ENHANCED_CARD_DATA.map((c) => c.joiningFee)),
          annual: Math.max(...ENHANCED_CARD_DATA.map((c) => c.annualFee)),
        }

        const eligibility = checkEligibility(rawCard, formData)
        const scoring = calculateRefinedScore(rawCard, formData.spendingCategories, formData.preferredBanks, maxValues)

        card = {
          card: rawCard,
          score: scoring.total,
          scoreBreakdown: scoring.breakdown,
          eligible: eligibility.eligible,
          eligibilityReasons: eligibility.reasons,
          categoryMatches: scoring.categoryMatches,
        }
      }
    }

    setSelectedCard(card || null)
  }

  const sbiCards = cards.filter((c) => c.card.bank === "SBI")
  const allSbiCards = ENHANCED_CARD_DATA.filter((c) => c.bank === "SBI")

  // Group cards by bank for better organization
  const cardsByBank = ENHANCED_CARD_DATA.reduce(
    (acc, card) => {
      if (!acc[card.bank]) {
        acc[card.bank] = []
      }
      acc[card.bank].push(card)
      return acc
    },
    {} as Record<string, typeof ENHANCED_CARD_DATA>,
  )

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
              SBI Cards Overview ({allSbiCards.length} cards available)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allSbiCards.map((card) => {
                const scoredCard = cards.find((c) => c.card.id === card.id)
                return (
                  <div key={card.id} className="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <span className="font-medium">{card.name}</span>
                      <div className="text-sm text-gray-600">
                        {card.rewardRate}% • ₹{card.joiningFee} joining • {card.cardType}
                      </div>
                    </div>
                    <div className="text-right">
                      {scoredCard ? (
                        <>
                          <div className="font-bold text-lg">{scoredCard.score.toFixed(1)}</div>
                          <div className={`text-sm ${scoredCard.eligible ? "text-green-600" : "text-red-600"}`}>
                            {scoredCard.eligible ? "✅ Eligible" : "❌ Not Eligible"}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">Not scored</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card Selector - ALL CARDS */}
          <div className="mb-6">
            <Label htmlFor="card-select">
              Select any card to analyze (All {ENHANCED_CARD_DATA.length} cards available):
            </Label>
            <Select value={selectedCardId} onValueChange={handleCardSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose any card to test..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(cardsByBank).map(([bank, bankCards]) => (
                  <div key={bank}>
                    <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-100">
                      {bank} ({bankCards.length} cards)
                    </div>
                    {bankCards.map((card) => {
                      const scoredCard = cards.find((c) => c.card.id === card.id)
                      return (
                        <SelectItem key={card.id} value={card.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{card.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {card.cardType} • {card.rewardRate}%
                              {scoredCard && (
                                <span className={scoredCard.eligible ? "text-green-600" : "text-red-600"}>
                                  {" "}
                                  • {scoredCard.eligible ? "✅" : "❌"}
                                </span>
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </div>
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
                        <div className="text-xs text-gray-600">
                          Required: {selectedCard.card.minCreditScore}+ | Your Range: {formData.creditScoreRange} (≈
                          {getCreditScoreValue(formData.creditScoreRange)})
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
                        <div className="text-xs text-gray-600">
                          Required: ₹{selectedCard.card.minIncome?.toLocaleString()}+ | Your Income: ₹
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
                        <div className="text-xs text-gray-600">Card Rate: {selectedCard.card.rewardRate}%</div>

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
                          Bonus: ₹{selectedCard.card.signupBonus?.toLocaleString()}
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
                        <div className="font-medium">{selectedCard.card.rewardRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Sign-up Bonus:</span>
                        <div className="font-medium">₹{selectedCard.card.signupBonus?.toLocaleString()}</div>
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

                    {/* Show if card is in current recommendations */}
                    {cards.some((c) => c.card.id === selectedCard.card.id) && (
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
                <div className="font-bold text-lg">{ENHANCED_CARD_DATA.length}</div>
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
                <div className="font-bold text-lg text-orange-600">{allSbiCards.length}</div>
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
              Show Tester ({ENHANCED_CARD_DATA.length} cards)
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
      {showTester && <CardTester cards={allScoredCards} formData={formData} onClose={() => setShowTester(false)} />}
    </div>
  )
}
