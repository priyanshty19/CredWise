"use server"

import { parsePortfolioFile } from "@/lib/file-parsers"

export interface PortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  quantity: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  date: string
  source: "upload" | "manual"
  fileName?: string
  broker?: string
  folio?: string
  isin?: string
}

export interface PortfolioSummary {
  totalEntries: number
  totalInvested: number
  totalValue: number
  totalGainLoss: number
  totalGainLossPercentage: number
  byType: Record<string, { count: number; invested: number; value: number; gainLoss: number }>
  byBroker: Record<string, { count: number; invested: number; value: number; gainLoss: number }>
}

export async function parsePortfolioFiles(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[]

    if (files.length === 0) {
      return {
        success: false,
        error: "No files provided",
        data: [],
        summary: null,
      }
    }

    const allEntries: PortfolioEntry[] = []
    const errors: string[] = []
    const processingResults: Array<{
      fileName: string
      broker?: string
      count: number
      success: boolean
      error?: string
    }> = []

    for (const file of files) {
      try {
        const result = await parsePortfolioFile(file)

        if (result.success && result.data.length > 0) {
          const convertedEntries: PortfolioEntry[] = result.data.map((entry) => ({
            id: entry.id,
            name: entry.name,
            type: entry.type,
            quantity: entry.units,
            avgPrice: entry.invested / entry.units,
            currentPrice: entry.nav,
            currentValue: entry.current,
            gainLoss: entry.current - entry.invested,
            gainLossPercentage: entry.invested > 0 ? ((entry.current - entry.invested) / entry.invested) * 100 : 0,
            date: entry.date,
            source: entry.source,
            fileName: entry.fileName,
            broker: entry.broker,
            folio: entry.folio,
            isin: entry.isin,
          }))

          allEntries.push(...convertedEntries)
          processingResults.push({
            fileName: file.name,
            broker: result.broker,
            count: result.totalParsed,
            success: true,
          })
        } else {
          const errorMessage = result.errors.length > 0 ? result.errors.join(", ") : "Unknown parsing error"
          errors.push(`${file.name}: ${errorMessage}`)
          processingResults.push({
            fileName: file.name,
            count: 0,
            success: false,
            error: errorMessage,
          })
        }
      } catch (fileError) {
        const errorMessage = fileError instanceof Error ? fileError.message : "Unknown file processing error"
        errors.push(`${file.name}: ${errorMessage}`)
        processingResults.push({
          fileName: file.name,
          count: 0,
          success: false,
          error: errorMessage,
        })
      }
    }

    // Generate summary
    const summary = generatePortfolioSummary(allEntries)

    return {
      success: allEntries.length > 0,
      error: errors.length > 0 ? errors.join("; ") : null,
      data: allEntries,
      summary,
      processingResults,
    }
  } catch (error) {
    return {
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: [],
      summary: null,
    }
  }
}

function generatePortfolioSummary(entries: PortfolioEntry[]): PortfolioSummary {
  const totalEntries = entries.length
  const totalInvested = entries.reduce((sum, entry) => sum + entry.quantity * entry.avgPrice, 0)
  const totalValue = entries.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalGainLoss = totalValue - totalInvested
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  // Group by type
  const byType: Record<string, { count: number; invested: number; value: number; gainLoss: number }> = {}

  // Group by broker
  const byBroker: Record<string, { count: number; invested: number; value: number; gainLoss: number }> = {}

  entries.forEach((entry) => {
    const invested = entry.quantity * entry.avgPrice
    const gainLoss = entry.currentValue - invested

    // By type
    if (!byType[entry.type]) {
      byType[entry.type] = { count: 0, invested: 0, value: 0, gainLoss: 0 }
    }
    byType[entry.type].count++
    byType[entry.type].invested += invested
    byType[entry.type].value += entry.currentValue
    byType[entry.type].gainLoss += gainLoss

    // By broker
    const broker = entry.broker || (entry.source === "manual" ? "Manual Entry" : "Unknown")
    if (!byBroker[broker]) {
      byBroker[broker] = { count: 0, invested: 0, value: 0, gainLoss: 0 }
    }
    byBroker[broker].count++
    byBroker[broker].invested += invested
    byBroker[broker].value += entry.currentValue
    byBroker[broker].gainLoss += gainLoss
  })

  return {
    totalEntries,
    totalInvested,
    totalValue,
    totalGainLoss,
    totalGainLossPercentage,
    byType,
    byBroker,
  }
}

export async function addManualPortfolioEntry(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const quantity = Number.parseFloat(formData.get("quantity") as string)
    const avgPrice = Number.parseFloat(formData.get("avgPrice") as string)
    const currentPrice = Number.parseFloat(formData.get("currentPrice") as string)

    if (!name || !type || !quantity || !avgPrice || !currentPrice) {
      return {
        success: false,
        error: "All fields are required",
      }
    }

    if (quantity <= 0 || avgPrice <= 0 || currentPrice <= 0) {
      return {
        success: false,
        error: "Quantity and prices must be greater than 0",
      }
    }

    const currentValue = quantity * currentPrice
    const invested = quantity * avgPrice
    const gainLoss = currentValue - invested
    const gainLossPercentage = invested > 0 ? (gainLoss / invested) * 100 : 0

    const entry: PortfolioEntry = {
      id: `manual-${Date.now()}`,
      name,
      type: type as PortfolioEntry["type"],
      quantity,
      avgPrice,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercentage,
      date: new Date().toISOString().split("T")[0],
      source: "manual",
    }

    return {
      success: true,
      data: entry,
    }
  } catch (error) {
    return {
      success: false,
      error: `Error adding manual entry: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
