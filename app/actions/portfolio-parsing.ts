"use server"

import { PortfolioParser } from "@/lib/portfolio-parser"
import type { PortfolioParseResult } from "@/lib/portfolio-parser"

export async function parsePortfolioFile(formData: FormData): Promise<PortfolioParseResult> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return {
        success: false,
        data: [],
        graphData: { barGraph: [], lineGraph: { investedValue: [], currentValue: [] }, pieChart: [] },
        summary: { totalInvested: 0, totalCurrent: 0, totalReturns: 0, totalSchemes: 0 },
        errors: ["No file provided"],
        fileName: "",
        processingTime: 0,
      }
    }

    const result = await PortfolioParser.parseFile(file)
    return result
  } catch (error) {
    console.error("Portfolio parsing error:", error)

    return {
      success: false,
      data: [],
      graphData: { barGraph: [], lineGraph: { investedValue: [], currentValue: [] }, pieChart: [] },
      summary: { totalInvested: 0, totalCurrent: 0, totalReturns: 0, totalSchemes: 0 },
      errors: [error instanceof Error ? error.message : "Server error occurred"],
      fileName: "",
      processingTime: 0,
    }
  }
}
