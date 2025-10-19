"use server"

import { fetchCreditCardsAction } from "./google-sheets-actions"

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

export async function fetchAllCards(): Promise<{
  success: boolean
  cards?: CreditCard[]
  error?: string
}> {
  try {
    const result = await fetchCreditCardsAction()
    return result
  } catch (error) {
    console.error("Error fetching all cards:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch cards",
    }
  }
}
