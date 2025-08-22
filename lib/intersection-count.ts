// Intersection-based Card Recommendation Algorithm
// Prioritizes cards based on spending category intersection, bank preferences, and user criteria

export interface UserPreferences {
  spendingCategories: string[]
  preferredBanks: string[]
  creditScore: number
  monthlyIncome: number
  joiningFeePreference: "No joining fee" | "Low joining fees (₹0-1000)" | "Not a concern"
}

export interface CreditCard {
  name: string
  bank: string
  spendingCategories: string[]
  rewardRate: number
  creditScoreRequirement: number
  incomeRequirement: number
  joiningFee: number
  annualFee: number
  signupBonus: number
  [key: string]: any
}

export interface ScoredCard extends CreditCard {
  totalScore: number
  intersectionScore: number
  intersectionCount: number
  intersectionPercentage: number
  matchedCategories: string[]
  rewardsScore: number
  bankBonus: number
  signupScore: number
  joiningFeeScore: number
  annualFeeScore: number
  eligible: boolean
  eligibilityReasons: string[]
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
 * Calculates intersection between user spending categories and card categories
 */
export function calculateCategoryIntersection(
  userCategories: string[],
  cardCategories: string[],
): {
  intersectionCount: number
  intersectionPercentage: number
  matchedCategories: string[]
} {
  if (userCategories.length === 0) {
    return { intersectionCount: 0, intersectionPercentage: 0, matchedCategories: [] }
  }

  // Normalize categories for flexible matching
  const normalizeCategory = (category: string) =>
    category
      .toLowerCase()
      .trim()
      .replace(/[&\s]+/g, " ")

  const normalizedUserCategories = userCategories.map(normalizeCategory)
  const normalizedCardCategories = cardCategories.map(normalizeCategory)

  const matchedCategories: string[] = []
  let intersectionCount = 0

  // Check for exact matches and partial matches
  for (const userCat of normalizedUserCategories) {
    for (const cardCat of normalizedCardCategories) {
      // Exact match
      if (userCat === cardCat) {
        matchedCategories.push(userCategories[normalizedUserCategories.indexOf(userCat)])
        intersectionCount++
        break
      }
      // Partial match (either category contains the other)
      else if (userCat.includes(cardCat) || cardCat.includes(userCat)) {
        matchedCategories.push(userCategories[normalizedUserCategories.indexOf(userCat)])
        intersectionCount++
        break
      }
    }
  }

  const intersectionPercentage = (intersectionCount / userCategories.length) * 100

  return {
    intersectionCount,
    intersectionPercentage,
    matchedCategories: [...new Set(matchedCategories)], // Remove duplicates
  }
}

/**
 * Checks if card meets eligibility criteria
 */
export function checkCardEligibility(
  card: CreditCard,
  userPreferences: UserPreferences,
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Credit score requirement
  if (userPreferences.creditScore < card.creditScoreRequirement) {
    reasons.push(`Credit score ${userPreferences.creditScore} below required ${card.creditScoreRequirement}`)
  }

  // Income requirement
  if (userPreferences.monthlyIncome < card.incomeRequirement) {
    reasons.push(
      `Monthly income ₹${userPreferences.monthlyIncome.toLocaleString()} below required ₹${card.incomeRequirement.toLocaleString()}`,
    )
  }

  // Joining fee preference
  if (userPreferences.joiningFeePreference === "No joining fee" && card.joiningFee > 0) {
    reasons.push(`Has joining fee of ₹${card.joiningFee} (user prefers no joining fee)`)
  } else if (userPreferences.joiningFeePreference === "Low joining fees (₹0-1000)" && card.joiningFee > 1000) {
    reasons.push(`Joining fee ₹${card.joiningFee} exceeds ₹1000 limit`)
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  }
}

/**
 * Calculates bank preference bonus
 */
export function calculateBankBonus(cardBank: string, preferredBanks: string[]): number {
  if (preferredBanks.length === 0) return 0

  // Normalize bank names for flexible matching
  const normalizeBank = (bank: string) => bank.toLowerCase().trim().replace(/\s+/g, " ")

  const normalizedCardBank = normalizeBank(cardBank)
  const normalizedPreferredBanks = preferredBanks.map(normalizeBank)

  // Check for exact match or partial match
  for (const preferredBank of normalizedPreferredBanks) {
    if (
      normalizedCardBank === preferredBank ||
      normalizedCardBank.includes(preferredBank) ||
      preferredBank.includes(normalizedCardBank)
    ) {
      return SCORING_WEIGHTS.BANK_BONUS
    }
  }

  return 0
}

/**
 * Scores a single card based on user preferences
 */
export function scoreCard(
  card: CreditCard,
  userPreferences: UserPreferences,
  maxRewardRate = 5,
  maxSignupBonus = 10000,
): ScoredCard {
  // Check eligibility first
  const eligibility = checkCardEligibility(card, userPreferences)

  // Calculate category intersection
  const intersection = calculateCategoryIntersection(userPreferences.spendingCategories, card.spendingCategories)

  // Calculate individual scores
  const intersectionScore = (intersection.intersectionPercentage / 100) * SCORING_WEIGHTS.CATEGORY_WEIGHT
  const rewardsScore = (card.rewardRate / maxRewardRate) * SCORING_WEIGHTS.REWARD_WEIGHT
  const bankBonus = calculateBankBonus(card.bank, userPreferences.preferredBanks)
  const signupScore = (card.signupBonus / maxSignupBonus) * SCORING_WEIGHTS.SIGNUP_WEIGHT

  // Fee penalties (negative scores)
  const joiningFeeScore =
    userPreferences.joiningFeePreference === "Not a concern"
      ? 0
      : Math.max(0, SCORING_WEIGHTS.JOINING_FEE_WEIGHT - card.joiningFee / 1000)

  const annualFeeScore = Math.max(0, SCORING_WEIGHTS.ANNUAL_FEE_WEIGHT - card.annualFee / 2000)

  // Calculate total score
  const totalScore = intersectionScore + rewardsScore + bankBonus + signupScore + joiningFeeScore + annualFeeScore

  return {
    ...card,
    totalScore,
    intersectionScore,
    intersectionCount: intersection.intersectionCount,
    intersectionPercentage: intersection.intersectionPercentage,
    matchedCategories: intersection.matchedCategories,
    rewardsScore,
    bankBonus,
    signupScore,
    joiningFeeScore,
    annualFeeScore,
    eligible: eligibility.eligible,
    eligibilityReasons: eligibility.reasons,
  }
}

/**
 * Main function to get adaptive card recommendations
 */
export function getAdaptiveCardRecommendations(
  cards: CreditCard[],
  userPreferences: UserPreferences,
  maxResults = 7,
): {
  recommendations: ScoredCard[]
  eligibleCards: ScoredCard[]
  ineligibleCards: ScoredCard[]
  stats: {
    totalCards: number
    eligibleCount: number
    withIntersection: number
    preferredBankCards: number
  }
} {
  // Calculate max values for normalization
  const maxRewardRate = Math.max(...cards.map((c) => c.rewardRate))
  const maxSignupBonus = Math.max(...cards.map((c) => c.signupBonus))

  // Score all cards
  const scoredCards = cards.map((card) => scoreCard(card, userPreferences, maxRewardRate, maxSignupBonus))

  // Separate eligible and ineligible cards
  const eligibleCards = scoredCards.filter((card) => card.eligible)
  const ineligibleCards = scoredCards.filter((card) => !card.eligible)

  // Filter cards with at least one category intersection (success criteria)
  const cardsWithIntersection = eligibleCards.filter((card) => card.intersectionCount > 0)

  // Sort by total score (descending)
  const sortedCards = cardsWithIntersection.sort((a, b) => b.totalScore - a.totalScore)

  // Ensure preferred bank cards are included if qualified
  const preferredBankCards = sortedCards.filter((card) => card.bankBonus > 0)
  const otherCards = sortedCards.filter((card) => card.bankBonus === 0)

  // Combine recommendations: preferred bank cards first, then others
  let recommendations = [...preferredBankCards, ...otherCards].slice(0, maxResults)

  // If we don't have enough recommendations, include some without perfect intersection
  if (recommendations.length < maxResults) {
    const remainingSlots = maxResults - recommendations.length
    const additionalCards = eligibleCards
      .filter((card) => !recommendations.includes(card))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, remainingSlots)

    recommendations = [...recommendations, ...additionalCards]
  }

  // Calculate statistics
  const stats = {
    totalCards: cards.length,
    eligibleCount: eligibleCards.length,
    withIntersection: cardsWithIntersection.length,
    preferredBankCards: preferredBankCards.length,
  }

  return {
    recommendations,
    eligibleCards,
    ineligibleCards,
    stats,
  }
}

/**
 * Utility function to format score breakdown for debugging
 */
export function formatScoreBreakdown(scoredCard: ScoredCard): string {
  return `
Card: ${scoredCard.name}
Total Score: ${scoredCard.totalScore.toFixed(2)}
- Category Match: ${scoredCard.intersectionScore.toFixed(2)} (${scoredCard.intersectionCount}/${scoredCard.matchedCategories.length} categories)
- Rewards: ${scoredCard.rewardsScore.toFixed(2)}
- Bank Bonus: ${scoredCard.bankBonus.toFixed(2)}
- Signup Bonus: ${scoredCard.signupScore.toFixed(2)}
- Joining Fee: ${scoredCard.joiningFeeScore.toFixed(2)}
- Annual Fee: ${scoredCard.annualFeeScore.toFixed(2)}
Matched Categories: ${scoredCard.matchedCategories.join(", ")}
Eligible: ${scoredCard.eligible}
${scoredCard.eligibilityReasons.length > 0 ? `Reasons: ${scoredCard.eligibilityReasons.join(", ")}` : ""}
  `.trim()
}
