"use server"

import { parseInvestmentFile } from "@/lib/file-parsers"

interface PortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  invested: number
  current: number
  units: number
  nav: number
  date: string
  broker?: string
  folio?: string
  isin?: string
}

export async function uploadPortfolioFiles(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    console.log(`📄 Processing real file: ${file.name} (${file.size} bytes)`)

    // Parse the actual file content
    const parseResult = await parseInvestmentFile(file)

    if (!parseResult.success) {
      console.error(`❌ File parsing failed:`, parseResult.error)
      return {
        success: false,
        error: parseResult.error || "Failed to parse file",
      }
    }

    if (!parseResult.data || parseResult.data.length === 0) {
      return {
        success: false,
        error: "No investment data found in the file. Please check the file format and content.",
      }
    }

    // Convert parsed data to portfolio entries
    const portfolioEntries: PortfolioEntry[] = parseResult.data.map((investment, index) => ({
      id: `${parseResult.broker?.toLowerCase() || "parsed"}_${Date.now()}_${index}`,
      name: investment.name,
      type: investment.type,
      invested: investment.invested,
      current: investment.current,
      units: investment.units,
      nav: investment.nav,
      date: investment.date,
      broker: investment.broker,
      folio: investment.folio,
      isin: investment.isin,
    }))

    console.log(
      `✅ Successfully parsed ${portfolioEntries.length} investments from ${parseResult.broker} ${parseResult.fileType}:`,
    )
    portfolioEntries.forEach((entry, i) => {
      console.log(
        `  ${i + 1}. ${entry.name} - ₹${entry.invested.toLocaleString()} invested, ₹${entry.current.toLocaleString()} current`,
      )
    })

    const totalInvested = portfolioEntries.reduce((sum, entry) => sum + entry.invested, 0)
    const totalCurrent = portfolioEntries.reduce((sum, entry) => sum + entry.current, 0)
    const totalGainLoss = totalCurrent - totalInvested

    return {
      success: true,
      data: portfolioEntries,
      message: `Successfully parsed ${file.name} from ${parseResult.broker}. Found ${portfolioEntries.length} investments worth ₹${totalCurrent.toLocaleString()} (${totalGainLoss >= 0 ? "+" : ""}₹${totalGainLoss.toLocaleString()} gain/loss)`,
      broker: parseResult.broker,
      fileType: parseResult.fileType,
      summary: {
        totalInvestments: portfolioEntries.length,
        totalInvested,
        totalCurrent,
        totalGainLoss,
        returnPercentage: totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0,
      },
    }
  } catch (error) {
    console.error("❌ Error processing file:", error)
    return {
      success: false,
      error: `Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}. Please check the file format and try again.`,
    }
  }
}
