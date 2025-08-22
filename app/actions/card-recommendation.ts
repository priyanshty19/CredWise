"use server"

import { getAdaptiveCardRecommendations, type UserPreferences, type CreditCard } from "@/lib/intersection-count"
import { fetchCardData } from "@/lib/google-sheets"

export interface CardRecommendationRequest {
  spendingCategories: string[]
  preferredBanks: string[]
  creditScore: number
  monthlyIncome: number
  joiningFeePreference: "No joining fee" | "Low joining fees (₹0-1000)" | "Not a concern"
  maxResults?: number
}

export interface CardRecommendationResponse {
  success: boolean
  recommendations: any[]
  stats: {
    totalCards: number
    eligibleCount: number
    withIntersection: number
    preferredBankCards: number
  }
  error?: string
  debugInfo?: {
    userPreferences: UserPreferences
    processingTime: number
    algorithmVersion: string
  }
}

export async function getCardRecommendations(request: CardRecommendationRequest): Promise<CardRecommendationResponse> {
  const startTime = Date.now()

  try {
    console.log("🎯 Starting adaptive card recommendation process...")
    console.log("📋 User Request:", JSON.stringify(request, null, 2))

    // Fetch card data from Google Sheets
    const cardData = await fetchCardData()

    if (!cardData || cardData.length === 0) {
      throw new Error("No card data available from Google Sheets")
    }

    console.log(`📊 Loaded ${cardData.length} cards from Google Sheets`)

    // Transform Google Sheets data to CreditCard format
    const cards: CreditCard[] = cardData.map((row) => ({
      name: row["Card Name"] || "",
      bank: row["Bank"] || "",
      spendingCategories: (row["Spending Categories"] || "")
        .split(",")
        .map((cat: string) => cat.trim())
        .filter(Boolean),
      rewardRate: Number.parseFloat(row["Reward Rate"] || "0"),
      creditScoreRequirement: Number.parseInt(row["Credit Score Requirement"] || "0"),
      incomeRequirement: Number.parseInt(row["Income Requirement"] || "0"),
      joiningFee: Number.parseInt(row["Joining Fee"] || "0"),
      annualFee: Number.parseInt(row["Annual Fee"] || "0"),
      signupBonus: Number.parseInt(row["Signup Bonus"] || "0"),
      // Include all other fields for additional data
      ...row,
    }))

    // Prepare user preferences
    const userPreferences: UserPreferences = {
      spendingCategories: request.spendingCategories,
      preferredBanks: request.preferredBanks,
      creditScore: request.creditScore,
      monthlyIncome: request.monthlyIncome,
      joiningFeePreference: request.joiningFeePreference,
    }

    console.log("🔍 User Preferences:", JSON.stringify(userPreferences, null, 2))

    // Get adaptive recommendations using intersection-based algorithm
    const result = getAdaptiveCardRecommendations(cards, userPreferences, request.maxResults || 7)

    const processingTime = Date.now() - startTime

    console.log("✅ Recommendation Results:")
    console.log(`- Total Cards: ${result.stats.totalCards}`)
    console.log(`- Eligible Cards: ${result.stats.eligibleCount}`)
    console.log(`- Cards with Category Match: ${result.stats.withIntersection}`)
    console.log(`- Preferred Bank Cards: ${result.stats.preferredBankCards}`)
    console.log(`- Final Recommendations: ${result.recommendations.length}`)
    console.log(`- Processing Time: ${processingTime}ms`)

    // Log top 3 recommendations for debugging
    console.log("\n🏆 Top 3 Recommendations:")
    result.recommendations.slice(0, 3).forEach((card, index) => {
      console.log(`${index + 1}. ${card.name} (Score: ${card.totalScore.toFixed(2)})`)
      console.log(`   - Categories: ${card.matchedCategories.join(", ")}`)
      console.log(`   - Bank: ${card.bank} ${card.bankBonus > 0 ? "(Preferred ⭐)" : ""}`)
      console.log(
        `   - Intersection: ${card.intersectionCount}/${userPreferences.spendingCategories.length} categories`,
      )
    })

    return {
      success: true,
      recommendations: result.recommendations,
      stats: result.stats,
      debugInfo: {
        userPreferences,
        processingTime,
        algorithmVersion: "Intersection-Based v2.0",
      },
    }
  } catch (error) {
    console.error("❌ Card recommendation error:", error)

    return {
      success: false,
      recommendations: [],
      stats: {
        totalCards: 0,
        eligibleCount: 0,
        withIntersection: 0,
        preferredBankCards: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Legacy function for backward compatibility
export async function submitCardRecommendation(formData: FormData) {
  try {
    const spendingCategories = formData.getAll("spendingCategories") as string[]
    const preferredBanks = formData.getAll("preferredBanks") as string[]
    const creditScore = Number.parseInt(formData.get("creditScore") as string)
    const monthlyIncome = Number.parseInt(formData.get("monthlyIncome") as string)
    const joiningFeePreference = formData.get("joiningFeePreference") as
      | "No joining fee"
      | "Low joining fees (₹0-1000)"
      | "Not a concern"

    const request: CardRecommendationRequest = {
      spendingCategories,
      preferredBanks,
      creditScore,
      monthlyIncome,
      joiningFeePreference,
    }

    return await getCardRecommendations(request)
  } catch (error) {
    console.error("Form submission error:", error)
    return {
      success: false,
      recommendations: [],
      stats: {
        totalCards: 0,
        eligibleCount: 0,
        withIntersection: 0,
        preferredBankCards: 0,
      },
      error: "Failed to process form submission",
    }
  }
}
