"use server"

import { GoogleSheetsService } from "@/lib/google-sheets-service-account"

export interface CardRecommendation {
  cardName: string
  bank: string
  cardType: string
  annualFee: number
  joiningFee: number
  rewardRate: string
  welcomeBonus: string
  keyFeatures: string[]
  bestFor: string[]
  rating: number
  matchScore: number
  matchReasons: string[]
}

export interface UserProfile {
  monthlyIncome: number
  spendingCategories: string[]
  preferredBanks: string[]
  maxAnnualFee: number
  cardType: string
  currentCards: string[]
}

export async function getCardRecommendations(profile: UserProfile): Promise<{
  success: boolean
  recommendations: CardRecommendation[]
  error?: string
}> {
  try {
    const sheetsService = new GoogleSheetsService()
    const cards = await sheetsService.getCardData()

    if (!cards || cards.length === 0) {
      return {
        success: false,
        recommendations: [],
        error: "No card data available",
      }
    }

    // Filter and score cards
    const scoredCards = cards
      .filter((card) => {
        // Basic filters
        if (card.status !== "Active") return false
        if (card.annualFee > profile.maxAnnualFee) return false
        if (profile.monthlyIncome * 12 < card.minIncome) return false
        if (profile.monthlyIncome * 12 > card.maxIncome && card.maxIncome > 0) return false

        return true
      })
      .map((card) => {
        let score = 0
        const reasons: string[] = []

        // Income match (20 points)
        const annualIncome = profile.monthlyIncome * 12
        if (annualIncome >= card.minIncome && (card.maxIncome === 0 || annualIncome <= card.maxIncome)) {
          score += 20
          reasons.push("Income requirement met")
        }

        // Spending category match (30 points)
        const categoryMatches = profile.spendingCategories.filter((cat) =>
          card.spendingCategories.some(
            (cardCat) =>
              cardCat.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(cardCat.toLowerCase()),
          ),
        )
        if (categoryMatches.length > 0) {
          score += Math.min(30, categoryMatches.length * 10)
          reasons.push(`Matches ${categoryMatches.length} spending categories`)
        }

        // Bank preference (15 points)
        if (profile.preferredBanks.length === 0 || profile.preferredBanks.includes(card.bank)) {
          score += 15
          if (profile.preferredBanks.includes(card.bank)) {
            reasons.push("Preferred bank")
          }
        }

        // Card type match (10 points)
        if (profile.cardType === "Any" || card.cardType.toLowerCase() === profile.cardType.toLowerCase()) {
          score += 10
          if (profile.cardType !== "Any") {
            reasons.push("Matches preferred card type")
          }
        }

        // Fee consideration (10 points)
        if (card.annualFee === 0) {
          score += 10
          reasons.push("No annual fee")
        } else if (card.annualFee <= profile.maxAnnualFee * 0.5) {
          score += 5
          reasons.push("Low annual fee")
        }

        // Rating bonus (15 points)
        score += Math.round(card.rating * 3)
        if (card.rating >= 4.0) {
          reasons.push("Highly rated card")
        }

        return {
          ...card,
          matchScore: score,
          matchReasons: reasons,
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 7) // Top 7 recommendations

    return {
      success: true,
      recommendations: scoredCards,
    }
  } catch (error) {
    console.error("Error getting card recommendations:", error)
    return {
      success: false,
      recommendations: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
