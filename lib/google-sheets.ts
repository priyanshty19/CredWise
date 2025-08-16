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

// Fetch all credit cards from Google Sheets
export async function fetchCreditCards(): Promise<CreditCardData[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID}/values/CreditCards!A:M?key=${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const rows = data.values || []

    if (rows.length <= 1) {
      console.warn("No credit card data found in Google Sheets")
      return []
    }

    // Skip header row and process data
    const cards: CreditCardData[] = rows
      .slice(1)
      .map((row: string[], index: number) => {
        try {
          return {
            id: row[0] || `card-${index}`,
            cardName: row[1] || "Unknown Card",
            bank: row[2] || "Unknown Bank",
            cardType: row[3] || "Unknown Type",
            joiningFee: Number.parseFloat(row[4]) || 0,
            annualFee: Number.parseFloat(row[5]) || 0,
            creditScoreRequirement: Number.parseInt(row[6]) || 650,
            monthlyIncomeRequirement: Number.parseInt(row[7]) || 25000,
            rewardsRate: Number.parseFloat(row[8]) || 1.0,
            signUpBonus: Number.parseInt(row[9]) || 0,
            features: row[10] ? row[10].split(",").map((f) => f.trim()) : [],
            description: row[11] || "No description available",
            spendingCategories: row[12] ? row[12].split(",").map((c) => c.trim()) : [],
          }
        } catch (error) {
          console.error(`Error parsing card data for row ${index}:`, error)
          return null
        }
      })
      .filter(Boolean) as CreditCardData[]

    console.log(`✅ Successfully fetched ${cards.length} credit cards from Google Sheets`)
    return cards
  } catch (error) {
    console.error("Error fetching credit cards from Google Sheets:", error)
    // Return empty array instead of throwing to prevent app crash
    return []
  }
}

// Enhanced scoring algorithm
export function calculateRefinedScore(
  card: CreditCardData,
  userCategories: string[],
  preferredBanks: string[],
  maxValues: { rewards: number; signup: number; joining: number; annual: number },
) {
  // 1. Rewards Rate Score (0-30 points)
  const rewardsScore = (card.rewardsRate / maxValues.rewards) * 30

  // 2. Category Match Score (0-30 points)
  const matchingCategories = card.spendingCategories.filter((tag) => userCategories.includes(tag))
  const categoryScore = userCategories.length > 0 ? (matchingCategories.length / userCategories.length) * 30 : 0

  // 3. Sign-up Bonus Score (0-20 points)
  const signupScore = (card.signUpBonus / maxValues.signup) * 20

  // 4. Joining Fee Score (0-10 points) - Lower fee = higher score
  const joiningScore = ((maxValues.joining - card.joiningFee) / maxValues.joining) * 10

  // 5. Annual Fee Score (0-10 points) - Lower fee = higher score
  const annualScore = ((maxValues.annual - card.annualFee) / maxValues.annual) * 10

  // 6. Bank Preference Bonus (0-5 points)
  const bankScore = preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())) ? 5 : 0

  const totalScore = rewardsScore + categoryScore + signupScore + joiningScore + annualScore + bankScore

  return {
    total: totalScore,
    breakdown: {
      rewards: rewardsScore,
      category: categoryScore,
      signup: signupScore,
      joining: joiningScore,
      annual: annualScore,
      bank: bankScore,
    },
    categoryMatches: matchingCategories,
  }
}

// Check card eligibility
export function checkEligibility(card: CreditCardData, formData: any) {
  const reasons: string[] = []
  let eligible = true

  // Credit score check
  const creditScore = getCreditScoreValue(formData.creditScoreRange)
  if (creditScore < card.creditScoreRequirement) {
    eligible = false
    reasons.push(`Credit score too low (need ${card.creditScoreRequirement}+)`)
  }

  // Income check
  const income = Number.parseInt(formData.monthlyIncome)
  if (income < card.monthlyIncomeRequirement) {
    eligible = false
    reasons.push(`Income too low (need ₹${card.monthlyIncomeRequirement}+)`)
  }

  return { eligible, reasons }
}

// Get personalized card recommendations
export async function getCardRecommendationsForForm(formData: any) {
  try {
    // Fetch all cards
    const allCards = await fetchCreditCards()

    if (allCards.length === 0) {
      throw new Error("No cards available in database")
    }

    // Calculate max values for normalization
    const maxValues = {
      rewards: Math.max(...allCards.map((c) => c.rewardsRate)),
      signup: Math.max(...allCards.map((c) => c.signUpBonus)),
      joining: Math.max(...allCards.map((c) => c.joiningFee)),
      annual: Math.max(...allCards.map((c) => c.annualFee)),
    }

    // Score and filter all cards
    const scoredCards = allCards.map((card) => {
      const eligibility = checkEligibility(card, formData)
      const scoring = calculateRefinedScore(card, formData.spendingCategories, formData.preferredBanks, maxValues)

      return {
        card,
        score: scoring.total,
        scoreBreakdown: scoring.breakdown,
        eligible: eligibility.eligible,
        eligibilityReasons: eligibility.reasons,
        categoryMatches: scoring.categoryMatches,
      }
    })

    // Filter eligible cards with score >= 25.0
    const eligibleCards = scoredCards.filter((card) => card.eligible && card.score >= 25.0)

    // Sort by score (highest first) and take top 7
    const topRecommendations = eligibleCards.sort((a, b) => b.score - a.score).slice(0, 7)

    console.log(`✅ Generated ${topRecommendations.length} recommendations from ${allCards.length} total cards`)

    return {
      recommendations: topRecommendations,
      totalCards: allCards.length,
      eligibleCards: eligibleCards.length,
    }
  } catch (error) {
    console.error("Error generating card recommendations:", error)
    throw error
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

// ENHANCED helper function to normalize card types from sheet to match dropdown options
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
    "fuel card": "Rewards", // Fuel cards are typically rewards-based
    "shopping card": "Rewards", // Shopping cards are typically rewards-based
    "dining card": "Rewards", // Dining cards are typically rewards-based
    entertainment: "Rewards", // Entertainment cards are typically rewards-based
    grocery: "Rewards", // Grocery cards are typically rewards-based

    // Credit builder cards
    secured: "Student", // Secured cards often for students/beginners
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

  console.log("🔍 REFINED SCORING ALGORITHM WITH NEW WEIGHTS")
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
  console.log("📅 Annual Fee: 10 points")

  // Step 1: Basic eligibility filtering (same as before)
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
  console.log("\n📊 CALCULATING SCORES WITH REFINED ALGORITHM:")
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

    console.log(`\n📊 ${card.cardName} (${card.bank}):`)
    console.log(`   🎁 Rewards Rate: ${card.rewardsRate}% → Score: ${scoreRewards.toFixed(1)}/30`)
    console.log(`   🛍️ Category Match: ${card.spendingCategories.join(", ")} → Score: ${scoreCategory.toFixed(1)}/30`)
    console.log(`   🎉 Sign-up Bonus: ₹${card.signUpBonus} → Score: ${scoreSignup.toFixed(1)}/20`)
    console.log(`   💳 Joining Fee: ₹${card.joiningFee} → Score: ${scoreJoining.toFixed(1)}/10`)
    console.log(`   📅 Annual Fee: ₹${card.annualFee} → Score: ${scoreAnnual.toFixed(1)}/10`)
    console.log(
      `   🏦 Bank Bonus: ${bankBonus > 0 ? `+${bankBonus}` : "0"} (Preferred: ${preferredBanks.includes(card.bank)})`,
    )
    console.log(`   🎯 FINAL SCORE: ${finalScore}/105`)

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
  const scoreEligibleCards = scoredCards.filter((card) => {
    const meetsScoreThreshold = card.compositeScore >= 25.0
    console.log(
      `${meetsScoreThreshold ? "✅" : "❌"} ${card.cardName}: Score ${card.compositeScore}/105 ${meetsScoreThreshold ? "≥" : "<"} 25.0`,
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

  console.log(`\n🏆 TOP ${topN} REFINED ALGORITHM RECOMMENDATIONS:`)
  sortedCards.forEach((card, index) => {
    console.log(
      `${index + 1}. ${card.cardName}: ${card.compositeScore}/105 (R:${card.scoreBreakdown?.rewards.toFixed(1)} C:${card.scoreBreakdown?.category.toFixed(1)} S:${card.scoreBreakdown?.signup.toFixed(1)} J:${card.scoreBreakdown?.joining.toFixed(1)} A:${card.scoreBreakdown?.annual.toFixed(1)} B:${card.scoreBreakdown?.bankBonus})`,
    )
  })

  return sortedCards
}

export function filterAndRankCards(
  cards: CreditCard[],
  userProfile: { creditScore: number; monthlyIncome: number; cardType: string },
  topN = 3, // Allow configurable number of recommendations
): CreditCard[] {
  const { creditScore, monthlyIncome, cardType } = userProfile

  console.log("🔍 DETAILED FILTERING ANALYSIS WITH SCORE THRESHOLD")
  console.log("=".repeat(60))
  console.log("👤 User Profile:", userProfile)
  console.log("📊 Total available cards:", cards.length)
  console.log("🎯 NEW REQUIREMENT: Only cards with composite score ≥25.0 will be considered eligible")

  // Log available card types for debugging
  console.log("\n📊 AVAILABLE CARD TYPES IN DATABASE:")
  const availableCardTypes = [...new Set(cards.map((card) => card.cardType))].sort()
  availableCardTypes.forEach((type) => {
    const count = cards.filter((card) => card.cardType === type).length
    console.log(`   • ${type}: ${count} cards`)
  })

  // Find all cards of the requested type first for analysis
  const requestedTypeCards = cards.filter((card) => card.cardType === cardType)
  console.log(`💳 Total ${cardType} cards in database: ${requestedTypeCards.length}`)

  if (requestedTypeCards.length === 0) {
    console.error(`❌ NO CARDS FOUND FOR TYPE: "${cardType}"`)
    console.log("Available card types:", availableCardTypes)
    return []
  }

  // Log specific cards mentioned
  const specificCards = [
    "SBI Card Elite",
    "SBI Card SimplyCLICK",
    "SBI Card SimplySAVE",
    "SBI Card CashBack",
    "HDFC Millennia Credit Card",
    "HDFC Smart Click Credit Card",
    "ICICI HPCL Coral Credit Card",
  ]

  console.log("\n🔎 ANALYZING SPECIFIC CARDS:")
  specificCards.forEach((cardName) => {
    const card = cards.find((c) => c.cardName.toLowerCase().includes(cardName.toLowerCase()))
    if (card) {
      console.log(`\n📋 ${card.cardName}:`)
      console.log(`   🏦 Bank: ${card.bank}`)
      console.log(`   🏷️ Type: ${card.cardType}`)
      console.log(`   📊 Credit Score Req: ${card.creditScoreRequirement} (user has: ${creditScore})`)
      console.log(
        `   💰 Monthly Income Req: ₹${card.monthlyIncomeRequirement.toLocaleString()} (user has: ₹${monthlyIncome.toLocaleString()})`,
      )
      console.log(`   💳 Joining Fee: ₹${card.joiningFee}`)
      console.log(`   📅 Annual Fee: ₹${card.annualFee}`)
      console.log(`   🎁 Rewards Rate: ${card.rewardsRate}%`)
      console.log(`   🎉 Sign-up Bonus: ₹${card.signUpBonus}`)

      // Check eligibility
      const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
      const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
      const matchesType = card.cardType === cardType

      console.log(`   ✅ Credit Score: ${meetsCredit ? "PASS" : "FAIL"}`)
      console.log(`   ✅ Income: ${meetsIncome ? "PASS" : "FAIL"}`)
      console.log(
        `   ✅ Card Type: ${matchesType ? "PASS" : "FAIL"} (card: "${card.cardType}" vs requested: "${cardType}")`,
      )
      console.log(`   🎯 BASIC ELIGIBLE: ${meetsCredit && meetsIncome && matchesType ? "YES" : "NO"}`)
    } else {
      console.log(`❌ ${cardName}: NOT FOUND in database`)
    }
  })

  // Step 1: Filter for basic eligibility
  console.log("\n🎯 STEP 1: BASIC ELIGIBILITY FILTERING:")
  const basicEligibleCards = cards.filter((card) => {
    // Credit score requirement (0 means no requirement)
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement

    // Monthly income requirement (0 means no requirement)
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement

    // Card type match (exact match)
    const matchesType = card.cardType === cardType

    const isEligible = meetsCredit && meetsIncome && matchesType

    if (matchesType) {
      // Only log cards of the requested type
      console.log(
        `${isEligible ? "✅" : "❌"} ${card.cardName}: Credit(${meetsCredit}) Income(${meetsIncome}) Type(${matchesType})`,
      )
    }

    return isEligible
  })

  console.log(`\n🎯 BASIC ELIGIBLE CARDS FOUND: ${basicEligibleCards.length}`)

  if (basicEligibleCards.length === 0) {
    console.log("⚠️ No basic eligible cards found. Detailed breakdown:")
    console.log(`- Credit Score: ${creditScore} (looking for cards with requirement ≤ ${creditScore})`)
    console.log(
      `- Monthly Income: ₹${monthlyIncome.toLocaleString()} (looking for cards with requirement ≤ ₹${monthlyIncome.toLocaleString()})`,
    )
    console.log(`- Card Type: ${cardType}`)
    console.log(`- Available card types: ${availableCardTypes.join(", ")}`)
    return []
  }

  // Step 2: Calculate composite scores for basic eligible cards
  console.log("\n📊 STEP 2: CALCULATING COMPOSITE SCORES:")
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

    console.log(`📊 ${card.cardName}:`)
    console.log(`   💳 Joining Fee: ₹${card.joiningFee} → Score: ${joiningFeeScore.toFixed(1)}/25`)
    console.log(`   📅 Annual Fee: ₹${card.annualFee} → Score: ${annualFeeScore.toFixed(1)}/25`)
    console.log(`   🎁 Rewards Rate: ${card.rewardsRate}% → Score: ${rewardsScore.toFixed(1)}/25`)
    console.log(`   🎉 Sign-up Bonus: ₹${card.signUpBonus} → Score: ${bonusScore.toFixed(1)}/25`)
    console.log(`   🎯 COMPOSITE SCORE: ${compositeScore}/100`)

    return {
      ...card,
      compositeScore,
    }
  })

  // Step 3: NEW - Filter by composite score ≥25.0
  console.log("\n🎯 STEP 3: SCORE THRESHOLD FILTERING (≥25.0):")
  const scoreEligibleCards = scoredCards.filter((card) => {
    const meetsScoreThreshold = card.compositeScore >= 25.0
    console.log(
      `${meetsScoreThreshold ? "✅" : "❌"} ${card.cardName}: Score ${card.compositeScore}/100 ${meetsScoreThreshold ? "≥" : "<"} 25.0`,
    )
    return meetsScoreThreshold
  })

  console.log(`\n🎯 SCORE-ELIGIBLE CARDS FOUND: ${scoreEligibleCards.length}`)
  console.log(`📊 Cards filtered out by score threshold: ${scoredCards.length - scoreEligibleCards.length}`)

  if (scoreEligibleCards.length === 0) {
    console.log("⚠️ No cards meet the composite score threshold of ≥25.0")
    console.log("📊 Score distribution of basic eligible cards:")
    scoredCards
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .forEach((card) => {
        console.log(`   ${card.cardName}: ${card.compositeScore}/100`)
      })
    return []
  }

  // Step 4: Sort by composite score (highest first) and return top N
  const sortedCards = scoreEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  console.log(`\n🏆 TOP ${topN} RECOMMENDATIONS (from ${scoreEligibleCards.length} score-eligible cards):`)
  sortedCards.forEach((card, index) => {
    console.log(`${index + 1}. ${card.cardName}: ${card.compositeScore}/100`)
  })

  console.log("\n📈 FINAL SCORING BREAKDOWN:")
  console.log(`Total cards in database: ${cards.length}`)
  console.log(`Basic eligible cards: ${basicEligibleCards.length}`)
  console.log(`Score-eligible cards (≥25.0): ${scoreEligibleCards.length}`)
  console.log(`Cards shown (Top ${topN}): ${sortedCards.length}`)
  console.log(`Cards available for reward-based filtering: ${Math.max(0, scoreEligibleCards.length - topN)}`)

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

  console.log("🎁 REWARD-BASED FILTERING ANALYSIS WITH SCORE THRESHOLD")
  console.log("=".repeat(70))
  console.log("👤 User Profile:", userProfile)
  console.log("📊 Total available cards:", cards.length)
  console.log("🎯 LOGIC: Ranking purely by HIGHEST REWARD RATES (with ≥25.0 score threshold)")

  // Step 1: Basic eligibility filtering (same as before)
  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  console.log(`🎯 Basic eligible cards: ${basicEligibleCards.length}`)

  // Step 2: Calculate composite scores and filter by ≥25.0
  console.log("\n📊 CALCULATING SCORES AND APPLYING THRESHOLD:")
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
  const scoreEligibleCards = scoredCards.filter((card) => {
    const meetsScoreThreshold = card.compositeScore >= 25.0
    console.log(
      `${meetsScoreThreshold ? "✅" : "❌"} ${card.cardName}: Score ${card.compositeScore}/100 ${meetsScoreThreshold ? "≥" : "<"} 25.0`,
    )
    return meetsScoreThreshold
  })

  console.log(`🎯 Score-eligible cards (≥25.0): ${scoreEligibleCards.length}`)

  // Step 3: Apply additional filters with FIXED bank matching
  let filteredCards = scoreEligibleCards

  // Apply brand filter if specified - FIXED LOGIC
  if (preferredBrand && preferredBrand !== "Any") {
    console.log(`\n🏦 APPLYING BANK FILTER: "${preferredBrand}"`)
    console.log("🔍 Available banks in score-eligible cards:")

    const uniqueBanks = [...new Set(scoreEligibleCards.map((card) => card.bank))].sort()
    uniqueBanks.forEach((bank) => {
      const count = scoreEligibleCards.filter((card) => card.bank === bank).length
      console.log(`   • ${bank}: ${count} cards`)
    })

    filteredCards = filteredCards.filter((card) => {
      // EXACT match against the "Bank" column value from Google Sheet
      const bankMatch = card.bank === preferredBrand
      if (!bankMatch) {
        console.log(
          `🏦 Filtered out ${card.cardName} - Bank mismatch (Sheet Bank: "${card.bank}" vs Selected: "${preferredBrand}")`,
        )
      } else {
        console.log(
          `✅ ${card.cardName} - Bank EXACT match (Sheet Bank: "${card.bank}" === Selected: "${preferredBrand}")`,
        )
      }
      return bankMatch
    })
    console.log(`🏦 After EXACT bank filter (${preferredBrand}): ${filteredCards.length} cards`)
  }

  // Apply joining fee filter if specified
  if (maxJoiningFee !== undefined && maxJoiningFee >= 0) {
    filteredCards = filteredCards.filter((card) => {
      const feeMatch = card.joiningFee <= maxJoiningFee
      if (!feeMatch) {
        console.log(`💰 Filtered out ${card.cardName} - Joining fee too high (₹${card.joiningFee})`)
      }
      return feeMatch
    })
    console.log(`💰 After joining fee filter (≤₹${maxJoiningFee}): ${filteredCards.length} cards`)
  }

  if (filteredCards.length === 0) {
    console.log("⚠️ No cards match the filters. Falling back to score-eligible cards.")
    filteredCards = scoreEligibleCards
  }

  // Step 4: Sort PURELY by reward rate (highest first) - NO COMPOSITE SCORING
  console.log("\n🎁 RANKING BY REWARD RATES ONLY:")

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

  console.log(`\n🏆 TOP ${topN} REWARD-BASED RECOMMENDATIONS:`)
  rewardSortedCards.forEach((card, index) => {
    console.log(`${index + 1}. ${card.cardName}: ${card.rewardsRate}% rewards (Score: ${card.compositeScore}/100)`)
    console.log(`   🏦 Bank: ${card.bank}`)
    console.log(`   💳 Joining Fee: ₹${card.joiningFee}`)
    console.log(`   📅 Annual Fee: ₹${card.annualFee}`)
    console.log(`   🎉 Sign-up Bonus: ₹${card.signUpBonus}`)
  })

  // Add reward rate as the "score" for display consistency
  const cardsWithRewardScore = rewardSortedCards.map((card) => ({
    ...card,
    compositeScore: card.compositeScore, // Keep the actual composite score
  }))

  console.log("\n📈 REWARD-BASED FILTERING SUMMARY:")
  console.log(`Total cards in database: ${cards.length}`)
  console.log(`Basic eligible cards: ${basicEligibleCards.length}`)
  console.log(`Score-eligible cards (≥25.0): ${scoreEligibleCards.length}`)
  console.log(`After brand/fee filters: ${filteredCards.length}`)
  console.log(`Final reward-based results: ${rewardSortedCards.length}`)

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

  console.log("🔍 ENHANCED FILTERING ANALYSIS WITH SCORE THRESHOLD")
  console.log("=".repeat(70))
  console.log("👤 User Profile:", userProfile)
  console.log("📊 Total available cards:", cards.length)

  // Step 1: Basic eligibility filtering (same as before)
  const basicEligibleCards = cards.filter((card) => {
    const meetsCredit = card.creditScoreRequirement === 0 || creditScore >= card.creditScoreRequirement
    const meetsIncome = card.monthlyIncomeRequirement === 0 || monthlyIncome >= card.monthlyIncomeRequirement
    const matchesType = card.cardType === cardType
    return meetsCredit && meetsIncome && matchesType
  })

  console.log(`🎯 Basic eligible cards: ${basicEligibleCards.length}`)

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
  console.log(`🎯 Score-eligible cards (≥25.0): ${scoreEligibleCards.length}`)

  console.log("\n🏦 AVAILABLE BANKS IN SCORE-ELIGIBLE CARDS:")
  const uniqueBanks = [...new Set(scoreEligibleCards.map((card) => card.bank))].sort()
  uniqueBanks.forEach((bank) => {
    const count = scoreEligibleCards.filter((card) => card.bank === bank).length
    console.log(`   • ${bank}: ${count} cards`)
  })

  console.log("\n💰 JOINING FEE DISTRIBUTION IN SCORE-ELIGIBLE CARDS:")
  const feeDistribution = scoreEligibleCards.reduce(
    (acc, card) => {
      const feeRange =
        card.joiningFee === 0
          ? "Free (₹0)"
          : card.joiningFee <= 500
            ? "₹1-500"
            : card.joiningFee <= 1000
              ? "₹501-1000"
              : card.joiningFee <= 2500
                ? "₹1001-2500"
                : card.joiningFee <= 5000
                  ? "₹2501-5000"
                  : "₹5000+"
      acc[feeRange] = (acc[feeRange] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  Object.entries(feeDistribution).forEach(([range, count]) => {
    console.log(`   • ${range}: ${count} cards`)
  })

  // Step 3: Enhanced filtering with brand and joining fee preferences
  let enhancedEligibleCards = scoreEligibleCards

  // Apply brand filter if specified
  if (preferredBrand && preferredBrand !== "Any") {
    enhancedEligibleCards = enhancedEligibleCards.filter((card) => {
      // EXACT match against the "Bank" column value from Google Sheet
      const bankMatch = card.bank === preferredBrand
      if (!bankMatch) {
        console.log(
          `🏦 Filtered out ${card.cardName} - Bank mismatch (Sheet Bank: "${card.bank}" vs Selected: "${preferredBrand}")`,
        )
      } else {
        console.log(
          `✅ ${card.cardName} - Bank EXACT match (Sheet Bank: "${card.bank}" === Selected: "${preferredBrand}")`,
        )
      }
      return bankMatch
    })
    console.log(`🏦 After EXACT bank filter (${preferredBrand}): ${enhancedEligibleCards.length} cards`)
  }

  // Apply joining fee filter if specified
  if (maxJoiningFee !== undefined && maxJoiningFee >= 0) {
    enhancedEligibleCards = enhancedEligibleCards.filter((card) => {
      // Match against the exact "Joining Fee" column value from Google Sheet
      const feeMatch = card.joiningFee <= maxJoiningFee
      if (!feeMatch) {
        console.log(
          `💰 Filtered out ${card.cardName} - Joining fee too high (Sheet Joining Fee: ₹${card.joiningFee} > Selected Max: ₹${maxJoiningFee})`,
        )
      } else {
        console.log(
          `✅ ${card.cardName} - Joining fee acceptable (Sheet Joining Fee: ₹${card.joiningFee} ≤ Selected Max: ₹${maxJoiningFee})`,
        )
      }
      return feeMatch
    })
    console.log(`💰 After joining fee filter (≤₹${maxJoiningFee}): ${enhancedEligibleCards.length} cards`)
  }

  if (enhancedEligibleCards.length === 0) {
    console.log("⚠️ No cards match enhanced criteria. Falling back to score-eligible cards.")
    enhancedEligibleCards = scoreEligibleCards
  }

  const sortedCards = enhancedEligibleCards.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, topN)

  console.log(`\n🏆 TOP ${topN} ENHANCED RECOMMENDATIONS:`)
  sortedCards.forEach((card, index) => {
    console.log(`${index + 1}. ${card.cardName}: ${card.compositeScore}/100`)
  })

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

    console.log(`📊 ELIGIBILITY SUMMARY:`)
    console.log(`- Total cards in database: ${allCards.length}`)
    console.log(`- Basic eligible cards: ${basicEligibleCards.length}`)
    console.log(`- Score-eligible cards (≥25.0): ${scoreEligibleCount}`)
    console.log(`- Cards shown (Top ${topN}): ${recommendations.length}`)
    console.log(`- Additional cards available for reward-based: ${Math.max(0, scoreEligibleCount - topN)}`)

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
      console.log("✅ User data logged successfully")
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
      console.log("✅ Enhanced user data logged successfully")
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
// Helper function to get credit score value from range
export function getCreditScoreValue(range: string): number {
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
