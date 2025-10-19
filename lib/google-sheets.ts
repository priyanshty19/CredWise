const SPREADSHEET_ID = "1mA36CcJWP20YMFwi-1vJGNBF4w8LgcOy1uRAWmQPfvs"
const SHEET_NAME = "Card-Master"
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY

export interface CreditCard {
  cardName: string
  bank: string
  cardType: string
  minIncome: number
  joiningFee: number
  annualFee: number
  categories: string[]
  rewards: {
    category: string
    percentage: number
  }[]
  features: string[]
}

export async function getCardsFromSheet(): Promise<CreditCard[]> {
  if (!API_KEY) {
    throw new Error("Google Sheets API key not configured")
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:Z?key=${API_KEY}`
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.values || data.values.length === 0) {
      return []
    }

    const cards: CreditCard[] = data.values.map((row: any[]) => {
      // Parse categories (column index may vary based on sheet structure)
      const categoriesStr = row[6] || ""
      const categories = categoriesStr
        .split(",")
        .map((cat: string) => cat.trim())
        .filter(Boolean)

      // Parse rewards (format: "category:percentage,category:percentage")
      const rewardsStr = row[7] || ""
      const rewards = rewardsStr
        .split(",")
        .map((reward: string) => {
          const [category, percentage] = reward.split(":").map((s) => s.trim())
          return {
            category: category || "",
            percentage: Number.parseFloat(percentage) || 0,
          }
        })
        .filter((r) => r.category && r.percentage > 0)

      // Parse features
      const featuresStr = row[8] || ""
      const features = featuresStr
        .split(",")
        .map((feat: string) => feat.trim())
        .filter(Boolean)

      return {
        cardName: row[0] || "",
        bank: row[1] || "",
        cardType: row[2] || "",
        minIncome: Number.parseFloat(row[3]) || 0,
        joiningFee: Number.parseFloat(row[4]) || 0,
        annualFee: Number.parseFloat(row[5]) || 0,
        categories,
        rewards,
        features,
      }
    })

    return cards.filter((card) => card.cardName && card.bank)
  } catch (error) {
    console.error("Error fetching cards from Google Sheets:", error)
    throw error
  }
}

// Helper function to get unique values for filters
export async function getFilterOptions() {
  try {
    const cards = await getCardsFromSheet()

    const banks = Array.from(new Set(cards.map((card) => card.bank))).sort()
    const cardTypes = Array.from(new Set(cards.map((card) => card.cardType))).sort()
    const allCategories = Array.from(new Set(cards.flatMap((card) => card.categories))).sort()

    return {
      banks,
      cardTypes,
      categories: allCategories,
    }
  } catch (error) {
    console.error("Error getting filter options:", error)
    return {
      banks: [],
      cardTypes: [],
      categories: [],
    }
  }
}
