// lib/google-sheets.ts

import { GoogleSpreadsheet } from "google-spreadsheet"
import type { CardType } from "./types"

const doc = new GoogleSpreadsheet("YOUR_SPREADSHEET_ID")

async function loadCardsFromGoogleSheets() {
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  await sheet.loadCells()

  const headerRow = sheet.headerValues
  const requiredHeaders = ["id", "name", "type", "description"]
  const missingHeaders = requiredHeaders.filter((header) => !headerRow.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`)
  }

  const rows = await sheet.getRows()
  const validCards: CardType[] = []
  let skippedRows = 0

  for (const row of rows) {
    const cardType = normalizeCardTypeFromSheet(row.type)
    if (cardType) {
      validCards.push({
        id: row.id,
        name: row.name,
        type: cardType,
        description: row.description,
      })
    } else {
      skippedRows++
    }
  }

  console.log(`📊 Loaded ${validCards.length} cards from Google Sheets (${skippedRows} skipped)`)
}

// ENHANCED helper function to normalize card types from sheet to match dropdown options
function normalizeCardTypeFromSheet(sheetCardType: string): string | null {
  const normalized = sheetCardType.toLowerCase().trim()

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
    return mapped
  } else {
    // Try partial matching as fallback
    for (const [key, value] of Object.entries(typeMapping)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value
      }
    }
    return null
  }
}

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
  spendingCategories: string[] // NEW: Added spending categories
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

// Simple submission logging function (since the Google Sheets submission is having import issues)
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

    // In a production environment, you could send this to an analytics service
    // or use a different submission method
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
      throw new Error("No data found in Google Sheet.")
    }

    const [headers, ...rows] = sheetData.values
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
          skippedRows++
          continue
        }

        // Helper function to parse numeric values, handling "NA" and empty cells
        const parseNumeric = (value: any, defaultValue = 0): number => {
          if (!value || value === "NA" || value === "" || value === null || value === undefined) return defaultValue
          const parsed = Number.parseFloat(value.toString().replace(/,/g, "")) // Remove commas
          return isNaN(parsed) ? defaultValue : parsed
        }

        // Helper function to parse integer values
        const parseInt = (value: any, defaultValue = 0): number => {
          if (!value || value === "NA" || value === "" || value === null || value === undefined) return defaultValue
          const parsed = Number.parseInt(value.toString().replace(/,/g, "")) // Remove commas
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
          skippedRows++
          continue
        }

        // Normalize card type to match dropdown options
        const normalizedCardType = normalizeCardTypeFromSheet(card.cardType)
        if (!normalizedCardType) {
          skippedRows++
          continue
        }

        card.cardType = normalizedCardType
        cards.push(card)
        processedRows++
      } catch (error) {
        skippedRows++
        continue
      }
    }

    console.log(`📊 Loaded ${cards.length} cards from Google Sheets (${skippedRows} skipped)`)

    return cards
  } catch (error) {
    console.error("❌ Error fetching credit cards from Google Sheets:", error)
    throw error
  }
}

// NEW: Function to get all unique spending categories from the sheet
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

export async function submitUserData(submission: UserSubmission): Promise<boolean> {
  try {
    // For now, we'll just log the submission
    // In production, you could use Google Apps Script or a service like Zapier
    console.log("📝 User submission logged:", submission)

    // Simulate API call delay
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

// NEW: Enhanced filtering function with REFINED SCORING ALGORITHM
export function filterAndRankCardsWithSpendingCategories(
  cards: CreditCard[],
  userProfile: {
    creditScore: number
    monthlyIncome: number
    cardType: string
    spendingCategories?: string[] // NEW: User's spending categories
    preferredBanks?: string[] // NEW: User's preferred banks
  },
  topN = 3,
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType, spendingCategories = [], preferredBanks = [] } = userProfile

  // Step 1: Basic eligibility filtering (same as before)
  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  if (basicEligibleCards.length === 0) {
    return []
  }

  // Step 2: Calculate max values for normalization
  const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
  const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)
  const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
  const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)

  // Step 3: Calculate composite scores with NEW REFINED ALGORITHM
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

    // 5. Annual Fee Score (0-10 points) - Lower fee is better
    const scoreAnnual = maxAnnualFee > 0 ? ((maxAnnualFee - card.annualFee) / maxAnnualFee) * 10 : 10

    // Calculate composite score
    const compositeScore = scoreRewards + scoreCategory + scoreSignup + scoreJoining + scoreAnnual

    // Bank preference bonus (additional 5 points if preferred bank)
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

  // Step 4: Filter by composite score ≥25.0 (keeping existing threshold)
  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  if (scoreEligibleCards.length === 0) {
    return []
  }

  // Step 5: Sort by composite score (highest first) and return top N
  const sortedCards = scoreEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  return sortedCards
}

export function filterAndRankCards(
  cards: CreditCard[],
  userProfile: { creditScore: number; monthlyIncome: number; cardType: string },
  topN = 3, // Allow configurable number of recommendations
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType } = userProfile

  // Find all cards of the requested type first for analysis
  const requestedTypeCards = cards.filter((card) => card.cardType === cardType)

  if (requestedTypeCards.length === 0) {
    return []
  }

  // Step 1: Filter for basic eligibility
  const basicEligibleCards = cards.filter((card) => {
    // Credit score requirement (0 means no requirement)
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement

    // Monthly income requirement (0 means no requirement)
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement

    // Card type match (exact match)
    const matchesType = card.cardType === cardType

    return meetsCredit && meetsIncome && matchesType
  })

  if (basicEligibleCards.length === 0) {
    return []
  }

  // Step 2: Calculate composite scores for basic eligible cards
  const scoredCards = basicEligibleCards.map((card) => {
    // Scoring logic (lower fees and higher rewards/bonuses are better)
    let score = 0

    // Get max values for normalization
    const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
    const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
    const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
    const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

    // Joining fee (lower is better) - normalize to 0-25 scale
    const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
    score += joiningFeeScore

    // Annual fee (lower is better) - normalize to 0-25 scale
    const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
    score += annualFeeScore

    // Rewards rate (higher is better) - normalize to 0-25 scale
    const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 25 : 0
    score += rewardsScore

    // Sign-up bonus (higher is better) - normalize to 0-25 scale
    const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0
    score += bonusScore

    const compositeScore = Math.round(score * 100) / 100

    return {
      ...card,
      compositeScore,
    }
  })

  // Step 3: NEW - Filter by composite score ≥25.0
  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  if (scoreEligibleCards.length === 0) {
    return []
  }

  // Step 4: Sort by composite score (highest first) and return top N
  const sortedCards = scoreEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  return sortedCards
}

// NEW: Reward-based filtering function - completely different logic
export function filterAndRankCardsByRewards(
  cards: CreditCard[],
  userProfile: {
    creditScore: number
    monthlyIncome: number
    cardType: string
    preferredBrand?: string // New optional field
    maxJoiningFee?: number // New optional field
  },
  topN = 3,
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType, preferredBrand, maxJoiningFee } = userProfile

  // Step 1: Basic eligibility filtering (same as before)
  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  // Step 2: Calculate composite scores and filter by ≥25.0
  const scoredCards = basicEligibleCards.map((card) => {
    // Same scoring logic as main function
    let score = 0

    const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
    const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
    const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
    const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

    const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
    const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
    const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 25 : 0
    const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0

    score = joiningFeeScore + annualFeeScore + rewardsScore + bonusScore
    const compositeScore = Math.round(score * 100) / 100

    return {
      ...card,
      compositeScore,
    }
  })

  // Filter by score threshold ≥25.0
  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  // Step 3: Apply additional filters with FIXED bank matching
  let filteredCards = scoreEligibleCards

  // Apply brand filter if specified - FIXED LOGIC
  if (preferredBrand && preferredBrand !== "Any") {
    filteredCards = filteredCards.filter((card) => {
      // EXACT match against the "Bank" column value from Google Sheet
      const bankMatch = card.bank === preferredBrand
      return bankMatch
    })
  }

  // Apply joining fee filter if specified
  if (maxJoiningFee !== undefined && maxJoiningFee >= 0) {
    filteredCards = filteredCards.filter((card) => {
      const feeMatch = card.joiningFee <= maxJoiningFee
      return feeMatch
    })
  }

  if (filteredCards.length === 0) {
    filteredCards = scoreEligibleCards
  }

  // Step 4: Sort PURELY by reward rate (highest first) - NO COMPOSITE SCORING
  // Sort by reward rate descending, then by card name for consistency
  const rewardSortedCards = filteredCards
    .sort((a, b) => {
      // Primary sort: Reward rate (highest first)
      if (b.rewardsRate !== a.rewardsRate) {
        return b.rewardsRate - a.rewardsRate
      }
      // Secondary sort: Card name (alphabetical)
      return a.cardName.localeCompare(b.cardName)
    })
    .slice(0, topN)

  // Add reward rate as the "score" for display consistency
  const cardsWithRewardScore = rewardSortedCards.map((card) => ({
    ...card,
    compositeScore: card.compositeScore, // Keep the actual composite score
  }))

  return cardsWithRewardScore
}

// Keep the original enhanced filtering function for backward compatibility
export function filterAndRankCardsEnhanced(
  cards: CreditCard[],
  userProfile: {
    creditScore: number
    monthlyIncome: number
    cardType: string
    preferredBrand?: string // New optional field
    maxJoiningFee?: number // New optional field
  },
  topN = 3,
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType, preferredBrand, maxJoiningFee } = userProfile

  // Step 1: Basic eligibility filtering (same as before)
  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  // Step 2: Calculate scores and apply threshold
  const scoredCards = basicEligibleCards.map((card) => {
    let score = 0

    const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
    const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
    const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
    const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

    const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
    const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
    const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 25 : 0
    const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0

    score = joiningFeeScore + annualFeeScore + rewardsScore + bonusScore
    const compositeScore = Math.round(score * 100) / 100

    return {
      ...card,
      compositeScore,
    }
  })

  // Filter by score threshold ≥25.0
  const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)

  // Step 3: Enhanced filtering with brand and joining fee preferences
  let enhancedEligibleCards = scoreEligibleCards

  // Apply brand filter if specified
  if (preferredBrand && preferredBrand !== "Any") {
    enhancedEligibleCards = enhancedEligibleCards.filter((card) => {
      // EXACT match against the "Bank" column value from Google Sheet
      const bankMatch = card.bank === preferredBrand
      return bankMatch
    })
  }

  // Apply joining fee filter if specified
  if (maxJoiningFee !== undefined && maxJoiningFee >= 0) {
    enhancedEligibleCards = enhancedEligibleCards.filter((card) => {
      // Match against the exact "Joining Fee" column value from Google Sheet
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
    // Fetch live data from Google Sheets
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      return {
        success: false,
        error: "No credit card data available. Please try again later.",
      }
    }

    // Apply rule-based filtering and ranking with configurable top N
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

    // Calculate score-eligible cards count for reward-based logic
    const basicEligibleCards = allCards.filter((card) => {
      const meetsCredit = card.creditScoreRequirement === 0 || data.creditScore >= card.creditScoreRequirement
      const meetsIncome = card.monthlyIncomeRequirement === 0 || data.monthlyIncome >= card.monthlyIncomeRequirement
      const matchesType = card.cardType === data.cardType
      return meetsCredit && meetsIncome && matchesType
    })

    // Calculate composite scores for basic eligible cards
    const scoredCards = basicEligibleCards.map((card) => {
      let score = 0

      const maxJoiningFee = Math.max(...basicEligibleCards.map((c) => c.joiningFee), 1)
      const maxAnnualFee = Math.max(...basicEligibleCards.map((c) => c.annualFee), 1)
      const maxRewardsRate = Math.max(...basicEligibleCards.map((c) => c.rewardsRate), 1)
      const maxSignUpBonus = Math.max(...basicEligibleCards.map((c) => c.signUpBonus), 1)

      const joiningFeeScore = maxJoiningFee > 0 ? (1 - card.joiningFee / maxJoiningFee) * 25 : 25
      score += joiningFeeScore

      // Annual fee (lower is better) - normalize to 0-25 scale
      const annualFeeScore = maxAnnualFee > 0 ? (1 - card.annualFee / maxAnnualFee) * 25 : 25
      score += annualFeeScore

      // Rewards rate (higher is better) - normalize to 0-25 scale
      const rewardsScore = maxRewardsRate > 0 ? (card.rewardsRate / maxRewardsRate) * 25 : 0
      score += rewardsScore

      // Sign-up bonus (higher is better) - normalize to 0-25 scale
      const bonusScore = maxSignUpBonus > 0 ? (card.signUpBonus / maxSignUpBonus) * 25 : 0
      score += bonusScore

      const compositeScore = Math.round(score * 100) / 100

      return {
        ...card,
        compositeScore,
      }
    })

    // Count cards that meet the ≥25.0 score threshold
    const scoreEligibleCards = scoredCards.filter((card) => card.compositeScore >= 25.0)
    const scoreEligibleCount = scoreEligibleCards.length

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
      // Don't fail the recommendation request if logging fails
    }

    // Generate explanation text
    const filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    const scoringLogic =
      "Ranked by composite score considering: Low joining fees (25%), Low annual fees (25%), High rewards rate (25%), High sign-up bonus (25%). Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        cardName: card.cardName,
        bank: card.bank,
        features: card.features,
        reason: `Score: ${card.compositeScore}/100. ${card.description || "Selected based on optimal balance of low fees and high rewards for your profile."}`,
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

    // Use REWARD-BASED filtering instead of composite scoring
    const topN = data.topN || 3

    // Handle the "any" value for maxJoiningFee - convert to undefined for no filtering
    const processedMaxJoiningFee =
      data.maxJoiningFee === undefined || data.maxJoiningFee.toString() === "any" ? undefined : data.maxJoiningFee

    // Handle the "Any" value for preferredBrand - convert to undefined for no filtering
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

    // Log enhanced user data submission
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
      // Don't fail the recommendation request if logging fails
    }

    // Enhanced filter criteria description
    let filterCriteria = `Filtered for cards matching: Credit Score ≥ ${data.creditScore}, Monthly Income ≥ ₹${data.monthlyIncome.toLocaleString()}, Card Type: ${data.cardType}, Composite Score ≥ 25.0`

    if (processedPreferredBrand) {
      filterCriteria += `, Preferred Bank: ${processedPreferredBrand}`
    }

    if (processedMaxJoiningFee !== undefined) {
      filterCriteria += `, Max Joining Fee: ₹${processedMaxJoiningFee.toLocaleString()}`
    }

    // Updated scoring logic description for reward-based approach
    const scoringLogic =
      "Ranked PURELY by highest reward rates (no composite scoring) - cards with highest cashback/rewards percentage appear first. Only cards with composite score ≥25.0 are considered eligible."

    return {
      success: true,
      recommendations: recommendations.map((card) => ({
        cardName: card.cardName,
        bank: card.bank,
        features: card.features,
        reason: `Reward Rate: ${card.rewardsRate}%. ${card.description || "Selected for having one of the highest reward rates in your category."}`,
        rating: Math.min(5, Math.max(1, Math.round(card.rewardsRate))), // Rating based on reward rate
        joiningFee: card.joiningFee,
        annualFee: card.annualFee,
        rewardsRate: card.rewardsRate,
        signUpBonus: card.signUpBonus,
        compositeScore: card.compositeScore, // Keep the actual composite score
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

// NEW: Enhanced function for the form with spending categories and refined scoring
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
    // Convert form data to the format expected by our existing functions
    const creditScore = getCreditScoreValue(formData.creditScore) || 650
    const monthlyIncome = Number.parseInt(formData.monthlyIncome) || 50000

    // Determine card type based on spending categories
    let cardType = "Cashback" // Default
    if (formData.spendingCategories.includes("travel")) {
      cardType = "Travel"
    } else if (formData.spendingCategories.includes("dining") || formData.spendingCategories.includes("shopping")) {
      cardType = "Rewards"
    }

    // Fetch all cards to use the new spending category enhanced filtering
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

    // Use the new spending category enhanced filtering with refined scoring
    let recommendations = filterAndRankCardsWithSpendingCategories(
      allCards,
      {
        creditScore,
        monthlyIncome,
        cardType,
        spendingCategories: formData.spendingCategories, // Pass user's spending categories
        preferredBanks: formData.preferredBanks, // Pass user's preferred banks
      },
      7, // Get top 7 recommendations
    )

    // Prioritize cards from preferred banks
    if (formData.preferredBanks && formData.preferredBanks.length > 0) {
      const preferredBankCards = allCards.filter((card) =>
        formData.preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())),
      )

      // Score preferred bank cards if they aren't already in recommendations
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
        7 - recommendations.length, // Get enough to fill the top 7
      )

      // Combine recommendations, prioritizing existing ones
      recommendations = [...recommendations, ...scoredPreferredBankCards].slice(0, 7)
    }

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
      // Don't fail the recommendation request if logging fails
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
      reasoning: `Score: ${card.compositeScore}/105. ${card.spendingCategories.length > 0 ? `Matches your spending in: ${card.spendingCategories.join(", ")}. ` : ""}Refined algorithm prioritizes rewards rate (30%) and category match (30%) for optimal value.`,
      spendingCategories: card.spendingCategories, // Include card's spending categories
      scoreBreakdown: card.scoreBreakdown, // Include detailed score breakdown
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
      allCards, // Include all cards for testing component
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

// Explicit export for getCardRecommendationsForForm

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
