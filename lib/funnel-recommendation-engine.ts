export interface CreditCard {
  id: string
  cardName: string
  bank: string
  cardType: string
  joiningFee: number
  annualFee: number
  creditScoreRequirement: number
  monthlyIncomeRequirement: number
  rewardsRate: number
  signUpBonus: number
  features: string[]
  description: string
  spendingCategories: string[]
}

export interface UserProfile {
  monthlyIncome: number
  creditScore: number
  spendingCategories: string[]
  joiningFeePreference: "no_fee" | "low_fee" | "no_concern"
  preferredBrands: string[]
}

export interface FunnelResult {
  level1Cards: CreditCard[]
  level2Cards: CreditCard[]
  level3Cards: CreditCard[]
  availableBrands: string[]
  finalRecommendations: ScoredCard[]
  funnelStats: {
    totalCards: number
    level1Count: number
    level2Count: number
    level3Count: number
    finalCount: number
  }
}

export interface ScoredCard {
  card: CreditCard
  score: number
  scoreBreakdown: {
    categoryMatch: number
    rewardsRate: number
    brandMatch?: number
    signUpBonus?: number
  }
  matchPercentage: number
  reasoning: string
}

/**
 * FUNNEL-BASED RECOMMENDATION ENGINE
 *
 * Implements a 3-level filtering system:
 * Level 1: Basic Eligibility (Income + Credit Score)
 * Level 2: Category Preference (>65% match required)
 * Level 3: Joining Fee + Brand Filtering
 * Final: Adaptive Scoring based on user selections
 */
export class FunnelRecommendationEngine {
  /**
   * LEVEL 1: Basic Eligibility Filtering
   * Filter cards based on income and credit score requirements only
   */
  static level1BasicEligibility(allCards: CreditCard[], userIncome: number, userCreditScore: number): CreditCard[] {
    console.log("🎯 LEVEL 1: BASIC ELIGIBILITY FILTERING")
    console.log("=".repeat(50))
    console.log(`👤 User Income: ₹${userIncome.toLocaleString()}`)
    console.log(`👤 User Credit Score: ${userCreditScore}`)
    console.log(`📊 Total cards to filter: ${allCards.length}`)

    const level1Cards = allCards.filter((card) => {
      // Income requirement check (0 means no requirement)
      const meetsIncome = card.monthlyIncomeRequirement === 0 || userIncome >= card.monthlyIncomeRequirement

      // Credit score requirement check (0 means no requirement)
      const meetsCredit = card.creditScoreRequirement === 0 || userCreditScore >= card.creditScoreRequirement

      const isEligible = meetsIncome && meetsCredit

      if (!isEligible) {
        console.log(`❌ ${card.cardName}: Income(${meetsIncome}) Credit(${meetsCredit})`)
      }

      return isEligible
    })

    console.log(`✅ Level 1 Eligible Cards: ${level1Cards.length}`)
    level1Cards.forEach((card) => {
      console.log(`   • ${card.cardName} (${card.bank})`)
    })

    return level1Cards
  }

  /**
   * LEVEL 2: Category Preference Filtering
   * Only pass cards with >65% category match
   */
  static level2CategoryFiltering(level1Cards: CreditCard[], userSpendingCategories: string[]): CreditCard[] {
    console.log("\n🎯 LEVEL 2: CATEGORY PREFERENCE FILTERING")
    console.log("=".repeat(50))
    console.log(`👤 User Categories: [${userSpendingCategories.join(", ")}]`)
    console.log(`📊 Cards from Level 1: ${level1Cards.length}`)

    if (userSpendingCategories.length === 0) {
      console.log("⚠️ No user categories provided - passing all Level 1 cards")
      return level1Cards
    }

    const level2Cards = level1Cards.filter((card) => {
      const matchPercentage = this.calculateCategoryMatchPercentage(userSpendingCategories, card.spendingCategories)

      const passesThreshold = matchPercentage > 65

      console.log(
        `${passesThreshold ? "✅" : "❌"} ${card.cardName}: ${matchPercentage.toFixed(1)}% match ${passesThreshold ? "> 65%" : "≤ 65%"}`,
      )
      console.log(`   Card Categories: [${card.spendingCategories.join(", ")}]`)

      return passesThreshold
    })

    console.log(`✅ Level 2 Eligible Cards (>65% match): ${level2Cards.length}`)

    return level2Cards
  }

  /**
   * LEVEL 3: Joining Fee and Brand Filtering
   * Apply joining fee preference and extract available brands
   */
  static level3JoiningFeeAndBrandFiltering(
    level2Cards: CreditCard[],
    joiningFeePreference: "no_fee" | "low_fee" | "no_concern",
    preferredBrands: string[] = [],
  ): { level3Cards: CreditCard[]; availableBrands: string[] } {
    console.log("\n🎯 LEVEL 3: JOINING FEE AND BRAND FILTERING")
    console.log("=".repeat(50))
    console.log(`👤 Joining Fee Preference: ${joiningFeePreference}`)
    console.log(`👤 Preferred Brands: [${preferredBrands.join(", ")}]`)
    console.log(`📊 Cards from Level 2: ${level2Cards.length}`)

    // Step 3A: Apply joining fee filter
    let feeFilteredCards: CreditCard[] = []

    switch (joiningFeePreference) {
      case "no_fee":
        feeFilteredCards = level2Cards.filter((card) => card.joiningFee === 0)
        console.log(`💳 Filtering for ₹0 joining fee: ${feeFilteredCards.length} cards`)
        break

      case "low_fee":
        feeFilteredCards = level2Cards.filter((card) => card.joiningFee <= 1000)
        console.log(`💳 Filtering for ≤₹1000 joining fee: ${feeFilteredCards.length} cards`)
        break

      case "no_concern":
        feeFilteredCards = level2Cards
        console.log(`💳 No joining fee filter applied: ${feeFilteredCards.length} cards`)
        break
    }

    // Step 3B: Extract available brands from fee-filtered cards
    const availableBrands = [...new Set(feeFilteredCards.map((card) => card.bank))].sort()
    console.log(`🏦 Available Brands after fee filtering: [${availableBrands.join(", ")}]`)

    // Step 3C: Apply brand filter if brands are selected
    let level3Cards = feeFilteredCards

    if (preferredBrands.length > 0) {
      level3Cards = feeFilteredCards.filter((card) => preferredBrands.includes(card.bank))
      console.log(`🏦 After brand filtering: ${level3Cards.length} cards`)

      level3Cards.forEach((card) => {
        console.log(`   ✅ ${card.cardName} (${card.bank})`)
      })
    }

    console.log(`✅ Level 3 Final Cards: ${level3Cards.length}`)

    return { level3Cards, availableBrands }
  }

  /**
   * FINAL SCORING AND RECOMMENDATION
   * Apply adaptive scoring based on joining fee and brand match scenarios
   */
  static finalScoringAndRecommendation(level3Cards: CreditCard[], userProfile: UserProfile): ScoredCard[] {
    console.log("\n🎯 FINAL SCORING AND RECOMMENDATION")
    console.log("=".repeat(50))
    console.log(`📊 Cards to score: ${level3Cards.length}`)

    if (level3Cards.length === 0) {
      console.log("⚠️ No cards available for scoring")
      return []
    }

    // Determine scoring scenario
    const hasZeroJoiningFee = userProfile.joiningFeePreference === "no_fee"
    const hasBrandMatch = userProfile.preferredBrands.length > 0

    let scoringScenario: string
    let weights: { categoryMatch: number; rewardsRate: number; brandMatch?: number; signUpBonus?: number }

    if (hasZeroJoiningFee && hasBrandMatch) {
      scoringScenario = "Zero Fee + Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 20, brandMatch: 50 }
    } else if (hasZeroJoiningFee && !hasBrandMatch) {
      scoringScenario = "Zero Fee + No Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 60, signUpBonus: 10 }
    } else if (!hasZeroJoiningFee && hasBrandMatch) {
      scoringScenario = "Fee >0 + Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 20, brandMatch: 50 }
    } else {
      scoringScenario = "Fee >0 + No Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 60, signUpBonus: 10 }
    }

    console.log(`🎯 Scoring Scenario: ${scoringScenario}`)
    console.log(`⚖️ Weights: ${JSON.stringify(weights)}`)

    // Calculate max values for normalization
    const maxRewardsRate = Math.max(...level3Cards.map((c) => c.rewardsRate), 1)
    const maxSignUpBonus = Math.max(...level3Cards.map((c) => c.signUpBonus), 1)

    // Score each card
    const scoredCards: ScoredCard[] = level3Cards.map((card) => {
      // 1. Category Match Score
      const matchPercentage = this.calculateCategoryMatchPercentage(
        userProfile.spendingCategories,
        card.spendingCategories,
      )
      const categoryScore = (matchPercentage / 100) * weights.categoryMatch

      // 2. Rewards Rate Score
      const rewardsScore = (card.rewardsRate / maxRewardsRate) * weights.rewardsRate

      // 3. Brand Match Score (if applicable)
      let brandScore = 0
      if (weights.brandMatch) {
        brandScore = userProfile.preferredBrands.includes(card.bank) ? weights.brandMatch : 0
      }

      // 4. Sign-up Bonus Score (if applicable)
      let signUpScore = 0
      if (weights.signUpBonus) {
        signUpScore = (card.signUpBonus / maxSignUpBonus) * weights.signUpBonus
      }

      const totalScore = categoryScore + rewardsScore + brandScore + signUpScore

      console.log(`\n📊 ${card.cardName} (${card.bank}):`)
      console.log(
        `   🛍️ Category Match: ${matchPercentage.toFixed(1)}% → ${categoryScore.toFixed(1)}/${weights.categoryMatch}`,
      )
      console.log(`   🎁 Rewards Rate: ${card.rewardsRate}% → ${rewardsScore.toFixed(1)}/${weights.rewardsRate}`)
      if (weights.brandMatch) {
        console.log(`   🏦 Brand Match: ${brandScore > 0 ? "Yes" : "No"} → ${brandScore}/${weights.brandMatch}`)
      }
      if (weights.signUpBonus) {
        console.log(`   🎉 Sign-up Bonus: ₹${card.signUpBonus} → ${signUpScore.toFixed(1)}/${weights.signUpBonus}`)
      }
      console.log(`   🎯 TOTAL SCORE: ${totalScore.toFixed(2)}/100`)

      return {
        card,
        score: totalScore,
        scoreBreakdown: {
          categoryMatch: categoryScore,
          rewardsRate: rewardsScore,
          brandMatch: brandScore,
          signUpBonus: signUpScore,
        },
        matchPercentage,
        reasoning: this.generateReasoning(card, matchPercentage, scoringScenario, userProfile),
      }
    })

    // Sort by score (highest first) with brand preference priority
    const sortedCards = this.applySortingLogic(scoredCards, userProfile.preferredBrands)

    console.log(`\n🏆 FINAL RECOMMENDATIONS:`)
    sortedCards.forEach((scored, index) => {
      console.log(`${index + 1}. ${scored.card.cardName} (${scored.card.bank}): ${scored.score.toFixed(2)}/100`)
    })

    return sortedCards
  }

  /**
   * Complete funnel processing
   */
  static processFunnel(allCards: CreditCard[], userProfile: UserProfile): FunnelResult {
    console.log("🚀 STARTING FUNNEL-BASED RECOMMENDATION ENGINE")
    console.log("=".repeat(70))

    // Level 1: Basic Eligibility
    const level1Cards = this.level1BasicEligibility(allCards, userProfile.monthlyIncome, userProfile.creditScore)

    // Level 2: Category Filtering
    const level2Cards = this.level2CategoryFiltering(level1Cards, userProfile.spendingCategories)

    // Level 3: Joining Fee and Brand Filtering
    const { level3Cards, availableBrands } = this.level3JoiningFeeAndBrandFiltering(
      level2Cards,
      userProfile.joiningFeePreference,
      userProfile.preferredBrands,
    )

    // Final Scoring
    const finalRecommendations = this.finalScoringAndRecommendation(level3Cards, userProfile)

    const funnelStats = {
      totalCards: allCards.length,
      level1Count: level1Cards.length,
      level2Count: level2Cards.length,
      level3Count: level3Cards.length,
      finalCount: finalRecommendations.length,
    }

    console.log("\n📈 FUNNEL STATISTICS:")
    console.log(`Total Cards: ${funnelStats.totalCards}`)
    console.log(`Level 1 (Basic): ${funnelStats.level1Count}`)
    console.log(`Level 2 (Category): ${funnelStats.level2Count}`)
    console.log(`Level 3 (Fee/Brand): ${funnelStats.level3Count}`)
    console.log(`Final Recommendations: ${funnelStats.finalCount}`)

    return {
      level1Cards,
      level2Cards,
      level3Cards,
      availableBrands,
      finalRecommendations,
      funnelStats,
    }
  }

  /**
   * Calculate category match percentage with flexible matching
   */
  private static calculateCategoryMatchPercentage(userCategories: string[], cardCategories: string[]): number {
    if (userCategories.length === 0) return 0

    const normalizedUserCategories = userCategories.map((cat) => cat.toLowerCase().trim())
    const normalizedCardCategories = cardCategories.map((cat) => cat.toLowerCase().trim())

    let matchCount = 0

    for (const userCat of normalizedUserCategories) {
      for (const cardCat of normalizedCardCategories) {
        if (this.categoriesMatch(userCat, cardCat)) {
          matchCount++
          break // Count each user category only once
        }
      }
    }

    return (matchCount / userCategories.length) * 100
  }

  /**
   * Check if two categories match (exact, partial, or keyword match)
   */
  private static categoriesMatch(userCat: string, cardCat: string): boolean {
    // Exact match
    if (userCat === cardCat) return true

    // Partial match (either contains the other)
    if (userCat.includes(cardCat) || cardCat.includes(userCat)) return true

    // Keyword matching for common variations
    const keywordMappings: { [key: string]: string[] } = {
      dining: ["restaurant", "food", "eat", "meal"],
      restaurant: ["dining", "food", "eat", "meal"],
      travel: ["hotel", "flight", "airline", "booking", "vacation"],
      hotel: ["travel", "booking", "accommodation", "stay"],
      shopping: ["retail", "store", "purchase", "buy"],
      online: ["internet", "digital", "e-commerce", "web"],
      fuel: ["gas", "petrol", "gasoline", "pump"],
      gas: ["fuel", "petrol", "gasoline", "pump"],
      entertainment: ["movie", "cinema", "streaming", "show"],
      grocery: ["supermarket", "food", "groceries", "market"],
      utility: ["bill", "electric", "water", "internet", "phone"],
      transport: ["taxi", "uber", "metro", "bus", "ride"],
    }

    for (const [key, synonyms] of Object.entries(keywordMappings)) {
      if (userCat.includes(key) && synonyms.some((synonym) => cardCat.includes(synonym))) {
        return true
      }
      if (cardCat.includes(key) && synonyms.some((synonym) => userCat.includes(synonym))) {
        return true
      }
    }

    return false
  }

  /**
   * Apply sorting logic with brand preference priority
   */
  private static applySortingLogic(scoredCards: ScoredCard[], preferredBrands: string[]): ScoredCard[] {
    if (preferredBrands.length === 0) {
      // No brand preference - sort by score only
      return scoredCards.sort((a, b) => b.score - a.score)
    }

    // Check if any preferred brand cards exist
    const preferredBrandCards = scoredCards.filter((scored) => preferredBrands.includes(scored.card.bank))

    if (preferredBrandCards.length > 0) {
      // Case 1: Preferred brand cards exist - rank them first
      const otherCards = scoredCards.filter((scored) => !preferredBrands.includes(scored.card.bank))

      return [...preferredBrandCards.sort((a, b) => b.score - a.score), ...otherCards.sort((a, b) => b.score - a.score)]
    } else {
      // Case 2: No preferred brand cards - show notice and rank by score
      console.log("⚠️ NOTICE: Your chosen brand did not match; showing best alternatives")
      return scoredCards.sort((a, b) => b.score - a.score)
    }
  }

  /**
   * Generate reasoning text for each recommendation
   */
  private static generateReasoning(
    card: CreditCard,
    matchPercentage: number,
    scoringScenario: string,
    userProfile: UserProfile,
  ): string {
    const parts = []

    parts.push(`${matchPercentage.toFixed(1)}% category match`)
    parts.push(`${card.rewardsRate}% rewards rate`)

    if (userProfile.preferredBrands.includes(card.bank)) {
      parts.push("preferred brand bonus")
    }

    if (card.joiningFee === 0) {
      parts.push("no joining fee")
    }

    if (card.signUpBonus > 0) {
      parts.push(`₹${card.signUpBonus.toLocaleString()} welcome bonus`)
    }

    return `Selected based on ${parts.join(", ")}. Scoring: ${scoringScenario}.`
  }
}
