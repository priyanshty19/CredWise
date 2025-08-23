"use server"

import { fetchCreditCards, filterAndRankCards, filterAndRankCardsByRewards } from "@/lib/google-sheets"
import { getAdaptiveCardRecommendations } from "@/lib/intersection-count"
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

// Simple submission logging function (since the Google Sheets submission is having import issues)
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

    // In a production environment, you could send this to an analytics service
    // or use a different submission method
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

    // Calculate score-eligible cards count for reward-based logic
    const basicEligibleCards = allCards.filter((card) => {
      const meetsCredit = card.creditScoreRequirement === 0 || data.creditScore >= card.creditScoreRequirement
      const meetsIncome = card.monthlyIncomeRequirement === 0 || data.monthlyIncome >= card.monthlyIncomeRequirement
      const matchesType = card.cardType === data.cardType
      return meetsCredit && meetsIncome && matchesType
    })

    // Calculate composite scores for basic eligible cards
    const scoredCards = basicEligibleCards.map((card) => {
      let score = 0

      const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
      const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
      const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
      const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

      const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
      score += joiningFeeScore

      // Annual fee (lower is better) - normalize to 0-25 scale
      const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
      score += annualFeeScore

      // Rewards rate (higher is better) - normalize to 0-25 scale
      const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 25 : 0
      score += rewardsScore

      // Sign-up bonus (higher is better) - normalize to 0-25 scale
      const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0
      score += bonusScore

      const compositeScore = Math.round(score * 100) / 100

      return {
        ...card,
        compositeScore,
      }
    })

    // Count cards that meet the ≥25.0 score threshold
    const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)
    const scoreEligibleCount = scoreEligibleCards.length

    console.log(`📊 ELIGIBILITY SUMMARY:`)
    console.log(`- Total cards in database: ${allCards.length}`)
    console.log(`- Basic eligible cards: ${basicEligibleCards.length}`)
    console.log(`- Score-eligible cards (≥25.0): ${scoreEligibleCount}`)
    console.log(`- Cards shown (Top ${topN}): ${recommendations.length}`)
    console.log(`- Additional cards available for reward-based: ${Math.max(0, scoreEligibleCount - topN)}`)

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
      // Don't fail the recommendation request if logging fails
    }

    // Generate explanation text
    const filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    const scoringLogic =
      "Ranked by composite score considering: Low joining fees (25%), Low annual fees (25%), High rewards rate (25%), High sign-up bonus (25%). Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        cardName: card.cardName,
        bank: card.bank,
        features: card.features,
        reason: `Score: ${card.compositeScore}/100. ${card.description || "Selected based on optimal balance of low fees and high rewards for your profile."}`,
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
      eligibleCardsFound: basicEligibleCards.length,
      scoreEligibleCardsFound: scoreEligibleCount,
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

    // Use REWARD-BASED filtering instead of composite scoring
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
      // Don't fail the recommendation request if logging fails
    }

    // Enhanced filter criteria description
    let filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    if (processedPreferredBrand) {
      filterCriteria += `, Preferred Bank: ${processedPreferredBrand}`
    }

    if (processedMaxJoiningFee !== undefined) {
      filterCriteria += `, Max Joining Fee: ₹${processedMaxJoiningFee.toLocaleString()}`
    }

    // Updated scoring logic description for reward-based approach
    const scoringLogic =
      "Ranked PURELY by highest reward rates (no composite scoring) - cards with highest cashback/rewards percentage appear first. Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        cardName: card.cardName,
        bank: card.bank,
        features: card.features,
        reason: `Reward Rate: ${card.rewardsRate}%. ${card.description || "Selected for having one of the highest reward rates in your category."}`,
        rating: Math.min(5, Math.max(1, Math.round(card.rewardsRate))), // Rating based on reward rate
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardsRate: card.rewardsRate,
        signUpBonus: card.signUpBonus,
        compositeScore: card.compositeScore, // Keep the actual composite score
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

// NEW: Enhanced function for the form with spending categories and ADAPTIVE INTERSECTION-BASED scoring
export async function getCardRecommendationsForForm(formData: {
  monthlyIncome: string
  spendingCategories: string[]
  monthlySpending: string
  currentCards: string
  creditScore: string
  preferredBanks: string[]
  joiningFeePreference: string
}) {
  try {
    console.log("🔄 Processing form data with ADAPTIVE INTERSECTION-BASED algorithm:", formData)

    // Convert form data to the format expected by our adaptive algorithm
    const creditScore = getCreditScoreValue(formData.creditScore) || 650
    const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 50000

    // Convert joining fee preference to the format expected by adaptive algorithm
    let joiningFeePreference: "no_fee" | "low_fee" | "not_concerned" = "not_concerned"
    switch (formData.joiningFeePreference) {
      case "free":
        joiningFeePreference = "no_fee"
        break
      case "low":
        joiningFeePreference = "low_fee"
        break
      case "medium":
      case "any_amount":
        joiningFeePreference = "not_concerned"
        break
    }

    // Fetch all cards to use the new adaptive intersection-based filtering
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

    // Use the NEW ADAPTIVE INTERSECTION-BASED algorithm
    const userProfile = {
      creditScore,
      monthlyIncome,
      spendingCategories: formData.spendingCategories,
      preferredBanks: formData.preferredBanks,
      joiningFeePreference,
    }

    const adaptiveResult = getAdaptiveCardRecommendations(
      allCards,
      userProfile,
      7, // Get top 7 recommendations
    )

    console.log(
      `✅ Generated ${adaptiveResult.recommendations.length} recommendations with ADAPTIVE INTERSECTION-BASED algorithm`,
    )

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
        submissionType: "adaptive_intersection_based_algorithm",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      }

      console.log("📝 Submitting adaptive algorithm form data to Google Sheets:", submissionData)
      const submissionSuccess = await submitEnhancedFormData(submissionData)

      if (submissionSuccess) {
        console.log("✅ Adaptive algorithm form data submitted successfully to Google Sheets")
      } else {
        console.warn("⚠️ Failed to submit adaptive algorithm form data to Google Sheets")
      }
    } catch (submissionError) {
      console.error("❌ Error submitting adaptive algorithm form data:", submissionError)
      // Don't fail the recommendation request if logging fails
    }

    // Transform the recommendations to match the expected format
    const transformedRecommendations = adaptiveResult.recommendations.map((scored) => ({
      name: scored.card.cardName,
      bank: scored.card.bank,
      type: scored.card.cardType.toLowerCase(),
      annualFee: scored.card.annualFee,
      joiningFee: scored.card.joiningFee,
      rewardRate: `${scored.card.rewardsRate}% rewards`,
      welcomeBonus: scored.card.signUpBonus > 0 ? `₹${scored.card.signUpBonus.toLocaleString()} welcome bonus` : "",
      keyFeatures: scored.card.features || [
        "Reward points on purchases",
        "Online transaction benefits",
        "Fuel surcharge waiver",
        "Welcome bonus offer",
      ],
      bestFor: scored.intersectionDetails.matchedCategories.slice(0, 3),
      score: Math.round(scored.totalScore),
      reasoning: `Score: ${scored.totalScore.toFixed(1)}/100. Matches ${scored.intersectionDetails.intersectionCount}/${formData.spendingCategories.length} of your spending categories: [${scored.intersectionDetails.matchedCategories.join(", ")}]. Adaptive intersection-based algorithm prioritizes category matching (40%) and rewards rate (25%) for maximum relevance.`,
      spendingCategories: scored.card.spendingCategories, // Include card's spending categories
      scoreBreakdown: {
        rewards: scored.scoreBreakdown.rewardsScore,
        category: scored.scoreBreakdown.intersectionScore,
        signup: scored.scoreBreakdown.signupScore,
        joining: scored.scoreBreakdown.joiningFeeScore,
        annual: scored.scoreBreakdown.annualFeeScore,
        bankBonus: scored.scoreBreakdown.bankBonus,
      },
      intersectionDetails: scored.intersectionDetails, // Include intersection analysis
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
      adaptiveStats: adaptiveResult.stats, // Include adaptive algorithm statistics
    }
  } catch (error) {
    console.error("Error in getCardRecommendationsForForm with adaptive algorithm:", error)
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
    const result = await getCardRecommendationsForForm(formData)
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

// Helper function to get credit score value from range
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
