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

export interface UserPreferences {
  spendingCategories: string[]
  preferredBanks: string[]
  creditScore: number
  monthlyIncome: number
  joiningFeePreference: "no_fee" | "low_fee" | "not_concerned"
}

export interface ScoredCard {
  card: CreditCard
  totalScore: number
  scoreBreakdown: {
    intersectionScore: number
    rewardsScore: number
    bankBonus: number
    signupScore: number
    joiningFeeScore: number
    annualFeeScore: number
  }
  intersectionDetails: {
    intersectionCount: number
    matchedCategories: string[]
    intersectionPercentage: number
  }
  eligible: boolean
  eligibilityReasons: string[]
}

export interface RecommendationResult {
  recommendations: ScoredCard[]
  stats: {
    totalCards: number
    eligibleCount: number
    withIntersection: number
    preferredBankCards: number
  }
}

// Scoring weights (total: 100 points)
const SCORING_WEIGHTS = {
  CATEGORY_WEIGHT: 40, // Highest priority - intersection matching
  REWARD_WEIGHT: 25, // Second highest - rewards rate
  BANK_BONUS: 15, // Significant bonus for preferred banks
  SIGNUP_WEIGHT: 10, // Sign-up bonus
  JOINING_FEE_WEIGHT: 5, // Joining fee penalty
  ANNUAL_FEE_WEIGHT: 5, // Annual fee penalty
}

/**
 * Adaptive Card Recommendation Algorithm with Intersection-Based Logic
 *
 * This algorithm prioritizes cards based on:
 * 1. Category intersection (40%) - How many user categories match card categories
 * 2. Rewards rate (25%) - Higher reward rates get higher scores
 * 3. Bank preference (15%) - Bonus for preferred banks
 * 4. Sign-up bonus (10%) - Higher bonuses get higher scores
 * 5. Joining fee (5%) - Lower fees get higher scores
 * 6. Annual fee (5%) - Lower fees get higher scores
 */
export function getAdaptiveCardRecommendations(
  cards: CreditCard[],
  userPreferences: UserPreferences,
  maxResults = 7,
): RecommendationResult {
  console.log("🎯 ADAPTIVE INTERSECTION-BASED ALGORITHM STARTING")
  console.log("=".repeat(70))
  console.log("👤 User Preferences:", userPreferences)
  console.log("📊 Total cards to analyze:", cards.length)
  console.log("🎯 Max results requested:", maxResults)

  // Step 1: Basic eligibility filtering
  console.log("\n🔍 STEP 1: BASIC ELIGIBILITY FILTERING")
  const eligibleCards = cards.filter((card) => {
    const reasons: string[] = []
    let eligible = true

    // Credit score check
    if (card.creditScoreRequirement > 0 && userPreferences.creditScore < card.creditScoreRequirement) {
      eligible = false
      reasons.push(`Credit score too low (need ${card.creditScoreRequirement}+, have ${userPreferences.creditScore})`)
    }

    // Income check
    if (card.monthlyIncomeRequirement > 0 && userPreferences.monthlyIncome < card.monthlyIncomeRequirement) {
      eligible = false
      reasons.push(`Income too low (need ₹${card.monthlyIncomeRequirement}+, have ₹${userPreferences.monthlyIncome})`)
    }

    // Joining fee preference check
    if (userPreferences.joiningFeePreference === "no_fee" && card.joiningFee > 0) {
      eligible = false
      reasons.push(`Has joining fee (₹${card.joiningFee}) but user wants no fee`)
    } else if (userPreferences.joiningFeePreference === "low_fee" && card.joiningFee > 1000) {
      eligible = false
      reasons.push(`Joining fee too high (₹${card.joiningFee}) for low fee preference`)
    }

    if (!eligible) {
      console.log(`❌ ${card.cardName}: ${reasons.join(", ")}`)
    }

    return eligible
  })

  console.log(`✅ Eligible cards after basic filtering: ${eligibleCards.length}`)

  if (eligibleCards.length === 0) {
    console.log("⚠️ No cards meet basic eligibility criteria")
    return {
      recommendations: [],
      stats: {
        totalCards: cards.length,
        eligibleCount: 0,
        withIntersection: 0,
        preferredBankCards: 0,
      },
    }
  }

  // Step 2: Calculate intersection and scoring
  console.log("\n📊 STEP 2: INTERSECTION ANALYSIS & SCORING")

  // Calculate max values for normalization
  const maxRewardsRate = Math.max(...eligibleCards.map((c) => c.rewardsRate), 1)
  const maxSignUpBonus = Math.max(...eligibleCards.map((c) => c.signUpBonus), 1)
  const maxJoiningFee = Math.max(...eligibleCards.map((c) => c.joiningFee), 1)
  const maxAnnualFee = Math.max(...eligibleCards.map((c) => c.annualFee), 1)

  console.log("📈 Normalization values:")
  console.log(`- Max Rewards Rate: ${maxRewardsRate}%`)
  console.log(`- Max Sign-up Bonus: ₹${maxSignUpBonus.toLocaleString()}`)
  console.log(`- Max Joining Fee: ₹${maxJoiningFee.toLocaleString()}`)
  console.log(`- Max Annual Fee: ₹${maxAnnualFee.toLocaleString()}`)

  const scoredCards: ScoredCard[] = eligibleCards.map((card) => {
    // 1. Category Intersection Score (0-40 points) - HIGHEST PRIORITY
    const intersection = calculateCategoryIntersection(userPreferences.spendingCategories, card.spendingCategories)
    const intersectionScore =
      userPreferences.spendingCategories.length > 0
        ? (intersection.intersectionCount / userPreferences.spendingCategories.length) * SCORING_WEIGHTS.CATEGORY_WEIGHT
        : 0

    // 2. Rewards Rate Score (0-25 points)
    const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * SCORING_WEIGHTS.REWARD_WEIGHT : 0

    // 3. Bank Preference Bonus (0-15 points)
    const bankBonus = userPreferences.preferredBanks.some(
      (bank) =>
        card.bank.toLowerCase().includes(bank.toLowerCase()) || bank.toLowerCase().includes(card.bank.toLowerCase()),
    )
      ? SCORING_WEIGHTS.BANK_BONUS
      : 0

    // 4. Sign-up Bonus Score (0-10 points)
    const signupScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * SCORING_WEIGHTS.SIGNUP_WEIGHT : 0

    // 5. Joining Fee Score (0-5 points) - Lower fee = higher score
    const joiningFeeScore =
      maxJoiningFee > 0
        ? ((maxJoiningFee - card.joiningFee) / maxJoiningFee) * SCORING_WEIGHTS.JOINING_FEE_WEIGHT
        : SCORING_WEIGHTS.JOINING_FEE_WEIGHT

    // 6. Annual Fee Score (0-5 points) - Lower fee = higher score
    const annualFeeScore =
      maxAnnualFee > 0
        ? ((maxAnnualFee - card.annualFee) / maxAnnualFee) * SCORING_WEIGHTS.ANNUAL_FEE_WEIGHT
        : SCORING_WEIGHTS.ANNUAL_FEE_WEIGHT

    const totalScore = intersectionScore + rewardsScore + bankBonus + signupScore + joiningFeeScore + annualFeeScore

    console.log(`\n📊 ${card.cardName} (${card.bank}):`)
    console.log(
      `   🛍️ Category Match: ${intersection.intersectionCount}/${userPreferences.spendingCategories.length} → ${intersectionScore.toFixed(1)}/40`,
    )
    console.log(`   🎁 Rewards Rate: ${card.rewardsRate}% → ${rewardsScore.toFixed(1)}/25`)
    console.log(`   🏦 Bank Bonus: ${bankBonus > 0 ? "Yes" : "No"} → ${bankBonus}/15`)
    console.log(`   🎉 Sign-up Bonus: ₹${card.signUpBonus} → ${signupScore.toFixed(1)}/10`)
    console.log(`   💳 Joining Fee: ₹${card.joiningFee} → ${joiningFeeScore.toFixed(1)}/5`)
    console.log(`   📅 Annual Fee: ₹${card.annualFee} → ${annualFeeScore.toFixed(1)}/5`)
    console.log(`   🎯 TOTAL SCORE: ${totalScore.toFixed(2)}/100`)

    return {
      card,
      totalScore,
      scoreBreakdown: {
        intersectionScore,
        rewardsScore,
        bankBonus,
        signupScore,
        joiningFeeScore,
        annualFeeScore,
      },
      intersectionDetails: intersection,
      eligible: true,
      eligibilityReasons: [],
    }
  })

  // Step 3: Filter cards with category intersection (Success Criteria #1)
  console.log("\n🎯 STEP 3: CATEGORY RELEVANCE FILTERING")
  const cardsWithIntersection = scoredCards.filter((scored) => {
    const hasIntersection = scored.intersectionDetails.intersectionCount > 0
    if (!hasIntersection) {
      console.log(`❌ ${scored.card.cardName}: No category intersection`)
    }
    return hasIntersection
  })

  console.log(`✅ Cards with category intersection: ${cardsWithIntersection.length}`)

  // If no cards have intersection, fall back to all eligible cards but log warning
  const finalCandidates = cardsWithIntersection.length > 0 ? cardsWithIntersection : scoredCards
  if (cardsWithIntersection.length === 0) {
    console.log("⚠️ No cards match user categories - falling back to all eligible cards")
  }

  // Step 4: Sort by total score and take top N
  console.log("\n🏆 STEP 4: FINAL RANKING")
  const sortedRecommendations = finalCandidates.sort((a, b) => b.totalScore - a.totalScore).slice(0, maxResults)

  // Calculate statistics
  const stats = {
    totalCards: cards.length,
    eligibleCount: eligibleCards.length,
    withIntersection: cardsWithIntersection.length,
    preferredBankCards: sortedRecommendations.filter((scored) => scored.scoreBreakdown.bankBonus > 0).length,
  }

  console.log("\n📈 FINAL RESULTS:")
  console.log(`- Total cards analyzed: ${stats.totalCards}`)
  console.log(`- Eligible cards: ${stats.eligibleCount}`)
  console.log(`- Cards with category match: ${stats.withIntersection}`)
  console.log(`- Preferred bank cards in results: ${stats.preferredBankCards}`)
  console.log(`- Final recommendations: ${sortedRecommendations.length}`)

  console.log("\n🏆 TOP RECOMMENDATIONS:")
  sortedRecommendations.forEach((scored, index) => {
    console.log(`${index + 1}. ${scored.card.cardName} - Score: ${scored.totalScore.toFixed(2)}/100`)
    console.log(`   Categories: [${scored.intersectionDetails.matchedCategories.join(", ")}]`)
    console.log(`   Bank: ${scored.card.bank} ${scored.scoreBreakdown.bankBonus > 0 ? "⭐" : ""}`)
  })

  return {
    recommendations: sortedRecommendations,
    stats,
  }
}

/**
 * Calculate category intersection between user preferences and card categories
 * Uses flexible matching to handle variations in category names
 */
function calculateCategoryIntersection(userCategories: string[], cardCategories: string[]) {
  const matchedCategories: string[] = []

  // Normalize categories for comparison
  const normalizedUserCategories = userCategories.map((cat) => cat.toLowerCase().trim())
  const normalizedCardCategories = cardCategories.map((cat) => cat.toLowerCase().trim())

  // Find exact and partial matches
  for (const userCat of normalizedUserCategories) {
    for (const cardCat of normalizedCardCategories) {
      // Exact match
      if (userCat === cardCat) {
        matchedCategories.push(userCat)
        break
      }
      // Partial match (either contains the other)
      else if (userCat.includes(cardCat) || cardCat.includes(userCat)) {
        matchedCategories.push(userCat)
        break
      }
      // Keyword matching for common variations
      else if (matchesKeywords(userCat, cardCat)) {
        matchedCategories.push(userCat)
        break
      }
    }
  }

  const intersectionCount = matchedCategories.length
  const intersectionPercentage = userCategories.length > 0 ? (intersectionCount / userCategories.length) * 100 : 0

  return {
    intersectionCount,
    matchedCategories,
    intersectionPercentage,
  }
}

/**
 * Check if two category strings match based on common keywords
 */
function matchesKeywords(userCat: string, cardCat: string): boolean {
  const keywordMappings = {
    dining: ["restaurant", "food", "eat"],
    restaurant: ["dining", "food", "eat"],
    travel: ["hotel", "flight", "airline", "booking"],
    hotel: ["travel", "booking", "accommodation"],
    shopping: ["retail", "store", "purchase"],
    online: ["internet", "digital", "e-commerce"],
    fuel: ["gas", "petrol", "gasoline"],
    gas: ["fuel", "petrol", "gasoline"],
    entertainment: ["movie", "cinema", "streaming"],
    grocery: ["supermarket", "food", "groceries"],
    utility: ["bill", "electric", "water", "internet"],
    transport: ["taxi", "uber", "metro", "bus"],
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
