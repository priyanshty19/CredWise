"use server"

import { portfolioParser, type PortfolioParseResult, type ManualPortfolioEntry } from "@/lib/portfolio-parser"

export async function parsePortfolioFile(formData: FormData): Promise<PortfolioParseResult> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("No file provided")
    }

    // Validate file type
    const allowedTypes = [".csv", ".xlsx", ".xls"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!allowedTypes.includes(fileExtension)) {
      throw new Error("Invalid file type. Please upload CSV or Excel files only.")
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error("File size too large. Please upload files smaller than 10MB.")
    }

    // Parse the file
    const result = await portfolioParser.parseFile(file)

    return result
  } catch (error) {
    return {
      success: false,
      data: [],
      summary: {
        totalInvested: 0,
        totalCurrent: 0,
        totalReturns: 0,
        averageXIRR: 0,
        schemeCount: 0,
      },
      categoryBreakdown: {},
      amcBreakdown: {},
      errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      fileName: "unknown",
      processingTime: 0,
    }
  }
}

export async function addManualPortfolioEntry(formData: FormData): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const schemeName = formData.get("schemeName") as string
    const amc = formData.get("amc") as string
    const category = formData.get("category") as string
    const investedValue = Number.parseFloat(formData.get("investedValue") as string)
    const currentValue = Number.parseFloat(formData.get("currentValue") as string)
    const date = formData.get("date") as string

    if (!schemeName || !amc || !category || isNaN(investedValue) || isNaN(currentValue)) {
      throw new Error("Please fill in all required fields with valid values")
    }

    const entry: ManualPortfolioEntry = {
      id: Math.random().toString(36).substr(2, 9),
      schemeName,
      amc,
      category,
      investedValue,
      currentValue,
      date,
    }

    const parsedEntry = portfolioParser.addManualEntry(entry)

    return {
      success: true,
      data: parsedEntry,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add manual entry",
    }
  }
}
