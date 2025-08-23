// lib/google-sheets.ts - Updated to use server actions for sensitive operations

import { fetchCreditCardsAction } from "@/app/actions/google-sheets-actions"

export interface CreditCardData {
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

export interface CreditCard {
  id: string
  name: string
  bank: string
  cardType: string
  joiningFee: number
  annualFee: number
  rewardRate: number
  categories: string[]
  eligibilityIncome: number
  features: string[]
  pros: string[]
  cons: string[]
  bestFor: string[]
  applyUrl: string
}

interface UserSubmission {
  creditScore: number
  monthlyIncome: number
  cardType: string
  timestamp: string
}

interface CardSubmission {
  creditScore: number
  monthlyIncome: number
  cardType: string
  timestamp: string
  topN?: number
  userAgent?: string
}

interface SheetData {
  range: string
  majorDimension: string
  values: string[][]
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

// This function now uses server action instead of direct API calls
export async function fetchCreditCards(): Promise<CreditCard[]> {
  return await fetchCreditCardsAction()
}

// Legacy function for backward compatibility
export async function loadCreditCardsFromSheets(): Promise<CreditCard[]> {
  return await fetchCreditCards()
}

export async function fetchAvailableSpendingCategories(): Promise<string[]> {
  try {
    const cards = await fetchCreditCards()
    const allCategories = new Set<string>()

    cards.forEach((card) => {
      card.categories.forEach((category) => {
        allCategories.add(category)
      })
    })

    const sortedCategories = Array.from(allCategories).sort()
    console.log("📊 Available spending categories from sheet:", sortedCategories)

    return sortedCategories
  } catch (error) {
    console.error("❌ Error fetching spending categories:", error)
    return []
  }
}

export async function submitUserData(submission: UserSubmission): Promise<boolean> {
  try {
    console.log("📝 User submission logged:", submission)
    await new Promise((resolve) => setTimeout(resolve, 500))
    return true
  } catch (error) {
    console.error("❌ Error submitting user data:", error)
    return false
  }
}

export async function submitToGoogleSheets(data: any): Promise<boolean> {
  try {
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      throw new Error("Apps Script URL not configured")
    }

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error)
    return false
  }
}

export function filterAndRankCardsWithSpendingCategories(
  cards: CreditCard[],
  userProfile: {
    creditScore: number
    monthlyIncome: number
    cardType: string
    spendingCategories?: string[]
    preferredBanks?: string[]
  },
  topN = 3,
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType, spendingCategories = [], preferredBanks = [] } = userProfile

  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  if (basicEligibleCards.length === 0) {
    return []
  }

  const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardRate), 1)
  const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)
  const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
  const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)

  const scoredCards = basicEligibleCards.map((card) => {
    const scoreRewards = maxRewardsRate > 0 ? (card.rewardRate / maxRewardsRate) * 30 : 0

    let scoreCategory = 0
    if (spendingCategories.length > 0 && card.categories.length > 0) {
      const userCategoriesLower = spendingCategories.map((cat) => cat.toLowerCase())
      const matchingCategories = card.categories.filter((cardCat) =>
        userCategoriesLower.includes(cardCat.toLowerCase()),
      )
      const matchPercentage = matchingCategories.length / Math.max(userCategoriesLower.length, 1)
      scoreCategory = matchPercentage * 30
    }

    const scoreSignup = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 20 : 0
    const scoreJoining = maxJoiningFee > 0 ? ((maxJoiningFee - card.joiningFee) / maxJoiningFee) * 10 : 10
    const scoreAnnual = maxAnnualFee > 0 ? ((maxAnnualFee - card.annualFee) / maxAnnualFee) * 10 : 10

    const compositeScore = scoreRewards + scoreCategory + scoreSignup + scoreJoining + scoreAnnual

    let bankBonus = 0
    if (preferredBanks.length > 0 && preferredBanks.includes(card.bank)) {
      bankBonus = 5
    }

    const finalScore = Math.round((compositeScore + bankBonus) * 100) / 100

    return {
      ...card,
      compositeScore: finalScore,
      scoreBreakdown: {
        rewards: scoreRewards,
        category: scoreCategory,
        signup: scoreSignup,
        joining: scoreJoining,
        annual: scoreAnnual,
        bankBonus: bankBonus,
      },
    }
  })

  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  if (scoreEligibleCards.length === 0) {
    return []
  }

  const sortedCards = scoreEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  return sortedCards
}

export function filterAndRankCards(
  cards: CreditCard[],
  userProfile: { creditScore: number; monthlyIncome: number; cardType: string },
  topN = 3,
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType } = userProfile

  const requestedTypeCards = cards.filter((card) => card.cardType === cardType)

  if (requestedTypeCards.length === 0) {
    return []
  }

  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType

    return meetsCredit && meetsIncome && matchesType
  })

  if (basicEligibleCards.length === 0) {
    return []
  }

  const scoredCards = basicEligibleCards.map((card) => {
    let score = 0

    const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
    const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
    const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardRate), 1)
    const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

    const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
    score += joiningFeeScore

    const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
    score += annualFeeScore

    const rewardsScore = maxRewardsRate > 0 ? (card.rewardRate / maxRewardsRate) * 25 : 0
    score += rewardsScore

    const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0
    score += bonusScore

    const compositeScore = Math.round(score * 100) / 100

    return {
      ...card,
      compositeScore,
    }
  })

  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  if (scoreEligibleCards.length === 0) {
    return []
  }

  const sortedCards = scoreEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  return sortedCards
}

export function filterAndRankCardsByRewards(
  cards: CreditCard[],
  userProfile: {
    creditScore: number
    monthlyIncome: number
    cardType: string
    preferredBrand?: string
    maxJoiningFee?: number
  },
  topN = 3,
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType, preferredBrand, maxJoiningFee } = userProfile

  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  const scoredCards = basicEligibleCards.map((card) => {
    let score = 0

    const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
    const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
    const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardRate), 1)
    const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

    const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
    const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
    const rewardsScore = maxRewardsRate > 0 ? (card.rewardRate / maxRewardsRate) * 25 : 0
    const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0

    score = joiningFeeScore + annualFeeScore + rewardsScore + bonusScore
    const compositeScore = Math.round(score * 100) / 100

    return {
      ...card,
      compositeScore,
    }
  })

  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  let filteredCards = scoreEligibleCards

  if (preferredBrand && preferredBrand !== "Any") {
    filteredCards = filteredCards.filter((card) => {
      const bankMatch = card.bank === preferredBrand
      return bankMatch
    })
  }

  if (maxJoiningFee !== undefined && maxJoiningFee >= 0) {
    filteredCards = filteredCards.filter((card) => {
      const feeMatch = card.joiningFee <= maxJoiningFee
      return feeMatch
    })
  }

  if (filteredCards.length === 0) {
    filteredCards = scoreEligibleCards
  }

  const rewardSortedCards = filteredCards
    .sort((a, b) => {
      if (b.rewardRate !== a.rewardRate) {
        return b.rewardRate - a.rewardRate
      }
      return a.name.localeCompare(b.name)
    })
    .slice(0, topN)

  const cardsWithRewardScore = rewardSortedCards.map((card) => ({
    ...card,
    compositeScore: card.compositeScore,
  }))

  return cardsWithRewardScore
}

export function filterAndRankCardsEnhanced(
  cards: CreditCard[],
  userProfile: {
    creditScore: number
    monthlyIncome: number
    cardType: string
    preferredBrand?: string
    maxJoiningFee?: number
  },
  topN = 3,
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType, preferredBrand, maxJoiningFee } = userProfile

  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  const scoredCards = basicEligibleCards.map((card) => {
    let score = 0

    const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
    const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
    const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardRate), 1)
    const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

    const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
    const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
    const rewardsScore = maxRewardsRate > 0 ? (card.rewardRate / maxRewardsRate) * 25 : 0
    const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0

    score = joiningFeeScore + annualFeeScore + rewardsScore + bonusScore
    const compositeScore = Math.round(score * 100) / 100

    return {
      ...card,
      compositeScore,
    }
  })

  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  let enhancedEligibleCards = scoreEligibleCards

  if (preferredBrand && preferredBrand !== "Any") {
    enhancedEligibleCards = enhancedEligibleCards.filter((card) => {
      const bankMatch = card.bank === preferredBrand
      return bankMatch
    })
  }

  if (maxJoiningFee !== undefined && maxJoiningFee >= 0) {
    enhancedEligibleCards = enhancedEligibleCards.filter((card) => {
      const feeMatch = card.joiningFee <= maxJoiningFee
      return feeMatch
    })
  }

  if (enhancedEligibleCards.length === 0) {
    enhancedEligibleCards = scoreEligibleCards
  }

  const sortedCards = enhancedEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  return sortedCards
}

export async function getCardRecommendations(data: CardSubmission): Promise<RecommendationResult> {
  try {
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      return {
        success: false,
        error: "No credit card data available. Please try again later.",
      }
    }

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

    const basicEligibleCards = allCards.filter((card) => {
      const meetsCredit = card.creditScoreRequirement === 0 || data.creditScore >= card.creditScoreRequirement
      const meetsIncome = card.monthlyIncomeRequirement === 0 || data.monthlyIncome >= card.monthlyIncomeRequirement
      const matchesType = card.cardType === data.cardType
      return meetsCredit && meetsIncome && matchesType
    })

    const scoredCards = basicEligibleCards.map((card) => {
      let score = 0

      const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
      const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
      const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardRate), 1)
      const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

      const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
      score += joiningFeeScore

      const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
      score += annualFeeScore

      const rewardsScore = maxRewardsRate > 0 ? (card.rewardRate / maxRewardsRate) * 25 : 0
      score += rewardsScore

      const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0
      score += bonusScore

      const compositeScore = Math.round(score * 100) / 100

      return {
        ...card,
        compositeScore,
      }
    })

    const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)
    const scoreEligibleCount = scoreEligibleCards.length

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
    } catch (submissionError) {
      console.error("⚠️ Failed to log user data:", submissionError)
    }

    const filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    const scoringLogic =
      "Ranked by composite score considering: Low joining fees (25%), Low annual fees (25%), High rewards rate (25%), High sign-up bonus (25%). Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        name: card.name,
        bank: card.bank,
        features: card.features,
        reason: `Score: ${card.compositeScore}/100. ${card.description || "Selected based on optimal balance of low fees and high rewards for your profile."}`,
        rating: Math.min(5, Math.max(1, Math.round(card.compositeScore / 20))),
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardRate: card.rewardRate,
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

    const topN = data.topN || 3

    const processedMaxJoiningFee =
      data.maxJoiningFee === undefined || data.maxJoiningFee.toString() === "any" ? undefined : data.maxJoiningFee

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
    } catch (submissionError) {
      console.error("⚠️ Failed to log enhanced user data:", submissionError)
    }

    let filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    if (processedPreferredBrand) {
      filterCriteria += `, Preferred Bank: ${processedPreferredBrand}`
    }

    if (processedMaxJoiningFee !== undefined) {
      filterCriteria += `, Max Joining Fee: ₹${processedMaxJoiningFee.toLocaleString()}`
    }

    const scoringLogic =
      "Ranked PURELY by highest reward rates (no composite scoring) - cards with highest cashback/rewards percentage appear first. Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        name: card.name,
        bank: card.bank,
        features: card.features,
        reason: `Reward Rate: ${card.rewardRate}%. ${card.description || "Selected for having one of the highest reward rates in your category."}`,
        rating: Math.min(5, Math.max(1, Math.round(card.rewardRate))),
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardRate: card.rewardRate,
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
    const creditScore = getCreditScoreValue(formData.creditScore) || 650
    const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 50000

    let cardType = "Cashback"
    if (formData.spendingCategories.includes("travel")) {
      cardType = "Travel"
    } else if (formData.spendingCategories.includes("dining") || formData.spendingCategories.includes("shopping")) {
      cardType = "Rewards"
    }

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

    let recommendations = filterAndRankCardsWithSpendingCategories(
      allCards,
      {
        creditScore,
        monthlyIncome,
        cardType,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
      },
      7,
    )

    if (formData.preferredBanks && formData.preferredBanks.length > 0) {
      const preferredBankCards = allCards.filter((card) =>
        formData.preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())),
      )

      const preferredBankCardsToScore = preferredBankCards.filter(
        (card) => !recommendations.find((rec) => rec.id === card.id),
      )
      const scoredPreferredBankCards = filterAndRankCardsWithSpendingCategories(
        preferredBankCardsToScore,
        {
          creditScore,
          monthlyIncome,
          cardType,
          spendingCategories: formData.spendingCategories,
          preferredBanks: formData.preferredBanks,
        },
        7 - recommendations.length,
      )

      recommendations = [...recommendations, ...scoredPreferredBankCards].slice(0, 7)
    }

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
        submissionType: "enhanced_form_with_refined_scoring",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      }

      const submissionSuccess = await submitEnhancedFormData(submissionData)

      if (submissionSuccess) {
        console.log("✅ Enhanced form data submitted successfully to Google Sheets")
      } else {
        console.warn("⚠️ Failed to submit enhanced form data to Google Sheets")
      }
    } catch (submissionError) {
      console.error("❌ Error submitting enhanced form data:", submissionError)
    }

    const transformedRecommendations = recommendations.map((card) => ({
      name: card.name,
      bank: card.bank,
      type: cardType.toLowerCase(),
      annualFee: card.annualFee,
      joiningFee: card.joiningFee,
      rewardRate: `${card.rewardRate}% rewards`,
      welcomeBonus: card.signUpBonus > 0 ? `₹${card.signUpBonus.toLocaleString()} welcome bonus` : "",
      keyFeatures: card.features || [
        "Reward points on purchases",
        "Online transaction benefits",
        "Fuel surcharge waiver",
        "Welcome bonus offer",
      ],
      bestFor: formData.spendingCategories.slice(0, 3),
      score: Math.round(card.compositeScore),
      reasoning: `Score: ${card.compositeScore}/105. ${card.categories.length > 0 ? `Matches your spending in: ${card.categories.join(", ")}. ` : ""}Refined algorithm prioritizes rewards rate (30%) and category match (30%) for optimal value.`,
      categories: card.categories,
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
      allCards,
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

async function submitEnhancedFormData(data: any): Promise<boolean> {
  try {
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      throw new Error("Apps Script URL not configured")
    }

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error("Error submitting enhanced form data:", error)
    return false
  }
}
