import { GoogleSheetsAPI, type CardData } from "./google-sheets"

export class GoogleSheetsService {
  private sheetsAPI: GoogleSheetsAPI

  constructor() {
    this.sheetsAPI = new GoogleSheetsAPI()
  }

  async getCardData(): Promise<CardData[]> {
    try {
      return await this.sheetsAPI.getCardData()
    } catch (error) {
      console.error("Error fetching card data:", error)
      throw error
    }
  }

  async getCardsByIncome(minIncome: number, maxIncome?: number): Promise<CardData[]> {
    const allCards = await this.getCardData()

    return allCards.filter((card) => {
      if (card.minIncome > minIncome) return false
      if (maxIncome && card.maxIncome > 0 && card.maxIncome < maxIncome) return false
      return true
    })
  }

  async getCardsByCategory(categories: string[]): Promise<CardData[]> {
    const allCards = await this.getCardData()

    return allCards.filter((card) => {
      return categories.some((category) =>
        card.spendingCategories.some(
          (cardCategory) =>
            cardCategory.toLowerCase().includes(category.toLowerCase()) ||
            category.toLowerCase().includes(cardCategory.toLowerCase()),
        ),
      )
    })
  }

  async getCardsByBank(banks: string[]): Promise<CardData[]> {
    const allCards = await this.getCardData()

    if (banks.length === 0 || banks.includes("Any")) {
      return allCards
    }

    return allCards.filter((card) => banks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())))
  }
}
