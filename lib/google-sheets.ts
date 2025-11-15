// lib/google-sheets.ts - Credit card data fetching and recommendations

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

// Fetch credit cards from Google Sheets via server action
export async function fetchCreditCards(): Promise<CreditCard[]> {
  try {
    const result = await fetchCreditCardsAction()

    if (!result.success) {
      console.error("Failed to fetch credit cards:", result.error)
      throw new Error(result.error || "Failed to fetch credit cards")
    }

    return result.cards || []
  } catch (error) {
    console.error("❌ Error fetching credit cards:", error)
    throw error
  }
}

// Fetch available spending categories from all cards
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

// Submit data to Google Sheets via Apps Script
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

// Legacy function kept for backwards compatibility
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
