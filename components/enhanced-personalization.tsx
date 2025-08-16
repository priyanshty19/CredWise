"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Search, CreditCardIcon, Star, TrendingUp, Award, DollarSign, Calendar } from "lucide-react"
import {
  fetchCreditCards,
  fetchAvailableSpendingCategories,
  filterAndRankCardsWithSpendingCategories,
} from "@/lib/google-sheets"

interface Recommendation {
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
  spendingCategories: string[]
  scoreBreakdown?: {
    rewards: number
    category: number
    signup: number
    joining: number
    annual: number
    bank: number
  }
}

interface UserProfile {
  monthlyIncome: number
  monthlySpending: number
  creditScore: number
  spendingCategories: string[]
  preferredBanks: string[]
}

export default function EnhancedPersonalization() {
  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [spendingCategories, setSpendingCategories] = useState<string[]>([])
  const [monthlySpending, setMonthlySpending] = useState("")
  const [currentCards, setCurrentCards] = useState("")
  const [creditScore, setCreditScore] = useState("")
  const [preferredBanks, setPreferredBanks] = useState<string[]>([])
  const [joiningFeePreference, setJoiningFeePreference] = useState("")

  // Results state
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [totalCards, setTotalCards] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Tester state
  const [showTester, setShowTester] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allCards, setAllCards] = useState<any[]>([])
  const [filteredCards, setFilteredCards] = useState<any[]>([])
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [cardScore, setCardScore] = useState<number | null>(null)
  const [cardScoreBreakdown, setCardScoreBreakdown] = useState<any>(null)
  const [testerLoading, setTesterLoading] = useState(false)

  // Dynamic data state
  const [availableSpendingCategories, setAvailableSpendingCategories] = useState<string[]>([])
  const [availableBanks, setAvailableBanks] = useState<string[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Load dynamic data on component mount
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        setDataLoading(true)
        console.log("🔄 Loading dynamic data from database...")

        // Fetch all cards and spending categories from database
        const [cards, categories] = await Promise.all([fetchCreditCards(), fetchAvailableSpendingCategories()])

        console.log(`✅ Loaded ${cards.length} cards and ${categories.length} spending categories`)

        // Extract unique banks from cards
        const uniqueBanks = [...new Set(cards.map((card) => card.bank))].sort()

        setAllCards(cards)
        setAvailableSpendingCategories(categories)
        setAvailableBanks(uniqueBanks)

        console.log("📊 Available banks:", uniqueBanks)
        console.log("📊 Available spending categories:", categories)
      } catch (error) {
        console.error("❌ Error loading dynamic data:", error)
        setError("Failed to load card data. Please refresh the page.")
      } finally {
        setDataLoading(false)
      }
    }

    loadDynamicData()
  }, [])

  // Filter cards based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCards([])
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allCards
      .filter(
        (card) =>
          card.cardName.toLowerCase().includes(query) ||
          card.bank.toLowerCase().includes(query) ||
          card.cardType.toLowerCase().includes(query),
      )
      .slice(0, 50) // Limit to 50 results for performance

    setFilteredCards(filtered)
  }, [searchQuery, allCards])

  const handleSpendingCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSpendingCategories((prev) => [...prev, category])
    } else {
      setSpendingCategories((prev) => prev.filter((c) => c !== category))
    }
  }

  const handlePreferredBankChange = (bank: string, checked: boolean) => {
    if (checked) {
      setPreferredBanks((prev) => [...prev, bank])
    } else {
      setPreferredBanks((prev) => prev.filter((b) => b !== bank))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("🔄 Submitting form with data:", {
        monthlyIncome,
        spendingCategories,
        monthlySpending,
        currentCards,
        creditScore,
        preferredBanks,
        joiningFeePreference,
      })

      // Import the function dynamically to avoid build-time issues
      const { getCardRecommendationsForForm } = await import("@/lib/google-sheets")

      const result = await getCardRecommendationsForForm({
        monthlyIncome,
        spendingCategories,
        monthlySpending,
        currentCards,
        creditScore,
        preferredBanks,
        joiningFeePreference,
      })

      if (result.success) {
        setRecommendations(result.recommendations || [])
        setUserProfile(result.userProfile)
        setTotalCards(result.totalCards || 0)
        console.log(`✅ Generated ${result.recommendations?.length || 0} recommendations`)
      } else {
        setError(result.error || "Failed to generate recommendations")
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error)
      setError("An error occurred while generating recommendations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const testCardEligibility = async (card: any) => {
    if (!userProfile) {
      setError("Please submit the form first to test card eligibility")
      return
    }

    setTesterLoading(true)
    setSelectedCard(card)

    try {
      console.log(`🔍 Testing eligibility for: ${card.cardName}`)

      // Use the same scoring algorithm as the main recommendations
      const testResult = filterAndRankCardsWithSpendingCategories(
        [card], // Test just this one card
        {
          creditScore: userProfile.creditScore,
          monthlyIncome: userProfile.monthlyIncome,
          cardType: card.cardType,
          spendingCategories: userProfile.spendingCategories,
          preferredBanks: userProfile.preferredBanks,
        },
        1,
      )

      if (testResult.length > 0) {
        const scoredCard = testResult[0]
        setCardScore(scoredCard.compositeScore || 0)
        setCardScoreBreakdown(scoredCard.scoreBreakdown)
        console.log(`✅ Card score: ${scoredCard.compositeScore}/100`)
      } else {
        setCardScore(0)
        setCardScoreBreakdown(null)
        console.log(`❌ Card not eligible`)
      }
    } catch (error) {
      console.error("❌ Error testing card:", error)
      setError("Failed to test card eligibility")
    } finally {
      setTesterLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Loading card data from database...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fetching live card information and spending categories
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Enhanced Credit Card Recommendations</h1>
        <p className="text-muted-foreground">
          Get personalized recommendations with NEW scoring algorithm (Rewards 30% + Categories 30% + Bank Match 5%)
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Live data from {totalCards > 0 ? totalCards : allCards.length} cards • {availableSpendingCategories.length}{" "}
          spending categories • {availableBanks.length} banks
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="e.g., 75000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="monthlySpending">Monthly Spending (₹)</Label>
                <Input
                  id="monthlySpending"
                  type="number"
                  placeholder="e.g., 25000"
                  value={monthlySpending}
                  onChange={(e) => setMonthlySpending(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="creditScore">Credit Score Range</Label>
              <Select value={creditScore} onValueChange={setCreditScore} required>
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

            <div>
              <Label>Spending Categories (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {availableSpendingCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={spendingCategories.includes(category)}
                      onCheckedChange={(checked) => handleSpendingCategoryChange(category, checked as boolean)}
                    />
                    <Label htmlFor={category} className="text-sm capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Preferred Banks (Select for 5-point bonus)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {availableBanks.map((bank) => (
                  <div key={bank} className="flex items-center space-x-2">
                    <Checkbox
                      id={bank}
                      checked={preferredBanks.includes(bank)}
                      onCheckedChange={(checked) => handlePreferredBankChange(bank, checked as boolean)}
                    />
                    <Label htmlFor={bank} className="text-sm">
                      {bank}
                    </Label>
                  </div>
                ))}
              </div>
              {preferredBanks.length > 0 && (
                <p className="text-sm text-green-600 mt-2">✅ Cards from selected banks will receive +5 bonus points</p>
              )}
            </div>

            <div>
              <Label htmlFor="currentCards">Current Credit Cards (Optional)</Label>
              <Textarea
                id="currentCards"
                placeholder="List your current credit cards..."
                value={currentCards}
                onChange={(e) => setCurrentCards(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="joiningFeePreference">Joining Fee Preference</Label>
              <Select value={joiningFeePreference} onValueChange={setJoiningFeePreference} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select joining fee preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (₹0)</SelectItem>
                  <SelectItem value="low">Low (₹1-500)</SelectItem>
                  <SelectItem value="medium">Medium (₹501-2500)</SelectItem>
                  <SelectItem value="any">Any Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                "Get Personalized Recommendations"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Personalized Recommendations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on NEW scoring algorithm: Rewards (30%) + Categories (30%) + Sign-up Bonus (20%) + Joining Fee
                (10%) + Annual Fee (5%) + Bank Match (5%)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recommendations.map((card, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{card.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{card.bank}</Badge>
                            <Badge variant="outline" className="capitalize">
                              {card.type}
                            </Badge>
                            {preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())) && (
                              <Badge variant="default" className="bg-green-600">
                                Preferred Bank +5
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{card.score}/100</div>
                          <div className="text-sm text-muted-foreground">Composite Score</div>
                        </div>
                      </div>

                      {card.scoreBreakdown && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Score Breakdown:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div>🎁 Rewards: {card.scoreBreakdown.rewards.toFixed(1)}/30</div>
                            <div>🛍️ Categories: {card.scoreBreakdown.category.toFixed(1)}/30</div>
                            <div>🎉 Sign-up: {card.scoreBreakdown.signup.toFixed(1)}/20</div>
                            <div>💳 Joining Fee: {card.scoreBreakdown.joining.toFixed(1)}/10</div>
                            <div>📅 Annual Fee: {card.scoreBreakdown.annual.toFixed(1)}/5</div>
                            <div>🏦 Bank Match: {card.scoreBreakdown.bank}/5</div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">{card.rewardRate}</div>
                            <div className="text-sm text-muted-foreground">Reward Rate</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="font-medium">{card.welcomeBonus || "No bonus"}</div>
                            <div className="text-sm text-muted-foreground">Welcome Bonus</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">₹{card.joiningFee.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Joining Fee</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <div>
                            <div className="font-medium">₹{card.annualFee.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Annual Fee</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Key Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {card.keyFeatures.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {card.bestFor.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Best For:</h4>
                          <div className="flex flex-wrap gap-2">
                            {card.bestFor.map((category, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs capitalize">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{card.reasoning}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Card Eligibility Tester
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Search and test any card from our database of {allCards.length} cards
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => setShowTester(!showTester)} variant="outline" className="w-full">
                  {showTester ? "Hide Tester" : "Show Tester"}
                </Button>

                {showTester && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardSearch">Search for a card</Label>
                      <Input
                        id="cardSearch"
                        type="text"
                        placeholder="Type card name, bank, or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {searchQuery && filteredCards.length > 0 && (
                      <div className="max-h-96 overflow-y-auto border rounded-lg">
                        {filteredCards.map((card) => (
                          <div
                            key={card.id}
                            className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => testCardEligibility(card)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{card.cardName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {card.bank}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {card.cardType}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {card.rewardsRate}% rewards • ₹{card.joiningFee} joining • ₹{card.annualFee} annual
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                Test
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchQuery && filteredCards.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No cards found matching "{searchQuery}"</p>
                    )}

                    {selectedCard && (
                      <Card className="border-2 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{selectedCard.cardName}</span>
                            {testerLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              cardScore !== null && (
                                <Badge
                                  variant={cardScore >= 25 ? "default" : "destructive"}
                                  className="text-lg px-3 py-1"
                                >
                                  {cardScore.toFixed(1)}/100
                                </Badge>
                              )
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="font-medium">{selectedCard.bank}</div>
                              <div className="text-sm text-muted-foreground">Bank</div>
                            </div>
                            <div>
                              <div className="font-medium">{selectedCard.cardType}</div>
                              <div className="text-sm text-muted-foreground">Type</div>
                            </div>
                            <div>
                              <div className="font-medium">{selectedCard.rewardsRate}%</div>
                              <div className="text-sm text-muted-foreground">Rewards</div>
                            </div>
                            <div>
                              <div className="font-medium">₹{selectedCard.joiningFee}</div>
                              <div className="text-sm text-muted-foreground">Joining Fee</div>
                            </div>
                          </div>

                          {cardScoreBreakdown && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">NEW Algorithm Score Breakdown:</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                <div>🎁 Rewards: {cardScoreBreakdown.rewards.toFixed(1)}/30</div>
                                <div>🛍️ Categories: {cardScoreBreakdown.category.toFixed(1)}/30</div>
                                <div>🎉 Sign-up: {cardScoreBreakdown.signup.toFixed(1)}/20</div>
                                <div>💳 Joining Fee: {cardScoreBreakdown.joining.toFixed(1)}/10</div>
                                <div>📅 Annual Fee: {cardScoreBreakdown.annual.toFixed(1)}/5</div>
                                <div>🏦 Bank Match: {cardScoreBreakdown.bank}/5</div>
                              </div>
                            </div>
                          )}

                          {cardScore !== null && (
                            <div
                              className={`mt-4 p-3 rounded-lg ${cardScore >= 25 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                            >
                              <p className="font-medium">
                                {cardScore >= 25
                                  ? `✅ Eligible - Score: ${cardScore.toFixed(1)}/100 (≥25.0 threshold)`
                                  : `❌ Not Eligible - Score: ${cardScore.toFixed(1)}/100 (<25.0 threshold)`}
                              </p>
                              {preferredBanks.some((bank) =>
                                selectedCard.bank.toLowerCase().includes(bank.toLowerCase()),
                              ) && <p className="text-sm mt-1">🏦 This card received a +5 bank preference bonus!</p>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
