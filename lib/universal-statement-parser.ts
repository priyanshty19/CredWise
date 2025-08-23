// Platform header definitions for automatic detection
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
      "P&L",
    ],
  },
  ZERODHA: {
    stocks: ["Instrument", "Qty.", "Avg. cost", "LTP", "Cur. val", "P&L", "Net chg.", "Day chg."],
    mf: ["Fund", "ISIN", "Folio", "Units", "Avg. cost", "Current NAV", "Current value", "P&L", "% change"],
  },
  ANGEL_ONE: {
    stocks: ["Symbol", "Product", "Quantity", "Average Price", "LTP", "Market Value", "P&L", "% P&L"],
    mf: ["Scheme Name", "Folio Number", "Units", "Purchase Price", "Current NAV", "Current Value", "Gain/Loss"],
  },
  HDFC_SECURITIES: {
    stocks: ["Security Name", "ISIN", "Quantity", "Rate", "Market Price", "Market Value", "Unrealized Gain/Loss"],
    mf: [
      "Fund Name",
      "Folio",
      "Units",
      "Purchase NAV",
      "Current NAV",
      "Investment Value",
      "Current Value",
      "Gain/Loss",
    ],
  },
  ICICI_DIRECT: {
    stocks: ["Stock Name", "Symbol", "Quantity", "Avg Rate", "Current Price", "Current Value", "Unrealized P&L"],
    mf: ["Scheme", "Folio", "Units", "Avg NAV", "Current NAV", "Invested Amount", "Current Amount", "Gain/Loss"],
  },
}

export interface ParsedHolding {
  name: string
  symbol?: string
  isin?: string
  quantity: number
  avgPrice: number
  currentPrice: number
  investedValue: number
  currentValue: number
  pnl: number
  pnlPercentage: number
  type: "stock" | "mutual_fund"
  platform: string
  folio?: string
  category?: string
}

export interface ParsedPortfolio {
  holdings: ParsedHolding[]
  summary: {
    totalInvested: number
    totalCurrent: number
    totalPnL: number
    totalPnLPercentage: number
    stocksCount: number
    mutualFundsCount: number
  }
  platform: string
  parseDate: string
  errors: string[]
}

// Detect platform based on headers
export function detectPlatform(headers: string[]): string | null {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase())

  for (const [platform, platformHeaders] of Object.entries(PLATFORM_HEADERS)) {
    // Check stocks headers
    const stocksMatch = platformHeaders.stocks.some((header) =>
      normalizedHeaders.some((h) => h.includes(header.toLowerCase())),
    )

    // Check mutual funds headers
    const mfMatch = platformHeaders.mf.some((header) => normalizedHeaders.some((h) => h.includes(header.toLowerCase())))

    if (stocksMatch || mfMatch) {
      return platform
    }
  }

  return null
}

// Parse numeric value from string
function parseNumericValue(value: any): number {
  if (typeof value === "number") return value
  if (!value || value === "" || value === "N/A" || value === "-") return 0

  const stringValue = value.toString().replace(/[₹,\s]/g, "")
  const parsed = Number.parseFloat(stringValue)
  return isNaN(parsed) ? 0 : parsed
}

// Parse Groww statement
function parseGrowwStatement(data: any[][]): ParsedHolding[] {
  const holdings: ParsedHolding[] = []

  if (data.length < 2) return holdings

  const headers = data[0].map((h) => h.toString().trim())
  const rows = data.slice(1)

  // Detect if this is stocks or mutual funds based on headers
  const isStocks = headers.some((h) =>
    ["Stock Name", "ISIN", "Average buy price"].some((stockHeader) =>
      h.toLowerCase().includes(stockHeader.toLowerCase()),
    ),
  )

  for (const row of rows) {
    if (!row || row.length < 3) continue

    try {
      if (isStocks) {
        // Parse stock data
        const holding: ParsedHolding = {
          name: row[0]?.toString() || "",
          isin: row[1]?.toString() || "",
          quantity: parseNumericValue(row[2]),
          avgPrice: parseNumericValue(row[3]),
          investedValue: parseNumericValue(row[4]),
          currentPrice: parseNumericValue(row[5]),
          currentValue: parseNumericValue(row[6]),
          pnl: parseNumericValue(row[7]),
          pnlPercentage: 0,
          type: "stock",
          platform: "GROWW",
        }

        // Calculate P&L percentage
        if (holding.investedValue > 0) {
          holding.pnlPercentage = (holding.pnl / holding.investedValue) * 100
        }

        if (holding.name) {
          holdings.push(holding)
        }
      } else {
        // Parse mutual fund data
        const holding: ParsedHolding = {
          name: row[0]?.toString() || "",
          category: row[2]?.toString() || "",
          folio: row[4]?.toString() || "",
          quantity: parseNumericValue(row[6]),
          investedValue: parseNumericValue(row[7]),
          currentValue: parseNumericValue(row[8]),
          pnl: parseNumericValue(row[9]),
          avgPrice: 0,
          currentPrice: 0,
          pnlPercentage: 0,
          type: "mutual_fund",
          platform: "GROWW",
        }

        // Calculate average price and current price for MF
        if (holding.quantity > 0) {
          holding.avgPrice = holding.investedValue / holding.quantity
          holding.currentPrice = holding.currentValue / holding.quantity
        }

        // Calculate P&L percentage
        if (holding.investedValue > 0) {
          holding.pnlPercentage = (holding.pnl / holding.investedValue) * 100
        }

        if (holding.name) {
          holdings.push(holding)
        }
      }
    } catch (error) {
      console.warn("Error parsing Groww row:", error, row)
    }
  }

  return holdings
}

// Parse Zerodha statement
function parseZerodhaStatement(data: any[][]): ParsedHolding[] {
  const holdings: ParsedHolding[] = []

  if (data.length < 2) return holdings

  const headers = data[0].map((h) => h.toString().trim())
  const rows = data.slice(1)

  // Detect if this is stocks or mutual funds
  const isStocks = headers.some((h) =>
    ["Instrument", "Qty.", "Avg. cost"].some((stockHeader) => h.toLowerCase().includes(stockHeader.toLowerCase())),
  )

  for (const row of rows) {
    if (!row || row.length < 3) continue

    try {
      if (isStocks) {
        // Parse stock data
        const quantity = parseNumericValue(row[1])
        const avgCost = parseNumericValue(row[2])
        const ltp = parseNumericValue(row[3])
        const currentValue = parseNumericValue(row[4])
        const pnl = parseNumericValue(row[5])

        const holding: ParsedHolding = {
          name: row[0]?.toString() || "",
          quantity,
          avgPrice: avgCost,
          currentPrice: ltp,
          investedValue: quantity * avgCost,
          currentValue,
          pnl,
          pnlPercentage: 0,
          type: "stock",
          platform: "ZERODHA",
        }

        // Calculate P&L percentage
        if (holding.investedValue > 0) {
          holding.pnlPercentage = (holding.pnl / holding.investedValue) * 100
        }

        if (holding.name) {
          holdings.push(holding)
        }
      } else {
        // Parse mutual fund data
        const units = parseNumericValue(row[3])
        const avgCost = parseNumericValue(row[4])
        const currentNAV = parseNumericValue(row[5])
        const currentValue = parseNumericValue(row[6])
        const pnl = parseNumericValue(row[7])

        const holding: ParsedHolding = {
          name: row[0]?.toString() || "",
          isin: row[1]?.toString() || "",
          folio: row[2]?.toString() || "",
          quantity: units,
          avgPrice: avgCost,
          currentPrice: currentNAV,
          investedValue: units * avgCost,
          currentValue,
          pnl,
          pnlPercentage: 0,
          type: "mutual_fund",
          platform: "ZERODHA",
        }

        // Calculate P&L percentage
        if (holding.investedValue > 0) {
          holding.pnlPercentage = (holding.pnl / holding.investedValue) * 100
        }

        if (holding.name) {
          holdings.push(holding)
        }
      }
    } catch (error) {
      console.warn("Error parsing Zerodha row:", error, row)
    }
  }

  return holdings
}

// Generic parser for other platforms
function parseGenericStatement(data: any[][], platform: string): ParsedHolding[] {
  const holdings: ParsedHolding[] = []

  if (data.length < 2) return holdings

  const headers = data[0].map((h) => h.toString().trim().toLowerCase())
  const rows = data.slice(1)

  // Try to identify common column patterns
  const nameIndex = headers.findIndex(
    (h) => h.includes("name") || h.includes("symbol") || h.includes("instrument") || h.includes("security"),
  )
  const quantityIndex = headers.findIndex((h) => h.includes("quantity") || h.includes("qty") || h.includes("units"))
  const avgPriceIndex = headers.findIndex(
    (h) => h.includes("avg") || h.includes("average") || h.includes("cost") || h.includes("rate"),
  )
  const currentPriceIndex = headers.findIndex(
    (h) => h.includes("current") || h.includes("ltp") || h.includes("market") || h.includes("nav"),
  )
  const pnlIndex = headers.findIndex(
    (h) => h.includes("p&l") || h.includes("pnl") || h.includes("gain") || h.includes("loss"),
  )

  for (const row of rows) {
    if (!row || row.length < 3) continue

    try {
      const name = nameIndex >= 0 ? row[nameIndex]?.toString() || "" : row[0]?.toString() || ""
      const quantity = quantityIndex >= 0 ? parseNumericValue(row[quantityIndex]) : parseNumericValue(row[1])
      const avgPrice = avgPriceIndex >= 0 ? parseNumericValue(row[avgPriceIndex]) : parseNumericValue(row[2])
      const currentPrice =
        currentPriceIndex >= 0 ? parseNumericValue(row[currentPriceIndex]) : parseNumericValue(row[3])
      const pnl = pnlIndex >= 0 ? parseNumericValue(row[pnlIndex]) : 0

      const investedValue = quantity * avgPrice
      const currentValue = quantity * currentPrice
      const calculatedPnL = pnl || currentValue - investedValue

      const holding: ParsedHolding = {
        name,
        quantity,
        avgPrice,
        currentPrice,
        investedValue,
        currentValue,
        pnl: calculatedPnL,
        pnlPercentage: investedValue > 0 ? (calculatedPnL / investedValue) * 100 : 0,
        type: headers.some((h) => h.includes("fund") || h.includes("scheme")) ? "mutual_fund" : "stock",
        platform,
      }

      if (holding.name && holding.quantity > 0) {
        holdings.push(holding)
      }
    } catch (error) {
      console.warn(`Error parsing ${platform} row:`, error, row)
    }
  }

  return holdings
}

// Main parsing function
export function parseUniversalStatement(data: any[][], filename?: string): ParsedPortfolio {
  const errors: string[] = []
  let holdings: ParsedHolding[] = []
  let detectedPlatform = "UNKNOWN"

  try {
    if (!data || data.length < 2) {
      errors.push("Invalid or empty data provided")
      return {
        holdings: [],
        summary: {
          totalInvested: 0,
          totalCurrent: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          stocksCount: 0,
          mutualFundsCount: 0,
        },
        platform: detectedPlatform,
        parseDate: new Date().toISOString(),
        errors,
      }
    }

    // Detect platform from headers
    const headers = data[0].map((h) => h?.toString() || "")
    const platform = detectPlatform(headers)

    if (platform) {
      detectedPlatform = platform
      console.log(`Detected platform: ${platform}`)

      // Parse based on detected platform
      switch (platform) {
        case "GROWW":
          holdings = parseGrowwStatement(data)
          break
        case "ZERODHA":
          holdings = parseZerodhaStatement(data)
          break
        default:
          holdings = parseGenericStatement(data, platform)
      }
    } else {
      // Try generic parsing
      console.log("Platform not detected, using generic parser")
      holdings = parseGenericStatement(data, "GENERIC")
      detectedPlatform = "GENERIC"
    }

    // Calculate summary
    const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0)
    const totalCurrent = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalPnL = totalCurrent - totalInvested
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    const stocksCount = holdings.filter((h) => h.type === "stock").length
    const mutualFundsCount = holdings.filter((h) => h.type === "mutual_fund").length

    console.log(`Parsed ${holdings.length} holdings from ${detectedPlatform}`)
    console.log(`Stocks: ${stocksCount}, Mutual Funds: ${mutualFundsCount}`)
    console.log(`Total Invested: ₹${totalInvested.toLocaleString()}`)
    console.log(`Total Current: ₹${totalCurrent.toLocaleString()}`)
    console.log(`Total P&L: ₹${totalPnL.toLocaleString()} (${totalPnLPercentage.toFixed(2)}%)`)

    return {
      holdings,
      summary: {
        totalInvested,
        totalCurrent,
        totalPnL,
        totalPnLPercentage,
        stocksCount,
        mutualFundsCount,
      },
      platform: detectedPlatform,
      parseDate: new Date().toISOString(),
      errors,
    }
  } catch (error) {
    console.error("Error in parseUniversalStatement:", error)
    errors.push(`Parsing error: ${error instanceof Error ? error.message : "Unknown error"}`)

    return {
      holdings: [],
      summary: {
        totalInvested: 0,
        totalCurrent: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        stocksCount: 0,
        mutualFundsCount: 0,
      },
      platform: detectedPlatform,
      parseDate: new Date().toISOString(),
      errors,
    }
  }
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to format percentage
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? "+" : ""
  return `${sign}${percentage.toFixed(2)}%`
}
