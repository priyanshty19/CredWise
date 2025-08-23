"use server"

import { fetchCreditCards } from "@/lib/google-sheets"
import { FunnelRecommendationEngine, type UserProfile } from "@/lib/funnel-recommendation-engine"
import { submitEnhancedFormData } from "@/lib/google-sheets-submissions"

/**
 * FUNNEL-BASED CARD RECOMMENDATION WITH TWO-TIER SYSTEM
 *
 * Implements the 3-level filtering system:
 * Level 1: Basic Eligibility (Income + Credit Score)
 * Level 2: Category Preference (>65% match required)
 * Level 3: Joining Fee Filtering
 * Final: Two-Tier System (Preferred Brand + General)
 *
 * ALWAYS RETURNS TOP 7 CARDS WITH OPTIMAL USER EXPERIENCE
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
    console.log("🎯 CARD RECOMMENDATION SUBMISSION")
    console.log("=".repeat(50))

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

    // Log user selections
    console.log("📝 USER SELECTIONS:")
    console.log(`   Income: ₹${monthlyIncome.toLocaleString()}/month`)
    console.log(`   Credit Score: ${formData.creditScore} (${creditScore})`)
    console.log(`   Spending Categories: [${formData.spendingCategories.join(", ")}]`)
    console.log(`   Joining Fee Preference: ${formData.joiningFeePreference}`)
    console.log(`   Preferred Brands: [${formData.preferredBanks.join(", ") || "None"}]`)

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
        twoTierInfo: null,
      }
    }

    // Process through the funnel with two-tier system
    const funnelResult = FunnelRecommendationEngine.processFunnel(allCards, userProfile)

    // Log filtering results
    console.log("\n🔍 FILTERING RESULTS:")
    console.log(`   Total Cards: ${funnelResult.funnelStats.totalCards}`)
    console.log(`   Level 1 (Income + Credit): ${funnelResult.funnelStats.level1Count} cards passed`)
    console.log(`   Level 2 (Category >65%): ${funnelResult.funnelStats.level2Count} cards passed`)
    console.log(`   Level 3 (Joining Fee): ${funnelResult.funnelStats.level3Count} cards passed`)

    // Extract two-tier information
    const twoTierInfo = funnelResult.twoTierResult
    const showGeneralMessage = twoTierInfo?.showGeneralMessage || false
    const preferredBrandCount = twoTierInfo?.preferredBrandCards.length || 0
    const generalCount = Math.min(twoTierInfo?.generalCards.length || 0, 7 - preferredBrandCount)

    // Log two-tier results
    console.log("\n🎯 TWO-TIER RESULTS:")
    if (formData.preferredBanks.length > 0) {
      console.log(`   Preferred Brand Cards: ${preferredBrandCount}`)
      console.log(`   General Cards Added: ${generalCount}`)
      if (showGeneralMessage) {
        console.log(`   ⚠️ General message shown (insufficient preferred brand cards)`)
      }
    } else {
      console.log(`   No preferred brands selected - showing ${generalCount} general cards`)
    }
    console.log(`   Final TOP 7 Recommendations: ${funnelResult.finalRecommendations.length}`)

    // Log final recommendations
    console.log("\n🏆 FINAL RECOMMENDATIONS:")
    funnelResult.finalRecommendations.forEach((scored, index) => {
      const tierLabel = scored.tier === "preferred_brand" ? "[PREFERRED]" : "[GENERAL]"
      console.log(
        `   ${index + 1}. ${scored.card.cardName} (${scored.card.bank}) ${tierLabel} - Score: ${scored.score.toFixed(1)}`,
      )
    })

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
        submissionType: "funnel_two_tier_recommendation_engine",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
        funnelStats: funnelResult.funnelStats,
        twoTierStats: {
          preferredBrandCount,
          generalCount,
          showGeneralMessage,
          totalRecommendations: funnelResult.finalRecommendations.length,
        },
      }

      const submissionSuccess = await submitEnhancedFormData(submissionData)
      console.log(`\n📊 Google Sheets Logging: ${submissionSuccess ? "✅ Success" : "❌ Failed"}`)
    } catch (submissionError) {
      console.log(`\n📊 Google Sheets Logging: ❌ Error - ${submissionError}`)
    }

    // Transform TOP 7 recommendations to match expected format (ENFORCE 7 CARD LIMIT)
    const limitedRecommendations = funnelResult.finalRecommendations.slice(0, 7)
    const transformedRecommendations = limitedRecommendations.map((scored, index) => ({
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
      rank: index + 1,
      tier: scored.tier || "general",
    }))

    const finalRecommendations = transformedRecommendations.slice(0, 7)

    console.log(`\n✅ SUBMISSION COMPLETE - Returning ${finalRecommendations.length} recommendations`)
    console.log("=".repeat(50))

    return {
      success: true,
      recommendations: finalRecommendations,
      totalCards: allCards.length,
      userProfile: {
        monthlyIncome,
        monthlySpending: Number.parseInt(formData.monthlySpending) || 25000,
        creditScore,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
      },
      allCards,
      funnelStats: funnelResult.funnelStats,
      availableBrands: funnelResult.availableBrands,
      twoTierInfo: {
        showGeneralMessage,
        preferredBrandCount,
        generalCount,
        totalRecommendations: finalRecommendations.length,
        preferredBrands: formData.preferredBanks,
      },
      funnelBreakdown: {
        level1Cards: funnelResult.level1Cards.length,
        level2Cards: funnelResult.level2Cards.length,
        level3Cards: funnelResult.level3Cards.length,
        finalRecommendations: finalRecommendations.length,
        preferredBrandCards: preferredBrandCount,
        generalCards: generalCount,
      },
    }
  } catch (error) {
    console.error("❌ Error in getFunnelCardRecommendations:", error)
    return {
      success: false,
      error: "Failed to generate recommendations. Please try again.",
      recommendations: [],
      totalCards: 0,
      userProfile: null,
      funnelStats: null,
      availableBrands: [],
      twoTierInfo: null,
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
