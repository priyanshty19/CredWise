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
  twoTierResult?: TwoTierResult
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
  tier?: "preferred_brand" | "general"
}

export interface TwoTierResult {
  preferredBrandCards: ScoredCard[]
  generalCards: ScoredCard[]
  showGeneralMessage: boolean
  finalTop7: ScoredCard[]
}

/**
 * FUNNEL-BASED RECOMMENDATION ENGINE WITH TWO-TIER SYSTEM
 *
 * Implements a 3-level filtering system:
 * Level 1: Basic Eligibility (Income + Credit Score)
 * Level 2: Category Preference (>65% match required)
 * Level 3: Joining Fee + Brand Filtering
 * Final: Two-Tier Recommendation System (Preferred Brand + General)
 */
export class FunnelRecommendationEngine {
  /**
   * LEVEL 1: Basic Eligibility Filtering
   * Filter cards based on income and credit score requirements only
   */
  static level1BasicEligibility(allCards: CreditCard[], userIncome: number, userCreditScore: number): CreditCard[] {
    const level1Cards = allCards.filter((card) => {
      const meetsIncome = card.monthlyIncomeRequirement === 0 || userIncome >= card.monthlyIncomeRequirement
      const meetsCredit = card.creditScoreRequirement === 0 || userCreditScore >= card.creditScoreRequirement
      return meetsIncome && meetsCredit
    })

    return level1Cards
  }

  /**
   * LEVEL 2: Category Preference Filtering
   * Only pass cards with >65% category match
   */
  static level2CategoryFiltering(level1Cards: CreditCard[], userSpendingCategories: string[]): CreditCard[] {
    if (userSpendingCategories.length === 0) {
      return level1Cards
    }

    const level2Cards = level1Cards.filter((card) => {
      const matchPercentage = this.calculateCategoryMatchPercentage(userSpendingCategories, card.spendingCategories)
      return matchPercentage > 65
    })

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
    let feeFilteredCards: CreditCard[] = []

    switch (joiningFeePreference) {
      case "no_fee":
        feeFilteredCards = level2Cards.filter((card) => card.joiningFee === 0)
        break
      case "low_fee":
        feeFilteredCards = level2Cards.filter((card) => card.joiningFee <= 1000)
        break
      case "no_concern":
        feeFilteredCards = level2Cards
        break
    }

    const availableBrands = [...new Set(feeFilteredCards.map((card) => card.bank))].sort()

    return { level3Cards: feeFilteredCards, availableBrands }
  }

  /**
   * TWO-TIER RECOMMENDATION SYSTEM
   * Tier 1: Preferred Brand Cards (if selected)
   * Tier 2: General Cards (to fill remaining slots)
   * ALWAYS LIMITED TO MAXIMUM 7 CARDS TOTAL
   */
  static twoTierRecommendationSystem(level3Cards: CreditCard[], userProfile: UserProfile): TwoTierResult {
    if (level3Cards.length === 0) {
      return {
        preferredBrandCards: [],
        generalCards: [],
        showGeneralMessage: false,
        finalTop7: [],
      }
    }

    let preferredBrandCards: ScoredCard[] = []
    let generalCards: ScoredCard[] = []
    let showGeneralMessage = false

    // TIER 1: Preferred Brand Recommendations
    if (userProfile.preferredBrands.length > 0) {
      const brandMatchedCards = level3Cards.filter((card) => userProfile.preferredBrands.includes(card.bank))

      if (brandMatchedCards.length > 0) {
        const allPreferredBrandCards = this.scoreAndSortCards(brandMatchedCards, userProfile, "preferred_brand")
        preferredBrandCards = allPreferredBrandCards.slice(0, 7)
      }

      // TIER 2: General Recommendations (if needed and space available)
      if (preferredBrandCards.length < 7) {
        const remainingSlots = 7 - preferredBrandCards.length
        const generalCandidates = level3Cards.filter(
          (card) => !preferredBrandCards.some((pref) => pref.card.id === card.id),
        )

        if (generalCandidates.length > 0) {
          const allGeneralCards = this.scoreAndSortCards(generalCandidates, userProfile, "general")
          generalCards = allGeneralCards.slice(0, remainingSlots)
          showGeneralMessage = true
        }
      }
    } else {
      // NO PREFERRED BRANDS: Use general recommendations only (MAX 7)
      const allGeneralCards = this.scoreAndSortCards(level3Cards, userProfile, "general")
      generalCards = allGeneralCards.slice(0, 7)
      showGeneralMessage = false
    }

    // Combine tiers for final TOP 7 (should already be limited but double-check)
    const finalTop7 = [...preferredBrandCards, ...generalCards].slice(0, 7)

    return {
      preferredBrandCards,
      generalCards,
      showGeneralMessage,
      finalTop7,
    }
  }

  /**
   * Score and sort cards using existing logic
   */
  private static scoreAndSortCards(
    cards: CreditCard[],
    userProfile: UserProfile,
    tier: "preferred_brand" | "general",
  ): ScoredCard[] {
    // Determine scoring scenario
    const hasZeroJoiningFee = userProfile.joiningFeePreference === "no_fee"
    const hasBrandPreference = userProfile.preferredBrands.length > 0 && tier === "preferred_brand"

    let scoringScenario: string
    let weights: { categoryMatch: number; rewardsRate: number; brandMatch?: number; signUpBonus?: number }

    if (hasZeroJoiningFee && hasBrandPreference) {
      scoringScenario = "Zero Fee + Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 20, brandMatch: 50 }
    } else if (hasZeroJoiningFee && !hasBrandPreference) {
      scoringScenario = "Zero Fee + No Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 60, signUpBonus: 10 }
    } else if (!hasZeroJoiningFee && hasBrandPreference) {
      scoringScenario = "Fee >0 + Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 20, brandMatch: 50 }
    } else {
      scoringScenario = "Fee >0 + No Brand Match"
      weights = { categoryMatch: 30, rewardsRate: 60, signUpBonus: 10 }
    }

    // Calculate max values for normalization
    const maxRewardsRate = Math.max(...cards.map((c) => c.rewardsRate), 1)
    const maxSignUpBonus = Math.max(...cards.map((c) => c.signUpBonus), 1)

    // Score each card
    const scoredCards: ScoredCard[] = cards.map((card) => {
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
        reasoning: this.generateReasoning(card, matchPercentage, scoringScenario, userProfile, tier),
        tier,
      }
    })

    // Sort by score (highest first)
    return scoredCards.sort((a, b) => b.score - a.score)
  }

  /**
   * Complete funnel processing with two-tier system
   */
  static processFunnel(allCards: CreditCard[], userProfile: UserProfile): FunnelResult {
    // Level 1: Basic Eligibility
    const level1Cards = this.level1BasicEligibility(allCards, userProfile.monthlyIncome, userProfile.creditScore)

    // Level 2: Category Filtering
    const level2Cards = this.level2CategoryFiltering(level1Cards, userProfile.spendingCategories)

    // Level 3: Joining Fee Filtering (no brand filtering)
    const { level3Cards, availableBrands } = this.level3JoiningFeeAndBrandFiltering(
      level2Cards,
      userProfile.joiningFeePreference,
      userProfile.preferredBrands,
    )

    // Two-Tier Recommendation System
    const twoTierResult = this.twoTierRecommendationSystem(level3Cards, userProfile)

    const funnelStats = {
      totalCards: allCards.length,
      level1Count: level1Cards.length,
      level2Count: level2Cards.length,
      level3Count: level3Cards.length,
      finalCount: twoTierResult.finalTop7.length,
    }

    return {
      level1Cards,
      level2Cards,
      level3Cards,
      availableBrands,
      finalRecommendations: twoTierResult.finalTop7,
      funnelStats,
      twoTierResult,
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
   * Generate reasoning text for each recommendation
   */
  private static generateReasoning(
    card: CreditCard,
    matchPercentage: number,
    scoringScenario: string,
    userProfile: UserProfile,
    tier: "preferred_brand" | "general",
  ): string {
    const parts = []

    parts.push(`${matchPercentage.toFixed(1)}% category match`)
    parts.push(`${card.rewardsRate}% rewards rate`)

    if (tier === "preferred_brand" && userProfile.preferredBrands.includes(card.bank)) {
      parts.push("preferred brand match")
    } else if (tier === "general" && userProfile.preferredBrands.length > 0) {
      parts.push("best alternative option")
    }

    if (card.joiningFee === 0) {
      parts.push("no joining fee")
    }

    if (card.signUpBonus > 0) {
      parts.push(`₹${card.signUpBonus.toLocaleString()} welcome bonus`)
    }

    const tierLabel = tier === "preferred_brand" ? "Preferred Brand Tier" : "General Tier"
    return `Selected from ${tierLabel} based on ${parts.join(", ")}. Scoring: ${scoringScenario}.`
  }
}
