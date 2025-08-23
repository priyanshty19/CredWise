"use server"

import { FunnelRecommendationEngine } from "@/lib/funnel-recommendation-engine"
import { fetchCreditCards } from "@/lib/google-sheets"
import { submitEnhancedFormData } from "@/lib/google-sheets-submissions"

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

interface RecommendationResult {
  success: boolean
  recommendations?: any[]
  funnelStats?: FunnelStats
  brandMismatchNotice?: string
  error?: string
}

export async function submitCardRecommendation(formData: FormData): Promise<RecommendationResult> {
  try {
    console.log("🔄 Processing funnel-based card recommendation:", formData)

    // Fetch all cards from Google Sheets
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      return {
        success: false,
        error: "No credit card data available. Please try again later.",
      }
    }

    // Convert form data to user profile
    const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 50000
    const annualIncome = monthlyIncome * 12

    // Convert joining fee preference to numeric value
    let maxJoiningFee: number | undefined
    switch (formData.joiningFeePreference) {
      case "Free":
        maxJoiningFee = 0
        break
      case "Up to ₹500":
        maxJoiningFee = 500
        break
      case "Up to ₹1,000":
        maxJoiningFee = 1000
        break
      case "Up to ₹2,500":
        maxJoiningFee = 2500
        break
      case "Up to ₹5,000":
        maxJoiningFee = 5000
        break
      case "Any Amount":
        maxJoiningFee = undefined
        break
      default:
        maxJoiningFee = undefined
    }

    console.log("👤 User Profile:")
    console.log(`- Annual Income: ₹${annualIncome.toLocaleString()}`)
    console.log(`- Spending Categories: [${formData.spendingCategories.join(", ")}]`)
    console.log(`- Max Joining Fee: ${maxJoiningFee !== undefined ? `₹${maxJoiningFee}` : "No limit"}`)
    console.log(`- Preferred Brands: [${formData.preferredBrands.join(", ")}]`)

    // LEVEL 1: Basic Eligibility (Income-based filtering)
    console.log("\n🔍 LEVEL 1: Basic Eligibility Filtering")
    const level1Cards = FunnelRecommendationEngine.level1BasicEligibility(allCards, monthlyIncome, 650) // Assuming good credit score
    console.log(`✅ Level 1 Results: ${level1Cards.length}/${allCards.length} cards passed income eligibility`)

    // LEVEL 2: Category Preference Filtering
    console.log("\n🎯 LEVEL 2: Category Preference Filtering")
    const level2Cards = FunnelRecommendationEngine.level2CategoryFiltering(level1Cards, formData.spendingCategories)
    console.log(`✅ Level 2 Results: ${level2Cards.length}/${level1Cards.length} cards match spending categories`)

    // LEVEL 3: Joining Fee and Brand Filtering
    console.log("\n💰 LEVEL 3: Joining Fee and Brand Filtering")
    const level3Result = FunnelRecommendationEngine.level3JoiningFeeAndBrandFiltering(
      level2Cards,
      maxJoiningFee !== undefined ? (maxJoiningFee === 0 ? "no_fee" : "low_fee") : "no_concern",
      formData.preferredBrands,
    )
    console.log(
      `✅ Level 3 Results: ${level3Result.filteredCards.length}/${level2Cards.length} cards passed fee/brand filters`,
    )

    // FINAL STAGE: Adaptive Scoring and TOP 7 Selection
    console.log("\n🏆 FINAL STAGE: Adaptive Scoring and TOP 7 Selection")
    const finalRecommendations = FunnelRecommendationEngine.finalStageAdaptiveScoring(
      level3Result.filteredCards,
      {
        spendingCategories: formData.spendingCategories,
        preferredBrands: formData.preferredBrands,
        joiningFeePreference: maxJoiningFee !== undefined ? (maxJoiningFee === 0 ? "no_fee" : "low_fee") : "no_concern",
      },
      7, // TOP 7 limit
    )

    console.log(`🎯 Final Results: ${finalRecommendations.length} cards selected (MAX 7 ENFORCED)`)

    // Create funnel statistics
    const funnelStats: FunnelStats = {
      totalCards: allCards.length,
      level1Count: level1Cards.length,
      level2Count: level2Cards.length,
      level3Count: level3Result.filteredCards.length,
      finalCount: finalRecommendations.length,
    }

    // Check for brand mismatch notice
    let brandMismatchNotice: string | undefined
    if (formData.preferredBrands.length > 0 && level3Result.availableBrands.length > 0) {
      const unavailableBrands = formData.preferredBrands.filter(
        (brand) => !level3Result.availableBrands.includes(brand),
      )
      if (unavailableBrands.length > 0) {
        brandMismatchNotice = `Note: ${unavailableBrands.join(", ")} ${unavailableBrands.length === 1 ? "is" : "are"} not available for your current preferences. Showing best alternatives from available brands: ${level3Result.availableBrands.join(", ")}.`
      }
    }

    // Log submission to Google Sheets
    try {
      const submissionData = {
        timestamp: new Date().toISOString(),
        monthlyIncome,
        spendingCategories: formData.spendingCategories,
        joiningFeePreference: formData.joiningFeePreference,
        preferredBrands: formData.preferredBrands,
        submissionType: "funnel_based_recommendation",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
        funnelStats,
      }

      await submitEnhancedFormData(submissionData)
      console.log("✅ Funnel-based form data submitted to Google Sheets")
    } catch (submissionError) {
      console.error("⚠️ Failed to submit funnel-based form data:", submissionError)
    }

    // Transform recommendations to expected format
    const transformedRecommendations = finalRecommendations.map((card, index) => ({
      id: `rec_${index + 1}`,
      name: card.cardName,
      bank: card.bank,
      type: card.cardType.toLowerCase(),
      annualFee: card.annualFee,
      joiningFee: card.joiningFee,
      rewardRate: `${card.rewardsRate}% rewards`,
      welcomeBonus:
        card.signUpBonus > 0 ? `₹${card.signUpBonus.toLocaleString()} welcome bonus` : "Welcome offer available",
      keyFeatures: card.features || [
        "Reward points on purchases",
        "Online transaction benefits",
        "Fuel surcharge waiver",
        "Welcome bonus offer",
      ],
      bestFor: card.spendingCategories?.slice(0, 3) || formData.spendingCategories.slice(0, 3),
      score: Math.round(card.compositeScore || 85),
      reasoning: `Selected through our 3-level funnel system. Matches ${formData.spendingCategories.length} of your spending categories and meets your joining fee preference of ${formData.joiningFeePreference}.`,
    }))

    console.log(`🎉 Successfully processed funnel-based recommendation: ${transformedRecommendations.length} cards`)

    return {
      success: true,
      recommendations: transformedRecommendations,
      funnelStats,
      brandMismatchNotice,
    }
  } catch (error) {
    console.error("❌ Error in funnel-based card recommendation:", error)
    return {
      success: false,
      error: "Failed to process recommendation. Please try again.",
    }
  }
}

// Export alias for backward compatibility
export { submitCardRecommendation as getFunnelCardRecommendations }
