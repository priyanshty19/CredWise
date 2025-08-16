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
} from "lucide-react"
import { getCardRecommendationsForForm } from "@/app/actions/card-recommendation"
import { submitEnhancedFormData } from "@/lib/google-sheets-submissions"

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

const banks = [
  "HDFC Bank",
  "ICICI Bank",
  "SBI",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "Standard Chartered",
  "Citibank",
  "American Express",
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
              Enhanced Personalization
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
                placeholder="50000"
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

              {/* Preferred Banks */}
              <div className="space-y-3">
                <Label>Preferred Banks (Optional)</Label>
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

      {/* Recommendations Display */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Enhanced Recommendations</h2>
            <Badge variant="secondary">{recommendations.length} cards found</Badge>
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

                  {/* Apply Button */}
                  <Button className="w-full" size="lg">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply for {card.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
