"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Star, TrendingUp, CheckCircle } from "lucide-react"
import { getCardRecommendations, type CardRecommendation } from "@/app/actions/card-recommendation"

interface FormData {
  monthlyIncome: string
  spendingCategories: string[]
  preferredBanks: string[]
  maxAnnualFee: string
  cardType: string
}

export function CardRecommendationForm() {
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: "",
    spendingCategories: [],
    preferredBanks: [],
    maxAnnualFee: "",
    cardType: "",
  })

  const [recommendations, setRecommendations] = useState<CardRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  const spendingCategories = [
    "Online Shopping",
    "Dining",
    "Travel",
    "Groceries",
    "Fuel",
    "Entertainment",
    "Bills & Utilities",
  ]

  const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra Bank", "IndusInd Bank"]

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      spendingCategories: checked
        ? [...prev.spendingCategories, category]
        : prev.spendingCategories.filter((c) => c !== category),
    }))
  }

  const handleBankChange = (bank: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredBanks: checked ? [...prev.preferredBanks, bank] : prev.preferredBanks.filter((b) => b !== bank),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const profile = {
        monthlyIncome: Number.parseInt(formData.monthlyIncome),
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
        maxAnnualFee: Number.parseInt(formData.maxAnnualFee),
        cardType: formData.cardType,
        currentCards: [],
      }

      const result = await getCardRecommendations(profile)

      if (result.success) {
        setRecommendations(result.recommendations)
        setShowResults(true)
      } else {
        setError(result.error || "Failed to get recommendations")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your Personalized Recommendations</h2>
          </div>
          <p className="text-gray-600">Found {recommendations.length} credit cards tailored to your profile</p>
          <Button variant="outline" onClick={() => setShowResults(false)} className="mt-4">
            Modify Search
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.cardName}</CardTitle>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <p className="text-sm text-gray-600">{card.bank}</p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{card.rating}/5</span>
                  <Badge className="ml-auto bg-green-100 text-green-800">{card.matchScore}% Match</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Annual Fee:</span>
                    <div className="font-medium">{formatCurrency(card.annualFee)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Joining Fee:</span>
                    <div className="font-medium">{formatCurrency(card.joiningFee)}</div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Reward Rate:</span>
                  <div className="font-medium">{card.rewardRate}</div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Welcome Bonus:</span>
                  <div className="font-medium">{card.welcomeBonus}</div>
                </div>

                <div>
                  <span className="text-sm text-gray-600 block mb-2">Why this card:</span>
                  <div className="space-y-1">
                    {card.matchReasons.slice(0, 3).map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600 block mb-2">Best For:</span>
                  <div className="flex flex-wrap gap-1">
                    {card.bestFor.slice(0, 3).map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button className="w-full" size="sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recommendations Found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your criteria or income range to see more options.</p>
              <Button onClick={() => setShowResults(false)}>Modify Search Criteria</Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
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
              placeholder="50000"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData((prev) => ({ ...prev, monthlyIncome: e.target.value }))}
              required
            />
          </div>

          {/* Spending Categories */}
          <div>
            <Label>Primary Spending Categories (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {spendingCategories.map((category) => (
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

          {/* Preferred Banks */}
          <div>
            <Label>Preferred Banks (Optional)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {banks.map((bank) => (
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

          {/* Max Annual Fee */}
          <div>
            <Label htmlFor="maxAnnualFee">Maximum Annual Fee (₹)</Label>
            <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, maxAnnualFee: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select maximum annual fee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">₹0 (Free cards only)</SelectItem>
                <SelectItem value="1000">Up to ₹1,000</SelectItem>
                <SelectItem value="2500">Up to ₹2,500</SelectItem>
                <SelectItem value="5000">Up to ₹5,000</SelectItem>
                <SelectItem value="10000">Up to ₹10,000</SelectItem>
                <SelectItem value="25000">Up to ₹25,000</SelectItem>
                <SelectItem value="999999">Any Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Type */}
          <div>
            <Label htmlFor="cardType">Preferred Card Type</Label>
            <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, cardType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select card type preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any Type</SelectItem>
                <SelectItem value="Cashback">Cashback Cards</SelectItem>
                <SelectItem value="Rewards">Reward Points Cards</SelectItem>
                <SelectItem value="Travel">Travel Cards</SelectItem>
                <SelectItem value="Premium">Premium/Luxury Cards</SelectItem>
                <SelectItem value="Fuel">Fuel Cards</SelectItem>
                <SelectItem value="Shopping">Shopping Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding Your Perfect Cards...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Get Personalized Recommendations
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
