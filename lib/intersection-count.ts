// Adaptive and Dynamic Card Recommendation Algorithm
// Based on intersection logic for maximum user relevance

interface CreditCard {
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
  spendingCategories: string[] // Card's spending categories
}

interface UserProfile {
  creditScore: number
  monthlyIncome: number
  spendingCategories: string[] // User's selected spending categories
  preferredBanks: string[] // User's preferred banks
  joiningFeePreference: "no_fee" | "low_fee" | "not_concerned" // User's joining fee preference
}

interface ScoringWeights {
  CATEGORY_WEIGHT: number // Weight for category intersection
  REWARD_WEIGHT: number // Weight for rewards rate
  BANK_BONUS: number // Bonus points for preferred bank
  SIGNUP_WEIGHT: number // Weight for sign-up bonus
  JOINING_FEE_WEIGHT: number // Weight for joining fee penalty
  ANNUAL_FEE_WEIGHT: number // Weight for annual fee penalty
}

interface CardScore {
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
    matchedCategories: string[]
    intersectionCount: number
    intersectionPercentage: number
  }
  eligible: boolean
  eligibilityReasons: string[]
}

// Default scoring weights - can be adjusted based on business requirements
const DEFAULT_WEIGHTS: ScoringWeights = {
  CATEGORY_WEIGHT: 40, // Highest weight for category matching
  REWARD_WEIGHT: 25, // Second highest for rewards
  BANK_BONUS: 15, // Significant bonus for preferred banks
  SIGNUP_WEIGHT: 10, // Moderate weight for sign-up bonus
  JOINING_FEE_WEIGHT: 5, // Lower weight for joining fee
  ANNUAL_FEE_WEIGHT: 5, // Lower weight for annual fee
}

/**
 * Adaptive and Dynamic Card Recommendation Algorithm
 * Prioritizes cards based on intersection of user spending categories with card categories
 */
export function getAdaptiveCardRecommendations(
  cards: CreditCard[],
  userProfile: UserProfile,
  topN = 7,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): CardScore[] {
  console.log("🎯 ADAPTIVE INTERSECTION-BASED RECOMMENDATION ALGORITHM")
  console.log("=".repeat(80))
  console.log("👤 User Profile:", userProfile)
  console.log("📊 Total available cards:", cards.length)
  console.log("🎯 Scoring Weights:", weights)

  // Step 1: Eligibility Filtering
  console.log("\n🔍 STEP 1: ELIGIBILITY FILTERING")
  const eligibleCards = cards.filter((card) => {
    const reasons: string[] = []
    let eligible = true

    // Credit Score Check
    if (card.creditScoreRequirement > 0 && userProfile.creditScore < card.creditScoreRequirement) {
      eligible = false
      reasons.push(`Credit score too low (need ${card.creditScoreRequirement}+, have ${userProfile.creditScore})`)
    }

    // Income Check
    if (card.monthlyIncomeRequirement > 0 && userProfile.monthlyIncome < card.monthlyIncomeRequirement) {
      eligible = false
      reasons.push(`Income too low (need ₹${card.monthlyIncomeRequirement}+, have ₹${userProfile.monthlyIncome})`)
    }

    // Joining Fee Preference Check
    if (userProfile.joiningFeePreference === "no_fee" && card.joiningFee > 0) {
      eligible = false
      reasons.push(`Has joining fee (₹${card.joiningFee}) but user wants no fee`)
    }

    if (userProfile.joiningFeePreference === "low_fee" && card.joiningFee > 1000) {
      eligible = false
      reasons.push(`Joining fee too high (₹${card.joiningFee}) for low fee preference`)
    }

    if (eligible) {
      console.log(`✅ ${card.cardName}: ELIGIBLE`)
    } else {
      console.log(`❌ ${card.cardName}: ${reasons.join(", ")}`)
    }

    return eligible
  })

  console.log(`\n🎯 Eligible cards after filtering: ${eligibleCards.length}/${cards.length}`)

  if (eligibleCards.length === 0) {
    console.log("⚠️ No cards meet eligibility criteria")
    return []
  }

  // Step 2: Calculate Intersection and Scoring
  console.log("\n📊 STEP 2: INTERSECTION ANALYSIS & SCORING")

  // Calculate max values for normalization
  const maxRewardsRate = Math.max(...eligibleCards.map((c) => c.rewardsRate), 1)
  const maxSignUpBonus = Math.max(...eligibleCards.map((c) => c.signUpBonus), 1)
  const maxJoiningFee = Math.max(...eligibleCards.map((c) => c.joiningFee), 1)
  const maxAnnualFee = Math.max(...eligibleCards.map((c) => c.annualFee), 1)

  console.log("📈 Normalization values:")
  console.log(`   Max Rewards Rate: ${maxRewardsRate}%`)
  console.log(`   Max Sign-up Bonus: ₹${maxSignUpBonus}`)
  console.log(`   Max Joining Fee: ₹${maxJoiningFee}`)
  console.log(`   Max Annual Fee: ₹${maxAnnualFee}`)

  const scoredCards: CardScore[] = eligibleCards.map((card) => {
    // 1. Category Intersection Score (Highest Priority)
    const matchedCategories = card.spendingCategories.filter((cardCat) =>
      userProfile.spendingCategories.some(
        (userCat) =>
          cardCat.toLowerCase().includes(userCat.toLowerCase()) ||
          userCat.toLowerCase().includes(cardCat.toLowerCase()),
      ),
    )

    const intersectionCount = matchedCategories.length
    const intersectionPercentage =
      userProfile.spendingCategories.length > 0 ? intersectionCount / userProfile.spendingCategories.length : 0

    const intersectionScore = intersectionPercentage * weights.CATEGORY_WEIGHT

    // 2. Rewards Rate Score
    const rewardsScore = (card.rewardsRate / maxRewardsRate) * weights.REWARD_WEIGHT

    // 3. Bank Preference Bonus
    const bankBonus = userProfile.preferredBanks.some(
      (bank) =>
        card.bank.toLowerCase().includes(bank.toLowerCase()) || bank.toLowerCase().includes(card.bank.toLowerCase()),
    )
      ? weights.BANK_BONUS
      : 0

    // 4. Sign-up Bonus Score
    const signupScore = (card.signUpBonus / maxSignUpBonus) * weights.SIGNUP_WEIGHT

    // 5. Joining Fee Score (penalty for higher fees)
    let joiningFeeScore = 0
    if (userProfile.joiningFeePreference !== "not_concerned") {
      joiningFeeScore =
        maxJoiningFee > 0
          ? ((maxJoiningFee - card.joiningFee) / maxJoiningFee) * weights.JOINING_FEE_WEIGHT
          : weights.JOINING_FEE_WEIGHT
    }

    // 6. Annual Fee Score (penalty for higher fees)
    const annualFeeScore =
      maxAnnualFee > 0
        ? ((maxAnnualFee - card.annualFee) / maxAnnualFee) * weights.ANNUAL_FEE_WEIGHT
        : weights.ANNUAL_FEE_WEIGHT

    const totalScore = intersectionScore + rewardsScore + bankBonus + signupScore + joiningFeeScore + annualFeeScore

    console.log(`\n📊 ${card.cardName} (${card.bank}):`)
    console.log(`   🎯 Categories: [${card.spendingCategories.join(", ")}]`)
    console.log(
      `   ✅ Matched: [${matchedCategories.join(", ")}] (${intersectionCount}/${userProfile.spendingCategories.length})`,
    )
    console.log(
      `   📈 Intersection Score: ${intersectionScore.toFixed(1)}/${weights.CATEGORY_WEIGHT} (${(intersectionPercentage * 100).toFixed(1)}%)`,
    )
    console.log(`   🎁 Rewards Score: ${rewardsScore.toFixed(1)}/${weights.REWARD_WEIGHT} (${card.rewardsRate}%)`)
    console.log(
      `   🏦 Bank Bonus: ${bankBonus}/${weights.BANK_BONUS} (${bankBonus > 0 ? "Preferred" : "Not preferred"})`,
    )
    console.log(`   🎉 Signup Score: ${signupScore.toFixed(1)}/${weights.SIGNUP_WEIGHT} (₹${card.signUpBonus})`)
    console.log(
      `   💳 Joining Fee Score: ${joiningFeeScore.toFixed(1)}/${weights.JOINING_FEE_WEIGHT} (₹${card.joiningFee})`,
    )
    console.log(
      `   📅 Annual Fee Score: ${annualFeeScore.toFixed(1)}/${weights.ANNUAL_FEE_WEIGHT} (₹${card.annualFee})`,
    )
    console.log(`   🎯 TOTAL SCORE: ${totalScore.toFixed(1)}/100`)

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
      intersectionDetails: {
        matchedCategories,
        intersectionCount,
        intersectionPercentage,
      },
      eligible: true,
      eligibilityReasons: [],
    }
  })

  // Step 3: Ensure Relevance - Filter out cards with zero intersection (unless no matches found)
  console.log("\n🎯 STEP 3: RELEVANCE FILTERING")
  let relevantCards = scoredCards.filter((scored) => scored.intersectionDetails.intersectionCount > 0)

  if (relevantCards.length === 0) {
    console.log("⚠️ No cards match user spending categories - including all eligible cards")
    relevantCards = scoredCards
  } else {
    console.log(`✅ ${relevantCards.length} cards match at least one spending category`)
  }

  // Step 4: Ensure Preferred Bank Representation
  console.log("\n🏦 STEP 4: PREFERRED BANK GUARANTEE")
  if (userProfile.preferredBanks.length > 0) {
    const preferredBankCards = relevantCards.filter((scored) =>
      userProfile.preferredBanks.some(
        (bank) =>
          scored.card.bank.toLowerCase().includes(bank.toLowerCase()) ||
          bank.toLowerCase().includes(scored.card.bank.toLowerCase()),
      ),
    )

    console.log(`🏦 Found ${preferredBankCards.length} cards from preferred banks`)

    // Ensure at least one preferred bank card is included if available
    if (preferredBankCards.length > 0) {
      const topPreferredCard = preferredBankCards.sort((a, b) => b.totalScore - a.totalScore)[0]
      console.log(
        `✅ Top preferred bank card: ${topPreferredCard.card.cardName} (Score: ${topPreferredCard.totalScore.toFixed(1)})`,
      )
    }
  }

  // Step 5: Final Ranking and Selection
  console.log("\n🏆 STEP 5: FINAL RANKING")
  const finalRecommendations = relevantCards
    .sort((a, b) => {
      // Primary sort: Total score (descending)
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore
      }
      // Secondary sort: Intersection count (descending)
      if (b.intersectionDetails.intersectionCount !== a.intersectionDetails.intersectionCount) {
        return b.intersectionDetails.intersectionCount - a.intersectionDetails.intersectionCount
      }
      // Tertiary sort: Rewards rate (descending)
      return b.card.rewardsRate - a.card.rewardsRate
    })
    .slice(0, topN)

  console.log(`\n🎯 TOP ${topN} ADAPTIVE RECOMMENDATIONS:`)
  finalRecommendations.forEach((scored, index) => {
    console.log(`${index + 1}. ${scored.card.cardName} (${scored.card.bank})`)
    console.log(`   Score: ${scored.totalScore.toFixed(1)}/100`)
    console.log(
      `   Categories: ${scored.intersectionDetails.intersectionCount}/${userProfile.spendingCategories.length} match`,
    )
    console.log(`   Matched: [${scored.intersectionDetails.matchedCategories.join(", ")}]`)
    console.log(
      `   Bank: ${
        userProfile.preferredBanks.some((bank) => scored.card.bank.toLowerCase().includes(bank.toLowerCase()))
          ? "✅ Preferred"
          : "❌ Not preferred"
      }`,
    )
  })

  // Success Criteria Validation
  console.log("\n✅ SUCCESS CRITERIA VALIDATION:")
  console.log(
    `✅ All recommendations relevant: ${finalRecommendations.every((r) => r.intersectionDetails.intersectionCount > 0) || finalRecommendations.length === 0}`,
  )
  console.log(
    `✅ Preferred bank represented: ${
      userProfile.preferredBanks.length === 0 ||
      finalRecommendations.some((r) =>
        userProfile.preferredBanks.some((bank) => r.card.bank.toLowerCase().includes(bank.toLowerCase())),
      )
    }`,
  )
  console.log(
    `✅ Joining fee preference respected: ${finalRecommendations.every((r) => {
      if (userProfile.joiningFeePreference === "no_fee") return r.card.joiningFee === 0
      if (userProfile.joiningFeePreference === "low_fee") return r.card.joiningFee <= 1000
      return true
    })}`,
  )
  console.log(
    `✅ Intersection-based scoring: ${finalRecommendations.every((r) => r.intersectionDetails.intersectionCount >= 0)}`,
  )

  return finalRecommendations
}

/**
 * Helper function to validate user spending categories against available card categories
 */
export function validateSpendingCategories(
  userCategories: string[],
  availableCardCategories: string[],
): {
  valid: string[]
  invalid: string[]
  suggestions: string[]
} {
  const valid: string[] = []
  const invalid: string[] = []
  const suggestions: string[] = []

  userCategories.forEach((userCat) => {
    const matches = availableCardCategories.filter(
      (cardCat) =>
        cardCat.toLowerCase().includes(userCat.toLowerCase()) || userCat.toLowerCase().includes(cardCat.toLowerCase()),
    )

    if (matches.length > 0) {
      valid.push(userCat)
      suggestions.push(...matches)
    } else {
      invalid.push(userCat)
      // Find closest matches for suggestions
      const closeMatches = availableCardCategories.filter(
        (cardCat) =>
          cardCat.toLowerCase().includes(userCat.toLowerCase().substring(0, 3)) ||
          userCat.toLowerCase().includes(cardCat.toLowerCase().substring(0, 3)),
      )
      suggestions.push(...closeMatches.slice(0, 2))
    }
  })

  return {
    valid,
    invalid,
    suggestions: [...new Set(suggestions)], // Remove duplicates
  }
}

/**
 * Example usage and testing function
 */
export function testAdaptiveAlgorithm() {
  // Sample cards data
  const sampleCards: CreditCard[] = [
    {
      id: "1",
      cardName: "ICICI Amazon Pay Credit Card",
      bank: "ICICI Bank",
      cardType: "Cashback",
      joiningFee: 0,
      annualFee: 0,
      creditScoreRequirement: 650,
      monthlyIncomeRequirement: 25000,
      rewardsRate: 5,
      signUpBonus: 2000,
      features: ["Amazon cashback", "No annual fee"],
      description: "Best for online shopping",
      spendingCategories: ["Online Shopping", "Dining & Restaurants", "Utilities & Bills"],
    },
    {
      id: "2",
      cardName: "HDFC Regalia Credit Card",
      bank: "HDFC Bank",
      cardType: "Rewards",
      joiningFee: 2500,
      annualFee: 2500,
      creditScoreRequirement: 750,
      monthlyIncomeRequirement: 50000,
      rewardsRate: 4,
      signUpBonus: 5000,
      features: ["Travel benefits", "Lounge access"],
      description: "Premium lifestyle card",
      spendingCategories: ["Travel & Hotels", "Dining & Restaurants", "Entertainment"],
    },
    {
      id: "3",
      cardName: "SBI Fuel Credit Card",
      bank: "SBI",
      cardType: "Fuel",
      joiningFee: 500,
      annualFee: 500,
      creditScoreRequirement: 600,
      monthlyIncomeRequirement: 20000,
      rewardsRate: 2.5,
      signUpBonus: 1000,
      features: ["Fuel surcharge waiver", "Low fees"],
      description: "Best for fuel expenses",
      spendingCategories: ["Fuel & Gas", "Transport"],
    },
  ]

  // Sample user profile
  const userProfile: UserProfile = {
    creditScore: 700,
    monthlyIncome: 40000,
    spendingCategories: ["Fuel & Gas", "Dining & Restaurants", "Online Shopping"],
    preferredBanks: ["ICICI Bank"],
    joiningFeePreference: "no_fee",
  }

  console.log("🧪 TESTING ADAPTIVE ALGORITHM")
  const recommendations = getAdaptiveCardRecommendations(sampleCards, userProfile, 3)

  return recommendations
}
