"use server"

interface CreditCard {
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

interface GoogleSheetsResponse {
  values?: string[][]
}

async function fetchFromGoogleSheets(range: string): Promise<GoogleSheetsResponse> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY
  const spreadsheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" // Replace with your actual spreadsheet ID

  if (!apiKey) {
    throw new Error("Google Sheets API key not configured")
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`

  const response = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status}`)
  }

  return response.json()
}

export async function fetchCreditCardsAction(): Promise<CreditCard[]> {
  try {
    const response = await fetchFromGoogleSheets("Credit Cards!A:Z")

    if (!response.values || response.values.length === 0) {
      return []
    }

    const [headers, ...rows] = response.values

    return rows.map((row, index) => ({
      id: row[0] || `card-${index}`,
      name: row[1] || "",
      bank: row[2] || "",
      cardType: row[3] || "",
      joiningFee: Number.parseFloat(row[4]) || 0,
      annualFee: Number.parseFloat(row[5]) || 0,
      rewardRate: Number.parseFloat(row[6]) || 0,
      categories: row[7] ? row[7].split(",").map((c) => c.trim()) : [],
      eligibilityIncome: Number.parseFloat(row[8]) || 0,
      features: row[9] ? row[9].split(",").map((f) => f.trim()) : [],
      pros: row[10] ? row[10].split(",").map((p) => p.trim()) : [],
      cons: row[11] ? row[11].split(",").map((c) => c.trim()) : [],
      bestFor: row[12] ? row[12].split(",").map((b) => b.trim()) : [],
      applyUrl: row[13] || "",
    }))
  } catch (error) {
    console.error("Error fetching credit cards:", error)
    return []
  }
}

export async function checkGoogleSheetsStatus(): Promise<{
  success: boolean
  message: string
  cardCount?: number
}> {
  try {
    const cards = await fetchCreditCardsAction()
    return {
      success: true,
      message: "Google Sheets connection successful",
      cardCount: cards.length,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function testGoogleSheetsConnection(): Promise<{
  success: boolean
  message: string
  data?: any
}> {
  try {
    const response = await fetchFromGoogleSheets("Credit Cards!A1:C5")
    return {
      success: true,
      message: "Test connection successful",
      data: response.values,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Test connection failed",
    }
  }
}

export async function fetchSubmissionAnalytics(): Promise<{
  success: boolean
  data?: any[]
  message: string
}> {
  try {
    const response = await fetchFromGoogleSheets("Form-Submissions!A:Z")

    if (!response.values || response.values.length === 0) {
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
