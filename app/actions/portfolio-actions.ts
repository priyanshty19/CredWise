"use server"

import { parsePortfolioFile } from "@/lib/file-parsers"

export interface PortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf" | "manual"
  quantity: number
  avgPrice: number
  currentPrice: number
  investedValue: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  source: "upload" | "manual"
  fileName?: string
  broker?: string
  folio?: string
  isin?: string
  dateAdded: string
}

export interface PortfolioSummary {
  totalEntries: number
  totalInvested: number
  totalValue: number
  totalGainLoss: number
  totalGainLossPercentage: number
  byType: Record<string, { count: number; value: number; invested: number; gainLoss: number }>
  byBroker: Record<string, { count: number; value: number; invested: number; gainLoss: number }>
}

export async function uploadPortfolioFile(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    const result = await parsePortfolioFile(file)

    if (!result.success) {
      return {
        success: false,
        error: result.errors.join(", "),
        details: result,
      }
    }

    // Convert parsed entries to portfolio entries
    const portfolioEntries: PortfolioEntry[] = result.data.map((entry) => ({
      id: entry.id,
      name: entry.name,
      type: entry.type,
      quantity: entry.units,
      avgPrice: entry.invested / entry.units,
      currentPrice: entry.nav,
      investedValue: entry.invested,
      currentValue: entry.current,
      gainLoss: entry.current - entry.invested,
      gainLossPercentage: entry.invested > 0 ? ((entry.current - entry.invested) / entry.invested) * 100 : 0,
      source: entry.source,
      fileName: entry.fileName,
      broker: entry.broker,
      folio: entry.folio,
      isin: entry.isin,
      dateAdded: entry.date,
    }))

    return {
      success: true,
      data: portfolioEntries,
      summary: {
        totalParsed: result.totalParsed,
        broker: result.broker,
        detectedTableRange: result.detectedTableRange,
        sheetName: result.sheetName,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function addManualEntry(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const type = formData.get("type") as "mutual_fund" | "stock" | "bond" | "etf"
    const quantity = Number.parseFloat(formData.get("quantity") as string)
    const avgPrice = Number.parseFloat(formData.get("avgPrice") as string)
    const currentPrice = Number.parseFloat(formData.get("currentPrice") as string)

    if (!name || !type || quantity <= 0 || avgPrice <= 0 || currentPrice <= 0) {
      return { success: false, error: "Please fill all fields with valid values" }
    }

    const investedValue = quantity * avgPrice
    const currentValue = quantity * currentPrice
    const gainLoss = currentValue - investedValue
    const gainLossPercentage = (gainLoss / investedValue) * 100

    const entry: PortfolioEntry = {
      id: `manual-${Date.now()}`,
      name,
      type: "manual" as const,
      quantity,
      avgPrice,
      currentPrice,
      investedValue,
      currentValue,
      gainLoss,
      gainLossPercentage,
      source: "manual",
      dateAdded: new Date().toISOString().split("T")[0],
    }

    return { success: true, data: entry }
  } catch (error) {
    return {
      success: false,
      error: `Failed to add entry: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export function calculatePortfolioSummary(entries: PortfolioEntry[]): PortfolioSummary {
  const summary: PortfolioSummary = {
    totalEntries: entries.length,
    totalInvested: 0,
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0,
    byType: {},
    byBroker: {},
  }

  entries.forEach((entry) => {
    // Overall totals
    summary.totalInvested += entry.investedValue
    summary.totalValue += entry.currentValue
    summary.totalGainLoss += entry.gainLoss

    // By type
    const type = entry.type
    if (!summary.byType[type]) {
      summary.byType[type] = { count: 0, value: 0, invested: 0, gainLoss: 0 }
    }
    summary.byType[type].count++
    summary.byType[type].value += entry.currentValue
    summary.byType[type].invested += entry.investedValue
    summary.byType[type].gainLoss += entry.gainLoss

    // By broker
    const broker = entry.broker || "Manual Entry"
    if (!summary.byBroker[broker]) {
      summary.byBroker[broker] = { count: 0, value: 0, invested: 0, gainLoss: 0 }
    }
    summary.byBroker[broker].count++
    summary.byBroker[broker].value += entry.currentValue
    summary.byBroker[broker].invested += entry.investedValue
    summary.byBroker[broker].gainLoss += entry.gainLoss
  })

  // Calculate overall percentage
  summary.totalGainLossPercentage =
    summary.totalInvested > 0 ? (summary.totalGainLoss / summary.totalInvested) * 100 : 0

  return summary
}
