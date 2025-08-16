// Universal Statement Parser for Portfolio Analysis
// Integrates with the platform headers provided in the attachment

export interface PlatformHeaders {
  GROWW: {
    stocks: string[]
    mf: string[]
  }
  ZERODHA: {
    stocks: string[]
    mf: string[]
  }
  ANGEL_ONE: {
    stocks: string[]
    mf: string[]
  }
  HDFC_SECURITIES: {
    stocks: string[]
    mf: string[]
  }
  ICICI_DIRECT: {
    stocks: string[]
    mf: string[]
  }
}

export interface ParsedHolding {
  id: string
  name: string
  type: "stock" | "mutual_fund" | "bond" | "etf"
  quantity: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  platform: string
  isin?: string
  folio?: string
  category?: string
  subCategory?: string
}

export interface UniversalParseResult {
  success: boolean
  data: ParsedHolding[]
  platform: string
  totalHoldings: number
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  errors: string[]
  fileName: string
  detectedFormat: "csv" | "excel" | "pdf" | "unknown"
}

// Platform header definitions from the attachment
const PLATFORM_HEADERS: PlatformHeaders = {
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
      "Returns",
      "XIRR",
    ],
  },
  ZERODHA: {
    stocks: ["Instrument", "Qty.", "Avg. cost", "LTP", "Cur. val", "P&L", "Net chg.", "Day chg."],
    mf: ["Fund", "ISIN", "Units", "Avg. cost", "Current NAV", "Current value", "P&L"],
  },
  ANGEL_ONE: {
    stocks: ["Symbol", "Product", "Qty", "Avg Price", "LTP", "Current Value", "P&L", "% P&L"],
    mf: ["Scheme Name", "Folio Number", "Units", "Purchase NAV", "Current NAV", "Current Value", "Gain/Loss"],
  },
  HDFC_SECURITIES: {
    stocks: ["Security Name", "ISIN", "Quantity", "Rate", "Market Value", "Unrealized P&L"],
    mf: ["Scheme Name", "Folio Number", "Units", "NAV", "Market Value", "Invested Amount"],
  },
  ICICI_DIRECT: {
    stocks: ["Stock Name", "ISIN", "Quantity", "Average Price", "Current Price", "Current Value", "Unrealized P&L"],
    mf: ["Fund Name", "Folio", "Units", "Purchase Price", "Current NAV", "Current Value", "Gain/Loss"],
  },
}

class UniversalStatementParser {
  private normalizeHeader(header: string): string {
    return header
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, "_")
      .replace(/^_|_$/g, "")
  }

  private detectPlatform(headers: string[]): { platform: keyof PlatformHeaders; type: "stocks" | "mf" } | null {
    const normalizedHeaders = headers.map((h) => this.normalizeHeader(h))

    for (const [platform, formats] of Object.entries(PLATFORM_HEADERS)) {
      // Check stocks format
      const stockMatches = formats.stocks.filter((header) =>
        normalizedHeaders.some(
          (nh) => nh.includes(this.normalizeHeader(header)) || this.normalizeHeader(header).includes(nh),
        ),
      ).length

      if (stockMatches >= 3) {
        return { platform: platform as keyof PlatformHeaders, type: "stocks" }
      }

      // Check mutual funds format
      const mfMatches = formats.mf.filter((header) =>
        normalizedHeaders.some(
          (nh) => nh.includes(this.normalizeHeader(header)) || this.normalizeHeader(header).includes(nh),
        ),
      ).length

      if (mfMatches >= 3) {
        return { platform: platform as keyof PlatformHeaders, type: "mf" }
      }
    }

    return null
  }

  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    const normalizedHeaders = headers.map((h) => this.normalizeHeader(h))

    for (const name of possibleNames) {
      const normalizedName = this.normalizeHeader(name)
      const index = normalizedHeaders.findIndex((h) => h.includes(normalizedName) || normalizedName.includes(h))
      if (index !== -1) return index
    }

    return -1
  }

  private parseNumericValue(value: string | number): number {
    if (typeof value === "number") return value
    if (!value) return 0

    const cleanValue = value.toString().replace(/[^\d.-]/g, "")
    const numValue = Number.parseFloat(cleanValue)
    return isNaN(numValue) ? 0 : numValue
  }

  private parseGrowwData(data: any[], type: "stocks" | "mf", fileName: string): ParsedHolding[] {
    const holdings: ParsedHolding[] = []

    if (type === "stocks") {
      data.forEach((row, index) => {
        const name = row["Stock Name"] || row["stock_name"] || ""
        const quantity = this.parseNumericValue(row["Quantity"] || row["quantity"] || 0)
        const avgPrice = this.parseNumericValue(row["Average buy price"] || row["average_buy_price"] || 0)
        const currentPrice = this.parseNumericValue(row["Closing price"] || row["closing_price"] || 0)
        const currentValue = this.parseNumericValue(row["Closing value"] || row["closing_value"] || 0)
        const gainLoss = this.parseNumericValue(row["Unrealised P&L"] || row["unrealised_pl"] || 0)

        if (name && quantity > 0 && avgPrice > 0) {
          const invested = quantity * avgPrice
          const gainLossPercentage = invested > 0 ? (gainLoss / invested) * 100 : 0

          holdings.push({
            id: `groww-stock-${index}`,
            name,
            type: "stock",
            quantity,
            avgPrice,
            currentPrice: currentPrice || currentValue / quantity,
            currentValue: currentValue || quantity * currentPrice,
            gainLoss,
            gainLossPercentage,
            platform: "Groww",
            isin: row["ISIN"] || row["isin"] || undefined,
          })
        }
      })
    } else {
      data.forEach((row, index) => {
        const name = row["Scheme Name"] || row["scheme_name"] || ""
        const units = this.parseNumericValue(row["Units"] || row["units"] || 0)
        const investedValue = this.parseNumericValue(row["Invested Value"] || row["invested_value"] || 0)
        const currentValue = this.parseNumericValue(row["Current Value"] || row["current_value"] || 0)
        const returns = this.parseNumericValue(row["Returns"] || row["returns"] || 0)

        if (name && units > 0 && investedValue > 0) {
          const avgPrice = investedValue / units
          const currentPrice = currentValue / units
          const gainLoss = returns || currentValue - investedValue
          const gainLossPercentage = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0

          holdings.push({
            id: `groww-mf-${index}`,
            name,
            type: "mutual_fund",
            quantity: units,
            avgPrice,
            currentPrice,
            currentValue,
            gainLoss,
            gainLossPercentage,
            platform: "Groww",
            folio: row["Folio No."] || row["folio_no"] || undefined,
            category: row["Category"] || row["category"] || undefined,
            subCategory: row["Sub-category"] || row["sub_category"] || undefined,
          })
        }
      })
    }

    return holdings
  }

  private parseZerodhaData(data: any[], type: "stocks" | "mf", fileName: string): ParsedHolding[] {
    const holdings: ParsedHolding[] = []

    if (type === "stocks") {
      data.forEach((row, index) => {
        const name = row["Instrument"] || row["instrument"] || ""
        const quantity = this.parseNumericValue(row["Qty."] || row["qty"] || 0)
        const avgPrice = this.parseNumericValue(row["Avg. cost"] || row["avg_cost"] || 0)
        const currentPrice = this.parseNumericValue(row["LTP"] || row["ltp"] || 0)
        const currentValue = this.parseNumericValue(row["Cur. val"] || row["cur_val"] || 0)
        const gainLoss = this.parseNumericValue(row["P&L"] || row["pl"] || 0)

        if (name && quantity > 0 && avgPrice > 0) {
          const invested = quantity * avgPrice
          const gainLossPercentage = invested > 0 ? (gainLoss / invested) * 100 : 0

          holdings.push({
            id: `zerodha-stock-${index}`,
            name,
            type: "stock",
            quantity,
            avgPrice,
            currentPrice,
            currentValue: currentValue || quantity * currentPrice,
            gainLoss,
            gainLossPercentage,
            platform: "Zerodha",
          })
        }
      })
    } else {
      data.forEach((row, index) => {
        const name = row["Fund"] || row["fund"] || ""
        const units = this.parseNumericValue(row["Units"] || row["units"] || 0)
        const avgPrice = this.parseNumericValue(row["Avg. cost"] || row["avg_cost"] || 0)
        const currentPrice = this.parseNumericValue(row["Current NAV"] || row["current_nav"] || 0)
        const currentValue = this.parseNumericValue(row["Current value"] || row["current_value"] || 0)
        const gainLoss = this.parseNumericValue(row["P&L"] || row["pl"] || 0)

        if (name && units > 0 && avgPrice > 0) {
          const invested = units * avgPrice
          const gainLossPercentage = invested > 0 ? (gainLoss / invested) * 100 : 0

          holdings.push({
            id: `zerodha-mf-${index}`,
            name,
            type: "mutual_fund",
            quantity: units,
            avgPrice,
            currentPrice: currentPrice || currentValue / units,
            currentValue: currentValue || units * currentPrice,
            gainLoss,
            gainLossPercentage,
            platform: "Zerodha",
            isin: row["ISIN"] || row["isin"] || undefined,
          })
        }
      })
    }

    return holdings
  }

  private parseGenericData(data: any[], headers: string[], fileName: string): ParsedHolding[] {
    const holdings: ParsedHolding[] = []

    data.forEach((row, index) => {
      // Try to find common column patterns
      const nameIndex = this.findColumnIndex(headers, ["name", "instrument", "scheme", "fund", "stock", "security"])
      const quantityIndex = this.findColumnIndex(headers, ["quantity", "qty", "units", "shares"])
      const avgPriceIndex = this.findColumnIndex(headers, [
        "avg_price",
        "average_price",
        "avg_cost",
        "purchase_price",
        "nav",
      ])
      const currentPriceIndex = this.findColumnIndex(headers, ["current_price", "ltp", "closing_price", "current_nav"])
      const currentValueIndex = this.findColumnIndex(headers, ["current_value", "market_value", "closing_value"])

      if (nameIndex === -1 || quantityIndex === -1) return

      const rowArray = Array.isArray(row) ? row : Object.values(row)

      const name = rowArray[nameIndex]?.toString() || ""
      const quantity = this.parseNumericValue(rowArray[quantityIndex] || 0)
      const avgPrice = this.parseNumericValue(rowArray[avgPriceIndex] || 0)
      const currentPrice = this.parseNumericValue(rowArray[currentPriceIndex] || avgPrice)
      const currentValue = this.parseNumericValue(rowArray[currentValueIndex] || quantity * currentPrice)

      if (name && quantity > 0 && avgPrice > 0) {
        const invested = quantity * avgPrice
        const gainLoss = currentValue - invested
        const gainLossPercentage = invested > 0 ? (gainLoss / invested) * 100 : 0

        // Determine type based on name or headers
        const type =
          name.toLowerCase().includes("fund") || headers.some((h) => h.toLowerCase().includes("fund"))
            ? "mutual_fund"
            : "stock"

        holdings.push({
          id: `generic-${index}`,
          name,
          type,
          quantity,
          avgPrice,
          currentPrice,
          currentValue,
          gainLoss,
          gainLossPercentage,
          platform: "Generic",
        })
      }
    })

    return holdings
  }

  async parseFile(file: File): Promise<UniversalParseResult> {
    try {
      const fileName = file.name
      const fileExtension = fileName.split(".").pop()?.toLowerCase()

      let data: any[] = []
      let headers: string[] = []
      let detectedFormat: "csv" | "excel" | "pdf" | "unknown" = "unknown"

      // Parse based on file type
      if (fileExtension === "csv") {
        detectedFormat = "csv"
        const text = await file.text()
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          throw new Error("CSV file appears to be empty")
        }

        headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
        data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          return row
        })
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        detectedFormat = "excel"
        // Excel parsing would require XLSX library
        const XLSX = await import("xlsx")
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        if (jsonData.length < 2) {
          throw new Error("Excel file appears to be empty")
        }

        headers = jsonData[0].map((h) => h?.toString() || "")
        data = jsonData.slice(1).map((row) => {
          const rowObj: any = {}
          headers.forEach((header, index) => {
            rowObj[header] = row[index] || ""
          })
          return rowObj
        })
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}`)
      }

      // Detect platform and type
      const detection = this.detectPlatform(headers)

      let holdings: ParsedHolding[] = []
      let platform = "Unknown"

      if (detection) {
        platform = detection.platform

        switch (detection.platform) {
          case "GROWW":
            holdings = this.parseGrowwData(data, detection.type, fileName)
            break
          case "ZERODHA":
            holdings = this.parseZerodhaData(data, detection.type, fileName)
            break
          default:
            holdings = this.parseGenericData(data, headers, fileName)
        }
      } else {
        holdings = this.parseGenericData(data, headers, fileName)
      }

      // Calculate totals
      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
      const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.avgPrice, 0)
      const totalGainLoss = totalValue - totalInvested

      return {
        success: true,
        data: holdings,
        platform,
        totalHoldings: holdings.length,
        totalValue,
        totalInvested,
        totalGainLoss,
        errors: [],
        fileName,
        detectedFormat,
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        platform: "Unknown",
        totalHoldings: 0,
        totalValue: 0,
        totalInvested: 0,
        totalGainLoss: 0,
        errors: [error instanceof Error ? error.message : "Unknown parsing error"],
        fileName: file.name,
        detectedFormat: "unknown",
      }
    }
  }
}

export const universalParser = new UniversalStatementParser()
