import { universalParser, type UniversalParseResult, type ParsedHolding } from "./universal-statement-parser"

export interface ParsedPortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  units: number
  nav: number
  invested: number
  current: number
  date: string
  source: "upload"
  fileName: string
  broker?: string
  folio?: string
  isin?: string
}

export interface ParseResult {
  success: boolean
  data: ParsedPortfolioEntry[]
  errors: string[]
  totalParsed: number
  broker?: string
  detectedTableRange?: string
  sheetName?: string
}

// Convert UniversalParseResult to ParseResult for backward compatibility
function convertToLegacyFormat(universalResult: UniversalParseResult): ParseResult {
  const legacyEntries: ParsedPortfolioEntry[] = universalResult.data.map((holding) => ({
    id: holding.id,
    name: holding.name,
    type: holding.type === "stock" ? "stock" : holding.type,
    units: holding.quantity,
    nav: holding.currentPrice,
    invested: holding.quantity * holding.avgPrice,
    current: holding.currentValue,
    date: new Date().toISOString().split("T")[0],
    source: "upload" as const,
    fileName: universalResult.fileName,
    broker: holding.platform,
    folio: holding.folio,
    isin: holding.isin,
  }))

  return {
    success: universalResult.success,
    data: legacyEntries,
    errors: universalResult.errors,
    totalParsed: universalResult.totalHoldings,
    broker: universalResult.platform,
    detectedTableRange: `Detected ${universalResult.detectedFormat} format`,
    sheetName: universalResult.detectedFormat,
  }
}

export async function parsePortfolioFile(file: File): Promise<ParseResult> {
  try {
    // Use the new universal parser
    const universalResult = await universalParser.parseFile(file)

    // Convert to legacy format for backward compatibility
    return convertToLegacyFormat(universalResult)
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [error instanceof Error ? error.message : "Unknown parsing error"],
      totalParsed: 0,
    }
  }
}

// Export the universal parser for direct use in Portfolio Analysis
export { universalParser, type UniversalParseResult, type ParsedHolding }
