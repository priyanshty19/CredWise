"use server"

import { universalParser, type UniversalParseResult } from "@/lib/universal-statement-parser"

export interface PortfolioEntry {
  id: string
  name: string
  type: "equity" | "mutual_fund" | "bond" | "other"
  quantity: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  source: "upload" | "manual"
  fileName?: string
  broker?: string
  dateAdded: string
  platform?: string
  isin?: string
  folio?: string
  category?: string
}

export interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  totalGainLossPercentage: number
  totalEntries: number
  byType: Record<string, { value: number; count: number; invested: number; gainLoss: number }>
  byBroker: Record<string, { value: number; count: number; invested: number; gainLoss: number }>
}

// Convert UniversalParseResult to PortfolioEntry format
function convertToPortfolioEntries(universalResult: UniversalParseResult): PortfolioEntry[] {
  return universalResult.data.map((holding) => ({
    id: holding.id,
    name: holding.name,
    type:
      holding.type === "stock"
        ? "equity"
        : holding.type === "mutual_fund"
          ? "mutual_fund"
          : holding.type === "bond"
            ? "bond"
            : "other",
    quantity: holding.quantity,
    avgPrice: holding.avgPrice,
    currentPrice: holding.currentPrice,
    currentValue: holding.currentValue,
    gainLoss: holding.gainLoss,
    gainLossPercentage: holding.gainLossPercentage,
    source: "upload" as const,
    fileName: universalResult.fileName,
    broker: holding.platform,
    dateAdded: new Date().toISOString(),
    platform: holding.platform,
    isin: holding.isin,
    folio: holding.folio,
    category: holding.category,
  }))
}

export async function parsePortfolioFile(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Use the universal parser
    const universalResult = await universalParser.parseFile(file)

    if (!universalResult.success) {
      return {
        success: false,
        error: universalResult.errors.join(", ") || "Failed to parse file",
      }
    }

    // Convert to portfolio entries
    const portfolioEntries = convertToPortfolioEntries(universalResult)

    return {
      success: true,
      data: portfolioEntries,
      summary: {
        totalInvestments: universalResult.totalHoldings,
        totalValue: universalResult.totalValue,
        totalInvested: universalResult.totalInvested,
        totalGainLoss: universalResult.totalGainLoss,
        platform: universalResult.platform,
        fileName: file.name,
        detectedFormat: universalResult.detectedFormat,
      },
    }
  } catch (error) {
    console.error("Portfolio parsing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function addManualEntry(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const type = formData.get("type") as PortfolioEntry["type"]
    const quantity = Number.parseFloat(formData.get("quantity") as string)
    const avgPrice = Number.parseFloat(formData.get("avgPrice") as string)
    const currentPrice = Number.parseFloat(formData.get("currentPrice") as string)

    if (!name || !type || !quantity || !avgPrice || !currentPrice) {
      return { success: false, error: "All fields are required" }
    }

    const currentValue = quantity * currentPrice
    const investedValue = quantity * avgPrice
    const gainLoss = currentValue - investedValue
    const gainLossPercentage = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0

    const entry: PortfolioEntry = {
      id: `manual-${Date.now()}`,
      name,
      type,
      quantity,
      avgPrice,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercentage,
      source: "manual",
      dateAdded: new Date().toISOString(),
    }

    return {
      success: true,
      data: entry,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add entry",
    }
  }
}

export async function calculatePortfolioSummary(entries: PortfolioEntry[]): Promise<PortfolioSummary> {
  const totalValue = entries.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalInvested = entries.reduce((sum, entry) => sum + entry.quantity * entry.avgPrice, 0)
  const totalGainLoss = totalValue - totalInvested
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  const byType: Record<string, { value: number; count: number; invested: number; gainLoss: number }> = {}
  const byBroker: Record<string, { value: number; count: number; invested: number; gainLoss: number }> = {}

  entries.forEach((entry) => {
    const invested = entry.quantity * entry.avgPrice

    // By type
    if (!byType[entry.type]) {
      byType[entry.type] = { value: 0, count: 0, invested: 0, gainLoss: 0 }
    }
    byType[entry.type].value += entry.currentValue
    byType[entry.type].count += 1
    byType[entry.type].invested += invested
    byType[entry.type].gainLoss += entry.gainLoss

    // By broker/platform
    const broker = entry.broker || entry.platform || "Manual Entry"
    if (!byBroker[broker]) {
      byBroker[broker] = { value: 0, count: 0, invested: 0, gainLoss: 0 }
    }
    byBroker[broker].value += entry.currentValue
    byBroker[broker].count += 1
    byBroker[broker].invested += invested
    byBroker[broker].gainLoss += entry.gainLoss
  })

  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPercentage,
    totalEntries: entries.length,
    byType,
    byBroker,
  }
}
