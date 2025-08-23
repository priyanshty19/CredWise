"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, AlertCircle, CheckCircle2, Filter, BarChart3 } from "lucide-react"
import { submitCardRecommendation } from "@/app/actions/funnel-card-recommendation"
import EnhancedRecommendations from "./enhanced-recommendations"
import { fetchCreditCards } from "@/lib/google-sheets"

interface CreditCard {
  cardName: string
  bank: string
  cardType: string
  joiningFee: number
  annualFee: number
  rewardRate: string
  category: string[]
  eligibilityIncome: number
  welcomeBonus: string
  keyFeatures: string[]
}

interface FormData {
  monthlyIncome: string
  spendingCategories: string[]
  joiningFeePreference: string
  preferredBrands: string[]
}

interface FunnelStats {
  level1Count: number
  level2Count: number
  level3Count: number
  finalCount: number
  totalCards: number
}

export default function CardRecommendationForm() {
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: "",
    spendingCategories: [],
    joiningFeePreference: "",
    preferredBrands: [],
  })

  const [recommendations, setRecommendations] = useState<any[]>([])
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [allCards, setAllCards] = useState<CreditCard[]>([])
  const [brandMismatchNotice, setBrandMismatchNotice] = useState<string>("")

  // Load credit cards data on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        const cards = await fetchCreditCards()
        setAllCards(cards)
        console.log("✅ Loaded credit cards:", cards.length)
      } catch (error) {
        console.error("❌ Error loading cards:", error)
      }
    }
    loadCards()
  }, [])

  // Update available brands when joining fee preference changes
  useEffect(() => {
    if (formData.joiningFeePreference && allCards.length > 0) {
      updateAvailableBrands()
    }
  }, [formData.joiningFeePreference, allCards])

  const updateAvailableBrands = () => {
    if (!formData.joiningFeePreference || allCards.length === 0) {
      setAvailableBrands([])
      return
    }

    // Filter cards through Level 1 (Income eligibility)
    const level1Cards = allCards.filter((card) => {
      const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 0
      const annualIncome = monthlyIncome * 12
      return annualIncome >= card.eligibilityIncome
    })

    // Filter through Level 2 (Category preference) - if categories are selected
    let level2Cards = level1Cards
    if (formData.spendingCategories.length > 0) {
      level2Cards = level1Cards.filter((card) => {
        return formData.spendingCategories.some((userCategory) =>
          card.category.some(
            (cardCategory) =>
              cardCategory.toLowerCase().includes(userCategory.toLowerCase()) ||
              userCategory.toLowerCase().includes(cardCategory.toLowerCase()),
          ),
        )
      })
    }

    // Filter through Level 3 (Joining fee preference)
    let level3Cards = level2Cards
    if (formData.joiningFeePreference !== "Any Amount") {
      const maxFee = Number.parseInt(formData.joiningFeePreference.replace(/[^\d]/g, "")) || 0
      level3Cards = level2Cards.filter((card) => card.joiningFee <= maxFee)
    }

    // Extract unique brands from filtered cards
    const brands = [...new Set(level3Cards.map((card) => card.bank))].sort()
    setAvailableBrands(brands)

    console.log("🔄 Dynamic brand filtering:", {
      joiningFeePreference: formData.joiningFeePreference,
      level1Cards: level1Cards.length,
      level2Cards: level2Cards.length,
      level3Cards: level3Cards.length,
      availableBrands: brands.length,
      brands: brands,
    })
  }

  const spendingCategories = [
    "Dining",
    "Groceries",
    "Fuel",
    "Shopping",
    "Travel",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Education",
    "Online Shopping",
  ]

  const joiningFeeOptions = ["Free", "Up to ₹500", "Up to ₹1,000", "Up to ₹2,500", "Up to ₹5,000", "Any Amount"]

  const handleSpendingCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      spendingCategories: checked
        ? [...prev.spendingCategories, category]
        : prev.spendingCategories.filter((c) => c !== category),
    }))
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredBrands: checked ? [...prev.preferredBrands, brand] : prev.preferredBrands.filter((b) => b !== brand),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setBrandMismatchNotice("")

    try {
      const result = await submitCardRecommendation(formData)

      if (result.success) {
        setRecommendations(result.recommendations || [])
        setFunnelStats(result.funnelStats || null)

        // Check for brand mismatch notice
        if (result.brandMismatchNotice) {
          setBrandMismatchNotice(result.brandMismatchNotice)
        }

        console.log("✅ Form submitted successfully:", {
          recommendationsCount: result.recommendations?.length || 0,
          funnelStats: result.funnelStats,
          brandMismatchNotice: result.brandMismatchNotice,
        })
      } else {
        console.error("❌ Form submission failed:", result.error)
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Perfect Credit Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monthly Income */}
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="e.g., 50000"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData((prev) => ({ ...prev, monthlyIncome: e.target.value }))}
                required
              />
            </div>

            {/* Spending Categories */}
            <div>
              <Label>Primary Spending Categories (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {spendingCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.spendingCategories.includes(category)}
                      onCheckedChange={(checked) => handleSpendingCategoryChange(category, checked as boolean)}
                    />
                    <Label htmlFor={category} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Joining Fee Preference */}
            <div>
              <Label htmlFor="joiningFeePreference">Joining Fee Preference</Label>
              <Select
                value={formData.joiningFeePreference}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, joiningFeePreference: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your joining fee preference" />
                </SelectTrigger>
                <SelectContent>
                  {joiningFeeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Brands - Dynamic based on joining fee */}
            {availableBrands.length > 0 && (
              <div>
                <Label>Preferred Brands (Optional - Select up to 3)</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Showing {availableBrands.length} brands available for your joining fee preference
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {availableBrands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={formData.preferredBrands.includes(brand)}
                        onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                        disabled={!formData.preferredBrands.includes(brand) && formData.preferredBrands.length >= 3}
                      />
                      <Label htmlFor={brand} className="text-sm">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.preferredBrands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.preferredBrands.map((brand) => (
                      <Badge key={brand} variant="secondary">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Your Perfect Cards...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Get TOP 7 Recommendations
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Brand Mismatch Notice */}
      {brandMismatchNotice && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{brandMismatchNotice}</AlertDescription>
        </Alert>
      )}

      {/* Funnel Visualization */}
      {funnelStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Recommendation Funnel Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{funnelStats.totalCards}</div>
                  <div className="text-sm text-gray-600">Total Cards</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{funnelStats.level1Count}</div>
                  <div className="text-sm text-gray-600">Income Eligible</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{funnelStats.level2Count}</div>
                  <div className="text-sm text-gray-600">Category Match</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{funnelStats.level3Count}</div>
                  <div className="text-sm text-gray-600">Fee Preference</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{funnelStats.finalCount}</div>
                  <div className="text-sm text-gray-600">TOP 7 Selected</div>
                </div>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Funnel Efficiency: {((funnelStats.finalCount / funnelStats.totalCards) * 100).toFixed(1)}% | MAX 7
                  ENFORCED
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your TOP 7 Personalized Recommendations</h2>
            <Badge variant="secondary">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {recommendations.length} cards found
            </Badge>
          </div>
          <EnhancedRecommendations recommendations={recommendations} />
        </div>
      )}
    </div>
  )
}
