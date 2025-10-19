"use server"

import { getCardsFromSheet } from "@/lib/google-sheets"

export async function getCardData() {
  try {
    const cards = await getCardsFromSheet()

    if (!cards || cards.length === 0) {
      return {
        success: false,
        error: "No card data available",
        cards: [],
      }
    }

    return {
      success: true,
      cards,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching card data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch card data",
      cards: [],
    }
  }
}
