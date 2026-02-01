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
  spendingCategories: string[]
}

// Use the correct spreadsheet ID from the original configuration
const SHEET_ID = "1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo"
const CARDS_RANGE = "Card-Data!A:P"

/**
 * Column mapping: maps sheet header patterns to CreditCard field names.
 * Headers are normalized (lowercase, trimmed, newlines removed) before matching.
 */
interface ColumnMapConfig {
  [fieldName: string]: string[] // fieldName -> array of header patterns to search for
}

const COLUMN_MAP: ColumnMapConfig = {
  cardName: ["card name", "name"],
  bank: ["bank", "brand", "issuer"],
  cardType: ["card type", "type", "category"],
  joiningFee: ["joining fee", "joining_fee", "joiningfee", "upfront fee"],
  annualFee: ["annual fee", "annual_fee", "annualfee", "yearly fee"],
  creditScoreRequirement: [
    "credit score requirement",
    "min credit score",
    "credit score",
    "min credit",
  ],
  monthlyIncomeRequirement: ["income requirement", "min income", "monthly income", "income"],
  rewardsRate: [
    "optimized reward rate",
    "base reward rate",
    "reward rate",
    "rewards rate",
  ],
  spendingCategories: [
    "spending category",
    "spending categories",
    "best for categories",
    "best for",
  ],
}

/**
 * Normalize header by trimming whitespace and removing newline characters.
 */
function normalizeHeader(header: string): string {
  return (header || "").toString().toLowerCase().trim().replace(/[\n\r]+/g, " ")
}

/**
 * Find column index by matching normalized header against patterns.
 * Returns -1 if not found.
 */
function findColumnIndex(
  normalizedHeaders: string[],
  patterns: string[],
  fieldName: string,
): number {
  for (const pattern of patterns) {
    const patternNorm = normalizeHeader(pattern)
    const idx = normalizedHeaders.findIndex((h) => h === patternNorm || h.includes(patternNorm))
    if (idx >= 0) {
      return idx
    }
  }
  console.warn(`⚠️  Column mapping: "${fieldName}" not found. Checked patterns: [${patterns.join(", ")}]`)
  return -1
}

/**
 * Build a column index map from headers using COLUMN_MAP.
 */
function buildColumnIndexMap(
  headers: string[],
): { [fieldName: string]: number } {
  const normalizedHeaders = headers.map(normalizeHeader)

  console.log("\n📋 RAW HEADERS FROM SHEET:")
  console.log(headers)
  console.log("\n📋 NORMALIZED HEADERS:")
  console.log(normalizedHeaders)
  console.log("")

  const indexMap: { [fieldName: string]: number } = {}

  for (const [fieldName, patterns] of Object.entries(COLUMN_MAP)) {
    const idx = findColumnIndex(normalizedHeaders, patterns, fieldName)
    indexMap[fieldName] = idx
  }

  console.log("🗂️  COLUMN INDEX MAP:")
  for (const [fieldName, idx] of Object.entries(indexMap)) {
    if (idx >= 0) {
      console.log(`   ✅ ${fieldName}: index ${idx} (header: "${headers[idx]}")`)
    } else {
      console.log(`   ❌ ${fieldName}: NOT FOUND`)
    }
  }
  console.log("")

  return indexMap
}

/**
 * Safely parse a numeric value from a sheet cell.
 * Returns defaultValue if cell is empty, "NA", or not a valid number.
 */
function parseNumeric(value: any, defaultValue = 0): number {
  if (!value || value === "NA" || value === "" || value === null || value === undefined) {
    return defaultValue
  }
  const parsed = Number.parseFloat(value.toString().replace(/,/g, ""))
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Safely parse an integer from a sheet cell.
 */
function parseInteger(value: any, defaultValue = 0): number {
  if (!value || value === "NA" || value === "" || value === null || value === undefined) {
    return defaultValue
  }
  const parsed = Number.parseInt(value.toString().replace(/,/g, ""), 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Safely get a string value, trimming whitespace.
 */
function getString(value: any, defaultValue = ""): string {
  if (!value || value === "NA" || value === null || value === undefined) {
    return defaultValue
  }
  return value.toString().trim()
}

/**
 * Parse comma-separated spending categories into a string array (lowercased).
 */
function parseCategories(value: any): string[] {
  const str = getString(value)
  if (!str) return []
  return str
    .split(",")
    .map((cat) => cat.trim().toLowerCase())
    .filter((cat) => cat.length > 0)
}

async function fetchGoogleSheetData(sheetId: string, range: string): Promise<SheetData | null> {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (!apiKey) {
      throw new Error("Google Sheets API key not found")
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`

    console.log("Fetching from URL:", url.replace(apiKey, "***API_KEY***"))

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Sheets API error response:", errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
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
    console.log("\n🔄 FETCHING CREDIT CARDS FROM GOOGLE SHEETS")
    console.log("=".repeat(70))

    const sheetData = await fetchGoogleSheetData(SHEET_ID, CARDS_RANGE)

    if (!sheetData || !sheetData.values || sheetData.values.length === 0) {
      return {
        success: false,
        error: "No data found in Google Sheet.",
      }
    }

    console.log(`✅ Received ${sheetData.values.length} total rows from sheet`)

    const [headers, ...rows] = sheetData.values

    // Build column index map from headers
    const colMap = buildColumnIndexMap(headers)

    const cards: CreditCard[] = []
    let skippedRows = 0
    let processedRows = 0
    let cardsWithNoCategories = 0

    console.log(`📝 PROCESSING ${rows.length} DATA ROWS:\n`)

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]

      try {
        if (!row || row.every((cell) => !cell || cell === "")) {
          skippedRows++
          continue
        }

        // Check for minimum required fields
        if (row.length < 3) {
          skippedRows++
          continue
        }

        // Extract field values using column map
        const cardName = getString(row[colMap.cardName])
        const bank = getString(row[colMap.bank])
        const cardTypeRaw = getString(row[colMap.cardType])
        const joiningFee = parseNumeric(row[colMap.joiningFee])
        const annualFee = parseNumeric(row[colMap.annualFee])
        const creditScoreRequirement = parseInteger(row[colMap.creditScoreRequirement])
        const monthlyIncomeRequirement = parseNumeric(row[colMap.monthlyIncomeRequirement])
        const rewardsRate = parseNumeric(row[colMap.rewardsRate])
        const spendingCategories =
          colMap.spendingCategories >= 0 ? parseCategories(row[colMap.spendingCategories]) : []

        // Validate required fields
        if (!cardName || !bank || !cardTypeRaw) {
          console.warn(
            `⚠️  Skipping row ${index + 2}: Missing required fields (Name: "${cardName}", Bank: "${bank}", Type: "${cardTypeRaw}")`,
          )
          skippedRows++
          continue
        }

        // Normalize card type
        const normalizedCardType = normalizeCardTypeFromSheet(cardTypeRaw)
        if (!normalizedCardType) {
          console.warn(`⚠️  Skipping row ${index + 2}: Invalid card type "${cardTypeRaw}"`)
          skippedRows++
          continue
        }

        // Log first 20 cards for debugging
        if (processedRows < 20) {
          console.log(
            `✅ Card ${processedRows + 1}: "${cardName}" (${bank}) | Categories: [${spendingCategories.join(", ") || "NONE"}]`,
          )
        }

        // Track cards with no spending categories
        if (spendingCategories.length === 0) {
          cardsWithNoCategories++
          if (processedRows < 20) {
            console.warn(`   ⚠️  "${cardName}" has NO spending categories assigned`)
          }
        }

        const card: CreditCard = {
          id: `card_${processedRows + 1}`,
          cardName,
          bank,
          cardType: normalizedCardType,
          joiningFee,
          annualFee,
          creditScoreRequirement,
          monthlyIncomeRequirement,
          rewardsRate,
          spendingCategories,
        }

        cards.push(card)
        processedRows++
      } catch (error) {
        console.error(`❌ Error processing row ${index + 2}:`, error)
        skippedRows++
        continue
      }
    }

    console.log(`\n📊 FINAL RESULTS:`)
    console.log(`   ✅ Successfully loaded: ${cards.length} cards`)
    console.log(`   ⏭️  Skipped: ${skippedRows} rows`)
    console.log(`   📈 Total rows processed: ${rows.length}`)
    if (cardsWithNoCategories > 0) {
      console.warn(`   ⚠️  ${cardsWithNoCategories} cards have NO spending categories`)
    }
    console.log("=".repeat(70))
    console.log("")

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
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (!apiKey) {
      return {
        success: false,
        error: "Google Sheets API key not found in environment variables",
      }
    }

    // Test with the actual sheet first
    console.log("\n🔌 Testing connection to main sheet...")
    const mainSheetData = await fetchGoogleSheetData(SHEET_ID, "Card-Data!A1:P10")

    if (mainSheetData) {
      return {
        success: true,
        data: mainSheetData,
        totalCards: mainSheetData.values ? mainSheetData.values.length - 1 : 0,
      }
    }

    // Fallback to test sheet
    console.log("Testing connection to fallback sheet...")
    const testSheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
    const testData = await fetchGoogleSheetData(testSheetId, "Class Data!A1:F10")

    if (testData) {
      return {
        success: true,
        data: testData,
        totalCards: testData.values ? testData.values.length - 1 : 0,
      }
    }

    return {
      success: false,
      error: "Unable to connect to any test sheets",
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

    // Test with a simple range first
    const testData = await fetchGoogleSheetData(SHEET_ID, "Card-Data!A1:A1")
    const sheetsResponseTime = Date.now() - sheetsStartTime

    if (testData) {
      sheetsResult = {
        status: "connected" as const,
        message: "Google Sheets API is accessible",
        responseTime: sheetsResponseTime,
      }
    } else {
      throw new Error("No data returned from sheet")
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

export async function fetchSubmissionAnalytics(): Promise<{
  success: boolean
  data?: any[]
  message: string
}> {
  try {
    const response = await fetchGoogleSheetData(SHEET_ID, "Form-Submissions!A:Z")

    if (!response || !response.values || response.values.length === 0) {
      return {
        success: true,
        data: [],
        message: "No submission data found",
      }
    }

    return {
      success: true,
      data: response.values,
      message: "Analytics data fetched successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch analytics",
    }
  }
}
