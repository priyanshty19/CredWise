"use server"

interface SheetData {
  range: string
  majorDimension: string
  values: string[][]
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
  spendingCategories: string[]
}

// Server-side Google Sheets configuration
const SHEET_ID = "1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo"
const CARDS_RANGE = "Card-Data!A:L"

async function fetchGoogleSheetData(sheetId: string, range: string): Promise<SheetData | null> {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY // Remove NEXT_PUBLIC_ prefix

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

function normalizeCardTypeFromSheet(sheetCardType: string): string | null {
  const normalized = sheetCardType.toLowerCase().trim()

  const typeMapping: { [key: string]: string } = {
    cashback: "Cashback",
    travel: "Travel",
    rewards: "Rewards",
    student: "Student",
    business: "Business",
    "cash back": "Cashback",
    "cash-back": "Cashback",
    "cashback card": "Cashback",
    "cash rewards": "Cashback",
    "cash back rewards": "Cashback",
    "travel rewards": "Travel",
    "air miles": "Travel",
    airline: "Travel",
    hotel: "Travel",
    "travel card": "Travel",
    miles: "Travel",
    "frequent flyer": "Travel",
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
    "student card": "Student",
    youth: "Student",
    starter: "Student",
    "entry level": "Student",
    "first card": "Student",
    beginner: "Student",
    "business/professional": "Business",
    "business professional": "Business",
    businessprofessional: "Business",
    professional: "Business",
    corporate: "Business",
    commercial: "Business",
    "business card": "Business",
    "corporate card": "Business",
    "fuel card": "Rewards",
    "shopping card": "Rewards",
    "dining card": "Rewards",
    entertainment: "Rewards",
    grocery: "Rewards",
    secured: "Student",
    "credit builder": "Student",
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
    for (const [key, value] of Object.entries(typeMapping)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value
      }
    }
    return null
  }
}

export async function fetchCreditCardsAction(): Promise<{ success: boolean; cards?: CreditCard[]; error?: string }> {
  try {
    const sheetData = await fetchGoogleSheetData(SHEET_ID, CARDS_RANGE)

    if (!sheetData || !sheetData.values || sheetData.values.length === 0) {
      return {
        success: false,
        error: "No data found in Google Sheet.",
      }
    }

    const [headers, ...rows] = sheetData.values
    const cards: CreditCard[] = []
    let skippedRows = 0
    let processedRows = 0

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]

      try {
        if (!row || row.every((cell) => !cell || cell === "")) {
          skippedRows++
          continue
        }

        if (row.length < 3) {
          skippedRows++
          continue
        }

        const parseNumeric = (value: any, defaultValue = 0): number => {
          if (!value || value === "NA" || value === "" || value === null || value === undefined) return defaultValue
          const parsed = Number.parseFloat(value.toString().replace(/,/g, ""))
          return isNaN(parsed) ? defaultValue : parsed
        }

        const parseInt = (value: any, defaultValue = 0): number => {
          if (!value || value === "NA" || value === "" || value === null || value === undefined) return defaultValue
          const parsed = Number.parseInt(value.toString().replace(/,/g, ""))
          return isNaN(parsed) ? defaultValue : parsed
        }

        const getString = (value: any, defaultValue = ""): string => {
          if (!value || value === "NA" || value === null || value === undefined) return defaultValue
          return value.toString().trim()
        }

        const featuresString = getString(row[9])
        const features =
          !featuresString || featuresString === "NA"
            ? []
            : featuresString
                .split(",")
                .map((f: string) => f.trim())
                .filter(Boolean)

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

        if (!card.cardName || !card.bank || !card.cardType) {
          skippedRows++
          continue
        }

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

    return {
      success: true,
      cards,
    }
  } catch (error) {
    console.error("❌ Error fetching credit cards from Google Sheets:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch credit cards",
    }
  }
}

export async function testGoogleSheetsConnection(): Promise<{
  success: boolean
  data?: SheetData
  error?: string
  totalCards?: number
}> {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY // Remove NEXT_PUBLIC_ prefix
    const sheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

    if (!apiKey) {
      return {
        success: false,
        error: "Google Sheets API key not found in environment variables",
      }
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Class Data!A1:F10?key=${apiKey}`,
    )

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      }
    }

    const data: SheetData = await response.json()

    return {
      success: true,
      data,
      totalCards: data.values ? data.values.length - 1 : 0,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function checkGoogleSheetsStatus(): Promise<{
  sheetsApi: {
    status: "connected" | "error"
    message?: string
    responseTime?: number
  }
  appsScript: {
    status: "connected" | "error"
    message?: string
    responseTime?: number
  }
}> {
  // Check Google Sheets API
  const sheetsStartTime = Date.now()
  let sheetsResult: any

  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY
    if (!apiKey) {
      throw new Error("API key not configured")
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/values/Sheet1!A1:A1?key=${apiKey}`,
    )

    const sheetsResponseTime = Date.now() - sheetsStartTime

    if (response.ok) {
      sheetsResult = {
        status: "connected" as const,
        message: "Google Sheets API is accessible",
        responseTime: sheetsResponseTime,
      }
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    sheetsResult = {
      status: "error" as const,
      message: error instanceof Error ? error.message : "Connection failed",
      responseTime: Date.now() - sheetsStartTime,
    }
  }

  // Check Apps Script
  const appsScriptStartTime = Date.now()
  let appsScriptResult: any

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
      body: JSON.stringify({ test: true }),
    })

    const appsScriptResponseTime = Date.now() - appsScriptStartTime

    if (response.ok) {
      appsScriptResult = {
        status: "connected" as const,
        message: "Apps Script webhook is responding",
        responseTime: appsScriptResponseTime,
      }
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    appsScriptResult = {
      status: "error" as const,
      message: error instanceof Error ? error.message : "Connection failed",
      responseTime: Date.now() - appsScriptStartTime,
    }
  }

  return {
    sheetsApi: sheetsResult,
    appsScript: appsScriptResult,
  }
}
