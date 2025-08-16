"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CreditCard,
  Star,
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
  Filter,
  RotateCcw,
  TestTube,
  Search,
} from "lucide-react"
import { getCardRecommendationsForForm } from "@/app/actions/card-recommendation"
import {
  submitEnhancedFormData,
  trackCardApplicationClick,
  type CardApplicationClick,
} from "@/lib/google-sheets-submissions"
import { fetchCreditCards } from "@/lib/google-sheets"

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
  spendingCategories?: string[]
}

const spendingCategories = [
  { id: "dining", label: "Dining & Restaurants", icon: Utensils },
  { id: "fuel", label: "Fuel & Gas", icon: Fuel },
  { id: "groceries", label: "Groceries & Supermarkets", icon: ShoppingBag },
  { id: "travel", label: "Travel & Hotels", icon: Plane },
  { id: "shopping", label: "Online Shopping", icon: ShoppingBag },
  { id: "entertainment", label: "Entertainment & Movies", icon: Smartphone },
  { id: "utilities", label: "Utilities & Bills", icon: Zap },
  { id: "transport", label: "Transport & Commute", icon: Car },
]

// FIXED: Updated bank names to match Google Sheet data exactly
const banks = [
  "SBI", // FIXED: Changed from "SBI" to match sheet data
  "American Express", // FIXED: Changed from "American Express" to match sheet data
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "Standard Chartered",
  "Citibank",
]

export default function EnhancedPersonalization() {
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    spendingCategories: [] as string[],
    monthlySpending: "",
    currentCards: "",
    creditScore: "",
    preferredBanks: [] as string[],
    joiningFeePreference: "",
  })

  const [recommendations, setRecommendations] = useState<CardRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [clickingCard, setClickingCard] = useState<string | null>(null)
  const [showTester, setShowTester] = useState(false)
  const [allCards, setAllCards] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any[]>([])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      spendingCategories: prev.spendingCategories.includes(categoryId)
        ? prev.spendingCategories.filter((id) => id !== categoryId)
        : [...prev.spendingCategories, categoryId],
    }))
  }

  const handleBankToggle = (bank: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredBanks: prev.preferredBanks.includes(bank)
        ? prev.preferredBanks.filter((b) => b !== bank)
        : [...prev.preferredBanks, bank],
    }))
  }

  const resetForm = () => {
    setFormData({
      monthlyIncome: "",
      spendingCategories: [],
      monthlySpending: "",
      currentCards: "",
      creditScore: "",
      preferredBanks: [],
      joiningFeePreference: "",
    })
    setRecommendations([])
    setError(null)
    setTestResults([])
  }

  // NEW: Card testing function
  const runCardTester = async () => {
    try {
      console.log("🧪 Running card tester...")
      const cards = await fetchCreditCards()
      setAllCards(cards)

      // Convert form data to test criteria
      const creditScore = formData.creditScore === "750-850" ? 750 : 650
      const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 100000
      const cardType = "Cashback" // Based on spending categories

      console.log("🎯 Test criteria:", { creditScore, monthlyIncome, cardType })

      // Find specific cards to test
      const testCards = [
        "SBI Card CashBack",
        "SBI Card SimplyCLICK",
        "HDFC Millennia Credit Card",
        "ICICI Amazon Pay Credit Card",
        "Axis Bank Ace Credit Card",
      ]

      const results = testCards.map((cardName) => {
        const card = cards.find((c) => c.cardName.toLowerCase().includes(cardName.toLowerCase()))

        if (!card) {
          return {
            cardName,
            found: false,
            reason: "Card not found in database",
            eligible: false,
            score: 0,
          }
        }

        // Test basic eligibility
        const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
        const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
        const matchesType = card.cardType === cardType

        // Test bank preference
        const matchesBank = formData.preferredBanks.length === 0 || formData.preferredBanks.includes(card.bank)

        // Calculate composite score
        const maxJoiningFee = Math.max(...cards.map((c) => c.joiningFee), 1)
        const maxAnnualFee = Math.max(...cards.map((c) => c.annualFee), 1)
        const maxRewardsRate = Math.max(...cards.map((c) => c.rewardsRate), 1)
        const maxSignUpBonus = Math.max(...cards.map((c) => c.signUpBonus), 1)

        const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
        const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
        const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 25 : 0
        const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0

        const compositeScore = Math.round((joiningFeeScore + annualFeeScore + rewardsScore + bonusScore) * 100) / 100

        const basicEligible = meetsCredit && meetsIncome && matchesType
        const scoreEligible = compositeScore >= 25.0
        const bankEligible = matchesBank

        let reason = ""
        if (!basicEligible) {
          const issues = []
          if (!meetsCredit) issues.push(`Credit: Need ${card.creditScoreRequirement}, have ${creditScore}`)
          if (!meetsIncome) issues.push(`Income: Need ₹${card.monthlyIncomeRequirement}, have ₹${monthlyIncome}`)
          if (!matchesType) issues.push(`Type: Need ${cardType}, card is ${card.cardType}`)
          reason = `Basic eligibility failed: ${issues.join(", ")}`
        } else if (!scoreEligible) {
          reason = `Score too low: ${compositeScore}/100 (need ≥25.0)`
        } else if (!bankEligible) {
          reason = `Bank not preferred: ${card.bank} not in [${formData.preferredBanks.join(", ")}]`
        } else {
          reason = `✅ ELIGIBLE: Score ${compositeScore}/100, Bank: ${card.bank}`
        }

        return {
          cardName: card.cardName,
          bank: card.bank,
          cardType: card.cardType,
          found: true,
          eligible: basicEligible && scoreEligible && bankEligible,
          basicEligible,
          scoreEligible,
          bankEligible,
          score: compositeScore,
          creditReq: card.creditScoreRequirement,
          incomeReq: card.monthlyIncomeRequirement,
          joiningFee: card.joiningFee,
          annualFee: card.annualFee,
          rewardsRate: card.rewardsRate,
          reason,
        }
      })

      setTestResults(results)
      console.log("🧪 Test results:", results)
    } catch (error) {
      console.error("❌ Error running card tester:", error)
    }
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

      // For demo purposes, we'll just show an alert
      alert(`Redirecting to ${card.bank} application page for ${card.name}...`)

      // In production, you would do:
      // window.open(card.applyUrl || `https://${card.bank.toLowerCase().replace(' ', '')}.com/apply`, '_blank')
    } catch (error) {
      console.error("❌ Error tracking card application click:", error)
      // Still allow the user to proceed even if tracking fails
    } finally {
      setClickingCard(null)
    }
  }

  const fetchRecommendations = async () => {
    if (!formData.monthlyIncome || !formData.monthlySpending || !formData.creditScore) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)

    startTransition(async () => {
      try {
        // Submit form data to Google Sheets
        try {
          await submitEnhancedFormData({
            timestamp: new Date().toISOString(),
            monthlyIncome: Number.parseInt(formData.monthlyIncome),
            monthlySpending: Number.parseInt(formData.monthlySpending),
            creditScoreRange: formData.creditScore,
            currentCards: formData.currentCards,
            spendingCategories: formData.spendingCategories,
            preferredBanks: formData.preferredBanks,
            joiningFeePreference: formData.joiningFeePreference,
            submissionType: "enhanced_form",
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          })
          console.log("✅ Enhanced form data submitted to Google Sheets")
        } catch (submissionError) {
          console.error("⚠️ Failed to submit form data to Google Sheets:", submissionError)
          // Don't fail the recommendation request if submission fails
        }

        const result = await getCardRecommendationsForForm(formData)

        if (result.success) {
          setRecommendations(result.recommendations)
          // Auto-run tester after getting recommendations
          setTimeout(() => runCardTester(), 1000)
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

  const getCategoryIcon = (categoryId: string) => {
    const category = spendingCategories.find((cat) => cat.id === categoryId)
    if (!category) return <CreditCard className="h-4 w-4" />
    const IconComponent = category.icon
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Enhanced Personalization with Click Tracking
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlySpending">Monthly Credit Card Spending (₹) *</Label>
              <Input
                id="monthlySpending"
                type="number"
                value={formData.monthlySpending}
                onChange={(e) => handleInputChange("monthlySpending", e.target.value)}
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditScore">Credit Score Range *</Label>
              <Select value={formData.creditScore} onValueChange={(value) => handleInputChange("creditScore", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300-549">300-549 (Poor)</SelectItem>
                  <SelectItem value="550-649">550-649 (Fair)</SelectItem>
                  <SelectItem value="650-749">650-749 (Good)</SelectItem>
                  <SelectItem value="750-850">750-850 (Excellent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Cards */}
          <div className="space-y-2">
            <Label htmlFor="currentCards">How many credit cards do you currently have?</Label>
            <Select value={formData.currentCards} onValueChange={(value) => handleInputChange("currentCards", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No credit cards</SelectItem>
                <SelectItem value="1">1 credit card</SelectItem>
                <SelectItem value="2">2 credit cards</SelectItem>
                <SelectItem value="3">3 or more credit cards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spending Categories */}
          <div className="space-y-3">
            <Label>Primary Spending Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {spendingCategories.map((category) => {
                const IconComponent = category.icon
                const isSelected = formData.spendingCategories.includes(category.id)
                return (
                  <div
                    key={category.id}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <Checkbox checked={isSelected} onChange={() => handleCategoryToggle(category.id)} />
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-medium text-gray-900">Advanced Preferences</h4>

              <div className="space-y-2">
                <Label htmlFor="joiningFee">Joining Fee Preference</Label>
                <Select
                  value={formData.joiningFeePreference}
                  onValueChange={(value) => handleInputChange("joiningFeePreference", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_fee">No joining fee</SelectItem>
                    <SelectItem value="low_fee">Low fee (₹0-1000)</SelectItem>
                    <SelectItem value="any_amount">Any amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Banks - FIXED with exact bank names */}
              <div className="space-y-3">
                <Label>Preferred Banks (Optional)</Label>
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Bank Filter Debug:</strong> Select "SBI" and "American Express" to see cards from these
                    banks. Bank names must match exactly with the data in Google Sheets.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {banks.map((bank) => {
                    const isSelected = formData.preferredBanks.includes(bank)
                    return (
                      <div
                        key={bank}
                        className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleBankToggle(bank)}
                      >
                        <Checkbox checked={isSelected} onChange={() => handleBankToggle(bank)} />
                        <span className="text-sm">{bank}</span>
                      </div>
                    )
                  })}
                </div>
                {formData.preferredBanks.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected banks:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.preferredBanks.map((bank) => (
                        <Badge key={bank} variant="secondary" className="text-xs">
                          {bank}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button onClick={fetchRecommendations} disabled={isLoading || isPending} className="w-full" size="lg">
            {isLoading || isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Your Profile...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Get Enhanced Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Recommendations Display with Click Tracking */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Enhanced Recommendations</h2>
            <div className="flex gap-2">
              <Badge variant="secondary">{recommendations.length} cards found</Badge>
              <Button variant="outline" size="sm" onClick={() => setShowTester(!showTester)}>
                <TestTube className="h-4 w-4 mr-2" />
                {showTester ? "Hide" : "Show"} Tester
              </Button>
            </div>
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
                            Best Match
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
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Fees and Bonus */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Joining:</span>
                      <span className="ml-2 font-semibold">
                        {card.joiningFee === 0 ? "Free" : formatCurrency(card.joiningFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Annual:</span>
                      <span className="ml-2 font-semibold">
                        {card.annualFee === 0 ? "Free" : formatCurrency(card.annualFee)}
                      </span>
                    </div>
                    {card.welcomeBonus && (
                      <div>
                        <span className="text-gray-600">Welcome:</span>
                        <span className="ml-2 font-semibold text-green-600">{card.welcomeBonus}</span>
                      </div>
                    )}
                  </div>

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

                  {/* Best For Categories */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Perfect For</h4>
                    <div className="flex flex-wrap gap-2">
                      {card.bestFor.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {getCategoryIcon(category.toLowerCase())}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* NEW: Card Testing Component */}
      {showTester && testResults.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <TestTube className="h-5 w-5" />
              Card Eligibility Tester (Debug Mode)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-orange-700 mb-4">
                <strong>Test Criteria:</strong> Income: ₹{formData.monthlyIncome}, Credit Score: {formData.creditScore},
                Preferred Banks: [{formData.preferredBanks.join(", ")}], Card Type: Cashback
              </div>

              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.eligible
                      ? "border-green-200 bg-green-50"
                      : result.found
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">
                      {result.eligible ? "✅" : result.found ? "❌" : "❓"} {result.cardName}
                    </h4>
                    {result.found && (
                      <Badge variant={result.eligible ? "default" : "destructive"}>Score: {result.score}/100</Badge>
                    )}
                  </div>

                  {result.found && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                      <div>Bank: {result.bank}</div>
                      <div>Type: {result.cardType}</div>
                      <div>Credit Req: {result.creditReq}</div>
                      <div>Income Req: ₹{result.incomeReq?.toLocaleString()}</div>
                      <div>Joining Fee: ₹{result.joiningFee}</div>
                      <div>Annual Fee: ₹{result.annualFee}</div>
                      <div>Rewards: {result.rewardsRate}%</div>
                      <div className="flex gap-1">
                        <span className={result.basicEligible ? "text-green-600" : "text-red-600"}>
                          Basic: {result.basicEligible ? "✓" : "✗"}
                        </span>
                        <span className={result.scoreEligible ? "text-green-600" : "text-red-600"}>
                          Score: {result.scoreEligible ? "✓" : "✗"}
                        </span>
                        <span className={result.bankEligible ? "text-green-600" : "text-red-600"}>
                          Bank: {result.bankEligible ? "✓" : "✗"}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-700">{result.reason}</p>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={runCardTester}>
                <Search className="h-4 w-4 mr-2" />
                Re-run Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
