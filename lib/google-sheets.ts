import { submitEnhancedFormData } from "@/lib/google-sheets-submissions"

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
  spendingCategories: string[]
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

// Google Sheets configuration - Updated for public access
const SHEET_ID = "1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo"
const CARDS_RANGE = "Card-Data!A:L" // Updated to include spending category column L
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY

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

export async function fetchCreditCards(): Promise<CreditCard[]> {
  try {
    // Validate API key
    if (!API_KEY) {
      throw new Error(
        "Google Sheets API key is not configured. Please add NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY to your environment variables.",
      )
    }

    const sheetData = await fetchGoogleSheetData(SHEET_ID, CARDS_RANGE)

    if (!sheetData || !sheetData.values || sheetData.values.length === 0) {
      throw new Error(
        "No data found in Google Sheet. Please ensure:\n" +
          "1. The 'Card-Data' tab contains data\n" +
          "2. Data starts from row 1 (headers)\n" +
          "3. Sheet is not empty",
      )
    }

    const [headers, ...rows] = sheetData.values
    console.log("📋 Headers found:", headers)
    console.log("📊 Data rows to process:", rows.length)

    const expectedHeaders = [
      "Card Name",
      "Bank",
      "Card Type",
      "Joining Fee",
      "Annual Fee",
      "Credit Score Requirement",
      "Income Requirement",
      "Rewards Rate",
      "Sign Up Bonus",
      "Features",
      "Description",
      "Spending Category",
    ]

    console.log("🔍 Header validation:")
    expectedHeaders.forEach((expected, index) => {
      const actual = headers[index]
      const match = actual === expected
      console.log(
        `   Column ${String.fromCharCode(65 + index)}: ${match ? "✅" : "⚠️"} Expected: "${expected}", Found: "${actual}"`,
      )
    })

    const cards: CreditCard[] = []
    let skippedRows = 0
    let processedRows = 0

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]

      try {
        // Skip completely empty rows
        if (!row || row.every((cell) => !cell || cell === "")) {
          skippedRows++
          continue
        }

        // Ensure we have at least the basic required columns
        if (row.length < 3) {
          console.warn(`⚠️ Row ${index + 2} has insufficient columns:`, row)
          skippedRows++
          continue
        }

        // Helper function to parse numeric values, handling "NA" and empty cells
        const parseNumeric = (value: any, defaultValue = 0): number => {
          if (!value || value === "NA" || value === "" || value === null || value === undefined) return defaultValue
          const parsed = Number.parseFloat(value.toString().replace(/,/g, ""))
          return isNaN(parsed) ? defaultValue : parsed
        }

        // Helper function to parse integer values
        const parseInt = (value: any, defaultValue = 0): number => {
          if (!value || value === "NA" || value === "" || value === null || value === undefined) return defaultValue
          const parsed = Number.parseInt(value.toString().replace(/,/g, ""))
          return isNaN(parsed) ? defaultValue : parsed
        }

        // Helper function to safely get string value
        const getString = (value: any, defaultValue = ""): string => {
          if (!value || value === "NA" || value === null || value === undefined) return defaultValue
          return value.toString().trim()
        }

        // Parse features from comma-separated string, handling "NA"
        const featuresString = getString(row[9])
        const features =
          !featuresString || featuresString === "NA"
            ? []
            : featuresString
                .split(",")
                .map((f: string) => f.trim())
                .filter(Boolean)

        // Parse spending categories from comma-separated string in column L
        const spendingCategoriesString = getString(row[11])
        const spendingCategories =
          !spendingCategoriesString || spendingCategoriesString === "NA"
            ? []
            : spendingCategoriesString
                .split(",")
                .map((cat: string) => cat.trim().toLowerCase())
                .filter(Boolean)

        const rawCardType = getString(row[2])

        const card = {
          id: `card_${processedRows + 1}`,
          cardName: getString(row[0]),
          bank: getString(row[1]),
          cardType: rawCardType,
          joiningFee: parseNumeric(row[3]),
          annualFee: parseNumeric(row[4]),
          creditScoreRequirement: parseInt(row[5]),
          monthlyIncomeRequirement: parseNumeric(row[6]),
          rewardsRate: parseNumeric(row[7]),
          signUpBonus: parseNumeric(row[8]),
          features,
          description: getString(row[10]),
          spendingCategories,
        }

        // Validate required fields
        if (!card.cardName || !card.bank || !card.cardType) {
          console.warn(`⚠️ Row ${index + 2} missing required fields:`, {
            name: card.cardName,
            bank: card.bank,
            type: card.cardType,
          })
          skippedRows++
          continue
        }

        // Normalize card type to match dropdown options
        const normalizedCardType = normalizeCardType(card.cardType)
        if (!normalizedCardType) {
          console.warn(`⚠️ Row ${index + 2} has unsupported card type: "${card.cardType}" - SKIPPING`)
          skippedRows++
          continue
        }

        card.cardType = normalizedCardType
        cards.push(card)
        processedRows++

        // Log progress every 50 cards
        if (processedRows % 50 === 0) {
          console.log(`📈 Processed ${processedRows} cards so far...`)
        }
      } catch (error) {
        console.error(`❌ Error parsing row ${index + 2}:`, error, row)
        skippedRows++
        continue
      }
    }

    console.log("🎉 PROCESSING COMPLETE!")
    console.log(`✅ Successfully parsed ${cards.length} cards`)
    console.log(`⚠️ Skipped ${skippedRows} rows due to missing/invalid data`)
    console.log(
      `📊 Processing summary: ${processedRows} processed, ${skippedRows} skipped, ${cards.length} valid cards`,
    )

    // Log final card type distribution
    console.log("\n📊 FINAL CARD TYPE DISTRIBUTION:")
    const finalCardTypes = cards.reduce(
      (acc, card) => {
        acc[card.cardType] = (acc[card.cardType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    Object.entries(finalCardTypes).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} cards`)
    })

    // Log sample of successfully parsed cards with spending categories
    if (cards.length > 0) {
      console.log("📋 Sample parsed cards with spending categories:")
      cards.slice(0, 3).forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.cardName} (${card.bank}) - ${card.cardType}`)
        console.log(`      Spending Categories: [${card.spendingCategories.join(", ")}]`)
      })
    }

    return cards
  } catch (error) {
    console.error("❌ Error fetching credit cards from Google Sheets:", error)

    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }

    throw error
  }
}

// Function to get all unique spending categories from the sheet
export async function fetchAvailableSpendingCategories(): Promise<string[]> {
  try {
    const cards = await fetchCreditCards()
    const allCategories = new Set<string>()

    cards.forEach((card) => {
      card.spendingCategories.forEach((category) => {
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

export async function fetchGoogleSheetData(sheetId: string, range: string): Promise<SheetData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY

    if (!apiKey) {
      throw new Error("Google Sheets API key not found")
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: SheetData = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error)
    return null
  }
}

// Helper function to normalize card types from sheet to match dropdown options
function normalizeCardType(sheetCardType: string): string | null {
  const normalized = sheetCardType.toLowerCase().trim()

  console.log(`🔄 Normalizing card type: "${sheetCardType}" → "${normalized}"`)

  // Map sheet values to dropdown values with COMPREHENSIVE mapping
  const typeMapping: { [key: string]: string } = {
    // Direct matches (case insensitive)
    cashback: "Cashback",
    travel: "Travel",
    rewards: "Rewards",
    student: "Student",
    business: "Business",

    // Common variations for CASHBACK
    "cash back": "Cashback",
    "cash-back": "Cashback",
    "cashback card": "Cashback",
    "cash rewards": "Cashback",
    "cash back rewards": "Cashback",

    // Common variations for TRAVEL
    "travel rewards": "Travel",
    "air miles": "Travel",
    airline: "Travel",
    hotel: "Travel",
    "travel card": "Travel",
    miles: "Travel",
    "frequent flyer": "Travel",

    // Common variations for REWARDS
    reward: "Rewards",
    "reward points": "Rewards",
    points: "Rewards",
    "points card": "Rewards",
    premium: "Rewards",
    lifestyle: "Rewards",
    "lifestyle & rewards": "Rewards",
    "lifestyle&rewards": "Rewards",
    "lifestyle rewards": "Rewards",
    "reward card": "Rewards",
    "general rewards": "Rewards",

    // Common variations for STUDENT
    "student card": "Student",
    youth: "Student",
    starter: "Student",
    "entry level": "Student",
    "first card": "Student",
    beginner: "Student",

    // Common variations for BUSINESS
    "business/professional": "Business",
    "business professional": "Business",
    businessprofessional: "Business",
    professional: "Business",
    corporate: "Business",
    commercial: "Business",
    "business card": "Business",
    "corporate card": "Business",

    // Additional specific mappings that might be in your sheet
    "fuel card": "Rewards",
    "shopping card": "Rewards",
    "dining card": "Rewards",
    entertainment: "Rewards",
    grocery: "Rewards",

    // Credit builder cards
    secured: "Student",
    "credit builder": "Student",

    // Premium/luxury cards
    platinum: "Rewards",
    gold: "Rewards",
    signature: "Rewards",
    infinite: "Rewards",
    world: "Rewards",
    elite: "Rewards",
    privilege: "Rewards",
    prestige: "Rewards",
  }

  const mapped = typeMapping[normalized]

  if (mapped) {
    console.log(`✅ Successfully mapped: "${sheetCardType}" → "${mapped}"`)
    return mapped
  } else {
    console.warn(`⚠️ UNMAPPED card type: "${sheetCardType}" (normalized: "${normalized}")`)
    console.warn(`   Available mappings: ${Object.keys(typeMapping).join(", ")}`)

    // Try partial matching as fallback
    for (const [key, value] of Object.entries(typeMapping)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        console.log(`🔄 Partial match found: "${normalized}" contains "${key}" → "${value}"`)
        return value
      }
    }

    console.error(`❌ No mapping found for card type: "${sheetCardType}"`)
    return null
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

// NEW ENHANCED FILTERING FUNCTION with UPDATED SCORING ALGORITHM (0-100 total)
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

  console.log("🔍 NEW REFINED SCORING ALGORITHM (0-100 TOTAL)")
  console.log("=".repeat(70))
  console.log("👤 User Profile:", userProfile)
  console.log("📊 Total available cards:", cards.length)
  console.log("🛍️ User spending categories:", spendingCategories)
  console.log("🏦 User preferred banks:", preferredBanks)

  // NEW WEIGHT DISTRIBUTION (Total = 100):
  console.log("\n🎯 NEW SCORING WEIGHTS:")
  console.log("🎁 Rewards Rate: 30 points")
  console.log("🛍️ Category Match: 30 points")
  console.log("🎉 Sign-up Bonus: 20 points")
  console.log("💳 Joining Fee: 10 points")
  console.log("📅 Annual Fee: 5 points")
  console.log("🏦 Bank Match: 5 points")

  // Step 1: Basic eligibility filtering
  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  console.log(`🎯 Basic eligible cards: ${basicEligibleCards.length}`)

  if (basicEligibleCards.length === 0) {
    console.log("⚠️ No basic eligible cards found")
    return []
  }

  // Step 2: Calculate max values for normalization
  const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
  const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)
  const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
  const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)

  console.log("\n📊 NORMALIZATION VALUES:")
  console.log(`Max Rewards Rate: ${maxRewardsRate}%`)
  console.log(`Max Sign-up Bonus: ₹${maxSignUpBonus.toLocaleString()}`)
  console.log(`Max Joining Fee: ₹${maxJoiningFee.toLocaleString()}`)
  console.log(`Max Annual Fee: ₹${maxAnnualFee.toLocaleString()}`)

  // Step 3: Calculate composite scores with NEW REFINED ALGORITHM
  console.log("\n📊 CALCULATING SCORES WITH NEW ALGORITHM:")
  const scoredCards = basicEligibleCards.map((card) => {
    // 1. Rewards Rate Score (0-30 points) - Higher is better
    const scoreRewards = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 30 : 0

    // 2. Category Match Score (0-30 points) - % of user categories matched
    let scoreCategory = 0
    if (spendingCategories.length > 0 && card.spendingCategories.length > 0) {
      const userCategoriesLower = spendingCategories.map((cat) => cat.toLowerCase())
      const matchingCategories = card.spendingCategories.filter((cardCat) =>
        userCategoriesLower.includes(cardCat.toLowerCase()),
      )
      const matchPercentage = matchingCategories.length / Math.max(userCategoriesLower.length, 1)
      scoreCategory = matchPercentage * 30
    }

    // 3. Sign-up Bonus Score (0-20 points) - Higher is better
    const scoreSignup = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 20 : 0

    // 4. Joining Fee Score (0-10 points) - Lower fee is better
    const scoreJoining = maxJoiningFee > 0 ? ((maxJoiningFee - card.joiningFee) / maxJoiningFee) * 10 : 10

    // 5. Annual Fee Score (0-5 points) - Lower fee is better
    const scoreAnnual = maxAnnualFee > 0 ? ((maxAnnualFee - card.annualFee) / maxAnnualFee) * 5 : 5

    // 6. Bank Match Score (0-5 points) - NEW: Dedicated bank preference bonus
    const scoreBank = preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())) ? 5 : 0

    // Calculate composite score
    const compositeScore = scoreRewards + scoreCategory + scoreSignup + scoreJoining + scoreAnnual + scoreBank

    const finalScore = Math.round(compositeScore * 100) / 100

    console.log(`\n📊 ${card.cardName} (${card.bank}):`)
    console.log(`   🎁 Rewards Rate: ${card.rewardsRate}% → Score: ${scoreRewards.toFixed(1)}/30`)
    console.log(`   🛍️ Category Match: ${card.spendingCategories.join(", ")} → Score: ${scoreCategory.toFixed(1)}/30`)
    console.log(`   🎉 Sign-up Bonus: ₹${card.signUpBonus} → Score: ${scoreSignup.toFixed(1)}/20`)
    console.log(`   💳 Joining Fee: ₹${card.joiningFee} → Score: ${scoreJoining.toFixed(1)}/10`)
    console.log(`   📅 Annual Fee: ₹${card.annualFee} → Score: ${scoreAnnual.toFixed(1)}/5`)
    console.log(
      `   🏦 Bank Match: ${scoreBank > 0 ? `+${scoreBank}` : "0"} (Preferred: ${preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase()))})`,
    )
    console.log(`   🎯 FINAL SCORE: ${finalScore}/100`)

    return {
      ...card,
      compositeScore: finalScore,
      scoreBreakdown: {
        rewards: scoreRewards,
        category: scoreCategory,
        signup: scoreSignup,
        joining: scoreJoining,
        annual: scoreAnnual,
        bank: scoreBank,
      },
    }
  })

  // Step 4: Filter by composite score ≥25.0
  const scoreEligibleCards = scoredCards.filter((card) => {
    const meetsScoreThreshold = card.compositeScore >= 25.0
    console.log(
      `${meetsScoreThreshold ? "✅" : "❌"} ${card.cardName}: Score ${card.compositeScore}/100 ${meetsScoreThreshold ? "≥" : "<"} 25.0`,
    )
    return meetsScoreThreshold
  })

  console.log(`🎯 Score-eligible cards (≥25.0): ${scoreEligibleCards.length}`)

  if (scoreEligibleCards.length === 0) {
    console.log("⚠️ No cards meet the composite score threshold of ≥25.0")
    return []
  }

  // Step 5: Sort by composite score (highest first) and return top N
  const sortedCards = scoreEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  console.log(`\n🏆 TOP ${topN} NEW ALGORITHM RECOMMENDATIONS:`)
  sortedCards.forEach((card, index) => {
    console.log(
      `${index + 1}. ${card.cardName}: ${card.compositeScore}/100 (R:${card.scoreBreakdown?.rewards.toFixed(1)} C:${card.scoreBreakdown?.category.toFixed(1)} S:${card.scoreBreakdown?.signup.toFixed(1)} J:${card.scoreBreakdown?.joining.toFixed(1)} A:${card.scoreBreakdown?.annual.toFixed(1)} B:${card.scoreBreakdown?.bank})`,
    )
  })

  return sortedCards
}

// Keep existing functions for backward compatibility
export function filterAndRankCards(
  cards: CreditCard[],
  userProfile: { creditScore: number; monthlyIncome: number; cardType: string },
  topN = 3,
): CreditCard[] {
  // Use the new algorithm with empty categories and banks for backward compatibility
  return filterAndRankCardsWithSpendingCategories(
    cards,
    {
      ...userProfile,
      spendingCategories: [],
      preferredBanks: [],
    },
    topN,
  )
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

  console.log("🎁 REWARD-BASED FILTERING WITH NEW SCORING")
  console.log("=".repeat(70))

  // Step 1: Basic eligibility filtering
  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  // Apply additional filters
  let filteredCards = basicEligibleCards

  if (preferredBrand && preferredBrand !== "Any") {
    filteredCards = filteredCards.filter((card) => card.bank === preferredBrand)
  }

  if (maxJoiningFee !== undefined && maxJoiningFee >= 0) {
    filteredCards = filteredCards.filter((card) => card.joiningFee <= maxJoiningFee)
  }

  // Use new scoring algorithm
  const scoredCards = filterAndRankCardsWithSpendingCategories(
    filteredCards,
    {
      creditScore,
      monthlyIncome,
      cardType,
      spendingCategories: [],
      preferredBanks: preferredBrand ? [preferredBrand] : [],
    },
    topN,
  )

  // Sort by reward rate for reward-based approach
  return scoredCards.sort((a, b) => b.rewardsRate - a.rewardsRate).slice(0, topN)
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

    // Log user data submission
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
      "NEW ALGORITHM: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus (20%) + Joining Fee (10%) + Annual Fee (5%) + Bank Match (5%) = 100%. Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        cardName: card.cardName,
        bank: card.bank,
        features: card.features,
        reason: `Score: ${card.compositeScore}/100. ${card.description || "Selected based on new refined scoring algorithm optimizing rewards and category matches."}`,
        rating: Math.min(5, Math.max(1, Math.round(card.compositeScore / 20))),
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardsRate: card.rewardsRate,
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
    console.error("Error getting card recommendations:", error)
    return {
      success: false,
      error: "Failed to fetch recommendations. Please check your internet connection and try again.",
    }
  }
}

// Enhanced function for the form with spending categories and new refined scoring
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
    console.log("🔄 Processing form data with NEW refined scoring algorithm:", formData)

    const creditScore = getCreditScoreValue(formData.creditScore)
    const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 50000

    // Determine card type based on spending categories
    let cardType = "Cashback" // Default
    if (formData.spendingCategories.includes("travel")) {
      cardType = "Travel"
    } else if (formData.spendingCategories.includes("dining") || formData.spendingCategories.includes("shopping")) {
      cardType = "Rewards"
    }

    console.log(
      `🎯 Determined card type: ${cardType} based on spending categories: [${formData.spendingCategories.join(", ")}]`,
    )

    // Fetch all cards from database
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

    // Use the new spending category enhanced filtering with NEW scoring algorithm
    const recommendations = filterAndRankCardsWithSpendingCategories(
      allCards,
      {
        creditScore,
        monthlyIncome,
        cardType,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
      },
      7, // Get top 7 recommendations
    )

    console.log(`✅ Generated ${recommendations.length} recommendations with NEW scoring algorithm`)

    // Log the enhanced form submission to Google Sheets
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
        submissionType: "enhanced_form_with_new_scoring_algorithm",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      }

      console.log("📝 Submitting enhanced form data to Google Sheets:", submissionData)
      const submissionSuccess = await submitEnhancedFormData(submissionData)

      if (submissionSuccess) {
        console.log("✅ Enhanced form data submitted successfully to Google Sheets")
      } else {
        console.warn("⚠️ Failed to submit enhanced form data to Google Sheets")
      }
    } catch (submissionError) {
      console.error("❌ Error submitting enhanced form data:", submissionError)
    }

    // Transform the recommendations to match the expected format
    const transformedRecommendations = recommendations.map((card) => ({
      name: card.cardName,
      bank: card.bank,
      type: cardType.toLowerCase(),
      annualFee: card.annualFee,
      joiningFee: card.joiningFee,
      rewardRate: `${card.rewardsRate}% rewards`,
      welcomeBonus: card.signUpBonus > 0 ? `₹${card.signUpBonus.toLocaleString()} welcome bonus` : "",
      keyFeatures: card.features || [
        "Reward points on purchases",
        "Online transaction benefits",
        "Fuel surcharge waiver",
        "Welcome bonus offer",
      ],
      bestFor: formData.spendingCategories.slice(0, 3),
      score: Math.round(card.compositeScore),
      reasoning: `Score: ${card.compositeScore}/100. ${card.spendingCategories.length > 0 ? `Matches your spending in: ${card.spendingCategories.join(", ")}. ` : ""}NEW algorithm prioritizes rewards rate (30%) and category match (30%) with bank preference bonus (5%).`,
      spendingCategories: card.spendingCategories,
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

// Helper function to convert credit score range to numeric value
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

// At the very end of the file, add this explicit export to ensure it's available
