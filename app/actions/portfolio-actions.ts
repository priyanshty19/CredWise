"use server"

import { parseInvestmentFile } from "@/lib/file-parsers"

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
}

export interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  totalGainLossPercentage: number
  totalEntries: number
  byType: Record<string, { value: number; count: number }>
  byBroker: Record<string, { value: number; count: number }>
}

export async function parsePortfolioFile(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Check file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return {
        success: false,
        error: "Unsupported file format. Please upload CSV or Excel files.",
      }
    }

    // Parse the file
    const parseResult = await parseInvestmentFile(file)

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error || "Failed to parse file",
      }
    }

    // Convert parsed data to portfolio entries
    const portfolioEntries: PortfolioEntry[] = parseResult.data.map((investment, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity,
      avgPrice: investment.avgPrice,
      currentPrice: investment.currentPrice,
      currentValue: investment.currentValue,
      gainLoss: investment.gainLoss,
      gainLossPercentage: investment.gainLossPercentage,
      source: "upload" as const,
      fileName: file.name,
      broker: investment.broker,
      dateAdded: new Date().toISOString(),
    }))

    return {
      success: true,
      data: portfolioEntries,
      summary: {
        totalInvestments: parseResult.totalInvestments,
        totalValue: parseResult.totalValue,
        totalGainLoss: parseResult.totalGainLoss,
        broker: parseResult.broker,
        fileName: file.name,
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

export function calculatePortfolioSummary(entries: PortfolioEntry[]): PortfolioSummary {
  const totalValue = entries.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalInvested = entries.reduce((sum, entry) => sum + entry.quantity * entry.avgPrice, 0)
  const totalGainLoss = totalValue - totalInvested
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  const byType: Record<string, { value: number; count: number }> = {}
  const byBroker: Record<string, { value: number; count: number }> = {}

  entries.forEach((entry) => {
    // By type
    if (!byType[entry.type]) {
      byType[entry.type] = { value: 0, count: 0 }
    }
    byType[entry.type].value += entry.currentValue
    byType[entry.type].count += 1

    // By broker
    const broker = entry.broker || "Manual Entry"
    if (!byBroker[broker]) {
      byBroker[broker] = { value: 0, count: 0 }
    }
    byBroker[broker].value += entry.currentValue
    byBroker[broker].count += 1
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
