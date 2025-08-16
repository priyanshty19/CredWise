"use server"

interface CardData {
  name: string
  bank: string
  type: string
  annualFee: number
  joiningFee: number
  rewardRate: string
  welcomeBonus: string
  keyFeatures: string[]
  bestFor: string[]
  minIncome: number
  minCreditScore: number
  status: string
}

interface UserProfile {
  monthlyIncome: number
  spendingCategories: string[]
  monthlySpending: number
  currentCards: string
  creditScore: number
  preferredBanks: string[]
  joiningFeePreference: string
}

interface CardRecommendation extends CardData {
  score: number
  reasoning: string
}

// Fetch cards from Google Sheets
async function fetchCardsFromSheet(): Promise<CardData[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
    const sheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" // Replace with your actual sheet ID

    if (!apiKey) {
      throw new Error("Google Sheets API key not configured")
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:L1000?key=${apiKey}`,
      { next: { revalidate: 300 } }, // Cache for 5 minutes
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const data = await response.json()
    const rows = data.values || []

    if (rows.length < 2) {
      throw new Error("No data found in sheet")
    }

    // Skip header row and parse data
    const cards: CardData[] = rows.slice(1).map((row: string[]) => ({
      name: row[0] || "",
      bank: row[1] || "",
      type: row[2] || "",
      annualFee: Number.parseInt(row[3]) || 0,
      joiningFee: Number.parseInt(row[4]) || 0,
      rewardRate: row[5] || "",
      welcomeBonus: row[6] || "",
      keyFeatures: row[7] ? row[7].split(";").map((f) => f.trim()) : [],
      bestFor: row[8] ? row[8].split(";").map((b) => b.trim()) : [],
      minIncome: Number.parseInt(row[9]) || 0,
      minCreditScore: Number.parseInt(row[10]) || 0,
      status: row[11] || "Active",
    }))

    return cards.filter((card) => card.name && card.status === "Active")
  } catch (error) {
    console.error("Error fetching cards:", error)
    // Return fallback data
    return getFallbackCards()
  }
}

// Fallback cards data
function getFallbackCards(): CardData[] {
  return [
    {
      name: "HDFC Regalia Gold",
      bank: "HDFC Bank",
      type: "Premium",
      annualFee: 2500,
      joiningFee: 2500,
      rewardRate: "2-4% on dining & travel",
      welcomeBonus: "10,000 reward points",
      keyFeatures: ["Airport lounge access", "Dining offers", "Travel insurance", "Reward points"],
      bestFor: ["Dining", "Travel", "Premium lifestyle"],
      minIncome: 500000,
      minCreditScore: 750,
      status: "Active",
    },
    {
      name: "SBI Cashback",
      bank: "SBI",
      type: "Cashback",
      annualFee: 999,
      joiningFee: 999,
      rewardRate: "5% on online shopping",
      welcomeBonus: "₹2,000 cashback",
      keyFeatures: ["High cashback rates", "No reward point hassle", "Online shopping benefits"],
      bestFor: ["Shopping", "Online purchases", "Cashback"],
      minIncome: 300000,
      minCreditScore: 700,
      status: "Active",
    },
    {
      name: "ICICI Amazon Pay",
      bank: "ICICI Bank",
      type: "Co-branded",
      annualFee: 500,
      joiningFee: 500,
      rewardRate: "2-5% on Amazon",
      welcomeBonus: "₹2,000 Amazon Pay balance",
      keyFeatures: ["Amazon Prime membership", "High Amazon rewards", "Fuel surcharge waiver"],
      bestFor: ["Shopping", "Amazon", "E-commerce"],
      minIncome: 250000,
      minCreditScore: 650,
      status: "Active",
    },
  ]
}

// Calculate card score based on user profile
function calculateCardScore(card: CardData, profile: UserProfile): number {
  let score = 0

  // Income compatibility (30 points)
  if (profile.monthlyIncome * 12 >= card.minIncome) {
    score += 30
  } else {
    const incomeRatio = (profile.monthlyIncome * 12) / card.minIncome
    score += Math.max(0, incomeRatio * 30)
  }

  // Credit score compatibility (25 points)
  if (profile.creditScore >= card.minCreditScore) {
    score += 25
  } else {
    const creditRatio = profile.creditScore / card.minCreditScore
    score += Math.max(0, creditRatio * 25)
  }

  // Spending category match (25 points)
  const categoryMatches = profile.spendingCategories.filter((category) =>
    card.bestFor.some((cardCategory) => cardCategory.toLowerCase().includes(category.toLowerCase())),
  ).length

  if (categoryMatches > 0) {
    score += Math.min(25, (categoryMatches / profile.spendingCategories.length) * 25)
  }

  // Bank preference (10 points)
  if (profile.preferredBanks.includes(card.bank)) {
    score += 10
  }

  // Joining fee preference (10 points)
  if (profile.joiningFeePreference === "no_fee" && card.joiningFee === 0) {
    score += 10
  } else if (profile.joiningFeePreference === "low_fee" && card.joiningFee <= 1000) {
    score += 8
  } else if (profile.joiningFeePreference === "any_amount") {
    score += 5
  }

  return Math.min(100, Math.round(score))
}

// Generate reasoning for recommendation
function generateReasoning(card: CardData, profile: UserProfile, score: number): string {
  const reasons = []

  if (profile.monthlyIncome * 12 >= card.minIncome) {
    reasons.push("meets income requirements")
  }

  if (profile.creditScore >= card.minCreditScore) {
    reasons.push("matches credit score criteria")
  }

  const categoryMatches = profile.spendingCategories.filter((category) =>
    card.bestFor.some((cardCategory) => cardCategory.toLowerCase().includes(category.toLowerCase())),
  )

  if (categoryMatches.length > 0) {
    reasons.push(`excellent for ${categoryMatches.join(" and ")} spending`)
  }

  if (profile.preferredBanks.includes(card.bank)) {
    reasons.push("from your preferred bank")
  }

  if (card.joiningFee === 0) {
    reasons.push("no joining fee")
  }

  const baseReason = `This card scores ${score}/100 for your profile because it ${reasons.join(", ")}.`

  if (score >= 80) {
    return `${baseReason} This is an excellent match for your spending patterns and financial profile.`
  } else if (score >= 60) {
    return `${baseReason} This card offers good value for your needs.`
  } else {
    return `${baseReason} While not a perfect match, it still offers some benefits for your profile.`
  }
}

export async function getCardRecommendations(formData: {
  monthlyIncome: string
  spendingCategories: string[]
  monthlySpending: string
  currentCards: string
  creditScore: string
  preferredBanks: string[]
  joiningFeePreference: string
}) {
  try {
    // Parse user profile
    const profile: UserProfile = {
      monthlyIncome: Number.parseInt(formData.monthlyIncome) || 0,
      spendingCategories: formData.spendingCategories || [],
      monthlySpending: Number.parseInt(formData.monthlySpending) || 0,
      currentCards: formData.currentCards || "",
      creditScore: Number.parseInt(formData.creditScore) || 0,
      preferredBanks: formData.preferredBanks || [],
      joiningFeePreference: formData.joiningFeePreference || "any_amount",
    }

    // Fetch cards from Google Sheets
    const allCards = await fetchCardsFromSheet()

    // Calculate scores and create recommendations
    const recommendations: CardRecommendation[] = allCards
      .map((card) => {
        const score = calculateCardScore(card, profile)
        const reasoning = generateReasoning(card, profile, score)

        return {
          ...card,
          score,
          reasoning,
        }
      })
      .filter((card) => card.score >= 25) // Only show cards with reasonable scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 7) // Top 7 recommendations

    return {
      success: true,
      recommendations,
      totalCards: allCards.length,
      userProfile: profile,
    }
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return {
      success: false,
      recommendations: [],
      totalCards: 0,
      userProfile: null,
      error: error instanceof Error ? error.message : "Failed to generate recommendations",
    }
  }
}
