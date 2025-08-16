// Platform-specific header configurations from the attachment
export const PLATFORM_HEADERS = {
  GROWW: {
    stocks: [
      "Stock Name",
      "ISIN",
      "Quantity",
      "Average buy price",
      "Buy value",
      "Closing price",
      "Closing value",
      "Unrealised P&L",
    ],
    mf: [
      "Scheme Name",
      "AMC",
      "Category",
      "Sub-category",
      "Folio No.",
      "Source",
      "Units",
      "Invested Value",
      "Current Value",
      "Unrealised P&L",
    ],
  },
  ZERODHA: {
    stocks: ["Instrument", "Qty.", "Avg. cost", "LTP", "Cur. val", "P&L", "Net chg.", "Day chg."],
    mf: ["Fund", "ISIN", "Units", "Avg. cost", "LTP", "Cur. val", "P&L", "Day chg."],
  },
  ANGEL_ONE: {
    stocks: ["Symbol", "Product", "Quantity", "Average Price", "LTP", "Market Value", "Unrealized P&L", "Realized P&L"],
    mf: ["Scheme Name", "Folio Number", "Units", "Purchase Price", "Current NAV", "Current Value", "Gain/Loss"],
  },
  HDFC_SECURITIES: {
    stocks: ["Security Name", "ISIN", "Quantity", "Rate", "Market Price", "Market Value", "Unrealized Gain/Loss"],
    mf: ["Fund Name", "Folio", "Units", "Purchase NAV", "Current NAV", "Current Value", "Gain/Loss Amount"],
  },
  ICICI_DIRECT: {
    stocks: ["Stock Name", "Symbol", "Quantity", "Avg Rate", "Current Price", "Current Value", "Unrealized P&L"],
    mf: ["Scheme", "Folio", "Units", "Avg NAV", "Current NAV", "Market Value", "P&L"],
  },
}

export interface ParsedHolding {
  name: string
  symbol?: string
  isin?: string
  quantity: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  pnl: number
  pnlPercentage: number
  type: "stock" | "mf"
  platform: string
  folio?: string
  category?: string
  amc?: string
}

export interface ParsedPortfolio {
  holdings: ParsedHolding[]
  summary: {
    totalInvested: number
    currentValue: number
    totalPnL: number
    totalPnLPercentage: number
    stocksCount: number
    mfCount: number
    platform: string
  }
  metadata: {
    fileName: string
    parsedAt: string
    platform: string
    dataSource: "file" | "manual"
  }
}

// Detect platform based on headers
export function detectPlatform(headers: string[]): string | null {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase())

  // Check each platform's header patterns
  for (const [platform, config] of Object.entries(PLATFORM_HEADERS)) {
    const stockHeaders = config.stocks.map((h) => h.toLowerCase())
    const mfHeaders = config.mf.map((h) => h.toLowerCase())

    // Check if significant portion of headers match
    const stockMatches = stockHeaders.filter((h) =>
      normalizedHeaders.some((nh) => nh.includes(h) || h.includes(nh)),
    ).length

    const mfMatches = mfHeaders.filter((h) => normalizedHeaders.some((nh) => nh.includes(h) || h.includes(nh))).length

    // If more than 50% headers match, consider it a match
    if (stockMatches >= stockHeaders.length * 0.5 || mfMatches >= mfHeaders.length * 0.5) {
      return platform
    }
  }

  return null
}

// Parse numeric value from string
function parseNumeric(value: any): number {
  if (typeof value === "number") return value
  if (!value || value === "" || value === "N/A" || value === "-") return 0

  const str = value
    .toString()
    .replace(/[₹,\s]/g, "")
    .replace(/[()]/g, "-")
  const num = Number.parseFloat(str)
  return isNaN(num) ? 0 : num
}

// Parse Groww format
function parseGrowwData(rows: any[][], headers: string[], type: "stocks" | "mf"): ParsedHolding[] {
  const holdings: ParsedHolding[] = []
  const expectedHeaders = PLATFORM_HEADERS.GROWW[type]

  // Create header mapping
  const headerMap: { [key: string]: number } = {}
  expectedHeaders.forEach((expectedHeader) => {
    const index = headers.findIndex(
      (h) =>
        h.toLowerCase().includes(expectedHeader.toLowerCase()) ||
        expectedHeader.toLowerCase().includes(h.toLowerCase()),
    )
    if (index !== -1) {
      headerMap[expectedHeader] = index
    }
  })

  rows.forEach((row) => {
    if (!row || row.length === 0) return

    try {
      if (type === "stocks") {
        const holding: ParsedHolding = {
          name: row[headerMap["Stock Name"]] || "",
          symbol: row[headerMap["Stock Name"]] || "",
          isin: row[headerMap["ISIN"]] || "",
          quantity: parseNumeric(row[headerMap["Quantity"]]),
          avgPrice: parseNumeric(row[headerMap["Average buy price"]]),
          currentPrice: parseNumeric(row[headerMap["Closing price"]]),
          currentValue: parseNumeric(row[headerMap["Closing value"]]),
          pnl: parseNumeric(row[headerMap["Unrealised P&L"]]),
          pnlPercentage: 0,
          type: "stock",
          platform: "GROWW",
        }

        // Calculate P&L percentage
        const invested = holding.quantity * holding.avgPrice
        if (invested > 0) {
          holding.pnlPercentage = (holding.pnl / invested) * 100
        }

        if (holding.name && holding.quantity > 0) {
          holdings.push(holding)
        }
      } else {
        const holding: ParsedHolding = {
          name: row[headerMap["Scheme Name"]] || "",
          quantity: parseNumeric(row[headerMap["Units"]]),
          avgPrice: 0, // Calculate from invested value and units
          currentPrice: 0, // Calculate from current value and units
          currentValue: parseNumeric(row[headerMap["Current Value"]]),
          pnl: parseNumeric(row[headerMap["Unrealised P&L"]]),
          pnlPercentage: 0,
          type: "mf",
          platform: "GROWW",
          folio: row[headerMap["Folio No."]] || "",
          category: row[headerMap["Category"]] || "",
          amc: row[headerMap["AMC"]] || "",
        }

        const investedValue = parseNumeric(row[headerMap["Invested Value"]])
        if (holding.quantity > 0) {
          holding.avgPrice = investedValue / holding.quantity
          holding.currentPrice = holding.currentValue / holding.quantity
        }

        // Calculate P&L percentage
        if (investedValue > 0) {
          holding.pnlPercentage = (holding.pnl / investedValue) * 100
        }

        if (holding.name && holding.quantity > 0) {
          holdings.push(holding)
        }
      }
    } catch (error) {
      console.warn("Error parsing row:", error, row)
    }
  })

  return holdings
}

// Parse Zerodha format
function parseZerodhaData(rows: any[][], headers: string[], type: "stocks" | "mf"): ParsedHolding[] {
  const holdings: ParsedHolding[] = []
  const expectedHeaders = PLATFORM_HEADERS.ZERODHA[type]

  // Create header mapping
  const headerMap: { [key: string]: number } = {}
  expectedHeaders.forEach((expectedHeader) => {
    const index = headers.findIndex(
      (h) =>
        h.toLowerCase().includes(expectedHeader.toLowerCase()) ||
        expectedHeader.toLowerCase().includes(h.toLowerCase()),
    )
    if (index !== -1) {
      headerMap[expectedHeader] = index
    }
  })

  rows.forEach((row) => {
    if (!row || row.length === 0) return

    try {
      if (type === "stocks") {
        const holding: ParsedHolding = {
          name: row[headerMap["Instrument"]] || "",
          symbol: row[headerMap["Instrument"]] || "",
          quantity: parseNumeric(row[headerMap["Qty."]]),
          avgPrice: parseNumeric(row[headerMap["Avg. cost"]]),
          currentPrice: parseNumeric(row[headerMap["LTP"]]),
          currentValue: parseNumeric(row[headerMap["Cur. val"]]),
          pnl: parseNumeric(row[headerMap["P&L"]]),
          pnlPercentage: 0,
          type: "stock",
          platform: "ZERODHA",
        }

        // Calculate P&L percentage
        const invested = holding.quantity * holding.avgPrice
        if (invested > 0) {
          holding.pnlPercentage = (holding.pnl / invested) * 100
        }

        if (holding.name && holding.quantity > 0) {
          holdings.push(holding)
        }
      } else {
        const holding: ParsedHolding = {
          name: row[headerMap["Fund"]] || "",
          isin: row[headerMap["ISIN"]] || "",
          quantity: parseNumeric(row[headerMap["Units"]]),
          avgPrice: parseNumeric(row[headerMap["Avg. cost"]]),
          currentPrice: parseNumeric(row[headerMap["LTP"]]),
          currentValue: parseNumeric(row[headerMap["Cur. val"]]),
          pnl: parseNumeric(row[headerMap["P&L"]]),
          pnlPercentage: 0,
          type: "mf",
          platform: "ZERODHA",
        }

        // Calculate P&L percentage
        const invested = holding.quantity * holding.avgPrice
        if (invested > 0) {
          holding.pnlPercentage = (holding.pnl / invested) * 100
        }

        if (holding.name && holding.quantity > 0) {
          holdings.push(holding)
        }
      }
    } catch (error) {
      console.warn("Error parsing row:", error, row)
    }
  })

  return holdings
}

// Main parsing function
export async function parseUniversalStatement(data: any[][], fileName: string): Promise<ParsedPortfolio> {
  if (!data || data.length === 0) {
    throw new Error("No data provided")
  }

  // Extract headers (first row)
  const headers = data[0].map((h) => h?.toString().trim() || "")
  const dataRows = data.slice(1).filter((row) => row && row.some((cell) => cell !== null && cell !== ""))

  console.log("📊 Parsing Universal Statement:", fileName)
  console.log("📋 Headers found:", headers)
  console.log("📊 Data rows:", dataRows.length)

  // Detect platform
  const platform = detectPlatform(headers)
  console.log("🔍 Detected platform:", platform || "UNKNOWN")

  if (!platform) {
    throw new Error("Unable to detect platform format. Please ensure the file contains proper headers.")
  }

  let holdings: ParsedHolding[] = []

  // Parse based on detected platform
  switch (platform) {
    case "GROWW":
      // Try to detect if it's stocks or MF based on headers
      const hasStockHeaders = PLATFORM_HEADERS.GROWW.stocks.some((h) =>
        headers.some((header) => header.toLowerCase().includes(h.toLowerCase())),
      )
      const hasMFHeaders = PLATFORM_HEADERS.GROWW.mf.some((h) =>
        headers.some((header) => header.toLowerCase().includes(h.toLowerCase())),
      )

      if (hasStockHeaders) {
        holdings = parseGrowwData(dataRows, headers, "stocks")
      } else if (hasMFHeaders) {
        holdings = parseGrowwData(dataRows, headers, "mf")
      }
      break

    case "ZERODHA":
      const hasZerodhaStockHeaders = PLATFORM_HEADERS.ZERODHA.stocks.some((h) =>
        headers.some((header) => header.toLowerCase().includes(h.toLowerCase())),
      )
      const hasZerodhaMFHeaders = PLATFORM_HEADERS.ZERODHA.mf.some((h) =>
        headers.some((header) => header.toLowerCase().includes(h.toLowerCase())),
      )

      if (hasZerodhaStockHeaders) {
        holdings = parseZerodhaData(dataRows, headers, "stocks")
      } else if (hasZerodhaMFHeaders) {
        holdings = parseZerodhaData(dataRows, headers, "mf")
      }
      break

    default:
      throw new Error(`Platform ${platform} parsing not yet implemented`)
  }

  if (holdings.length === 0) {
    throw new Error("No valid holdings found in the file")
  }

  // Calculate summary
  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.avgPrice, 0)
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0)
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  const stocksCount = holdings.filter((h) => h.type === "stock").length
  const mfCount = holdings.filter((h) => h.type === "mf").length

  console.log("✅ Parsing complete:", {
    holdings: holdings.length,
    stocks: stocksCount,
    mf: mfCount,
    totalInvested,
    currentValue,
    totalPnL,
  })

  return {
    holdings,
    summary: {
      totalInvested,
      currentValue,
      totalPnL,
      totalPnLPercentage,
      stocksCount,
      mfCount,
      platform,
    },
    metadata: {
      fileName,
      parsedAt: new Date().toISOString(),
      platform,
      dataSource: "file",
    },
  }
}

// Export utility functions
export { parseNumeric }
