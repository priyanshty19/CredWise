"use server"

import { fetchCreditCards } from "@/lib/google-sheets"
import { FunnelRecommendationEngine, type UserProfile } from "@/lib/funnel-recommendation-engine"
import { submitEnhancedFormData } from "@/lib/google-sheets-submissions"

/**
 * NEW FUNNEL-BASED CARD RECOMMENDATION SERVER ACTION
 *
 * Implements the 3-level filtering system:
 * Level 1: Basic Eligibility (Income + Credit Score)
 * Level 2: Category Preference (>65% match required)
 * Level 3: Joining Fee + Brand Filtering
 * Final: Adaptive Scoring based on user selections
 *
 * LIMITS RECOMMENDATIONS TO TOP 7 CARDS
 */
export async function getFunnelCardRecommendations(formData: {
  monthlyIncome: string
  spendingCategories: string[]
  monthlySpending: string
  currentCards: string
  creditScore: string
  preferredBanks: string[]
  joiningFeePreference: string
}) {
  try {
    console.log("🚀 FUNNEL-BASED RECOMMENDATION ENGINE STARTING")
    console.log("=".repeat(70))
    console.log("📝 Form Data Received:", formData)

    // Convert form data to user profile
    const creditScore = getCreditScoreValue(formData.creditScore) || 650
    const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 50000

    // Convert joining fee preference to expected format
    let joiningFeePreference: "no_fee" | "low_fee" | "no_concern" = "no_concern"
    switch (formData.joiningFeePreference) {
      case "no_fee":
        joiningFeePreference = "no_fee"
        break
      case "low_fee":
        joiningFeePreference = "low_fee"
        break
      case "any_amount":
      default:
        joiningFeePreference = "no_concern"
        break
    }

    const userProfile: UserProfile = {
      monthlyIncome,
      creditScore,
      spendingCategories: formData.spendingCategories,
      joiningFeePreference,
      preferredBrands: formData.preferredBanks,
    }

    console.log("👤 User Profile:", userProfile)

    // Fetch all cards from Google Sheets
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      return {
        success: false,
        error: "No credit card data available. Please try again later.",
        recommendations: [],
        totalCards: 0,
        userProfile: null,
        funnelStats: null,
        availableBrands: [],
      }
    }

    console.log(`📊 Total cards loaded: ${allCards.length}`)

    // Process through the funnel
    const funnelResult = FunnelRecommendationEngine.processFunnel(allCards, userProfile)

    // Check for brand mismatch scenario
    const brandMismatchNotice =
      userProfile.preferredBrands.length > 0 &&
      !funnelResult.finalRecommendations.some((scored) => userProfile.preferredBrands.includes(scored.card.bank))

    // LIMIT TO TOP 7 RECOMMENDATIONS
    const top7Recommendations = funnelResult.finalRecommendations.slice(0, 7)

    console.log(`✅ Funnel processing complete. Total recommendations: ${funnelResult.finalRecommendations.length}`)
    console.log(`🎯 Limiting to TOP 7 recommendations: ${top7Recommendations.length}`)

    if (brandMismatchNotice) {
      console.log("⚠️ BRAND MISMATCH NOTICE: Selected brand(s) not available, showing best alternatives")
    }

    // Log the funnel-based form submission to Google Sheets
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
        submissionType: "funnel_based_recommendation_engine_top7",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
        funnelStats: funnelResult.funnelStats,
        finalRecommendationCount: top7Recommendations.length,
        brandMismatchNotice,
      }

      console.log("📝 Submitting funnel-based form data to Google Sheets:", submissionData)
      const submissionSuccess = await submitEnhancedFormData(submissionData)

      if (submissionSuccess) {
        console.log("✅ Funnel-based form data submitted successfully to Google Sheets")
      } else {
        console.warn("⚠️ Failed to submit funnel-based form data to Google Sheets")
      }
    } catch (submissionError) {
      console.error("❌ Error submitting funnel-based form data:", submissionError)
      // Don't fail the recommendation request if logging fails
    }

    // Transform TOP 7 recommendations to match expected format
    const transformedRecommendations = top7Recommendations.map((scored, index) => ({
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
      bestFor: scored.card.spendingCategories.slice(0, 3),
      score: Math.round(scored.score),
      reasoning: scored.reasoning,
      spendingCategories: scored.card.spendingCategories,
      scoreBreakdown: scored.scoreBreakdown,
      matchPercentage: scored.matchPercentage,
      rank: index + 1, // Add ranking
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
      funnelStats: funnelResult.funnelStats,
      availableBrands: funnelResult.availableBrands,
      brandMismatchNotice,
      funnelBreakdown: {
        level1Cards: funnelResult.level1Cards.length,
        level2Cards: funnelResult.level2Cards.length,
        level3Cards: funnelResult.level3Cards.length,
        finalRecommendations: funnelResult.finalRecommendations.length,
        top7Recommendations: top7Recommendations.length,
      },
    }
  } catch (error) {
    console.error("Error in getFunnelCardRecommendations:", error)
    return {
      success: false,
      error: "Failed to generate recommendations. Please try again.",
      recommendations: [],
      totalCards: 0,
      userProfile: null,
      funnelStats: null,
      availableBrands: [],
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
