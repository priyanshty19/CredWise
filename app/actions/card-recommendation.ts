"use server"

import {
  fetchCreditCards,
  filterAndRankCards,
  filterAndRankCardsByRewards,
  filterAndRankCardsWithSpendingCategories,
} from "@/lib/google-sheets"
import { submitEnhancedFormData } from "@/lib/google-sheets-submissions"

interface CardSubmission {
  creditScore: number
  monthlyIncome: number
  cardType: string
  timestamp: string
  topN?: number
  userAgent?: string
}

interface RecommendationResult {
  success: boolean
  recommendations?: any[]
  filterCriteria?: string
  scoringLogic?: string
  error?: string
  totalCardsConsidered?: number
  eligibleCardsFound?: number
  scoreEligibleCardsFound?: number
}

// Simple submission logging function
async function logUserSubmission(data: {
  creditScore: number
  monthlyIncome: number
  cardType: string
  topN: number
  timestamp: string
  userAgent?: string
  submissionType: string
}): Promise<void> {
  try {
    console.log("📝 User submission logged:", {
      timestamp: data.timestamp,
      creditScore: data.creditScore,
      monthlyIncome: data.monthlyIncome,
      cardType: data.cardType,
      topN: data.topN,
      submissionType: data.submissionType,
      userAgent: data.userAgent || "Unknown",
    })
  } catch (error) {
    console.error("⚠️ Failed to log user submission:", error)
  }
}

export async function getCardRecommendations(data: CardSubmission): Promise<RecommendationResult> {
  try {
    // Fetch live data from Google Sheets
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      return {
        success: false,
        error: "No credit card data available. Please try again later.",
      }
    }

    // Apply rule-based filtering and ranking with configurable top N
    const topN = data.topN || 3
    const recommendations = filterAndRankCards(
      allCards,
      {
        creditScore: data.creditScore,
        monthlyIncome: data.monthlyIncome,
        cardType: data.cardType,
      },
      topN,
    )

    // Log user data submission
    try {
      await logUserSubmission({
        creditScore: data.creditScore,
        monthlyIncome: data.monthlyIncome,
        cardType: data.cardType,
        topN: topN,
        timestamp: data.timestamp,
        userAgent: data.userAgent,
        submissionType: "basic",
      })
      console.log("✅ User data logged successfully")
    } catch (submissionError) {
      console.error("⚠️ Failed to log user data:", submissionError)
    }

    // Generate explanation text
    const filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    const scoringLogic =
      "NEW ALGORITHM: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus (20%) + Joining Fee (10%) + Annual Fee (5%) + Bank Match (5%) = 100%. Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        cardName: card.cardName,
        bank: card.bank,
        features: card.features,
        reason: `Score: ${card.compositeScore}/100. ${card.description || "Selected based on new refined scoring algorithm optimizing rewards and category matches."}`,
        rating: Math.min(5, Math.max(1, Math.round(card.compositeScore / 20))),
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardsRate: card.rewardsRate,
        signUpBonus: card.signUpBonus,
        compositeScore: card.compositeScore,
        monthlyIncomeRequirement: card.monthlyIncomeRequirement,
      })),
      filterCriteria,
      scoringLogic,
      totalCardsConsidered: allCards.length,
      eligibleCardsFound: recommendations.length,
    }
  } catch (error) {
    console.error("Error getting card recommendations:", error)
    return {
      success: false,
      error: "Failed to fetch recommendations. Please check your internet connection and try again.",
    }
  }
}

export async function getEnhancedCardRecommendations(
  data: CardSubmission & {
    preferredBrand?: string
    maxJoiningFee?: number
  },
): Promise<RecommendationResult> {
  try {
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      return {
        success: false,
        error: "No credit card data available. Please try again later.",
      }
    }

    // Use NEW SCORING ALGORITHM
    const topN = data.topN || 3

    // Handle the "any" value for maxJoiningFee - convert to undefined for no filtering
    const processedMaxJoiningFee =
      data.maxJoiningFee === undefined || data.maxJoiningFee.toString() === "any" ? undefined : data.maxJoiningFee

    // Handle the "Any" value for preferredBrand - convert to undefined for no filtering
    const processedPreferredBrand =
      data.preferredBrand === undefined || data.preferredBrand === "Any" ? undefined : data.preferredBrand

    const recommendations = filterAndRankCardsByRewards(
      allCards,
      {
        creditScore: data.creditScore,
        monthlyIncome: data.monthlyIncome,
        cardType: data.cardType,
        preferredBrand: processedPreferredBrand,
        maxJoiningFee: processedMaxJoiningFee,
      },
      topN,
    )

    // Log enhanced user data submission
    try {
      await logUserSubmission({
        creditScore: data.creditScore,
        monthlyIncome: data.monthlyIncome,
        cardType: data.cardType,
        topN: topN,
        timestamp: data.timestamp,
        userAgent: data.userAgent,
        submissionType: "enhanced",
      })
      console.log("✅ Enhanced user data logged successfully")
    } catch (submissionError) {
      console.error("⚠️ Failed to log enhanced user data:", submissionError)
    }

    // Enhanced filter criteria description
    let filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    if (processedPreferredBrand) {
      filterCriteria += `, Preferred Bank: ${processedPreferredBrand}`
    }

    if (processedMaxJoiningFee !== undefined) {
      filterCriteria += `, Max Joining Fee: ₹${processedMaxJoiningFee.toLocaleString()}`
    }

    // Updated scoring logic description
    const scoringLogic =
      "NEW ALGORITHM with reward-based ranking: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus (20%) + Joining Fee (10%) + Annual Fee (5%) + Bank Match (5%) = 100%. Cards ranked by highest reward rates within eligible set."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        cardName: card.cardName,
        bank: card.bank,
        features: card.features,
        reason: `Reward Rate: ${card.rewardsRate}%. ${card.description || "Selected for having one of the highest reward rates in your category with new scoring algorithm."}`,
        rating: Math.min(5, Math.max(1, Math.round(card.rewardsRate))),
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardsRate: card.rewardsRate,
        signUpBonus: card.signUpBonus,
        compositeScore: card.compositeScore,
        monthlyIncomeRequirement: card.monthlyIncomeRequirement,
      })),
      filterCriteria,
      scoringLogic,
      totalCardsConsidered: allCards.length,
      eligibleCardsFound: recommendations.length,
    }
  } catch (error) {
    console.error("Error getting enhanced card recommendations:", error)
    return {
      success: false,
      error: "Failed to fetch recommendations. Please check your internet connection and try again.",
    }
  }
}

// Enhanced function for the form with spending categories and NEW refined scoring
export async function getCardRecommendationsForFormRefined(formData: {
  monthlyIncome: string
  spendingCategories: string[]
  monthlySpending: string
  currentCards: string
  creditScore: string
  preferredBanks: string[]
  joiningFeePreference: string
}) {
  try {
    console.log("🔄 Processing form data with NEW refined scoring algorithm:", formData)

    // Convert form data to the format expected by our existing functions
    const creditScore = Number.parseInt(formData.creditScore) || 650
    const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 50000

    // Determine card type based on spending categories
    let cardType = "Cashback" // Default
    if (formData.spendingCategories.includes("travel")) {
      cardType = "Travel"
    } else if (formData.spendingCategories.includes("dining") || formData.spendingCategories.includes("shopping")) {
      cardType = "Rewards"
    }

    console.log(
      `🎯 Determined card type: ${cardType} based on spending categories: [${formData.spendingCategories.join(", ")}]`,
    )

    // Fetch all cards from database - NO HARDCODED DATA
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      return {
        success: false,
        error: "No credit card data available. Please try again later.",
        recommendations: [],
        totalCards: 0,
        userProfile: null,
      }
    }

    // Use the NEW spending category enhanced filtering with NEW scoring algorithm
    const recommendations = filterAndRankCardsWithSpendingCategories(
      allCards,
      {
        creditScore,
        monthlyIncome,
        cardType,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
      },
      7, // Get top 7 recommendations
    )

    console.log(`✅ Generated ${recommendations.length} recommendations with NEW scoring algorithm`)

    // Log the enhanced form submission to Google Sheets
    try {
      const submissionData = {
        timestamp: new Date().toISOString(),
        monthlyIncome,
        monthlySpending: Number.parseInt(formData.monthlySpending) || 25000,
        creditScoreRange: formData.creditScore,
        currentCards: formData.currentCards,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
        joiningFeePreference: formData.joiningFeePreference,
        submissionType: "enhanced_form_with_new_scoring_algorithm",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      }

      console.log("📝 Submitting enhanced form data to Google Sheets:", submissionData)
      const submissionSuccess = await submitEnhancedFormData(submissionData)

      if (submissionSuccess) {
        console.log("✅ Enhanced form data submitted successfully to Google Sheets")
      } else {
        console.warn("⚠️ Failed to submit enhanced form data to Google Sheets")
      }
    } catch (submissionError) {
      console.error("❌ Error submitting enhanced form data:", submissionError)
    }

    // Transform the recommendations to match the expected format
    const transformedRecommendations = recommendations.map((card) => ({
      name: card.cardName,
      bank: card.bank,
      type: cardType.toLowerCase(),
      annualFee: card.annualFee,
      joiningFee: card.joiningFee,
      rewardRate: `${card.rewardsRate}% rewards`,
      welcomeBonus: card.signUpBonus > 0 ? `₹${card.signUpBonus.toLocaleString()} welcome bonus` : "",
      keyFeatures: card.features || [
        "Reward points on purchases",
        "Online transaction benefits",
        "Fuel surcharge waiver",
        "Welcome bonus offer",
      ],
      bestFor: formData.spendingCategories.slice(0, 3),
      score: Math.round(card.compositeScore),
      reasoning: `Score: ${card.compositeScore}/100. ${card.spendingCategories.length > 0 ? `Matches your spending in: ${card.spendingCategories.join(", ")}. ` : ""}NEW algorithm prioritizes rewards rate (30%) and category match (30%) with bank preference bonus (5%).`,
      spendingCategories: card.spendingCategories,
      scoreBreakdown: card.scoreBreakdown,
    }))

    return {
      success: true,
      recommendations: transformedRecommendations,
      totalCards: allCards.length,
      userProfile: {
        monthlyIncome,
        monthlySpending: Number.parseInt(formData.monthlySpending) || 25000,
        creditScore,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
      },
      allCards, // Include all cards for testing component
    }
  } catch (error) {
    console.error("Error in getCardRecommendationsForForm:", error)
    return {
      success: false,
      error: "Failed to generate recommendations. Please try again.",
      recommendations: [],
      totalCards: 0,
      userProfile: null,
    }
  }
}

export async function getRecommendations(formData: FormData) {
  try {
    const result = await getCardRecommendationsForFormRefined(formData)
    return result
  } catch (error: any) {
    console.error("Error in getRecommendations server action:", error)
    return {
      success: false,
      error: "Failed to generate recommendations. Please try again.",
      recommendations: [],
      totalCards: 0,
      userProfile: null,
    }
  }
}
