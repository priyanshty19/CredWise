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
}

interface UserSubmission {
  creditScore: number
  monthlyIncome: number
  cardType: string
  timestamp: string
}

interface SheetData {
  range: string
  majorDimension: string
  values: string[][]
}

// Google Sheets configuration - Updated for public access
const SHEET_ID = "1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo"
const CARDS_RANGE = "Card-Data!A:K" // Fetch all rows in columns A through K
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY

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

    // Validate expected headers
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

    // First, let's analyze all card types in the sheet
    console.log("\n🔍 ANALYZING ALL CARD TYPES IN SHEET:")
    const allCardTypes = new Set<string>()
    rows.forEach((row, index) => {
      if (row && row.length > 2 && row[2]) {
        const cardType = row[2].toString().trim()
        allCardTypes.add(cardType)
      }
    })

    console.log("📊 Unique card types found in sheet:")
    Array.from(allCardTypes)
      .sort()
      .forEach((type) => {
        console.log(`   • "${type}"`)
      })

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

        const rawCardType = getString(row[2])
        console.log(
          `\n🔍 Processing row ${index + 2}: Card "${getString(row[0])}" with raw card type: "${rawCardType}"`,
        )

        const card = {
          id: `card_${processedRows + 1}`,
          cardName: getString(row[0]),
          bank: getString(row[1]),
          cardType: rawCardType, // Keep raw for now, will normalize below
          joiningFee: parseNumeric(row[3]),
          annualFee: parseNumeric(row[4]),
          creditScoreRequirement: parseInt(row[5]),
          monthlyIncomeRequirement: parseNumeric(row[6]),
          rewardsRate: parseNumeric(row[7]),
          signUpBonus: parseNumeric(row[8]),
          features,
          description: getString(row[10]),
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

        console.log(`✅ Normalized "${card.cardType}" → "${normalizedCardType}"`)
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

    // Log sample of successfully parsed cards
    if (cards.length > 0) {
      console.log("📋 Sample parsed cards:")
      cards.slice(0, 3).forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.cardName} (${card.bank}) - ${card.cardType}`)
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
