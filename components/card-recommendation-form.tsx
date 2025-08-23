"use client"

import { useState, useEffect } from "react"
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
  Utensils,
  Fuel,
  ShoppingBag,
  Plane,
  Smartphone,
  Zap,
  Car,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import EnhancedRecommendations from "./enhanced-recommendations"
import { fetchAvailableSpendingCategories } from "@/lib/google-sheets"

// Icon mapping for spending categories
const categoryIcons: { [key: string]: any } = {
  dining: Utensils,
  fuel: Fuel,
  groceries: ShoppingBag,
  travel: Plane,
  shopping: ShoppingBag,
  entertainment: Smartphone,
  utilities: Zap,
  transport: Car,
  // Add more mappings as needed
}

// Updated banks list from the provided data
const banks = [
  "SBI",
  "PNB",
  "Bank Of Baroda",
  "Canara Bank",
  "Indian Bank",
  "Union Bank",
  "Central Bank",
  "BOI",
  "IOB",
  "HDFC",
  "ICICI Bank",
  "Axis Bank",
  "Kotak",
  "Yes Bank",
  "FIRST",
  "RBL",
  "Induslnd Bank",
  "SIB",
  "Citi",
  "Standard Chartered",
  "HSBC",
  "Barclays",
  "Bajaj",
  "Tata",
  "Slice",
  "Uni",
  "Jupiter",
  "Niyo",
  "Federal",
  "American Express",
]

export default function CardRecommendationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [availableSpendingCategories, setAvailableSpendingCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    spendingCategories: [] as string[],
    monthlySpending: "",
    currentCards: "",
    creditScore: "",
    preferredBanks: [] as string[],
    joiningFeePreference: "",
  })
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Fetch available spending categories from Google Sheets on component mount
  useEffect(() => {
    const loadSpendingCategories = async () => {
      try {
        console.log("🔄 Loading spending categories from Google Sheets...")
        setLoadingCategories(true)
        const categories = await fetchAvailableSpendingCategories()
        console.log("✅ Loaded spending categories:", categories)
        setAvailableSpendingCategories(categories)
      } catch (error) {
        console.error("❌ Error loading spending categories:", error)
        // Fallback to default categories if loading fails
        setAvailableSpendingCategories([
          "dining",
          "fuel",
          "groceries",
          "travel",
          "shopping",
          "entertainment",
          "utilities",
          "transport",
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    loadSpendingCategories()
  }, [])

  // Create spending category objects with icons and labels
  const spendingCategories = availableSpendingCategories.map((category) => {
    const normalizedCategory = category.toLowerCase()
    return {
      id: normalizedCategory,
      label: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
      icon: categoryIcons[normalizedCategory] || ShoppingBag, // Default icon if not found
    }
  })

  const handleInputChange = (field: string, value: string) => {
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
    setFormData((prev) => {
      const currentBanks = prev.preferredBanks

      // If bank is already selected, remove it
      if (currentBanks.includes(bank)) {
        return {
          ...prev,
          preferredBanks: currentBanks.filter((b) => b !== bank),
        }
      }

      // If less than 3 banks selected, add it
      if (currentBanks.length < 3) {
        return {
          ...prev,
          preferredBanks: [...currentBanks, bank],
        }
      }

      // If 3 banks already selected, don't add more
      return prev
    })
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setShowRecommendations(true)
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.monthlyIncome && formData.monthlySpending && formData.creditScore
      case 2:
        return formData.spendingCategories.length > 0
      case 3:
        return true // Optional step
      default:
        return false
    }
  }

  if (showRecommendations) {
    return <EnhancedRecommendations formData={formData} />
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? "bg-blue-600 text-white"
                  : step < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {step < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step}
            </div>
            {step < 3 && <div className={`w-12 h-1 mx-2 ${step < currentStep ? "bg-green-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            {currentStep === 1 && "Basic Financial Information"}
            {currentStep === 2 && "Spending Preferences"}
            {currentStep === 3 && "Additional Preferences"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score Range *</Label>
                <Select value={formData.creditScore} onValueChange={(value) => handleInputChange("creditScore", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your credit score range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300-549">300-549 (Poor)</SelectItem>
                    <SelectItem value="550-649">550-649 (Fair)</SelectItem>
                    <SelectItem value="650-749">650-749 (Good)</SelectItem>
                    <SelectItem value="750-850">750-850 (Excellent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCards">How many credit cards do you currently have?</Label>
                <Select
                  value={formData.currentCards}
                  onValueChange={(value) => handleInputChange("currentCards", value)}
                >
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
            </div>
          )}

          {/* Step 2: Spending Categories */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  What are your primary spending categories? (Select all that apply)
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  This helps us recommend cards with the best rewards for your spending patterns.
                </p>
                {loadingCategories && (
                  <p className="text-sm text-blue-600 mt-2">Loading spending categories from your data...</p>
                )}
              </div>

              {!loadingCategories && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {spendingCategories.map((category) => {
                    const IconComponent = category.icon
                    const isSelected = formData.spendingCategories.includes(category.id)
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        <Checkbox checked={isSelected} onChange={() => handleCategoryToggle(category.id)} />
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{category.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {formData.spendingCategories.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.spendingCategories.map((categoryId) => {
                      const category = spendingCategories.find((cat) => cat.id === categoryId)
                      return (
                        <Badge key={categoryId} variant="secondary">
                          {category?.label || categoryId}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Additional Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Additional Preferences (Optional)</Label>
                <p className="text-sm text-gray-600 mt-1">These preferences help us fine-tune your recommendations.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningFee">Joining Fee Preference</Label>
                <Select
                  value={formData.joiningFeePreference}
                  onValueChange={(value) => handleInputChange("joiningFeePreference", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_fee">I prefer cards with no joining fee</SelectItem>
                    <SelectItem value="low_fee">I'm okay with low joining fees (₹0-1000)</SelectItem>
                    <SelectItem value="any_amount">Joining fee is not a concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label>Preferred Brands (Optional)</Label>
                  <Badge variant="outline" className="text-xs">
                    Max 3 selections
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Select up to 3 brands you prefer or have existing relationships with.
                </p>

                {/* Selection limit warning */}
                {formData.preferredBanks.length >= 3 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You've reached the maximum of 3 brand selections. Unselect a brand to choose a different one.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {banks.map((bank) => {
                    const isSelected = formData.preferredBanks.includes(bank)
                    const isDisabled = !isSelected && formData.preferredBanks.length >= 3

                    return (
                      <div
                        key={bank}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isDisabled
                              ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => !isDisabled && handleBankToggle(bank)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && handleBankToggle(bank)}
                        />
                        <span className={`text-sm font-medium ${isDisabled ? "text-gray-400" : ""}`}>{bank}</span>
                      </div>
                    )
                  })}
                </div>

                {formData.preferredBanks.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected brands ({formData.preferredBanks.length}/3):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferredBanks.map((bank) => (
                        <Badge key={bank} variant="secondary" className="flex items-center gap-1">
                          {bank}
                          <button
                            onClick={() => handleBankToggle(bank)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            aria-label={`Remove ${bank}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button onClick={nextStep} disabled={!isStepValid(currentStep)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(1) || !isStepValid(2)}
                className="bg-green-600 hover:bg-green-700"
              >
                Get My Recommendations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
